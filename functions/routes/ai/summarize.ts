// ============================================================================
// AI ROUTE: Summarize
// ============================================================================

import { createClientFromRequest } from "npm:@base44/sdk@0.7.1";
import { invokeOpenAI } from "../../openai_agent.js";
import { SummaryJSONSchema, SummarySchema } from "../../../lib/ai/schemas.js";
import { SUMMARIZE_INSTRUCTIONS } from "../../../lib/ai/prompts.js";

const MAX_INPUT_LENGTH = 12000;

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { text, context, model } = await req.json();
    
    if (!text || typeof text !== "string") {
      return Response.json({ error: "Missing or invalid 'text' field" }, { status: 400 });
    }
    
    if (text.length > MAX_INPUT_LENGTH) {
      return Response.json({ 
        error: `Input too long. Max ${MAX_INPUT_LENGTH} characters.` 
      }, { status: 413 });
    }
    
    // Build prompt
    const userPrompt = context 
      ? `Context: ${context}\n\nText to summarize:\n${text}`
      : `Text to summarize:\n${text}`;
    
    const messages = [
      {
        role: "developer",
        content: `${SUMMARIZE_INSTRUCTIONS}\n\nYou must respond with valid JSON matching this schema:\n${JSON.stringify(SummaryJSONSchema, null, 2)}`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];
    
    // Invoke OpenAI
    const result = await invokeOpenAI({
      model: model || "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
      metadata: {
        route: "/api/ai/summarize",
        org_id: user.org_id,
        user_id: user.id
      }
    });
    
    // Validate with Zod
    const validated = SummarySchema.parse(result);
    
    const latency = Date.now() - startTime;
    
    console.log(JSON.stringify({
      type: "ai_route_success",
      route: "/api/ai/summarize",
      latency_ms: latency,
      user_id: user.id
    }));
    
    return Response.json(validated);
    
  } catch (error) {
    console.error("Summarize route error:", error);
    
    if (error.name === "ZodError") {
      return Response.json({ 
        error: "AI returned invalid response",
        details: error.issues 
      }, { status: 422 });
    }
    
    return Response.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
});