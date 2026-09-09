import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import { sql } from "@/lib/neon";
import { party, mapEmbedUrl } from "@/lib/party";
import { logActivity } from "@/lib/activity";
import giftImg from "@/assets/gift.png";

export const Route = createFileRoute("/rsvp")({
  head: () => ({
    meta: [
      { title: `RSVP — ${party.title}` },
      {
        name: "description",
        content: "Let us know if you can make it, and how many people are coming with you.",
      },
      { property: "og:title", content: `RSVP — ${party.title}` },
      { property: "og:description", content: "Confirm your attendance in under a minute." },
    ],
  }),
  component: RsvpPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number is too long"),
});

const field =
  "w-full min-w-0 rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary";

function RsvpPage() {
  const [step, setStep] = useState<"form" | "summary" | "done">("form");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [bringing, setBringing] = useState<boolean | null>(null);
  const [guests, setGuests] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

  const cleanGuests = useMemo(
    () => (attending && bringing ? guests.map((g) => g.trim()).filter(Boolean) : []),
    [attending, bringing, guests]
  );
  const total = useMemo(() => (attending ? 1 + cleanGuests.length : 0), [attending, cleanGuests.length]);

  function review() {
    const parsed = schema.safeParse({ fullName, phone });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid details");
    if (attending === null) return setError("Please tell us if you'll be attending");
    if (attending && bringing === null)
      return setError("Please tell us if you're bringing someone");
    if (attending && bringing && cleanGuests.length === 0)
      return setError("Please enter the name of at least one additional guest");
    setError(null);
    setStep("summary");
  }

  const submit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const rows = await sql`
        INSERT INTO rsvps (full_name, phone_number, attending, additional_guests, guest_names)
        VALUES (${fullName.trim()}, ${phone.trim()}, ${attending === true}, ${cleanGuests.length}, ${cleanGuests})
        RETURNING id
      `;
      const data = rows[0];
      setSaving(false);
      await logActivity({
        action: "rsvp_submitted",
        entityType: "rsvp",
        entityId: data.id,
        details: { fullName: fullName.trim(), attending: attending === true, guests: cleanGuests.length },
      });
      setStep("done");
    } catch {
      setSaving(false);
      setError("Something went wrong. Please try again.");
    }
  }, [fullName, phone, attending, cleanGuests]);

  const updateGuest = useCallback((index: number, value: string) => {
    setGuests((prev) => prev.map((v, idx) => (idx === index ? value : v)));
  }, []);

  const removeGuest = useCallback((index: number) => {
    setGuests((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const addGuest = useCallback(() => {
    setGuests((prev) => [...prev, ""]);
  }, []);

  const [giftMessage, setGiftMessage] = useState("");
  const [giftGifterName, setGiftGifterName] = useState("");
  const [giftGifterPhone, setGiftGifterPhone] = useState("");
  const [giftGifterEmail, setGiftGifterEmail] = useState("");

  const handleGiftSubmit = async () => {
    if (giftMessage.trim() && giftGifterName.trim()) {
      try {
        await sql`
          INSERT INTO gifts (gifter_name, gifter_phone, gifter_email, gift_message)
          VALUES (${giftGifterName.trim()}, ${giftGifterPhone.trim()}, ${giftGifterEmail.trim() || null}, ${giftMessage.trim()})
        `;
        await logActivity({
          action: "gift_submitted",
          entityType: "gift",
          details: { gifterName: giftGifterName.trim(), giftMessage: giftMessage.trim() },
        });
        setGiftMessage("");
        setGiftGifterName("");
        setGiftGifterPhone("");
        setGiftGifterEmail("");
        setGiftOpen(false);
      } catch {
        console.error("Failed to save gift");
      }
    }
  };

  return (
    <main className="min-h-screen w-full bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-md lg:max-w-5xl">
        <Link to="/" className="text-sm text-muted-foreground">
          ← Back to invitation
        </Link>

        <div className="mt-4 grid w-full overflow-hidden rounded-3xl shadow-card lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Classic side panel — stacks above the form on small screens */}
          <aside className="bg-ink px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-12">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">
              {party.title}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Reserve your <span className="shimmer-text">seat</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              {party.message}
            </p>

            <dl className="mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10">
                  📅
                </span>
                <dd className="min-w-0 truncate">{party.date}</dd>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10">
                  ⏰
                </span>
                <dd className="min-w-0 truncate">{party.time}</dd>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10">
                  📍
                </span>
                <dd className="min-w-0 truncate">{party.venueAddress}</dd>
              </div>
            </dl>

            <iframe
              title={`Map showing the venue: ${party.venueAddress}`}
              src={mapEmbedUrl()}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-8 hidden h-48 w-full rounded-2xl border-0 lg:block"
            />
          </aside>

          {/* Form / summary / success panel */}
          <section className="min-w-0 bg-card px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
            {step === "form" && (
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Your RSVP</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Takes less than a minute.
                </p>

                <div className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium">Full name</label>
                      <input
                        className={field}
                        value={fullName}
                        maxLength={100}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium">Phone number</label>
                      <input
                        className={field}
                        type="tel"
                        value={phone}
                        maxLength={20}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="055 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Will you be attending?</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Choice
                        selected={attending === true}
                        onClick={() => setAttending(true)}
                        label="✅ Yes, I'll be there"
                      />
                      <Choice
                        selected={attending === false}
                        onClick={() => {
                          setAttending(false);
                          setBringing(null);
                        }}
                        label="❌ Sorry, can't make it"
                      />
                    </div>
                  </div>

                  {attending && (
                    <div>
                      <p className="mb-2 text-sm font-medium">
                        Are you bringing someone with you?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Choice
                          selected={bringing === true}
                          onClick={() => setBringing(true)}
                          label="Yes"
                        />
                        <Choice
                          selected={bringing === false}
                          onClick={() => setBringing(false)}
                          label="No"
                        />
                      </div>
                    </div>
                  )}

                  {attending && bringing && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Additional guest names</p>
                      {guests.map((g, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className={field}
                            value={g}
                            maxLength={100}
                            placeholder={`Guest ${i + 1} full name`}
                            onChange={(e) => updateGuest(i, e.target.value)}
                          />
                          {guests.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeGuest(i)}
                              className="shrink-0 rounded-xl border border-input px-3 text-sm text-muted-foreground"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addGuest}
                        className="rounded-xl bg-primary-soft px-4 py-2 text-sm font-medium text-accent-foreground"
                      >
                        + Add another guest
                      </button>
                    </div>
                  )}

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <button
                    onClick={review}
                    className="w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02]"
                  >
                    Review RSVP
                  </button>
                </div>
              </div>
            )}

            {step === "summary" && (
              <div>
                <h2 className="font-display text-2xl font-bold">RSVP summary</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please confirm your details below.
                </p>
                <dl className="mt-6 space-y-3 text-sm">
                  <Row label="Name" value={fullName} />
                  <Row label="Phone" value={phone} />
                  <Row label="Attendance" value={attending ? "Yes" : "No"} />
                  <Row label="Additional guests" value={String(cleanGuests.length)} />
                  {cleanGuests.length > 0 && (
                    <Row label="Guests" value={cleanGuests.join(", ")} />
                  )}
                  <Row label="Total people" value={String(total)} />
                </dl>
                {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
                <button
                  onClick={submit}
                  disabled={saving}
                  className="mt-6 w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {saving ? "Sending…" : "Confirm RSVP"}
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="mt-3 w-full rounded-full border border-input px-6 py-3 text-sm"
                >
                  Edit details
                </button>
              </div>
            )}

            {step === "done" && (
              <div className="py-6 text-center">
                <p className="text-5xl">🎉</p>
                <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                  {attending ? "RSVP confirmed!" : "Thanks for letting us know"}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                  {attending
                    ? `Thank you, ${fullName.split(" ")[0]}! We look forward to celebrating with you.`
                    : `We'll miss you, ${fullName.split(" ")[0]}. Thanks for responding.`}
                </p>
                {attending && (
                  <p className="mx-auto mt-5 max-w-sm rounded-2xl bg-primary-soft px-4 py-3 text-sm font-medium text-accent-foreground">
                    Total guests registered with you: {total}
                  </p>
                )}
                <Link
                  to="/"
                  className="mt-6 inline-block rounded-full border border-input px-6 py-3 text-sm"
                >
                  Back to invitation
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Floating Gift Button */}
      <button
        onClick={() => setGiftOpen(true)}
        className="fixed bottom-6 right-6 z-50 animate-bounce-subtle transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/50"
        aria-label="Send a gift"
      >
        <div className="relative">
          <img
            src={giftImg}
            alt="Send a gift"
            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"
            loading="lazy"
          />
          {/* Pulse ring animation */}
          <div className="absolute inset-0 -inset-2 rounded-full bg-gradient-to-br from-pink-500/50 to-rose-500/50 animate-pulse-ring" />
        </div>
      </button>

      {/* Gift Modal */}
      {giftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
          <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setGiftOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft">
                <img src={giftImg} alt="Gift" className="w-12 h-12" />
              </div>
              <h3 className="font-display text-xl font-bold">Birthday Gift</h3>
              <p className="mt-1 text-sm text-muted-foreground">Let us know what you're bringing</p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Your Name</label>
                  <input
                    type="text"
                    value={giftGifterName}
                    onChange={(e) => setGiftGifterName(e.target.value)}
                    placeholder="Your name"
                    className={field}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={giftGifterPhone}
                    onChange={(e) => setGiftGifterPhone(e.target.value)}
                    placeholder="055 000 0000"
                    className={field}
                    maxLength={20}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Email (optional)</label>
                  <input
                    type="email"
                    value={giftGifterEmail}
                    onChange={(e) => setGiftGifterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={field}
                    maxLength={100}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">What are you gifting?</label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="e.g., A nice bottle of wine, a personalized photo album, a spa voucher..."
                  className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground outline-none focus:border-primary resize-none"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setGiftOpen(false)}
                  className="flex-1 rounded-xl border border-input px-4 py-3 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGiftSubmit}
                  disabled={!giftMessage.trim() || !giftGifterName.trim()}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Gift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Choice({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-foreground hover:border-primary/50"
      }`}
    >
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{value}</dd>
    </div>
  );
}
