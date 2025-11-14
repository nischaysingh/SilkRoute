import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

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

        const { persona_id, message, conversation_history } = await req.json();

        if (!persona_id || !message) {
            return Response.json({ error: 'persona_id and message are required' }, { status: 400 });
        }

        // Fetch the persona
        const personas = await base44.asServiceRole.entities.AIAgentPersona.filter({ id: persona_id });
        const persona = personas[0];

        if (!persona) {
            return Response.json({ error: 'Persona not found' }, { status: 404 });
        }

        // Fetch contextual data for realistic responses
        const [orders, inventory, people, missions, crmTasks] = await Promise.all([
            base44.asServiceRole.entities.Order.list('-created_date', 10),
            base44.asServiceRole.entities.Inventory.list('-created_date', 10),
            base44.asServiceRole.entities.People.list('-created_date', 10),
            base44.asServiceRole.entities.AIMission.list('-created_date', 10),
            base44.asServiceRole.entities.CRMTask.list('-created_date', 10)
        ]);

        // Build system prompt based on persona configuration
        const systemPrompt = `You are ${persona.name}, an AI persona with the following characteristics:

DESCRIPTION: ${persona.description}

PERSONALITY TRAITS: ${persona.personality_traits?.join(', ') || 'Professional, helpful'}

COMMUNICATION STYLE:
- Tone: ${persona.communication_style?.tone || 'professional'}
- Verbosity: ${persona.communication_style?.verbosity || 'moderate'}
- Use Emojis: ${persona.communication_style?.emoji_usage ? 'Yes' : 'No'}

KNOWLEDGE DOMAINS: ${persona.knowledge_domains?.join(', ') || 'General business operations'}

SPECIALIZED TASKS: ${persona.specialized_tasks?.join(', ') || 'General assistance'}

CUSTOM INSTRUCTIONS: ${persona.system_prompt || 'Provide helpful, accurate assistance'}

CURRENT BUSINESS CONTEXT (use this to provide realistic, data-driven responses):

Recent Orders (last 10):
${JSON.stringify(orders.slice(0, 5).map(o => ({
    order_number: o.order_number,
    customer: o.customer_name,
    product: o.product_name,
    amount: o.total_amount,
    status: o.status,
    date: o.order_date
})), null, 2)}

Current Inventory Status:
${JSON.stringify(inventory.slice(0, 5).map(i => ({
    sku: i.sku,
    product: i.product_name,
    stock: i.quantity_in_stock,
    reorder_level: i.reorder_level
})), null, 2)}

Team Members:
${JSON.stringify(people.slice(0, 5).map(p => ({
    name: p.name,
    type: p.type,
    department: p.dept
})), null, 2)}

Active AI Missions:
${JSON.stringify(missions.filter(m => m.status === 'running' || m.status === 'armed').slice(0, 3).map(m => ({
    name: m.name,
    status: m.status,
    intent: m.intent
})), null, 2)}

Open CRM Tasks:
${JSON.stringify(crmTasks.filter(t => t.status === 'open').slice(0, 3).map(t => ({
    customer: t.customer_name,
    subject: t.subject
})), null, 2)}

IMPORTANT GUIDELINES:
1. Always respond in character according to your personality and communication style
2. Use the business context above to provide specific, data-driven insights
3. When asked about metrics, reference actual data from the context
4. If you don't have specific data, acknowledge it but provide helpful guidance
5. Be conversational but maintain your defined personality traits
6. Demonstrate your specialized knowledge in your assigned domains

Current user: ${user.full_name || user.email}
User role: ${user.role}`;

        // Build messages array
        const messages = [
            { role: "system", content: systemPrompt },
            ...(conversation_history || []),
            { role: "user", content: message }
        ];

        // Call OpenAI with persona-specific configuration
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: persona.communication_style?.verbosity === 'detailed' ? 0.8 : 
                        persona.communication_style?.verbosity === 'brief' ? 0.5 : 0.7,
            max_tokens: persona.communication_style?.verbosity === 'detailed' ? 1000 : 
                       persona.communication_style?.verbosity === 'brief' ? 300 : 600,
        });

        const assistantMessage = response.choices[0].message.content;

        return Response.json({
            response: assistantMessage,
            persona_name: persona.name,
            usage: {
                prompt_tokens: response.usage.prompt_tokens,
                completion_tokens: response.usage.completion_tokens,
                total_tokens: response.usage.total_tokens
            }
        });

    } catch (error) {
        console.error('Persona chat error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});