import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
const SIMPLE_SECRET = Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only";
function unauthorized() { return Response.json({ ok:false, error:"Unauthorized" }, { status:401 }); }

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-silk-secret")?.trim() !== SIMPLE_SECRET) return unauthorized();
    const base44 = createClientFromRequest(req);
    const { tracking, order_id = null, carrier = "UPS", trace_id = null } = await req.json();
    
    if (!tracking) {
      return Response.json({ ok:false, error:"Missing 'tracking'" }, { status:400 });
    }

    const statuses = ["label_created", "in_transit", "out_for_delivery", "delivered"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const checked_at = new Date().toISOString();

    if (status === "delivered" && order_id && base44.entities?.Order) {
      await base44.entities.Order.update(order_id, { 
        status: "delivered",
        notes: `Delivered successfully. Tracking: ${tracking}`
      });
    }

    if (base44.entities?.OpsLog) {
      await base44.entities.OpsLog.create({
        ts: new Date().toISOString(),
        event: "shipment_tracked",
        agent: "afterFulfilmentTrackShipment",
        order_id,
        trace_id, 
        level: status === "delivered" ? "info" : "info",
        detail: { carrier, tracking, status, checked_at }
      });
    }

    return Response.json({ ok:true, tracking, carrier, status, checked_at, trace_id });
  } catch (e) {
    return Response.json({ ok:false, error: String(e?.message || e) }, { status:500 });
  }
});