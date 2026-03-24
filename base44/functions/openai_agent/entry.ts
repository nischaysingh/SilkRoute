// ============================================================================
// OPENAI AGENT - Core invoker for all AI operations
// ============================================================================

import OpenAI from "npm:openai@4.20.1";
import { SYSTEM_PROMPT } from "../lib/ai/prompts.js";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_TOKENS = 2000;

// Rate limiting (simple in-memory store for demo)
const rateLimits = new Map();

function checkRateLimit(orgId, userId) {
  const now = Date.now();
  const orgKey = `org:${orgId}`;
  const userKey = `user:${userId}`;
  
  // Org limit: 60 req/min
  const orgData = rateLimits.get(orgKey) || { count: 0, resetAt: now + 60000 };
  if (now > orgData.resetAt) {
    orgData.count = 0;
    orgData.resetAt = now + 60000;
  }
  if (orgData.count >= 60) {
    return { allowed: false, reason: "org_rate_limit" };
  }
  orgData.count++;
  rateLimits.set(orgKey, orgData);
  
  // User limit: 10 req/min
  const userData = rateLimits.get(userKey) || { count: 0, resetAt: now + 60000 };
  if (now > userData.resetAt) {
    userData.count = 0;
    userData.resetAt = now + 60000;
  }
  if (userData.count >= 10) {
    return { allowed: false, reason: "user_rate_limit" };
  }
  userData.count++;
  rateLimits.set(userKey, userData);
  
  return { allowed: true };
}

export async function invokeOpenAI({
  model = DEFAULT_MODEL,
  messages = [],
  response_format = null,
  stream = false,
  temperature = 0.2,
  metadata = {}
}) {
  const startTime = Date.now();
  
  try {
    // Inject system prompt if not present
    if (!messages.find(m => m.role === "system")) {
      messages.unshift({ role: "system", content: SYSTEM_PROMPT });
    }
    
    // Build request
    const requestConfig = {
      model,
      messages,
      temperature,
      max_tokens: MAX_TOKENS,
    };
    
    if (response_format) {
      requestConfig.response_format = response_format;
    }
    
    if (stream) {
      requestConfig.stream = true;
    }
    
    // Call OpenAI
    const completion = await openai.chat.completions.create(requestConfig);
    
    const latency = Date.now() - startTime;
    
    // Log observability data
    console.log(JSON.stringify({
      type: "ai_invocation",
      model,
      latency_ms: latency,
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
      stream,
      ...metadata
    }));
    
    if (stream) {
      return completion; // Return stream for SSE
    }
    
    const content = completion.choices[0].message.content;
    
    // Parse JSON if response_format was json_object
    if (response_format?.type === "json_object") {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse JSON response:", content);
        throw new Error("Invalid JSON response from AI");
      }
    }
    
    return content;
    
  } catch (error) {
    console.error("OpenAI invocation failed:", error);
    throw error;
  }
}

// Health check endpoint
Deno.serve(function handler(req) {
  const url = new URL(req.url);
  
  if (url.pathname === "/api/ai/health" || url.pathname.endsWith("/health")) {
    return Response.json({
      ok: true,
      model: DEFAULT_MODEL,
      time: new Date().toISOString()
    });
  }
  
  return Response.json({ error: "Not found" }, { status: 404 });
});