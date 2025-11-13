import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { workflowId } = body;

        if (!workflowId) {
            return Response.json({ error: 'workflowId is required' }, { status: 400 });
        }

        // Fetch workflow and execution data
        const workflows = await base44.entities.Workflow.list();
        const workflow = workflows.find(w => w.id === workflowId);

        if (!workflow) {
            return Response.json({ error: 'Workflow not found' }, { status: 404 });
        }

        const executions = await base44.entities.WorkflowExecution.filter(
            { workflow_id: workflowId },
            '-start_time',
            100
        );

        // Analyze step performance
        const stepAnalysis = {};
        executions.forEach(exec => {
            if (exec.step_performance) {
                exec.step_performance.forEach(step => {
                    if (!stepAnalysis[step.step_name]) {
                        stepAnalysis[step.step_name] = {
                            executions: 0,
                            total_duration: 0,
                            failures: 0,
                            step_type: step.step_type
                        };
                    }
                    stepAnalysis[step.step_name].executions++;
                    stepAnalysis[step.step_name].total_duration += step.duration_ms || 0;
                    if (step.status === 'failed') {
                        stepAnalysis[step.step_name].failures++;
                    }
                });
            }
        });

        // Calculate averages
        const stepMetrics = Object.entries(stepAnalysis).map(([name, data]) => ({
            step_name: name,
            step_type: data.step_type,
            avg_duration_ms: data.total_duration / data.executions,
            failure_rate: data.failures / data.executions,
            executions: data.executions
        }));

        // Use AI to analyze bottlenecks
        const prompt = `Analyze this workflow and identify bottlenecks and optimization opportunities.

Workflow: ${workflow.name}
Description: ${workflow.description || 'N/A'}
Total Executions: ${executions.length}
Steps: ${workflow.steps?.length || 0}

Step Performance Metrics:
${stepMetrics.map(s => `- ${s.step_name} (${s.step_type}): ${s.avg_duration_ms.toFixed(0)}ms avg, ${(s.failure_rate * 100).toFixed(1)}% failure rate, ${s.executions} runs`).join('\n')}

Overall Workflow Stats:
- Average Duration: ${executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / executions.length}ms
- Success Rate: ${(executions.filter(e => e.status === 'succeeded').length / executions.length * 100).toFixed(1)}%

Identify bottlenecks and suggest optimizations. Return JSON:
{
  "bottlenecks": [
    {
      "step_name": "step name",
      "issue": "what's wrong",
      "severity": "low|medium|high|critical",
      "impact": "quantified impact like '45% of total execution time'",
      "root_cause": "likely cause"
    }
  ],
  "optimizations": [
    {
      "title": "optimization title",
      "description": "what to do",
      "target_steps": ["step names affected"],
      "expected_improvement": "quantified benefit",
      "implementation_effort": "low|medium|high",
      "priority": 1-5,
      "auto_applicable": true/false
    }
  ],
  "workflow_health_score": number 0-100,
  "summary": "overall assessment",
  "dynamic_reprioritization": {
    "should_reprioritize": true/false,
    "reasoning": "why",
    "suggested_changes": [
      {
        "mission_id": "id or workflow name",
        "current_priority": number,
        "suggested_priority": number,
        "reason": "rationale"
      }
    ]
  }
}`;

        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    bottlenecks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                step_name: { type: "string" },
                                issue: { type: "string" },
                                severity: { type: "string" },
                                impact: { type: "string" },
                                root_cause: { type: "string" }
                            }
                        }
                    },
                    optimizations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                target_steps: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                expected_improvement: { type: "string" },
                                implementation_effort: { type: "string" },
                                priority: { type: "number" },
                                auto_applicable: { type: "boolean" }
                            }
                        }
                    },
                    workflow_health_score: { type: "number" },
                    summary: { type: "string" },
                    dynamic_reprioritization: {
                        type: "object",
                        properties: {
                            should_reprioritize: { type: "boolean" },
                            reasoning: { type: "string" },
                            suggested_changes: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        mission_id: { type: "string" },
                                        current_priority: { type: "number" },
                                        suggested_priority: { type: "number" },
                                        reason: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            workflow_id: workflowId,
            workflow_name: workflow.name,
            analysis,
            step_metrics: stepMetrics,
            execution_summary: {
                total_executions: executions.length,
                success_rate: executions.filter(e => e.status === 'succeeded').length / executions.length,
                avg_duration_ms: executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / executions.length
            }
        });

    } catch (error) {
        console.error('Error analyzing workflow bottlenecks:', error);
        return Response.json({
            error: error.message,
            details: 'Failed to analyze workflow'
        }, { status: 500 });
    }
});