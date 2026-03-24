import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { missionId, forecastHours } = body;

        if (!missionId) {
            return Response.json({ error: 'missionId is required' }, { status: 400 });
        }

        const hours = forecastHours || 24;

        // Fetch mission and KPI data
        const missions = await base44.entities.AIMission.list();
        const mission = missions.find(m => m.id === missionId);

        if (!mission) {
            return Response.json({ error: 'Mission not found' }, { status: 404 });
        }

        const kpis = await base44.entities.MissionKPI.filter(
            { mission_id: missionId },
            '-timestamp',
            100
        );

        // Use AI for predictive analysis
        const prompt = `Analyze this AI mission and predict its performance for the next ${hours} hours.

Mission: ${mission.name}
Objective: ${mission.intent}
Current Status: ${mission.status}

Historical KPI Data Points: ${kpis.length}
${kpis.length > 0 ? `
Recent Success Rates: ${kpis.slice(0, 10).map(k => k.success_rate).filter(Boolean).join(', ')}
Recent Latencies: ${kpis.slice(0, 10).map(k => k.avg_latency_ms).filter(Boolean).join(', ')}ms
Recent Error Rates: ${kpis.slice(0, 10).map(k => k.error_rate).filter(Boolean).join(', ')}
` : 'Limited historical data available'}

Predict performance for the next ${hours} hours. Return JSON:
{
  "forecast": {
    "expected_success_rate": number 0-1,
    "expected_avg_latency_ms": number,
    "expected_error_rate": number 0-1,
    "expected_cost_per_run": number,
    "confidence_level": number 0-1
  },
  "risks": [
    {
      "type": "sla_breach|cost_overrun|error_spike|resource_exhaustion",
      "probability": number 0-1,
      "description": "what might happen",
      "impact": "low|medium|high|critical",
      "suggested_mitigation": "what to do about it"
    }
  ],
  "opportunities": [
    {
      "description": "optimization opportunity",
      "potential_improvement": "quantified benefit",
      "effort": "low|medium|high"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "overall_outlook": "positive|neutral|concerning|critical"
}`;

        const prediction = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    forecast: {
                        type: "object",
                        properties: {
                            expected_success_rate: { type: "number" },
                            expected_avg_latency_ms: { type: "number" },
                            expected_error_rate: { type: "number" },
                            expected_cost_per_run: { type: "number" },
                            confidence_level: { type: "number" }
                        }
                    },
                    risks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                probability: { type: "number" },
                                description: { type: "string" },
                                impact: { type: "string" },
                                suggested_mitigation: { type: "string" }
                            }
                        }
                    },
                    opportunities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                potential_improvement: { type: "string" },
                                effort: { type: "string" }
                            }
                        }
                    },
                    recommendations: {
                        type: "array",
                        items: { type: "string" }
                    },
                    overall_outlook: { type: "string" }
                }
            }
        });

        return Response.json({
            success: true,
            mission_id: missionId,
            mission_name: mission.name,
            forecast_horizon_hours: hours,
            prediction,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error predicting mission performance:', error);
        return Response.json({
            error: error.message,
            details: 'Failed to predict mission performance'
        }, { status: 500 });
    }
});