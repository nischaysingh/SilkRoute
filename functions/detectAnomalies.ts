import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { missionId } = body;

        if (!missionId) {
            return Response.json({ error: 'missionId is required' }, { status: 400 });
        }

        // Fetch mission KPIs
        const kpis = await base44.entities.MissionKPI.filter(
            { mission_id: missionId },
            '-timestamp',
            50
        );

        if (kpis.length < 10) {
            return Response.json({
                success: true,
                anomalies: [],
                message: 'Insufficient data for anomaly detection'
            });
        }

        // Calculate baselines
        const metrics = {
            success_rate: kpis.map(k => k.success_rate || 0),
            avg_latency: kpis.map(k => k.avg_latency_ms || 0),
            error_rate: kpis.map(k => k.error_rate || 0),
            cost_per_run: kpis.map(k => k.cost_per_run || 0)
        };

        const calculateStats = (arr) => {
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
            const stdDev = Math.sqrt(variance);
            return { mean, stdDev };
        };

        const baselines = {
            success_rate: calculateStats(metrics.success_rate),
            avg_latency: calculateStats(metrics.avg_latency),
            error_rate: calculateStats(metrics.error_rate),
            cost_per_run: calculateStats(metrics.cost_per_run)
        };

        // Use AI to analyze patterns and detect anomalies
        const prompt = `Analyze these mission KPI metrics and detect anomalies:

Mission ID: ${missionId}
Recent KPIs (last ${kpis.length} measurements):

Success Rate: mean=${baselines.success_rate.mean.toFixed(3)}, stdDev=${baselines.success_rate.stdDev.toFixed(3)}
Recent values: ${metrics.success_rate.slice(0, 5).join(', ')}

Avg Latency: mean=${baselines.avg_latency.mean.toFixed(1)}ms, stdDev=${baselines.avg_latency.stdDev.toFixed(1)}ms
Recent values: ${metrics.avg_latency.slice(0, 5).join(', ')}

Error Rate: mean=${baselines.error_rate.mean.toFixed(3)}, stdDev=${baselines.error_rate.stdDev.toFixed(3)}
Recent values: ${metrics.error_rate.slice(0, 5).join(', ')}

Cost Per Run: mean=$${baselines.cost_per_run.mean.toFixed(3)}, stdDev=$${baselines.cost_per_run.stdDev.toFixed(3)}
Recent values: ${metrics.cost_per_run.slice(0, 5).map(v => v.toFixed(3)).join(', ')}

Detect anomalies (values >2 standard deviations from mean, or concerning trends).

Return JSON:
{
  "anomalies": [
    {
      "metric": "metric_name",
      "severity": "low|medium|high|critical",
      "description": "what's wrong",
      "current_value": number,
      "baseline_value": number,
      "deviation_percentage": number,
      "recommended_actions": ["action 1", "action 2"],
      "create_incident": true/false
    }
  ],
  "overall_health_score": number 0-100,
  "summary": "brief summary of findings"
}`;

        const aiAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    anomalies: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                metric: { type: "string" },
                                severity: { type: "string" },
                                description: { type: "string" },
                                current_value: { type: "number" },
                                baseline_value: { type: "number" },
                                deviation_percentage: { type: "number" },
                                recommended_actions: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                create_incident: { type: "boolean" }
                            }
                        }
                    },
                    overall_health_score: { type: "number" },
                    summary: { type: "string" }
                }
            }
        });

        // Create incidents for critical anomalies
        const createdIncidents = [];
        for (const anomaly of aiAnalysis.anomalies) {
            if (anomaly.create_incident && anomaly.severity === "critical") {
                const incident = await base44.entities.AIIncident.create({
                    type: "ai_anomaly_detected",
                    status: "open",
                    started_at: new Date().toISOString(),
                    root_cause_md: `**Anomaly in ${anomaly.metric}**\n\n${anomaly.description}`,
                    blast_radius_json: {
                        mission_id: missionId,
                        affected_metric: anomaly.metric,
                        severity: anomaly.severity
                    },
                    suggested_mitigation: anomaly.recommended_actions
                });
                createdIncidents.push(incident.id);
            }
        }

        return Response.json({
            success: true,
            anomalies: aiAnalysis.anomalies,
            overall_health_score: aiAnalysis.overall_health_score,
            summary: aiAnalysis.summary,
            baselines,
            incidents_created: createdIncidents
        });

    } catch (error) {
        console.error('Error detecting anomalies:', error);
        return Response.json({
            error: error.message,
            details: 'Failed to detect anomalies'
        }, { status: 500 });
    }
});