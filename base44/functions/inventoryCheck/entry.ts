import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const SIMPLE_SECRET = (Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only").trim();

function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

Deno.serve(async (req) => {
  try {
    if ((req.headers.get("x-silk-secret") || "").trim() !== SIMPLE_SECRET) {
      return unauthorized();
    }

    const base44 = createClientFromRequest(req);
    const { items, trace_id } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ ok: false, error: "Missing items[]" }, { status: 400 });
    }

    const Inventory = base44.entities && base44.entities.Inventory;
    const availability = [];

    if (!Inventory) {
      for (const it of items) {
        const sku = it?.sku ?? null;
        const product_name = it?.product_name ?? null;
        const quantity = it?.quantity ?? 0;

        availability.push({
          sku,
          product_name,
          requested: Number(quantity) || 0,
          available_qty: 0,
          reorder_level: 0,
          in_stock: false
        });
      }
      return Response.json({
        ok: true,
        overall_status: "out_of_stock",
        availability,
        trace_id: trace_id ?? null
      });
    }

    for (const it of items) {
      const sku = it?.sku ?? null;
      const product_name = it?.product_name ?? null;
      const quantity = it?.quantity ?? 0;

      if (!sku && !product_name) continue;

      const filter = sku ? { sku } : { product_name };
      const inv = await Inventory.list({ filter, limit: 1 });
      const row = inv?.data?.[0];

      const on_hand = Number(row?.quantity_in_stock ?? 0);
      const reqd = Math.max(0, Number(quantity) || 0);
      const in_stock = on_hand >= reqd;

      availability.push({
        sku: row?.sku ?? sku ?? null,
        product_name: row?.product_name ?? product_name ?? null,
        requested: reqd,
        available_qty: on_hand,
        reorder_level: Number(row?.reorder_level ?? 0),
        in_stock
      });
    }

    const anyOOS = availability.some(a => a.requested > 0 && a.available_qty === 0);
    const anyPartial = availability.some(a => a.available_qty > 0 && a.available_qty < a.requested);
    const overall_status = anyOOS ? "out_of_stock" : (anyPartial ? "partial" : "in_stock");

    if (base44.entities && base44.entities.OpsLog) {
      await base44.entities.OpsLog.create({
        ts: new Date().toISOString(),
        event: "inventory_checked",
        agent: "inventoryCheck",
        trace_id: trace_id ?? null,
        level: "info",
        detail: { availability, overall_status }
      });
    }

    return Response.json({ ok: true, overall_status, availability, trace_id: trace_id ?? null });
  } catch (e) {
    return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
});