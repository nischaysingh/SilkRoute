import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { timeRangeDays = 30, analysisDepth = "comprehensive" } = body;

    // Fetch data for audit
    const [personas, missions, workflows, executions, auditLogs, requests] = await Promise.all([
      base44.asServiceRole.entities.AIAgentPersona.list(),
      base44.asServiceRole.entities.AIMission.list(),
      base44.asServiceRole.entities.Workflow.list(),
      base44.asServiceRole.entities.WorkflowExecution.list('-created_date', 100),
      base44.asServiceRole.entities.AuditLog.list('-created_date', 200),
      base44.asServiceRole.entities.AIRequest.list('-created_date', 150)
    ]);

    // Filter by time range
    const cutoffDate = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);
    const recentExecutions = executions.filter(e => new Date(e.created_date) > cutoffDate);
    const recentLogs = auditLogs.filter(l => new Date(l.timestamp) > cutoffDate);
    const recentRequests = requests.filter(r => new Date(r.created_date) > cutoffDate);

    // Calculate statistics
    const totalInteractions = recentRequests.length;
    const failedRequests = recentRequests.filter(r => r.state === 'failed').length;
    const highRiskRequests = recentRequests.filter(r => r.risk_score > 0.7).length;
    const piiRequests = recentRequests.filter(r => r.pii === true).length;

    const totalWorkflowRuns = recentExecutions.length;
    const failedWorkflows = recentExecutions.filter(e => e.status === 'failed').length;
    const avgWorkflowDuration = recentExecutions.length > 0
      ? recentExecutions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / recentExecutions.length
      : 0;

    // Construct comprehensive AI audit prompt
    const auditPrompt = `Perform a comprehensive AI system audit analyzing security, bias, and performance.

SYSTEM OVERVIEW:
- Time period: Last ${timeRangeDays} days
- Active AI Personas: ${personas.filter(p => p.status === 'active').length}
- Active Missions: ${missions.filter(m => m.status === 'running').length}
- Active Workflows: ${workflows.filter(w => w.status === 'active').length}

INTERACTION STATISTICS:
- Total AI Requests: ${totalInteractions}
- Failed Requests: ${failedRequests} (${((failedRequests / totalInteractions) * 100).toFixed(1)}%)
- High Risk Requests: ${highRiskRequests}
- PII Detected: ${piiRequests} requests
- Workflow Executions: ${totalWorkflowRuns}
- Failed Workflows: ${failedWorkflows}
- Avg Workflow Duration: ${avgWorkflowDuration.toFixed(0)}ms

PERSONAS ANALYSIS:
${personas.map(p => `- ${p.name}: ${p.status}, ${p.knowledge_domains?.length || 0} domains, ${((p.performance_metrics?.avg_user_satisfaction || 0) * 100).toFixed(0)}% satisfaction`).join('\n')}

REQUEST PATTERNS:
${recentRequests.slice(0, 20).map(r => `- Source: ${r.source}, Intent: ${r.intent}, Risk: ${r.risk_score?.toFixed(2) || 'N/A'}, Route: ${r.route}`).join('\n')}

AUDIT LOG PATTERNS:
- Total actions logged: ${recentLogs.length}
- Critical severity events: ${recentLogs.filter(l => l.severity === 'critical').length}
- High severity events: ${recentLogs.filter(l => l.severity === 'high').length}
- Compliance-relevant actions: ${recentLogs.filter(l => l.compliance_relevant).length}

Provide a thorough audit covering:

1. BIAS DETECTION
- Identify any patterns suggesting bias in routing, prioritization, or decision-making
- Analyze if certain sources/intents are treated unfairly
- Check for demographic or categorical bias in persona assignments

2. SECURITY RISKS
- Identify security vulnerabilities in AI request handling
- Analyze PII handling and data privacy compliance
- Check for potential data leakage or unauthorized access patterns
- Review authentication and authorization patterns

3. PERFORMANCE ISSUES
- Identify bottlenecks and inefficiencies
- Analyze failure patterns and root causes
- Suggest optimization opportunities
- Review resource utilization

4. COMPLIANCE & GOVERNANCE
- Check adherence to policies and regulations
- Identify missing audit trails
- Review access control patterns
- Assess data retention compliance

5. OPERATIONAL EXCELLENCE
- Identify best practices being followed
- Suggest areas for improvement
- Recommend automation opportunities
- Strategic recommendations for AI system evolution

Return detailed JSON audit report.`;

    const auditResponse = await base44.integrations.Core.InvokeLLM({
      prompt: auditPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: {
            type: "object",
            properties: {
              overall_health_score: { type: "number" },
              risk_level: { type: "string" },
              compliance_status: { type: "string" },
              key_findings: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          bias_analysis: {
            type: "object",
            properties: {
              bias_detected: { type: "boolean" },
              severity: { type: "string" },
              findings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    description: { type: "string" },
                    evidence: { type: "string" },
                    recommendation: { type: "string" }
                  }
                }
              }
            }
          },
          security_risks: {
            type: "object",
            properties: {
              critical_risks: { type: "number" },
              high_risks: { type: "number" },
              risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    severity: { type: "string" },
                    description: { type: "string" },
                    mitigation: { type: "string" },
                    affected_systems: {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          performance_analysis: {
            type: "object",
            properties: {
              bottlenecks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    component: { type: "string" },
                    issue: { type: "string" },
                    impact: { type: "string" },
                    optimization: { type: "string" }
                  }
                }
              },
              efficiency_score: { type: "number" },
              cost_optimization_opportunities: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          compliance_assessment: {
            type: "object",
            properties: {
              compliant: { type: "boolean" },
              violations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    regulation: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string" },
                    remediation: { type: "string" }
                  }
                }
              },
              audit_trail_completeness: { type: "number" }
            }
          },
          recommendations: {
            type: "object",
            properties: {
              immediate_actions: {
                type: "array",
                items: { type: "string" }
              },
              short_term: {
                type: "array",
                items: { type: "string" }
              },
              long_term: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Log the audit execution
    await base44.entities.AuditLog.create({
      timestamp: new Date().toISOString(),
      user_email: user.email,
      user_name: user.full_name,
      action_type: "ai_audit_execute",
      action_description: "Executed comprehensive AI system audit",
      resource_type: "system",
      metadata: {
        time_range_days: timeRangeDays,
        analysis_depth: analysisDepth,
        interactions_analyzed: totalInteractions,
        workflows_analyzed: totalWorkflowRuns,
        personas_analyzed: personas.length
      },
      status: "success",
      severity: "high",
      compliance_relevant: true
    });

    return Response.json({
      success: true,
      audit_report: auditResponse,
      metadata: {
        analysis_date: new Date().toISOString(),
        time_range_days: timeRangeDays,
        data_points_analyzed: {
          ai_requests: totalInteractions,
          workflow_executions: totalWorkflowRuns,
          audit_logs: recentLogs.length,
          personas: personas.length,
          missions: missions.length
        }
      }
    });

  } catch (error) {
    console.error('AI Audit error:', error);
    return Response.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});