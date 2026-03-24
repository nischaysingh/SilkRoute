// ============================================================================
// AI ROUTE: Intent Classification & Entity Extraction
// ============================================================================

import { createClientFromRequest } from "npm:@base44/sdk@0.7.1";
import { invokeOpenAI } from "../../openai_agent.js";
import { IntentJSONSchema, IntentSchema } from "../../../lib/ai/schemas.js";
import { CLASSIFY_INSTRUCTIONS } from "../../../lib/ai/prompts.js";

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
    
    const { text, model } = await req.json();
    
    if (!text || typeof text !== "string") {
      return Response.json({ error: "Missing or invalid 'text' field" }, { status: 400 });
    }
    
    if (text.length > MAX_INPUT_LENGTH) {
      return Response.json({ 
        error: `Input too long. Max ${MAX_INPUT_LENGTH} characters.` 
      }, { status: 413 });
    }
    
    const messages = [
      {
        role: "developer",
        content: `${CLASSIFY_INSTRUCTIONS}\n\nYou must respond with valid JSON matching this schema:\n${JSON.stringify(IntentJSONSchema, null, 2)}`
      },
      {
        role: "user",
        content: `Extract intents and entities from this text:\n\n${text}`
      }
    ];
    
    const result = await invokeOpenAI({
      model: model || "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
      metadata: {
        route: "/api/ai/classify",
        org_id: user.org_id,
        user_id: user.id
      }
    });
    
    const validated = IntentSchema.parse(result);
    
    const latency = Date.now() - startTime;
    
    console.log(JSON.stringify({
      type: "ai_route_success",
      route: "/api/ai/classify",
      latency_ms: latency,
      user_id: user.id
    }));
    
    return Response.json(validated);
    
  } catch (error) {
    console.error("Classify route error:", error);
    
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