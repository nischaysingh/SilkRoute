import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
const SIMPLE_SECRET = Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only";
function unauthorized() { return Response.json({ ok:false, error:"Unauthorized" }, { status:401 }); }

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-silk-secret")?.trim() !== SIMPLE_SECRET) return unauthorized();
    const base44 = createClientFromRequest(req);
    const { order, trace_id } = await req.json();

    if (!order || typeof order !== "object") {
      return Response.json({ ok:false, error:"Missing 'order' object" }, { status:400 });
    }

    const Orders = base44.entities?.Order;
    if (!Orders) {
      return Response.json({ ok:true, order_id: `demo-${crypto.randomUUID()}`, trace_id: trace_id ?? null });
    }

    let saved, id;
    if (order.order_number) {
      const existing = await Orders.list({ filter: { order_number: order.order_number }, limit: 1 });
      if (existing?.data?.[0]) {
        id = existing.data[0].id;
        saved = await Orders.update(id, order);
      } else {
        saved = await Orders.create(order);
        id = saved.id;
      }
    } else {
      saved = await Orders.create(order);
      id = saved.id;
    }

    if (base44.entities?.OpsLog) {
      await base44.entities.OpsLog.create({
        ts: new Date().toISOString(),
        event: "order_upserted",
        agent: "ordersUpsert",
        order_id: id,
        trace_id: trace_id ?? null,
        level: "info",
        detail: { order_number: order.order_number ?? null }
      });
    }

    return Response.json({ ok:true, order_id: id, trace_id: trace_id ?? null });
  } catch (e) {
    return Response.json({ ok:false, error: String(e?.message || e) }, { status:500 });
  }
});