import { sql } from "./neon";
import bcrypt from "bcryptjs";

export async function initializeAuth() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function createAdminUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const rows = await sql`
      INSERT INTO admin_users (email, password_hash)
      VALUES (${email.toLowerCase()}, ${passwordHash})
      RETURNING id, email, created_at
    `;
    return rows[0];
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("duplicate key")) {
      throw new Error("An account with this email already exists");
    }
    throw err;
  }
}

export async function verifyAdminUser(email: string, password: string) {
  const rows = await sql`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${email.toLowerCase()}
  `;
  if (rows.length === 0) {
    throw new Error("Invalid email or password");
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }
  return { id: user.id, email: user.email };
}