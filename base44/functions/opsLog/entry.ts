import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
const SIMPLE_SECRET = Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only";
function unauthorized() { return Response.json({ ok:false, error:"Unauthorized" }, { status:401 }); }

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-silk-secret")?.trim() !== SIMPLE_SECRET) return unauthorized();
    const base44 = createClientFromRequest(req);
    const { event, level = "info", order_id = null, detail = {}, trace_id = null } = await req.json();

    if (!event) {
      return Response.json({ ok:false, error:"Missing 'event'" }, { status:400 });
    }

    let logged = { 
      ts: new Date().toISOString(), 
      agent: "opsLog",
      event, 
      level, 
      order_id,
      trace_id, 
      detail 
    };
    
    if (base44.entities?.OpsLog) {
      const row = await base44.entities.OpsLog.create(logged);
      logged = { ...logged, id: row.id };
    }

    return Response.json({ ok:true, logged });
  } catch (e) {
    return Response.json({ ok:false, error: String(e?.message || e) }, { status:500 });
  }
});