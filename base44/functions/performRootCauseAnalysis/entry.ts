import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { anomalyData, missionId } = body;

        if (!anomalyData) {
            return Response.json({ error: 'anomalyData is required' }, { status: 400 });
        }

        // Fetch relevant context
        const kpis = missionId ? await base44.entities.MissionKPI.filter(
            { mission_id: missionId },
            '-timestamp',
            50
        ) : [];

        const executions = missionId ? await base44.entities.WorkflowExecution.filter(
            { workflow_id: missionId },
            '-start_time',
            30
        ) : [];

        const incidents = await base44.entities.AIIncident.filter(
            { status: 'open' },
            '-started_at',
            10
        );

        // Deep root cause analysis with AI
        const prompt = `Perform deep root cause analysis for this anomaly.

Anomaly Details:
- Metric: ${anomalyData.metric}
- Severity: ${anomalyData.severity}
- Current Value: ${anomalyData.current_value}
- Baseline: ${anomalyData.baseline_value}
- Deviation: ${anomalyData.deviation_percentage}%
- Description: ${anomalyData.description}

Historical Context:
- Recent KPIs: ${kpis.length} data points
- Recent Executions: ${executions.length}
- Open Incidents: ${incidents.length}

Perform multi-layer root cause analysis using the "5 Whys" methodology.

Return JSON:
{
  "root_causes": [
    {
      "cause": "primary root cause",
      "confidence": number 0-1,
      "evidence": ["supporting evidence"],
      "layer": "immediate|intermediate|root",
      "contributing_factors": ["factor 1", "factor 2"]
    }
  ],
  "causal_chain": [
    {
      "level": 1-5,
      "question": "why question",
      "answer": "analysis answer"
    }
  ],
  "correlation_analysis": {
    "correlated_metrics": ["metric names that correlate"],
    "external_factors": ["external events that may contribute"],
    "temporal_patterns": "time-based pattern description"
  },
  "remediation_plan": {
    "immediate_actions": ["urgent action 1", "urgent action 2"],
    "short_term_fixes": ["fix 1", "fix 2"],
    "long_term_solutions": ["solution 1", "solution 2"],
    "preventive_measures": ["prevention 1", "prevention 2"]
  },
  "confidence_score": number 0-1,
  "estimated_resolution_time": "time estimate",
  "business_impact": "impact description"
}`;

        const rcaAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    root_causes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                cause: { type: "string" },
                                confidence: { type: "number" },
                                evidence: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                layer: { type: "string" },
                                contributing_factors: {
                                    type: "array",
                                    items: { type: "string" }
                                }
                            }
                        }
                    },
                    causal_chain: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                level: { type: "number" },
                                question: { type: "string" },
                                answer: { type: "string" }
                            }
                        }
                    },
                    correlation_analysis: {
                        type: "object",
                        properties: {
                            correlated_metrics: {
                                type: "array",
                                items: { type: "string" }
                            },
                            external_factors: {
                                type: "array",
                                items: { type: "string" }
                            },
                            temporal_patterns: { type: "string" }
                        }
                    },
                    remediation_plan: {
                        type: "object",
                        properties: {
                            immediate_actions: {
                                type: "array",
                                items: { type: "string" }
                            },
                            short_term_fixes: {
                                type: "array",
                                items: { type: "string" }
                            },
                            long_term_solutions: {
                                type: "array",
                                items: { type: "string" }
                            },
                            preventive_measures: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    },
                    confidence_score: { type: "number" },
                    estimated_resolution_time: { type: "string" },
                    business_impact: { type: "string" }
                }
            }
        });

        return Response.json({
            success: true,
            rca: rcaAnalysis,
            context: {
                kpis_analyzed: kpis.length,
                executions_analyzed: executions.length,
                incidents_reviewed: incidents.length
            },
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error performing root cause analysis:', error);
        return Response.json({
            error: error.message,
            details: 'Failed to perform root cause analysis'
        }, { status: 500 });
    }
});