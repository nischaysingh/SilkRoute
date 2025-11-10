// ============================================================================
// AI ROUTE: Strategic Planning / Next-Best-Actions
// ============================================================================

import { createClientFromRequest } from "npm:@base44/sdk@0.7.1";
import { invokeOpenAI } from "../../openai_agent.js";
import { PlanJSONSchema, PlanSchema } from "../../../lib/ai/schemas.js";
import { PLAN_INSTRUCTIONS } from "../../../lib/ai/prompts.js";

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
    
    const { objective, context, model } = await req.json();
    
    if (!objective || typeof objective !== "string") {
      return Response.json({ error: "Missing or invalid 'objective' field" }, { status: 400 });
    }
    
    const combinedText = context ? `${objective}\n\n${context}` : objective;
    
    if (combinedText.length > MAX_INPUT_LENGTH) {
      return Response.json({ 
        error: `Input too long. Max ${MAX_INPUT_LENGTH} characters.` 
      }, { status: 413 });
    }
    
    const userPrompt = context
      ? `Objective: ${objective}\n\nContext:\n${context}`
      : `Objective: ${objective}`;
    
    const messages = [
      {
        role: "developer",
        content: `${PLAN_INSTRUCTIONS}\n\nYou must respond with valid JSON matching this schema:\n${JSON.stringify(PlanJSONSchema, null, 2)}`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];
    
    const result = await invokeOpenAI({
      model: model || "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.6, // Higher for creative planning
      metadata: {
        route: "/api/ai/plan",
        org_id: user.org_id,
        user_id: user.id
      }
    });
    
    const validated = PlanSchema.parse(result);
    
    const latency = Date.now() - startTime;
    
    console.log(JSON.stringify({
      type: "ai_route_success",
      route: "/api/ai/plan",
      latency_ms: latency,
      user_id: user.id
    }));
    
    return Response.json(validated);
    
  } catch (error) {
    console.error("Plan route error:", error);
    
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