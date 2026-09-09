import { supabase } from "@/integrations/supabase/client";

export type ActivityAction =
  | "rsvp_submitted"
  | "rsvp_updated"
  | "rsvp_deleted"
  | "user_login"
  | "user_logout"
  | "admin_access";

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
    await supabase.from("activity_log").insert({
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details,
      user_id: userId ?? null,
    });
  } catch {
    console.warn("Failed to log activity:", action);
  }
}

export async function getActivityLog(limit = 100) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}