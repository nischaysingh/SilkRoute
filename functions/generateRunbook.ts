import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { missionId, incidentId, scenario } = body;

        // Fetch mission data
        let mission = null;
        if (missionId) {
            mission = await base44.entities.AIMission.list();
            mission = mission.find(m => m.id === missionId);
        }

        // Fetch incident data
        let incident = null;
        if (incidentId) {
            incident = await base44.entities.AIIncident.list();
            incident = incident.find(i => i.id === incidentId);
        }

        // Fetch historical execution data for context
        const executions = await base44.entities.WorkflowExecution.list('-created_date', 50);
        
        // Build AI prompt
        let prompt = `Generate a comprehensive operational runbook in JSON format.

Context:
${mission ? `Mission: ${mission.name} - ${mission.intent}` : ''}
${incident ? `Incident: ${incident.type} - Started at ${incident.started_at}` : ''}
${scenario ? `Scenario: ${scenario}` : ''}

Historical Data:
- Recent executions: ${executions.length} recorded
- Common failure patterns from history

Create a detailed, actionable runbook with these exact fields:
{
  "name": "descriptive runbook name",
  "description": "what this runbook handles and when to use it",
  "trigger_conditions": ["condition 1", "condition 2"],
  "steps": [
    {
      "step_number": 1,
      "action": "detailed action to take",
      "expected_outcome": "what should happen",
      "fallback_action": "what to do if this step fails"
    }
  ],
  "mitigation_strategies": ["strategy 1", "strategy 2"],
  "expected_resolution_time": "estimate like '15 minutes' or '2 hours'",
  "ai_confidence_score": number between 0.7-0.95,
  "prerequisites": ["any prerequisites"],
  "success_criteria": ["criterion 1", "criterion 2"]
}

Make it practical and executable. Include 5-8 specific steps. Be detailed.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    trigger_conditions: {
                        type: "array",
                        items: { type: "string" }
                    },
                    steps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                step_number: { type: "number" },
                                action: { type: "string" },
                                expected_outcome: { type: "string" },
                                fallback_action: { type: "string" }
                            }
                        }
                    },
                    mitigation_strategies: {
                        type: "array",
                        items: { type: "string" }
                    },
                    expected_resolution_time: { type: "string" },
                    ai_confidence_score: { type: "number" },
                    prerequisites: {
                        type: "array",
                        items: { type: "string" }
                    },
                    success_criteria: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        // Create runbook entity
        const runbookData = {
            name: aiResponse.name,
            description: aiResponse.description,
            trigger_conditions: aiResponse.trigger_conditions,
            steps: aiResponse.steps,
            mitigation_strategies: aiResponse.mitigation_strategies,
            associated_missions: missionId ? [missionId] : [],
            associated_incidents: incidentId ? [incidentId] : [],
            status: "draft",
            version: 1,
            ai_confidence_score: aiResponse.ai_confidence_score || 0.85,
            execution_count: 0,
            success_rate: 0
        };

        const savedRunbook = await base44.entities.Runbook.create(runbookData);

        return Response.json({
            success: true,
            runbook: savedRunbook,
            additional_context: {
                expected_resolution_time: aiResponse.expected_resolution_time,
                prerequisites: aiResponse.prerequisites,
                success_criteria: aiResponse.success_criteria
            }
        });

    } catch (error) {
        console.error('Error generating runbook:', error);
        return Response.json({
            error: error.message,
            details: 'Failed to generate runbook'
        }, { status: 500 });
    }
});