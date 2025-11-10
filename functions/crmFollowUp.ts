import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
const SIMPLE_SECRET = Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only";
function unauthorized() { return Response.json({ ok:false, error:"Unauthorized" }, { status:401 }); }

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-silk-secret")?.trim() !== SIMPLE_SECRET) return unauthorized();
    const base44 = createClientFromRequest(req);
    const { customer_email, customer_name = null, subject, body = "", order_id = null, due_date = null, trace_id = null } = await req.json();

    if (!customer_email || !subject) {
      return Response.json({ ok:false, error:"Missing 'customer_email' or 'subject'" }, { status:400 });
    }

    const payload = { 
      customer_email,
      customer_name,
      subject, 
      body, 
      order_id,
      status: "open", 
      due_date,
      trace_id 
    };

    let id = `demo-${crypto.randomUUID()}`;
    if (base44.entities?.CRMTask) {
      const row = await base44.entities.CRMTask.create(payload);
      id = row.id;
    }

    if (base44.entities?.OpsLog) {
      await base44.entities.OpsLog.create({
        ts: new Date().toISOString(),
        event: "crm_followup_created",
        agent: "crmFollowUp",
        order_id,
        trace_id, 
        level: "info",
        detail: { id, customer_email, subject }
      });
    }

    return Response.json({ ok:true, followup_id: id, trace_id });
  } catch (e) {
    return Response.json({ ok:false, error: String(e?.message || e) }, { status:500 });
  }
});