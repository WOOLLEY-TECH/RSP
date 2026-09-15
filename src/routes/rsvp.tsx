import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Minus, PartyPopper, Plus, Users, Check, CreditCard } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sql } from "@/lib/neon";
import { party, mapEmbedUrl } from "@/lib/party";
import { logActivity } from "@/lib/activity";
import { normalizePhoneForWhatsApp, generateWhatsAppMessage, openWhatsApp } from "@/lib/whatsapp";
import mum5 from "@/assets/mum5.jpeg";

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
      { property: "og:image", content: mum5 },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `RSVP — ${party.title}` },
      { name: "twitter:description", content: "Confirm your attendance in under a minute." },
      { name: "twitter:image", content: mum5 },
    ],
  }),
  component: RsvpPage,
});

const rsvpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
    phone: z.string().trim().min(7, "Please enter a valid phone number.").max(20),
    email: z.string().trim().email("Please enter a valid email address.").max(200),
    attending: z.boolean(),
    attendingDays: z.array(z.enum(["Friday", "Saturday", "Sunday"])).optional(),
    bringingGuests: z.boolean(),
    guests: z.array(z.string().trim().min(2, "Please enter each guest's name.")).max(19),
  })
  .superRefine((value, context) => {
    if (!value.attending && value.bringingGuests) {
      context.addIssue({
        code: "custom",
        path: ["bringingGuests"],
        message: "Guests can only be added when attending.",
      });
    }
    if (value.attending && value.bringingGuests && value.guests.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["guests"],
        message: "Please add at least one guest.",
      });
    }
    if (value.attending && (!value.attendingDays || value.attendingDays.length === 0)) {
      context.addIssue({
        code: "custom",
        path: ["attendingDays"],
        message: "Please select at least one day you'll be attending.",
      });
    }
  });

const events = [
  {
    day: "Friday",
    date: "October 23, 2026",
    title: "Praise Night",
    time: "6:30pm - 8:30 pm",
    venue: "INTERNATIONAL CHARISMATIC CHURCH (ICC)",
    address: "1737 SW 3rd St, Grand Prairie, TX 75051",
    dress: "All White",
    note: "All White",
    icon: "🙏",
    mapQuery: "1737 SW 3rd St, Grand Prairie, TX 75051",
  },
  {
    day: "Saturday",
    date: "October 24, 2026",
    title: "70TH BIRTHDAY CELEBRATION",
    time: "5:00 PM - 10:00 PM",
    venue: "BOB DUNCAN CENTER",
    address: "2800 S Center St., Arlington, TX 76014",
    dress: "Formal",
    note: "Formal",
    icon: "🎂",
    mapQuery: "2800 S Center St., Arlington, TX 76014",
    featured: true,
  },
  {
    day: "Sunday",
    date: "October 25, 2026",
    title: "THANKSGIVING SERVICE",
    time: "9:00 AM - 12:30 PM",
    venue: "INTERNATIONAL CHARISMATIC CHURCH (ICC)",
    address: "1717 SW 3rd St, Grand Prairie, TX 75051",
    dress: "Fascinator and Hats",
    note: "Fascinator and Hats",
    icon: "🕊️",
    mapQuery: "1717 SW 3rd St, Grand Prairie, TX 75051",
  },
] as const;

type Step = "form" | "summary" | "done";
type Errors = Record<string, string | undefined>;

function FieldError({ children }: { children: string | undefined }) {
  return children ? <p className="mt-1 text-xs font-medium text-destructive">{children}</p> : null;
}

function RsvpPage() {
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [attendingDays, setAttendingDays] = useState<string[]>([]);
  const [bringingGuests, setBringingGuests] = useState<boolean | null>(null);
  const [guests, setGuests] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const cleanGuests = useMemo(
    () => (attending && bringingGuests ? guests.map((g) => g.trim()).filter(Boolean) : []),
    [attending, bringingGuests, guests],
  );
  const cleanAttendingDays = useMemo(
    () =>
      attending ? attendingDays.filter((d) => ["Friday", "Saturday", "Sunday"].includes(d)) : [],
    [attending, attendingDays],
  );
  const totalGuests = useMemo(
    () => (attending ? 1 + cleanGuests.length : 0),
    [attending, cleanGuests.length],
  );

  const payload = useMemo(
    () => ({
      fullName,
      phone,
      email,
      attending: attending === true,
      attendingDays: cleanAttendingDays,
      bringingGuests: bringingGuests === true,
      guests: cleanGuests,
    }),
    [
      fullName,
      phone,
      email,
      attending,
      attendingDays,
      bringingGuests,
      cleanGuests,
      cleanAttendingDays,
    ],
  );

  function review(event: FormEvent) {
    event.preventDefault();
    const result = rsvpSchema.safeParse(payload);
    if (!result.success) {
      const nextErrors: Errors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitRsvp() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const rows = await sql`
        INSERT INTO rsvps (full_name, phone_number, email, attending, attending_days, additional_guests, guest_names)
        VALUES (${fullName.trim()}, ${phone.trim()}, ${email.trim().toLowerCase()}, ${attending === true}, ${cleanAttendingDays}, ${cleanGuests.length}, ${cleanGuests})
        RETURNING id
      `;
      const data = rows[0];
      await logActivity({
        action: "rsvp_submitted",
        entityType: "rsvp",
        entityId: data.id,
        details: {
          fullName: fullName.trim(),
          attending: attending === true,
          attendingDays: cleanAttendingDays,
          guests: cleanGuests.length,
        },
      });
      sendConfirmationEmail().catch(() => {
        // Email delivery must never block the RSVP confirmation.
      });
      setSubmitting(false);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("RSVP submission error:", error);
      setSubmitting(false);
      setSubmitError(
        error instanceof Error && error.message.includes("attending_days")
          ? "Database not updated yet. Please contact the organizer."
          : "Something went wrong. Please try again.",
      );
    }
  }

  async function sendConfirmationEmail() {
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: trimmed.toLowerCase(),
          fullName: fullName.trim(),
          attending: attending === true,
          attendingDays: cleanAttendingDays,
          guests: cleanGuests,
        }),
        signal: AbortSignal.timeout(8000),
      });
    } catch (error) {
      console.error("Confirmation email could not be sent:", error);
    }
  }

  function chooseAttendance(value: boolean) {
    setAttending(value);
    if (!value) {
      setBringingGuests(false);
      setGuests([""]);
      setAttendingDays([]);
    }
  }

  function toggleAttendingDay(day: string) {
    setAttendingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleBringingGuests(value: boolean) {
    setBringingGuests(value);
    if (value && guests.length === 0) {
      setGuests([""]);
    } else if (!value) {
      setGuests([""]);
    }
  }

  function updateGuest(index: number, value: string) {
    setGuests((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeGuest(index: number) {
    setGuests((prev) => prev.filter((_, i) => i !== index));
  }

  function addGuest() {
    if (guests.length < 19) {
      setGuests((prev) => [...prev, ""]);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <main className="celebration-canvas relative min-h-screen overflow-hidden px-4 py-7 sm:px-7 sm:py-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
      <div className="page-enter relative mx-auto max-w-6xl">
        <header className="mb-7 text-center sm:mb-9 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to invitation
          </Link>
          <div>
            <span className="inline-flex rounded-full border border-border bg-background/80 backdrop-blur-xl px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Celebrating 70 years
            </span>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-none text-foreground sm:text-5xl lg:text-6xl">
              Deborah Woolley
            </h1>
            <p className="mt-3 text-sm font-medium text-muted-foreground sm:text-base">
              October 23–25, 2026
            </p>
          </div>
          <div className="w-24" />
        </header>

        <nav aria-label="RSVP progress" className="mx-auto mb-6 grid max-w-lg grid-cols-3 gap-2">
          {(["Your details", "Confirm", "Complete"] as const).map((label, index) => {
            const current = step === "form" ? 0 : step === "summary" ? 1 : 2;
            return (
              <div key={label} className="min-w-0 text-center">
                <div
                  className={`mx-auto grid size-7 place-items-center rounded-full text-xs font-bold ${
                    index <= current
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground"
                  }`}
                >
                  {index < current ? "✓" : index + 1}
                </div>
                <p className="mt-1 truncate text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs">
                  {label}
                </p>
              </div>
            );
          })}
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-5">
          <section className="order-2 lg:order-1 lg:col-span-3">
            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-7">
              {step === "form" && (
                <RsvpForm
                  fullName={fullName}
                  setFullName={setFullName}
                  phone={phone}
                  setPhone={setPhone}
                  email={email}
                  setEmail={setEmail}
                  attending={attending}
                  chooseAttendance={chooseAttendance}
                  attendingDays={attendingDays}
                  toggleAttendingDay={toggleAttendingDay}
                  bringingGuests={bringingGuests}
                  handleBringingGuests={handleBringingGuests}
                  guests={guests}
                  setGuests={setGuests}
                  updateGuest={updateGuest}
                  removeGuest={removeGuest}
                  addGuest={addGuest}
                  errors={errors}
                  review={review}
                  inputClass={inputClass}
                />
              )}
              {step === "summary" && (
                <Summary
                  fullName={fullName}
                  phone={phone}
                  email={email}
                  attending={attending === true}
                  attendingDays={cleanAttendingDays}
                  guests={cleanGuests}
                  totalGuests={totalGuests}
                  submitting={submitting}
                  submitError={submitError}
                  onBack={() => setStep("form")}
                  onSubmit={submitRsvp}
                />
              )}
              {step === "done" && (
                <Done
                  fullName={fullName}
                  attending={attending === true}
                  totalGuests={totalGuests}
                  attendingDays={cleanAttendingDays}
                  phone={phone}
                  guestCount={cleanGuests.length}
                />
              )}
            </div>
          </section>
          <EventPanel />
        </div>
      </div>
    </main>
  );
}

interface RsvpFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  attending: boolean | null;
  chooseAttendance: (value: boolean) => void;
  attendingDays: string[];
  toggleAttendingDay: (day: string) => void;
  bringingGuests: boolean | null;
  handleBringingGuests: (value: boolean) => void;
  guests: string[];
  setGuests: (value: string[]) => void;
  updateGuest: (index: number, value: string) => void;
  removeGuest: (index: number) => void;
  addGuest: () => void;
  errors: Errors;
  review: (event: FormEvent) => void;
  inputClass: string;
}

function RsvpForm(props: RsvpFormProps) {
  return (
    <form onSubmit={props.review} noValidate>
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-primary">Your invitation</p>
          <h2 className="truncate font-display text-2xl font-semibold text-foreground">
            Will you join us?
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          Step 1 of 3
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <Label
            htmlFor="name"
            className="mb-2 block text-xs font-semibold uppercase text-muted-foreground"
          >
            Full name
          </Label>
          <Input
            id="name"
            value={props.fullName}
            onChange={(event) => props.setFullName(event.target.value)}
            placeholder="e.g. Priya Nair"
            autoComplete="name"
            className={props.inputClass}
            aria-invalid={Boolean(props.errors["fullName"])}
          />
          <FieldError>{props.errors["fullName"]}</FieldError>
        </div>

        <div>
          <Label
            htmlFor="phone"
            className="mb-2 block text-xs font-semibold uppercase text-muted-foreground"
          >
            Phone number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={props.phone}
            onChange={(event) => props.setPhone(event.target.value)}
            placeholder="Your best contact number"
            autoComplete="tel"
            className={props.inputClass}
            aria-invalid={Boolean(props.errors["phone"])}
          />
          <FieldError>{props.errors["phone"]}</FieldError>
        </div>

        <div>
          <Label
            htmlFor="email"
            className="mb-2 block text-xs font-semibold uppercase text-muted-foreground"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={props.email}
            onChange={(event) => props.setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={props.inputClass}
            aria-invalid={Boolean(props.errors["email"])}
          />
          <FieldError>{props.errors["email"]}</FieldError>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Will you attend?
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              type="button"
              variant={props.attending === true ? "default" : "outline"}
              className="h-auto min-h-12 whitespace-normal px-3 py-3"
              onClick={() => props.chooseAttendance(true)}
            >
              Joyfully attend
            </Button>
            <Button
              type="button"
              variant={props.attending === false ? "default" : "outline"}
              className="h-auto min-h-12 whitespace-normal px-3 py-3"
              onClick={() => props.chooseAttendance(false)}
            >
              Regretfully decline
            </Button>
          </div>
        </fieldset>

        {props.attending && (
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Which days will you attend?
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {["Friday", "Saturday", "Sunday"].map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={props.attendingDays.includes(day) ? "default" : "outline"}
                  className="h-auto min-h-12 whitespace-normal px-3 py-3"
                  onClick={() => props.toggleAttendingDay(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
            <FieldError>{props.errors["attendingDays"]}</FieldError>
          </fieldset>
        )}

        {props.attending && (
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Bringing guests?
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                type="button"
                variant={props.bringingGuests === false ? "default" : "outline"}
                className="h-12"
                onClick={() => props.handleBringingGuests(false)}
              >
                Just me
              </Button>
              <Button
                type="button"
                variant={props.bringingGuests === true ? "default" : "outline"}
                className="h-12"
                onClick={() => props.handleBringingGuests(true)}
              >
                Yes, with guests
              </Button>
            </div>
            <FieldError>{props.errors["bringingGuests"]}</FieldError>
          </fieldset>
        )}

        {props.attending && props.bringingGuests && (
          <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Guest names</p>
              <span className="text-xs text-muted-foreground">Up to 19</span>
            </div>
            <div className="space-y-2">
              {props.guests.map((guest, index) => (
                <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <Input
                    value={guest}
                    onChange={(event) => props.updateGuest(index, event.target.value)}
                    placeholder={`Guest ${index + 1} full name`}
                    className={props.inputClass}
                  />
                  {props.guests.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-12 shrink-0"
                      aria-label={`Remove guest ${index + 1}`}
                      onClick={() => props.removeGuest(index)}
                    >
                      <Minus />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <FieldError>{props.errors["guests"]}</FieldError>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-11 w-full border-dashed"
              disabled={props.guests.length >= 19}
              onClick={props.addGuest}
            >
              <Plus /> Add another guest
            </Button>
          </div>
        )}
      </div>

      <div className="mt-7 flex justify-end">
        <Button
          type="submit"
          className="h-12 px-6 bg-primary hover:bg-primary/90 shadow-card transition-transform hover:scale-[1.02]"
        >
          Review response <span aria-hidden="true">→</span>
        </Button>
      </div>
    </form>
  );
}

interface SummaryProps {
  fullName: string;
  phone: string;
  email: string;
  attending: boolean;
  attendingDays: string[];
  guests: string[];
  totalGuests: number;
  submitting: boolean;
  submitError: string;
  onBack: () => void;
  onSubmit: () => void;
}

function Summary({
  fullName,
  phone,
  email,
  attending,
  attendingDays,
  guests,
  totalGuests,
  submitting,
  submitError,
  onBack,
  onSubmit,
}: SummaryProps) {
  const rows = [
    ["Name", fullName],
    ["Phone", phone],
    ["Email", email],
    ["Attendance", attending ? "Joyfully attending" : "Regretfully declining"],
    ...(attending && attendingDays.length ? [["Days attending", attendingDays.join(", ")]] : []),
    ...(attending && guests.length ? [["Guests", guests.join(", ")]] : []),
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-primary">Almost there</p>
      <h2 className="mt-1 font-display text-3xl font-semibold text-foreground">
        Review your response
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please make sure everything is correct before submitting.
      </p>

      <dl className="mt-6 divide-y divide-border rounded-2xl bg-background/50 px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-4 sm:grid-cols-[130px_1fr]">
            <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-words text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {attending && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/10 p-4 text-foreground">
          <Users className="size-5 shrink-0 text-primary" />
          <p className="text-sm font-semibold">Party of {totalGuests} attending</p>
        </div>
      )}

      <FieldError>{submitError}</FieldError>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="bg-primary hover:bg-primary/90 shadow-card transition-transform hover:scale-[1.02]"
        >
          {submitting ? "Submitting…" : "Confirm RSVP"}
        </Button>
      </div>
    </div>
  );
}

interface DoneProps {
  fullName: string;
  attending: boolean;
  totalGuests: number;
  attendingDays: string[];
  phone: string;
  guestCount: number;
}

function Done({ fullName, attending, totalGuests, attendingDays, phone, guestCount }: DoneProps) {
  const handleWhatsAppClick = () => {
    const normalizedPhone = normalizePhoneForWhatsApp(phone);
    const message = generateWhatsAppMessage({
      fullName,
      attending,
      attendingDays,
      guestCount,
    });
    openWhatsApp(normalizedPhone, message);
  };

  if (!attending) {
    return (
      <div className="flex flex-col items-center justify-center text-center w-full min-h-[430px]">
        <div className="grid size-16 place-items-center rounded-full bg-primary/20 text-primary mb-4">
          <PartyPopper className="size-8" />
        </div>
        <p className="text-xs font-semibold uppercase text-primary">Response received</p>
        <h2 className="mt-2 font-display text-4xl font-semibold text-foreground">
          Thank you, {fullName.split(" ")[0]}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          We're sorry you can't join us, but we're grateful you let the family know.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleWhatsAppClick}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.085 3.87 1.123 4.074.039.201.074.271.198.355.263.18 1.28.774 3.098 1.943 1.517.977 2.855 2.06 3.322 2.332.514.297 1.07.454 1.605.454.53 0 1.07-.152 1.492-.41.243-.155.669-.52.744-.57.075-.043.168-.06.25-.06.105 0 .198.028.298.068.099.038.197.098.297.174.105.068.197.16.297.188.216.056.633.02.71-.174.068-.173.187-.327.297-.497.12-.158.045-.316.01-.471-.035-.158-.23-.505-.372-.653-.14-.148-.35-.342-.51-.5-.173-.173-.435-.316-.792-.375-.343-.07-.932-.07-1.255-.07-.326 0-.643.058-.89.173-.173.08-.247.15-.52.298-.623.343-1.517 1.555-2.39 3.098-1.045 1.795-1.653 2.827-1.653 2.827 0 .326.134.623.23.792.098.149.168.327.18.52.01.198-.06.372-.18.52z" />
            </svg>
            Send Response on WhatsApp
          </button>
        </div>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full border border-border px-6 py-3 text-sm"
        >
          Back to invitation
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center w-full">
      <div className="grid size-16 place-items-center rounded-full bg-primary/20 text-primary mb-4">
        <PartyPopper className="size-8" />
      </div>
      <p className="text-xs font-semibold uppercase text-primary">Response received</p>
      <h2 className="mt-2 font-display text-4xl font-semibold text-foreground">
        Thank you, {fullName.split(" ")[0]}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        We have reserved {totalGuests === 1 ? "your place" : `${totalGuests} places`} for Deborah's
        celebration weekend. We can't wait to celebrate together.
      </p>
      <div className="mt-6 rounded-2xl bg-background/50 px-8 py-5 w-full max-w-md">
        <p className="font-display text-5xl font-semibold text-foreground">{totalGuests}</p>
        <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
          {totalGuests === 1 ? "guest" : "guests"} confirmed
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleWhatsAppClick}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-700"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.085 3.87 1.123 4.074.039.201.074.271.198.355.263.18 1.28.774 3.098 1.943 1.517.977 2.855 2.06 3.322 2.332.514.297 1.07.454 1.605.454.53 0 1.07-.152 1.492-.41.243-.155.669-.52.744-.57.075-.043.168-.06.25-.06.105 0 .198.028.298.068.099.038.197.098.297.174.105.068.197.16.297.188.216.056.633.02.71-.174.068-.173.187-.327.297-.497.12-.158.045-.316.01-.471-.035-.158-.23-.505-.372-.653-.14-.148-.35-.342-.51-.5-.173-.173-.435-.316-.792-.375-.343-.07-.932-.07-1.255-.07-.326 0-.643.058-.89.173-.173.08-.247.15-.52.298-.623.343-1.517 1.555-2.39 3.098-1.045 1.795-1.653 2.827-1.653 2.827 0 .326.134.623.23.792.098.149.168.327.18.52.01.198-.06.372-.18.52z" />
          </svg>
          Confirm on WhatsApp
        </button>
      </div>

      <Link
        to="/"
        className="mt-8 inline-block rounded-full border border-border px-6 py-3 text-sm"
      >
        Back to invitation
      </Link>
    </div>
  );
}

function EventPanel() {
  const [expanded, setExpanded] = useState<number | null>(1);

  return (
    <aside className="order-1 lg:order-2 lg:col-span-2 lg:sticky lg:top-6">
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <PartyPopper className="size-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">The weekend</h2>
        </div>
        <div className="space-y-3">
          {events.map((event, index) => (
            <article
              key={event.title}
              className={`rounded-2xl border p-4 backdrop-blur-xl ${
                "featured" in event && event.featured
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-background/50"
              }`}
            >
              <button
                type="button"
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-left"
                onClick={() => setExpanded(expanded === index ? null : index)}
                aria-expanded={expanded === index}
              >
                <span className="min-w-0">
                  <span className="text-[11px] font-semibold uppercase text-primary">
                    {event.day} · {event.date}
                  </span>
                  <span className="mt-1 block truncate font-display text-lg font-semibold text-foreground">
                    {event.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {event.time} · {event.venue}
                    <br />
                    Dress: {event.dress}
                  </span>
                </span>
                <MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" />
              </button>
              {expanded === index && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border bg-background/50">
                  <iframe
                    title={`Map for ${event.title}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(event.venue)}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-36 w-full"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </aside>
  );
}
