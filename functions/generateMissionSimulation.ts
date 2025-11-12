import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { missionName, objective, priority } = body;

        if (!missionName || !objective) {
            return Response.json({ error: 'missionName and objective are required' }, { status: 400 });
        }

        // Generate realistic mission simulation data via AI
        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a realistic AI mission simulation in JSON format for:

Mission Name: ${missionName}
Objective: ${objective}
Priority: ${priority || 2}

Create realistic operational metrics. Return ONLY a JSON object with these exact fields:
{
  "status": "draft" or "armed",
  "route": "pilot" or "copilot" or "autopilot" (based on complexity - simple tasks go to autopilot, complex to pilot),
  "successRate": number between 85-99,
  "avgLatency": number in milliseconds between 300-2000,
  "tokensPerRun": number between 500-2000,
  "spendPerRun": string like "0.025" (dollars, between 0.01-0.10),
  "risk_score": number between 0.0-1.0 (higher = riskier),
  "confidence": number between 85-95,
  "estimatedImpact": string describing expected business impact,
  "suggestedOptimizations": array of 2-3 optimization suggestions as strings,
  "lastRuns": array of exactly 10 objects like {"success": 1} or {"success": 0}
}

Be creative but realistic. Higher complexity objectives should have higher latency and cost.`,
            response_json_schema: {
                type: "object",
                properties: {
                    status: { type: "string" },
                    route: { type: "string" },
                    successRate: { type: "number" },
                    avgLatency: { type: "number" },
                    tokensPerRun: { type: "number" },
                    spendPerRun: { type: "string" },
                    risk_score: { type: "number" },
                    confidence: { type: "number" },
                    estimatedImpact: { type: "string" },
                    suggestedOptimizations: { 
                        type: "array",
                        items: { type: "string" }
                    },
                    lastRuns: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                success: { type: "number" }
                            }
                        }
                    }
                }
            }
        });

        // Structure the mission data
        const missionData = {
            name: missionName,
            version: 1,
            intent: objective,
            owner: user.email,
            status: aiResponse.status || "draft",
            priority: priority || 2,
            risk_score: aiResponse.risk_score || 0.15,
            simulation_metadata: {
                route: aiResponse.route || "pilot",
                lastRun: "Never",
                successRate: aiResponse.successRate || 92,
                avgLatency: aiResponse.avgLatency || 840,
                tokensPerRun: aiResponse.tokensPerRun || 950,
                spendPerRun: aiResponse.spendPerRun || "0.025",
                lastRuns: aiResponse.lastRuns || Array.from({ length: 10 }, () => ({ success: Math.random() > 0.1 ? 1 : 0 })),
                confidence: aiResponse.confidence || 89,
                estimatedImpact: aiResponse.estimatedImpact || "Moderate operational improvement expected",
                suggestedOptimizations: aiResponse.suggestedOptimizations || []
            }
        };

        // Save to AIMission entity
        const savedMission = await base44.entities.AIMission.create(missionData);

        return Response.json({
            success: true,
            mission: savedMission,
            aiGenerated: true,
            message: `Mission "${missionName}" simulated and ready for deployment`
        });

    } catch (error) {
        console.error('Error generating mission simulation:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to generate mission simulation',
            stack: error.stack
        }, { status: 500 });
    }
});