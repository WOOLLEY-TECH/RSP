import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Organizer Login — Birthday RSVP" },
      { name: "description", content: "Sign in to manage the birthday guest list and RSVPs." },
      { property: "og:title", content: "Organizer Login — Birthday RSVP" },
      { property: "og:description", content: "Private dashboard for the party organizer." },
    ],
  }),
  component: AuthPage,
});

const field =
  "w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) return setError(err.message);
      navigate({ to: "/admin" });
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      setBusy(false);
      if (err) return setError(err.message);
      if (data.session) navigate({ to: "/admin" });
      else setMessage("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <main className="flex min-h-screen items-center bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Link to="/" className="text-sm text-muted-foreground">
          ← Back to invitation
        </Link>
        <form onSubmit={onSubmit} className="mt-4 rounded-3xl bg-card p-6 shadow-card">
          <h1 className="font-display text-2xl font-bold">
            {mode === "signin" ? "Organizer login" : "Create organizer account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guests don't need an account — this is only for the party organizer.
          </p>
          <div className="mt-6 space-y-4">
            <input
              className={field}
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={field}
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-accent-foreground">{message}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-primary px-6 py-4 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-sm text-muted-foreground underline"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
