import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { missionId, forecastDays, scenarios } = body;

        const days = forecastDays || 30;

        // Fetch historical data
        const kpis = missionId ? await base44.entities.MissionKPI.filter(
            { mission_id: missionId },
            '-timestamp',
            200
        ) : [];

        const missions = await base44.entities.AIMission.list();
        const mission = missionId ? missions.find(m => m.id === missionId) : null;

        // Use AI for sophisticated forecasting
        const prompt = `Generate a comprehensive long-term forecast with scenario planning.

${mission ? `Mission: ${mission.name} - ${mission.intent}` : 'System-wide forecast'}
Forecast Horizon: ${days} days
Historical Data Points: ${kpis.length}

${scenarios?.length > 0 ? `Scenarios to Model:
${scenarios.map(s => `- ${s.name}: ${s.description}`).join('\n')}` : ''}

Create a detailed forecast with multiple scenarios (best case, expected, worst case).

Return JSON:
{
  "baseline_forecast": {
    "daily_projections": [
      {
        "day": 1-${days},
        "expected_success_rate": number 0-1,
        "expected_latency_ms": number,
        "expected_cost": number,
        "expected_errors": number,
        "confidence_interval_lower": number,
        "confidence_interval_upper": number
      }
    ],
    "summary_statistics": {
      "mean_success_rate": number,
      "mean_latency": number,
      "total_projected_cost": number,
      "confidence_level": number 0-1
    }
  },
  "scenarios": [
    {
      "name": "best_case|expected|worst_case or custom",
      "description": "scenario description",
      "probability": number 0-1,
      "outcomes": {
        "success_rate_change": "percentage",
        "cost_change": "percentage",
        "latency_change": "percentage"
      },
      "triggers": ["what would cause this scenario"],
      "mitigation_if_negative": "how to prevent/mitigate"
    }
  ],
  "trend_analysis": {
    "detected_trends": ["trend 1", "trend 2"],
    "seasonality": "detected patterns",
    "inflection_points": [
      {
        "day": number,
        "event": "predicted event",
        "impact": "description"
      }
    ]
  },
  "strategic_recommendations": ["recommendation 1", "recommendation 2"],
  "confidence_score": number 0-1
}`;

        const forecast = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    baseline_forecast: {
                        type: "object",
                        properties: {
                            daily_projections: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        day: { type: "number" },
                                        expected_success_rate: { type: "number" },
                                        expected_latency_ms: { type: "number" },
                                        expected_cost: { type: "number" },
                                        expected_errors: { type: "number" },
                                        confidence_interval_lower: { type: "number" },
                                        confidence_interval_upper: { type: "number" }
                                    }
                                }
                            },
                            summary_statistics: {
                                type: "object",
                                properties: {
                                    mean_success_rate: { type: "number" },
                                    mean_latency: { type: "number" },
                                    total_projected_cost: { type: "number" },
                                    confidence_level: { type: "number" }
                                }
                            }
                        }
                    },
                    scenarios: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                description: { type: "string" },
                                probability: { type: "number" },
                                outcomes: {
                                    type: "object",
                                    properties: {
                                        success_rate_change: { type: "string" },
                                        cost_change: { type: "string" },
                                        latency_change: { type: "string" }
                                    }
                                },
                                triggers: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                mitigation_if_negative: { type: "string" }
                            }
                        }
                    },
                    trend_analysis: {
                        type: "object",
                        properties: {
                            detected_trends: {
                                type: "array",
                                items: { type: "string" }
                            },
                            seasonality: { type: "string" },
                            inflection_points: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        day: { type: "number" },
                                        event: { type: "string" },
                                        impact: { type: "string" }
                                    }
                                }
                            }
                        }
                    },
                    strategic_recommendations: {
                        type: "array",
                        items: { type: "string" }
                    },
                    confidence_score: { type: "number" }
                }
            }
        });

        return Response.json({
            success: true,
            mission_id: missionId,
            forecast_days: days,
            forecast,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating long-term forecast:', error);
        return Response.json({
            error: error.message,
            details: 'Failed to generate forecast'
        }, { status: 500 });
    }
});