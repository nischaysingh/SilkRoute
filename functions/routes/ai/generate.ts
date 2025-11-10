// ============================================================================
// AI ROUTE: Generate Reply (with optional streaming)
// ============================================================================

import { createClientFromRequest } from "npm:@base44/sdk@0.7.1";
import { invokeOpenAI } from "../../openai_agent.js";
import { ReplyJSONSchema, ReplySchema } from "../../../lib/ai/schemas.js";
import { GENERATE_INSTRUCTIONS } from "../../../lib/ai/prompts.js";

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
    
    const { text, tone = "friendly", context, model, stream = false } = await req.json();
    
    if (!text || typeof text !== "string") {
      return Response.json({ error: "Missing or invalid 'text' field" }, { status: 400 });
    }
    
    if (text.length > MAX_INPUT_LENGTH) {
      return Response.json({ 
        error: `Input too long. Max ${MAX_INPUT_LENGTH} characters.` 
      }, { status: 413 });
    }
    
    const userPrompt = context
      ? `Context: ${context}\n\nConversation thread:\n${text}\n\nTone: ${tone}`
      : `Conversation thread:\n${text}\n\nTone: ${tone}`;
    
    const messages = [
      {
        role: "developer",
        content: `${GENERATE_INSTRUCTIONS}\n\nYou must respond with valid JSON matching this schema:\n${JSON.stringify(ReplyJSONSchema, null, 2)}`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];
    
    if (stream) {
      // SSE streaming
      const encoder = new TextEncoder();
      const streamResult = await invokeOpenAI({
        model: model || "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.6, // Higher for generation
        stream: true,
        metadata: {
          route: "/api/ai/generate",
          org_id: user.org_id,
          user_id: user.id
        }
      });
      
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResult) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
      
      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }
    
    // Non-streaming
    const result = await invokeOpenAI({
      model: model || "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.6,
      metadata: {
        route: "/api/ai/generate",
        org_id: user.org_id,
        user_id: user.id
      }
    });
    
    const validated = ReplySchema.parse(result);
    
    const latency = Date.now() - startTime;
    
    console.log(JSON.stringify({
      type: "ai_route_success",
      route: "/api/ai/generate",
      latency_ms: latency,
      user_id: user.id
    }));
    
    return Response.json(validated);
    
  } catch (error) {
    console.error("Generate route error:", error);
    
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