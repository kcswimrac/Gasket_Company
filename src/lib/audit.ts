import { neon } from "@neondatabase/serverless";

export async function logAudit(opts: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO audit_log (action, entity_type, entity_id, details, ip_address)
      VALUES (${opts.action}, ${opts.entityType}, ${opts.entityId || null}, ${JSON.stringify(opts.details || {})}::jsonb, ${opts.ip || null})
    `;
  } catch { /* audit failure should never crash the main operation */ }
}
