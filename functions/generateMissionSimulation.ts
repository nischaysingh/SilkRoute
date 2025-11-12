import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.20.1';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

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
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an AI mission simulation generator for SilkRoute ATC. Generate realistic operational data for AI missions based on user input. Be creative but realistic with metrics.`
                },
                {
                    role: "user",
                    content: `Generate a realistic AI mission simulation for:
Mission Name: ${missionName}
Objective: ${objective}
Priority: ${priority || 2}

Create realistic operational metrics including:
- Initial status (should be "draft" or "armed")
- Suggested route (pilot/copilot/autopilot based on complexity)
- Expected success rate (85-99%)
- Average latency in ms (300-2000ms)
- Tokens per run (500-2000)
- Spend per run in dollars (0.01-0.10)
- Risk score (0.0-1.0, where higher = riskier)
- Last 10 runs simulation (array of success 0 or 1)

Make it feel like a real mission that's been analyzed and ready to deploy.`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8
        });

        const aiContent = JSON.parse(response.choices[0].message.content);

        // Structure the mission data
        const missionData = {
            name: missionName,
            version: aiContent.version || 1,
            intent: objective,
            owner: user.email,
            status: aiContent.status || "draft",
            priority: priority || 2,
            risk_score: aiContent.risk_score || 0.15,
            // Store simulation metadata for UI display
            simulation_metadata: {
                route: aiContent.route || "pilot",
                lastRun: aiContent.lastRun || "Never",
                successRate: aiContent.successRate || 92,
                avgLatency: aiContent.avgLatency || 840,
                tokensPerRun: aiContent.tokensPerRun || 950,
                spendPerRun: aiContent.spendPerRun || "0.025",
                lastRuns: aiContent.lastRuns || Array.from({ length: 10 }, () => ({ success: Math.random() > 0.1 ? 1 : 0 })),
                confidence: aiContent.confidence || 89,
                estimatedImpact: aiContent.estimatedImpact || "Moderate operational improvement expected",
                suggestedOptimizations: aiContent.suggestedOptimizations || []
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
            details: 'Failed to generate mission simulation'
        }, { status: 500 });
    }
});