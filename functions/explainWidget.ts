import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import OpenAI from 'npm:openai@4.28.0';

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

        const { widgetData, context } = await req.json();

        const prompt = `You are a financial and operational AI assistant analyzing a dashboard widget.

Widget Context:
- Title: ${widgetData.title || 'Unknown'}
- Primary Metric: ${widgetData.metric || 'Not detected'}
- Unit: ${widgetData.unit || 'N/A'}
- Trend: ${widgetData.trend || 'Unknown'}
- Change/Delta: ${widgetData.delta || 'N/A'}
- Time Period: ${widgetData.period || 'Not specified'}
- Dimensions: ${widgetData.dimensions?.join(', ') || 'None'}
- Visible Text: ${widgetData.rawText?.substring(0, 500) || 'None'}
- Page Context: ${context.page || 'Unknown'}
- Current Tab: ${context.tab || 'Unknown'}

Task:
1. Explain what this widget shows in 2-4 clear, actionable bullet points
2. Provide 2-3 intelligent reasons why it might look like this (consider business context, seasonality, operational patterns)
3. Suggest 1-2 specific next actions the user should consider

Return JSON format:
{
  "explanation": ["bullet 1", "bullet 2", ...],
  "reasoning": ["reason 1", "reason 2", ...],
  "suggestions": ["action 1", "action 2"]
}

Be concise, business-focused, and actionable. If data is unclear, acknowledge it gracefully.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert financial and operational analyst helping users understand their dashboard metrics."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 500
        });

        const aiInsights = JSON.parse(response.choices[0].message.content);

        return Response.json({
            explanation: aiInsights.explanation || [],
            reasoning: aiInsights.reasoning || [],
            suggestions: aiInsights.suggestions || [],
            confidence: 0.85
        });

    } catch (error) {
        console.error('Error in explainWidget:', error);
        return Response.json({ 
            error: error.message,
            explanation: ['Unable to generate AI explanation'],
            reasoning: ['An error occurred while analyzing this widget'],
            suggestions: ['Try again or contact support']
        }, { status: 500 });
    }
});