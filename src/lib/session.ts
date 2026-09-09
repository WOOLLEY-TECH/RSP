export function createSession(userId: string, email: string) {
  const session = { userId, email, createdAt: Date.now() };
  localStorage.setItem("admin_session", JSON.stringify(session));
}

export function getSession(): { userId: string; email: string } | null {
  try {
    const stored = localStorage.getItem("admin_session");
    if (!stored) return null;
    const session = JSON.parse(stored);
    const dayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > 7 * dayMs) {
      localStorage.removeItem("admin_session");
      return null;
    }
    return { userId: session.userId, email: session.email };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("admin_session");
}