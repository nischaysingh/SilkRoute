import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
const SIMPLE_SECRET = Deno.env.get("SILK_SHARED_SECRET") ?? "sh_silkroute_only";
function unauthorized() { return Response.json({ ok:false, error:"Unauthorized" }, { status:401 }); }

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-silk-secret")?.trim() !== SIMPLE_SECRET) return unauthorized();
    const base44 = createClientFromRequest(req);
    const { assignee, title, description = "", order_id = null, due_date = null, trace_id = null } = await req.json();

    if (!assignee || !title) {
      return Response.json({ ok:false, error:"Missing 'assignee' or 'title'" }, { status:400 });
    }

    const payload = { 
      assignee, 
      title, 
      description, 
      order_id,
      status: "assigned", 
      due_date,
      trace_id 
    };

    let id = `demo-${crypto.randomUUID()}`;
    if (base44.entities?.HRAssignment) {
      const row = await base44.entities.HRAssignment.create(payload);
      id = row.id;
    }

    if (base44.entities?.OpsLog) {
      await base44.entities.OpsLog.create({
        ts: new Date().toISOString(),
        event: "hr_task_assigned",
        agent: "hrAssignTask",
        order_id,
        trace_id, 
        level: "info",
        detail: { id, assignee, title }
      });
    }

    return Response.json({ ok:true, task_id: id, trace_id });
  } catch (e) {
    return Response.json({ ok:false, error: String(e?.message || e) }, { status:500 });
  }
});