import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
const SIMPLE_SECRET = Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only";
function unauthorized() { return Response.json({ ok:false, error:"Unauthorized" }, { status:401 }); }

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-silk-secret")?.trim() !== SIMPLE_SECRET) return unauthorized();
    const base44 = createClientFromRequest(req);
    const { order_id, carrier = "UPS", trace_id = null } = await req.json();
    
    if (!order_id) {
      return Response.json({ ok:false, error:"Missing 'order_id'" }, { status:400 });
    }

    const tracking = `TRK-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
    const shipped_at = new Date().toISOString();

    if (base44.entities?.Order) {
      await base44.entities.Order.update(order_id, { 
        status: "shipped", 
        notes: `Shipped via ${carrier}. Tracking: ${tracking}`
      });
    }

    if (base44.entities?.OpsLog) {
      await base44.entities.OpsLog.create({
        ts: new Date().toISOString(),
        event: "order_shipped",
        agent: "logisticsShipOrder",
        trace_id, 
        level: "info",
        order_id, 
        detail: { carrier, tracking, shipped_at }
      });
    }

    return Response.json({ ok:true, order_id, carrier, tracking, shipped_at, trace_id });
  } catch (e) {
    return Response.json({ ok:false, error: String(e?.message || e) }, { status:500 });
  }
});