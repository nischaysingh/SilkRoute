import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
const SIMPLE_SECRET = Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only";
function unauthorized() { return Response.json({ ok:false, error:"Unauthorized" }, { status:401 }); }

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-silk-secret")?.trim() !== SIMPLE_SECRET) return unauthorized();
    const base44 = createClientFromRequest(req);
    const { order_id = null, amount, currency = "USD", txn_type = "sale", trace_id = null, meta = {} } = await req.json();

    if (amount === undefined || amount === null) {
      return Response.json({ ok:false, error:"Missing 'amount'" }, { status:400 });
    }

    const payload = {
      order_id, 
      amount: Number(amount), 
      currency, 
      txn_type, 
      status: "completed",
      meta, 
      trace_id
    };

    let id = `demo-${crypto.randomUUID()}`;
    if (base44.entities?.AccountingTransaction) {
      const row = await base44.entities.AccountingTransaction.create(payload);
      id = row.id;
    }

    if (base44.entities?.OpsLog) {
      await base44.entities.OpsLog.create({
        ts: new Date().toISOString(),
        event: "accounting_txn_recorded",
        agent: "accountingRecordTransaction",
        order_id,
        trace_id, 
        level: "info",
        detail: { id, amount, currency, txn_type }
      });
    }

    return Response.json({ ok:true, txn_id: id, trace_id });
  } catch (e) {
    return Response.json({ ok:false, error: String(e?.message || e) }, { status:500 });
  }
});