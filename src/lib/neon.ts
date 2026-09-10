import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_DATABASE_URL!, {
  disableWarningInBrowsers: true,
});

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      attending BOOLEAN NOT NULL,
      additional_guests INTEGER NOT NULL DEFAULT 0,
      guest_names TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id UUID,
      details JSONB DEFAULT '{}',
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gifts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      gifter_name TEXT NOT NULL,
      gifter_phone TEXT NOT NULL,
      gifter_email TEXT,
      gift_message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps (created_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log (created_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON gifts (created_at DESC)
  `;
}

export { sql };
