import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mission_id, input_data } = await req.json();

        if (!mission_id) {
            return Response.json({ error: 'mission_id is required' }, { status: 400 });
        }

        // Fetch the mission
        const missions = await base44.asServiceRole.entities.AIMission.filter({ id: mission_id });
        const mission = missions[0];

        if (!mission) {
            return Response.json({ error: 'Mission not found' }, { status: 404 });
        }

        // Update mission status to running
        await base44.asServiceRole.entities.AIMission.update(mission_id, { 
            status: 'running' 
        });

        // Get all available entities for the AI to use
        const entities = await base44.asServiceRole.entities.Order.list('-created_date', 10);
        const inventory = await base44.asServiceRole.entities.Inventory.list('-created_date', 10);
        const people = await base44.asServiceRole.entities.People.list('-created_date', 10);
        
        // Build the execution prompt with full context and advanced configuration
        const executionPrompt = `You are an AI agent executor with access to a complete operational toolkit.

MISSION NAME: ${mission.name}
MISSION INTENT: ${mission.intent}
VERSION: ${mission.version}

CONFIGURATION:
${JSON.stringify(mission.simulation_metadata, null, 2)}

ADVANCED AI SETTINGS:
${mission.advanced_config ? JSON.stringify(mission.advanced_config, null, 2) : 'Default settings'}

CURRENT CONTEXT:
- Recent Orders: ${JSON.stringify(entities.slice(0, 5), null, 2)}
- Recent Inventory: ${JSON.stringify(inventory.slice(0, 5), null, 2)}
- Recent People: ${JSON.stringify(people.slice(0, 5), null, 2)}

INPUT DATA PROVIDED:
${JSON.stringify(input_data || {}, null, 2)}

AVAILABLE TOOLS & ENTITIES:
1. Order (create, update, filter, delete)
2. Inventory (create, update, filter, delete)
3. AccountingTransaction (create, update, filter)
4. CRMTask (create, update, filter)
5. HRAssignment (create, update, filter)
6. OpsLog (create for logging)
7. Bills, Payouts, Vendors, Accounts (accounting operations)
8. SendEmail integration (send notifications)
9. InvokeLLM integration (generate AI content, analyze data)

EXECUTION GUIDELINES:
- Follow the execution_steps from simulation_metadata if available
- Respect all safeguards and thresholds
- Log all significant actions to OpsLog
- Handle errors gracefully
- Return detailed results

YOUR TASK:
Analyze the mission and create a detailed, executable plan with specific tool calls that will accomplish the mission objective.

Return a JSON object with:
{
  "execution_plan": [
    {
      "step": 1,
      "action": "create_order|update_inventory|send_email|invoke_llm|etc",
      "entity_or_tool": "Order|Inventory|SendEmail|InvokeLLM|etc",
      "operation": "create|update|filter|etc",
      "parameters": {...complete parameters},
      "reasoning": "why this step is needed",
      "validation": "what to check before executing",
      "error_fallback": "what to do if this step fails"
    }
  ],
  "expected_outcome": "detailed description of what will happen",
  "estimated_duration": "time estimate",
  "confidence": 0.95,
  "risk_assessment": "any risks identified",
  "preconditions": ["things that must be true before execution"],
  "postconditions": ["things that will be true after execution"]
}`;

        // Get the execution plan from AI with advanced config
        const executionPlan = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: executionPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    execution_plan: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                step: { type: "number" },
                                action: { type: "string" },
                                entity_or_tool: { type: "string" },
                                operation: { type: "string" },
                                parameters: { type: "object" },
                                reasoning: { type: "string" },
                                validation: { type: "string" },
                                error_fallback: { type: "string" }
                            }
                        }
                    },
                    expected_outcome: { type: "string" },
                    estimated_duration: { type: "string" },
                    confidence: { type: "number" },
                    risk_assessment: { type: "string" },
                    preconditions: { type: "array", items: { type: "string" } },
                    postconditions: { type: "array", items: { type: "string" } }
                }
            }
        });

        // Execute the plan
        const results = [];
        for (const step of executionPlan.execution_plan) {
            try {
                let stepResult;

                // Execute based on entity/tool type
                if (step.entity_or_tool === 'Order') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.Order.create(step.parameters);
                    } else if (step.operation === 'update') {
                        stepResult = await base44.asServiceRole.entities.Order.update(step.parameters.id, step.parameters.data);
                    } else if (step.operation === 'filter') {
                        stepResult = await base44.asServiceRole.entities.Order.filter(step.parameters);
                    }
                } else if (step.entity_or_tool === 'Inventory') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.Inventory.create(step.parameters);
                    } else if (step.operation === 'update') {
                        stepResult = await base44.asServiceRole.entities.Inventory.update(step.parameters.id, step.parameters.data);
                    } else if (step.operation === 'filter') {
                        stepResult = await base44.asServiceRole.entities.Inventory.filter(step.parameters);
                    }
                } else if (step.entity_or_tool === 'AccountingTransaction') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.AccountingTransaction.create(step.parameters);
                    }
                } else if (step.entity_or_tool === 'CRMTask') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.CRMTask.create(step.parameters);
                    }
                } else if (step.entity_or_tool === 'HRAssignment') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.HRAssignment.create(step.parameters);
                    }
                } else if (step.entity_or_tool === 'OpsLog') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.OpsLog.create(step.parameters);
                    }
                } else if (step.entity_or_tool === 'Bills') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.Bills.create(step.parameters);
                    }
                } else if (step.entity_or_tool === 'Vendors') {
                    if (step.operation === 'create') {
                        stepResult = await base44.asServiceRole.entities.Vendors.create(step.parameters);
                    }
                } else if (step.entity_or_tool === 'SendEmail') {
                    stepResult = await base44.asServiceRole.integrations.Core.SendEmail(step.parameters);
                } else if (step.entity_or_tool === 'InvokeLLM') {
                    stepResult = await base44.asServiceRole.integrations.Core.InvokeLLM(step.parameters);
                }

                results.push({
                    step: step.step,
                    status: 'succeeded',
                    result: stepResult,
                    reasoning: step.reasoning
                });

                // Log to OpsLog
                await base44.asServiceRole.entities.OpsLog.create({
                    ts: new Date().toISOString(),
                    agent: mission.name,
                    event: `executed_step_${step.step}`,
                    level: 'info',
                    detail: {
                        action: step.action,
                        reasoning: step.reasoning,
                        result: stepResult
                    }
                });

            } catch (stepError) {
                results.push({
                    step: step.step,
                    status: 'failed',
                    error: stepError.message,
                    reasoning: step.reasoning,
                    fallback: step.error_fallback
                });

                // Log error
                await base44.asServiceRole.entities.OpsLog.create({
                    ts: new Date().toISOString(),
                    agent: mission.name,
                    event: `step_${step.step}_failed`,
                    level: 'error',
                    detail: {
                        action: step.action,
                        error: stepError.message,
                        fallback: step.error_fallback
                    }
                });
            }
        }

        // Determine overall success
        const allSucceeded = results.every(r => r.status === 'succeeded');
        const finalStatus = allSucceeded ? 'succeeded' : 'failed';

        // Update mission status
        await base44.asServiceRole.entities.AIMission.update(mission_id, { 
            status: finalStatus
        });

        // Update simulation metadata with actual run data
        const updatedMetadata = {
            ...mission.simulation_metadata,
            lastRun: new Date().toISOString(),
            lastRuns: [
                ...(mission.simulation_metadata?.lastRuns || []).slice(-9),
                {
                    timestamp: new Date().toISOString(),
                    status: finalStatus,
                    duration: executionPlan.estimated_duration,
                    steps_completed: results.filter(r => r.status === 'succeeded').length,
                    total_steps: results.length
                }
            ]
        };

        await base44.asServiceRole.entities.AIMission.update(mission_id, {
            simulation_metadata: updatedMetadata
        });

        // Create AIRun record if entity exists
        try {
            await base44.asServiceRole.entities.AIRun.create({
                mission_id: mission_id,
                mission_name: mission.name,
                mission_version: mission.version,
                status: finalStatus,
                execution_plan: executionPlan.execution_plan,
                results: results,
                executed_by: user.email,
                confidence: executionPlan.confidence,
                duration_estimate: executionPlan.estimated_duration,
                risk_assessment: executionPlan.risk_assessment
            });
        } catch (e) {
            console.log('Could not create AIRun record:', e.message);
        }

        return Response.json({
            success: allSucceeded,
            mission_name: mission.name,
            mission_version: mission.version,
            status: finalStatus,
            execution_plan: executionPlan.execution_plan,
            results: results,
            expected_outcome: executionPlan.expected_outcome,
            confidence: executionPlan.confidence,
            risk_assessment: executionPlan.risk_assessment
        });

    } catch (error) {
        console.error('Mission execution error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});