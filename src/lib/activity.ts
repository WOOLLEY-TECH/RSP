import { sql } from "./neon";

export type ActivityAction =
  | "rsvp_submitted"
  | "rsvp_updated"
  | "rsvp_deleted"
  | "user_login"
  | "user_logout"
  | "admin_access"
  | "gift_submitted";

export async function logActivity({
  action,
  entityType,
  entityId,
  details = {},
  userId,
}: {
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  userId?: string;
}) {
  try {
    await sql`
      INSERT INTO activity_log (action, entity_type, entity_id, details, user_id)
      VALUES (${action}, ${entityType}, ${entityId ?? null}, ${JSON.stringify(details)}, ${userId ?? null})
    `;
  } catch {
    console.warn("Failed to log activity:", action);
  }
}

export async function getActivityLog(limit = 100) {
  const rows = await sql`
    SELECT * FROM activity_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows;
}
