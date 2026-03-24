import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, time_range_days = 30 } = await req.json();

    if (!workflow_id) {
      return Response.json({ error: 'workflow_id is required' }, { status: 400 });
    }

    // Fetch workflow details
    const workflows = await base44.entities.Workflow.filter({ id: workflow_id });
    if (!workflows || workflows.length === 0) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }
    const workflow = workflows[0];

    // Calculate time range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - time_range_days);

    // Fetch execution history
    const executions = await base44.entities.WorkflowExecution.filter({
      workflow_id: workflow_id
    });

    // Filter by date range
    const filteredExecutions = executions.filter(exec => {
      const execDate = new Date(exec.start_time);
      return execDate >= startDate && execDate <= endDate;
    });

    if (filteredExecutions.length === 0) {
      return Response.json({
        workflow_id,
        workflow_name: workflow.name,
        message: 'No execution data available for analysis',
        overall_summary: 'Insufficient data for AI analysis',
        key_metrics: {
          total_runs: 0,
          success_rate: 0,
          avg_duration_ms: 0
        }
      });
    }

    // Calculate metrics
    const totalRuns = filteredExecutions.length;
    const successfulRuns = filteredExecutions.filter(e => e.status === 'succeeded').length;
    const failedRuns = filteredExecutions.filter(e => e.status === 'failed').length;
    const successRate = (successfulRuns / totalRuns * 100).toFixed(2);
    
    const durations = filteredExecutions
      .filter(e => e.duration_ms)
      .map(e => e.duration_ms);
    const avgDuration = durations.length > 0 
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0)
      : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

    // Analyze step performance
    const stepPerformanceMap = {};
    filteredExecutions.forEach(exec => {
      if (exec.step_performance && Array.isArray(exec.step_performance)) {
        exec.step_performance.forEach(step => {
          if (!stepPerformanceMap[step.step_name]) {
            stepPerformanceMap[step.step_name] = {
              total_runs: 0,
              total_duration: 0,
              failures: 0,
              successes: 0
            };
          }
          stepPerformanceMap[step.step_name].total_runs++;
          stepPerformanceMap[step.step_name].total_duration += step.duration_ms || 0;
          if (step.status === 'failed' || step.error) {
            stepPerformanceMap[step.step_name].failures++;
          } else {
            stepPerformanceMap[step.step_name].successes++;
          }
        });
      }
    });

    const stepAnalysis = Object.entries(stepPerformanceMap).map(([name, data]) => ({
      step_name: name,
      avg_duration_ms: (data.total_duration / data.total_runs).toFixed(0),
      success_rate: ((data.successes / data.total_runs) * 100).toFixed(1),
      total_runs: data.total_runs
    }));

    // Calculate resource usage
    const totalCost = filteredExecutions
      .filter(e => e.resource_usage_summary?.total_cost_usd)
      .reduce((sum, e) => sum + e.resource_usage_summary.total_cost_usd, 0);
    const totalTokens = filteredExecutions
      .filter(e => e.resource_usage_summary?.total_llm_tokens)
      .reduce((sum, e) => sum + e.resource_usage_summary.total_llm_tokens, 0);

    // Common errors
    const errorMap = {};
    filteredExecutions
      .filter(e => e.error_details?.message)
      .forEach(e => {
        const errorMsg = e.error_details.message;
        errorMap[errorMsg] = (errorMap[errorMsg] || 0) + 1;
      });
    const commonErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([msg, count]) => ({ message: msg, count }));

    // Prepare data for AI analysis
    const analysisData = {
      workflow_name: workflow.name,
      workflow_steps: workflow.steps.map(s => ({ name: s.name, type: s.type })),
      time_period_days: time_range_days,
      metrics: {
        total_runs: totalRuns,
        successful_runs: successfulRuns,
        failed_runs: failedRuns,
        success_rate_percentage: parseFloat(successRate),
        avg_duration_ms: parseFloat(avgDuration),
        max_duration_ms: maxDuration,
        min_duration_ms: minDuration,
        total_cost_usd: totalCost.toFixed(4),
        total_llm_tokens: totalTokens
      },
      step_performance: stepAnalysis,
      common_errors: commonErrors
    };

    // Call OpenAI for AI-powered analysis
    const aiPrompt = `You are an expert workflow optimization AI. Analyze the following workflow execution data and provide actionable insights.

Workflow: ${analysisData.workflow_name}
Steps: ${JSON.stringify(analysisData.workflow_steps, null, 2)}

Performance Metrics (Last ${time_range_days} days):
- Total Runs: ${analysisData.metrics.total_runs}
- Success Rate: ${analysisData.metrics.success_rate_percentage}%
- Average Duration: ${analysisData.metrics.avg_duration_ms}ms
- Duration Range: ${analysisData.metrics.min_duration_ms}ms - ${analysisData.metrics.max_duration_ms}ms
- Total Cost: $${analysisData.metrics.total_cost_usd}
- Total LLM Tokens: ${analysisData.metrics.total_llm_tokens}

Step-by-Step Performance:
${JSON.stringify(analysisData.step_performance, null, 2)}

Common Errors:
${JSON.stringify(analysisData.common_errors, null, 2)}

Provide a comprehensive audit report in the following JSON format:
{
  "overall_summary": "Brief executive summary of workflow health",
  "performance_grade": "A/B/C/D/F based on metrics",
  "key_metrics_analysis": "Analysis of the key performance indicators",
  "inefficiencies_found": ["Specific inefficiency 1", "Specific inefficiency 2"],
  "optimization_suggestions": [
    {
      "title": "Suggestion title",
      "description": "Detailed description",
      "expected_improvement": "Expected outcome",
      "priority": "high/medium/low"
    }
  ],
  "anomalies_and_risks": [
    {
      "type": "anomaly/risk",
      "description": "What was detected",
      "severity": "critical/high/medium/low",
      "recommendation": "How to address it"
    }
  ],
  "actionable_insights": ["Actionable insight 1", "Actionable insight 2"],
  "bottleneck_steps": ["Step name that is slowest"],
  "estimated_savings_potential": "Cost or time savings if optimizations applied"
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_summary: { type: "string" },
          performance_grade: { type: "string" },
          key_metrics_analysis: { type: "string" },
          inefficiencies_found: { type: "array", items: { type: "string" } },
          optimization_suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                expected_improvement: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          anomalies_and_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                description: { type: "string" },
                severity: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          actionable_insights: { type: "array", items: { type: "string" } },
          bottleneck_steps: { type: "array", items: { type: "string" } },
          estimated_savings_potential: { type: "string" }
        }
      }
    });

    // Combine raw metrics with AI analysis
    return Response.json({
      workflow_id,
      workflow_name: workflow.name,
      analysis_period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        days: time_range_days
      },
      raw_metrics: analysisData.metrics,
      step_performance: analysisData.step_performance,
      common_errors: analysisData.common_errors,
      ai_analysis: aiResponse,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Workflow audit error:', error);
    return Response.json({ 
      error: 'Failed to audit workflow',
      details: error.message 
    }, { status: 500 });
  }
});