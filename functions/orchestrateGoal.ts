import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { goalId, action } = body;

        if (!goalId) {
            return Response.json({ error: 'goalId is required' }, { status: 400 });
        }

        // Fetch the strategic goal
        const goals = await base44.entities.StrategicGoal.list();
        const goal = goals.find(g => g.id === goalId);

        if (!goal) {
            return Response.json({ error: 'Goal not found' }, { status: 404 });
        }

        if (action === 'breakdown') {
            // AI breaks down the goal into missions
            const prompt = `You are an AI orchestration engine. Break down this strategic goal into executable AI missions.

Goal: ${goal.name}
Description: ${goal.description}
Target Metrics: ${JSON.stringify(goal.target_metrics)}
Target Date: ${goal.target_date}
Priority: ${goal.priority}

Create 3-6 sub-missions that, when completed, will achieve this goal.

Return JSON:
{
  "suggested_missions": [
    {
      "name": "mission_name",
      "intent": "what this mission does",
      "priority": 1-5,
      "estimated_duration": "duration estimate",
      "dependencies": ["mission names this depends on"],
      "success_criteria": "how to measure success",
      "route_suggestion": "pilot|copilot|autopilot"
    }
  ],
  "execution_strategy": "sequential|parallel|hybrid",
  "estimated_timeline": "overall timeline",
  "risk_factors": ["factor 1", "factor 2"],
  "success_probability": number 0-1
}`;

            const breakdown = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggested_missions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    intent: { type: "string" },
                                    priority: { type: "number" },
                                    estimated_duration: { type: "string" },
                                    dependencies: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                    success_criteria: { type: "string" },
                                    route_suggestion: { type: "string" }
                                }
                            }
                        },
                        execution_strategy: { type: "string" },
                        estimated_timeline: { type: "string" },
                        risk_factors: {
                            type: "array",
                            items: { type: "string" }
                        },
                        success_probability: { type: "number" }
                    }
                }
            });

            // Update goal with AI suggestions
            await base44.entities.StrategicGoal.update(goalId, {
                ai_suggested_missions: breakdown.suggested_missions,
                last_ai_analysis: new Date().toISOString()
            });

            return Response.json({
                success: true,
                goal_id: goalId,
                breakdown,
                message: 'Goal broken down into executable missions'
            });
        }

        if (action === 'monitor') {
            // Monitor progress and suggest adjustments
            const linkedMissions = await base44.entities.AIMission.list();
            const relevantMissions = linkedMissions.filter(m => 
                goal.linked_missions && goal.linked_missions.includes(m.id)
            );

            const prompt = `Analyze progress towards this strategic goal and suggest adjustments.

Goal: ${goal.name}
Target Metrics: ${JSON.stringify(goal.target_metrics)}
Target Date: ${goal.target_date}
Current Progress: ${goal.progress_percentage}%

Linked Missions (${relevantMissions.length}):
${relevantMissions.map(m => `- ${m.name}: status=${m.status}, priority=${m.priority}`).join('\n')}

Analyze if we're on track and suggest any re-prioritization or corrective missions.

Return JSON:
{
  "on_track": true/false,
  "projected_completion_date": "date estimate",
  "confidence": number 0-1,
  "analysis": "detailed analysis",
  "adjustments": [
    {
      "type": "reprioritize|add_mission|pause_mission|accelerate",
      "target_mission_id": "mission id or 'new'",
      "suggestion": "what to do",
      "rationale": "why",
      "impact": "expected impact"
    }
  ],
  "status_recommendation": "planning|on-track|at-risk|achieved|failed"
}`;

            const analysis = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        on_track: { type: "boolean" },
                        projected_completion_date: { type: "string" },
                        confidence: { type: "number" },
                        analysis: { type: "string" },
                        adjustments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    target_mission_id: { type: "string" },
                                    suggestion: { type: "string" },
                                    rationale: { type: "string" },
                                    impact: { type: "string" }
                                }
                            }
                        },
                        status_recommendation: { type: "string" }
                    }
                }
            });

            // Update goal status if needed
            if (analysis.status_recommendation && analysis.status_recommendation !== goal.status) {
                await base44.entities.StrategicGoal.update(goalId, {
                    status: analysis.status_recommendation,
                    last_ai_analysis: new Date().toISOString(),
                    risk_assessment: {
                        on_track: analysis.on_track,
                        confidence: analysis.confidence,
                        adjustments: analysis.adjustments
                    }
                });
            }

            return Response.json({
                success: true,
                goal_id: goalId,
                analysis,
                message: 'Goal progress analyzed'
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error orchestrating goal:', error);
        return Response.json({
            error: error.message,
            details: 'Failed to orchestrate goal'
        }, { status: 500 });
    }
});