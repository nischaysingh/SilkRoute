import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, input_data = {} } = await req.json();

    if (!workflow_id) {
      return Response.json({ error: 'workflow_id is required' }, { status: 400 });
    }

    // Fetch workflow
    const workflows = await base44.entities.Workflow.filter({ id: workflow_id });
    if (!workflows || workflows.length === 0) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }
    const workflow = workflows[0];

    if (workflow.status !== 'active') {
      return Response.json({ error: 'Workflow is not active' }, { status: 400 });
    }

    const startTime = new Date();
    
    // Create execution record
    const execution = await base44.entities.WorkflowExecution.create({
      workflow_id: workflow.id,
      workflow_name: workflow.name,
      workflow_version: workflow.version || 1,
      start_time: startTime.toISOString(),
      status: 'running',
      triggered_by: user.email,
      input_data,
      step_performance: [],
      resource_usage_summary: {
        total_llm_tokens: 0,
        total_cost_usd: 0,
        api_calls_count: 0
      }
    });

    // Execute steps
    const stepResults = [];
    let totalTokens = 0;
    let totalCost = 0;
    let overallStatus = 'succeeded';
    
    for (const step of workflow.steps) {
      const stepStartTime = Date.now();
      let stepStatus = 'succeeded';
      let stepError = null;
      let stepTokens = 0;
      let stepCost = 0;

      try {
        // Simulate step execution based on type
        switch (step.type) {
          case 'condition':
            // Simulate condition check
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
            break;
          
          case 'alert':
            // Simulate alert sending
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
            break;
          
          case 'wait':
            // Simulate wait
            const waitTime = step.config?.duration || 1000;
            await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 5000)));
            break;
          
          case 'ai_action':
            // Simulate AI call with random token usage
            stepTokens = Math.floor(Math.random() * 500 + 200);
            stepCost = stepTokens * 0.00002; // Approximate cost
            totalTokens += stepTokens;
            totalCost += stepCost;
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300));
            break;
          
          case 'data_transform':
            // Simulate data transformation
            await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 75));
            break;
          
          case 'external_api':
            // Simulate external API call
            await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200));
            break;
          
          default:
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        }

        // Randomly simulate failures (5% chance)
        if (Math.random() < 0.05) {
          throw new Error(`Step ${step.name} failed: Simulated error`);
        }

      } catch (error) {
        stepStatus = 'failed';
        stepError = error.message;
        overallStatus = 'failed';
      }

      const stepDuration = Date.now() - stepStartTime;
      
      stepResults.push({
        step_name: step.name,
        step_type: step.type,
        duration_ms: stepDuration,
        status: stepStatus,
        resource_usage: {
          tokens: stepTokens,
          cost_usd: stepCost
        },
        error: stepError
      });
    }

    const endTime = new Date();
    const totalDuration = endTime - startTime;

    // Update execution record
    await base44.entities.WorkflowExecution.update(execution.id, {
      end_time: endTime.toISOString(),
      duration_ms: totalDuration,
      status: overallStatus,
      step_performance: stepResults,
      resource_usage_summary: {
        total_llm_tokens: totalTokens,
        total_cost_usd: parseFloat(totalCost.toFixed(6)),
        api_calls_count: workflow.steps.length
      },
      output_data: {
        steps_completed: stepResults.length,
        successful_steps: stepResults.filter(s => s.status === 'succeeded').length
      },
      ...(overallStatus === 'failed' && {
        error_details: {
          message: 'One or more steps failed',
          failed_steps: stepResults.filter(s => s.status === 'failed').map(s => s.step_name)
        }
      })
    });

    return Response.json({
      execution_id: execution.id,
      workflow_id,
      status: overallStatus,
      duration_ms: totalDuration,
      steps_executed: stepResults.length,
      steps_succeeded: stepResults.filter(s => s.status === 'succeeded').length,
      steps_failed: stepResults.filter(s => s.status === 'failed').length,
      resource_usage: {
        total_tokens: totalTokens,
        total_cost_usd: totalCost.toFixed(6)
      },
      step_results: stepResults
    });

  } catch (error) {
    console.error('Workflow execution error:', error);
    return Response.json({ 
      error: 'Failed to execute workflow',
      details: error.message 
    }, { status: 500 });
  }
});