import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gift,
  MapPin,
  Minus,
  PartyPopper,
  Plus,
  Users,
  Check,
  CreditCard,
  Sparkles,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { sql } from "@/lib/neon";
import { party, mapEmbedUrl } from "@/lib/party";
import { logActivity } from "@/lib/activity";
import { normalizePhoneForWhatsApp, generateWhatsAppMessage, openWhatsApp } from "@/lib/whatsapp";
import giftImg from "@/assets/gift.png";
import giftTeddyBear from "@/assets/gift/teddy-bear.png";
import giftRose from "@/assets/gift/rose-.png";
import giftHeart from "@/assets/gift/heart.png";
import giftFlowerBouquet from "@/assets/gift/flower-bouquet.png";
import giftCupcake from "@/assets/gift/cupcake.png";
import giftCrown from "@/assets/gift/crown.png";
import giftCelebrate from "@/assets/gift/celebrate.png";
import giftBalloon from "@/assets/gift/balloon.png";
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

const giftSchema = z.object({
  gifterName: z.string().trim().min(2, "Please enter your name."),
  gifterPhone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= 7, "Enter a valid phone number."),
  gifterEmail: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  giftMessage: z.string().trim().min(2, "Please describe your gift.").max(500),
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

const giftItems = [
  { id: "teddy-bear", name: "Teddy Bear", image: giftTeddyBear, price: 25, emoji: "🧸" },
  { id: "rose", name: "Rose", image: giftRose, price: 15, emoji: "🌹" },
  { id: "heart", name: "Heart Balloon", image: giftHeart, price: 10, emoji: "❤️" },
  {
    id: "flower-bouquet",
    name: "Flower Bouquet",
    image: giftFlowerBouquet,
    price: 35,
    emoji: "💐",
  },
  { id: "cupcake", name: "Cupcake", image: giftCupcake, price: 8, emoji: "🧁" },
  { id: "crown", name: "Crown", image: giftCrown, price: 20, emoji: "👑" },
  { id: "celebrate", name: "Celebration Box", image: giftCelebrate, price: 40, emoji: "🎉" },
  { id: "balloon", name: "Balloon Bundle", image: giftBalloon, price: 12, emoji: "🎈" },
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
  const [attending, setAttending] = useState<boolean | null>(null);
  const [attendingDays, setAttendingDays] = useState<string[]>([]);
  const [bringingGuests, setBringingGuests] = useState<boolean | null>(null);
  const [guests, setGuests] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [giftOpen, setGiftOpen] = useState(false);
  const [giftGifterName, setGiftGifterName] = useState("");
  const [giftGifterPhone, setGiftGifterPhone] = useState("");
  const [giftGifterEmail, setGiftGifterEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [giftErrors, setGiftErrors] = useState<Errors>({});
  const [giftSaving, setGiftSaving] = useState(false);
  const [giftSaved, setGiftSaved] = useState(false);
  const [giftModalSelectedGift, setGiftModalSelectedGift] = useState<string | null>(null);

  // Gift purchase state (for Done page)
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [giftPurchaseOpen, setGiftPurchaseOpen] = useState(false);
  const [giftPurchasing, setGiftPurchasing] = useState(false);
  const [giftPurchased, setGiftPurchased] = useState(false);

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
      attending: attending === true,
      attendingDays: cleanAttendingDays,
      bringingGuests: bringingGuests === true,
      guests: cleanGuests,
    }),
    [fullName, phone, attending, attendingDays, bringingGuests, cleanGuests, cleanAttendingDays],
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
        INSERT INTO rsvps (full_name, phone_number, attending, attending_days, additional_guests, guest_names)
        VALUES (${fullName.trim()}, ${phone.trim()}, ${attending === true}, ${cleanAttendingDays}, ${cleanGuests.length}, ${cleanGuests})
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

  async function saveGift(event: FormEvent) {
    event.preventDefault();
    const result = giftSchema.safeParse({
      gifterName: giftGifterName,
      gifterPhone: giftGifterPhone,
      gifterEmail: giftGifterEmail,
      giftMessage: giftMessage,
    });
    if (!result.success) {
      const next: Errors = {};
      result.error.issues.forEach((issue) => {
        next[issue.path[0]?.toString() ?? "form"] = issue.message;
      });
      setGiftErrors(next);
      return;
    }
    setGiftSaving(true);
    setGiftErrors({});

    // Include selected gift in the message if one was chosen
    const selectedGiftItem = giftModalSelectedGift
      ? giftItems.find((g) => g.id === giftModalSelectedGift)
      : null;
    const finalMessage = selectedGiftItem
      ? `${giftMessage.trim()}\n\n[Gift: ${selectedGiftItem.name} - $${selectedGiftItem.price}]`
      : giftMessage.trim();

    try {
      await sql`
        INSERT INTO gifts (gifter_name, gifter_phone, gifter_email, gift_message)
        VALUES (${giftGifterName.trim()}, ${giftGifterPhone.trim() || null}, ${giftGifterEmail.trim() || null}, ${finalMessage})
      `;
      await logActivity({
        action: "gift_submitted",
        entityType: "gift",
        details: {
          gifterName: giftGifterName.trim(),
          giftMessage: giftMessage.trim(),
          selectedGift: selectedGiftItem
            ? {
                id: selectedGiftItem.id,
                name: selectedGiftItem.name,
                price: selectedGiftItem.price,
              }
            : null,
        },
      });
      setGiftSaving(false);
      setGiftSaved(true);
    } catch {
      setGiftSaving(false);
      setGiftErrors({ form: "We couldn't save your gift details. Please try again." });
    }
  }

  function openGift() {
    setGiftOpen(true);
    setGiftGifterName(fullName);
    setGiftGifterPhone(phone);
    setGiftGifterEmail("");
    setGiftMessage("");
    setGiftErrors({});
    setGiftSaved(false);
    setGiftModalSelectedGift(null);
  }

  function closeGift() {
    setGiftOpen(false);
    setGiftSaved(false);
    setGiftModalSelectedGift(null);
  }

  function openGiftPurchase(giftId: string) {
    setSelectedGift(giftId);
    setGiftPurchaseOpen(true);
  }

  function closeGiftPurchase() {
    setGiftPurchaseOpen(false);
    setSelectedGift(null);
    setGiftPurchased(false);
  }

  async function purchaseGift() {
    if (!selectedGift) return;
    const gift = giftItems.find((g) => g.id === selectedGift);
    if (!gift) return;

    setGiftPurchasing(true);
    try {
      await sql`
        INSERT INTO gift_purchases (gifter_name, gifter_phone, gift_id, gift_name, gift_price, gift_image)
        VALUES (${fullName.trim()}, ${phone.trim()}, ${gift.id}, ${gift.name}, ${gift.price}, ${gift.image})
      `;
      await logActivity({
        action: "gift_purchased",
        entityType: "gift_purchase",
        details: {
          gifterName: fullName.trim(),
          giftId: gift.id,
          giftName: gift.name,
          price: gift.price,
        },
      });
      setGiftPurchasing(false);
      setGiftPurchased(true);
    } catch {
      setGiftPurchasing(false);
      alert("Something went wrong. Please try again.");
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
                  onGiftPurchase={openGiftPurchase}
                  onSendGift={openGift}
                />
              )}
            </div>
          </section>
          <EventPanel />
        </div>
      </div>

      {/* Floating Gift Button - Only show before RSVP completion */}
      {step !== "done" && (
        <button
          onClick={openGift}
          className="fixed bottom-6 right-6 z-50 animate-bounce-subtle transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/50 pb-safe lg:pb-0"
          aria-label="Send a gift"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="relative">
            <img
              src={giftImg}
              alt="Send a gift"
              className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"
              loading="lazy"
            />
            <div className="absolute inset-0 -inset-2 rounded-full bg-gradient-to-br from-pink-500/50 to-rose-500/50 animate-pulse-ring" />
          </div>
        </button>
      )}

      {/* Gift Modal - Responsive Design */}
      {giftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeGift}
              className="absolute top-3 right-3 z-10 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {giftSaved ? (
              <div className="py-8 px-6 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent/20 text-primary">
                  <Gift />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                  Gift details received
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thank you for celebrating Deborah.
                </p>
                <Button className="mt-5" onClick={closeGift}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={saveGift} className="p-4 sm:p-6 space-y-5">
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <img src={giftImg} alt="Gift" className="w-10 h-10" />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold">Birthday Gift</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Let us know what you're bringing
                  </p>
                </div>

                {/* Gift Selection Grid - Responsive */}
                <div className="space-y-3">
                  <Label className="block text-sm font-medium">Choose a gift (optional)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {giftItems.map((gift) => (
                      <button
                        key={gift.id}
                        type="button"
                        onClick={() =>
                          setGiftModalSelectedGift(
                            giftModalSelectedGift === gift.id ? null : gift.id,
                          )
                        }
                        className={`relative rounded-xl border-2 p-1.5 sm:p-2 transition-all ${
                          giftModalSelectedGift === gift.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="aspect-[4/3] sm:aspect-square rounded-lg overflow-hidden bg-muted/50 mb-1.5">
                          <img
                            src={gift.image}
                            alt={gift.name}
                            className="h-full w-full object-cover object-center"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-center text-foreground line-clamp-1">
                          {gift.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                          ${gift.price}
                        </p>
                        {giftModalSelectedGift === gift.id && (
                          <div className="absolute inset-0 rounded-xl border-2 border-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                  {giftModalSelectedGift && (
                    <p className="text-xs text-primary text-center">
                      Selected: {giftItems.find((g) => g.id === giftModalSelectedGift)?.name}
                    </p>
                  )}
                </div>

                <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
                  <div>
                    <Label htmlFor="gift-name" className="mb-2 block text-sm font-medium">
                      Your Name
                    </Label>
                    <Input
                      id="gift-name"
                      value={giftGifterName}
                      onChange={(e) => setGiftGifterName(e.target.value)}
                      placeholder="Your name"
                      className={inputClass}
                      maxLength={100}
                    />
                    <FieldError>{giftErrors["gifterName"]}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="gift-phone" className="mb-2 block text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="gift-phone"
                      type="tel"
                      value={giftGifterPhone}
                      onChange={(e) => setGiftGifterPhone(e.target.value)}
                      placeholder="055 000 0000"
                      className={inputClass}
                      maxLength={20}
                    />
                    <FieldError>{giftErrors["gifterPhone"]}</FieldError>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="gift-email" className="mb-2 block text-sm font-medium">
                      Email (optional)
                    </Label>
                    <Input
                      id="gift-email"
                      type="email"
                      value={giftGifterEmail}
                      onChange={(e) => setGiftGifterEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                      maxLength={100}
                    />
                    <FieldError>{giftErrors["gifterEmail"]}</FieldError>
                  </div>
                </div>

                <div>
                  <Label htmlFor="gift-details" className="mb-2 block text-sm font-medium">
                    What are you gifting?
                  </Label>
                  <Textarea
                    id="gift-details"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="e.g., A nice bottle of wine, a personalized photo album, a spa voucher..."
                    className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    maxLength={500}
                  />
                  <FieldError>{giftErrors["giftMessage"]}</FieldError>
                </div>

                <FieldError>{giftErrors["form"]}</FieldError>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={closeGift}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={giftSaving} className="flex-1 h-12">
                    {giftSaving ? "Saving…" : "Send Gift"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Gift Purchase Modal */}
      {giftPurchaseOpen && selectedGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeGiftPurchase}
              className="absolute top-3 right-3 z-10 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {giftPurchased ? (
              <div className="py-8 px-6 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent/20 text-primary">
                  <Gift />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                  Gift Purchased!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {giftItems.find((g) => g.id === selectedGift)?.name} will be presented to Deborah
                  at the celebration.
                </p>
                <Button className="mt-5" onClick={closeGiftPurchase}>
                  Done
                </Button>
              </div>
            ) : (
              (() => {
                const gift = giftItems.find((g) => g.id === selectedGift);
                if (!gift) return null;
                return (
                  <div className="p-4 sm:p-6 space-y-5">
                    <div className="text-center mb-2">
                      <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                        <img src={gift.image} alt={gift.name} className="w-12 h-12" />
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                        {gift.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        ${gift.price} • Will be presented at the celebration
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-background/50 p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        This gift will be purchased on your behalf and presented to Deborah at the
                        70th birthday celebration. Your name ({fullName.split(" ")[0]}) will be
                        included with the gift.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{gift.name}</span>
                        <span className="font-display text-xl font-semibold text-primary">
                          ${gift.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:flex-col sm:gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 sm:h-12"
                        onClick={closeGiftPurchase}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={giftPurchasing}
                        onClick={purchaseGift}
                        className="w-full h-12 sm:h-12 bg-primary hover:bg-primary/90"
                      >
                        {giftPurchasing ? "Processing…" : `Purchase for $${gift.price}`}
                      </Button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </main>
  );
}

interface RsvpFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
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
}

interface DoneProps {
  fullName: string;
  attending: boolean;
  totalGuests: number;
  attendingDays: string[];
  phone: string;
  guestCount: number;
  onGiftPurchase?: (giftId: string) => void;
  onSendGift?: () => void;
}

function Done({
  fullName,
  attending,
  totalGuests,
  attendingDays,
  phone,
  guestCount,
  onGiftPurchase,
  onSendGift,
}: DoneProps) {
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
  const renderGiftSection = () => (
    <div className="mt-8 w-full max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Gift className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Send a Gift</h3>
            <p className="text-xs text-muted-foreground">Choose a special gift for Deborah</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {giftItems.map((gift) => (
          <button
            key={gift.id}
            onClick={() => onGiftPurchase?.(gift.id)}
            className="group relative rounded-2xl border border-border bg-background/50 p-3 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 mb-3">
              <img
                src={gift.image}
                alt={gift.name}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm text-foreground">{gift.name}</p>
              <p className="text-xs text-muted-foreground">${gift.price}</p>
            </div>
            <Sparkles className="absolute top-2 right-2 size-4 text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Gifts will be presented at the celebration. Your name will be included with the gift.
      </p>
    </div>
  );

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
        {renderGiftSection()}
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

      {onSendGift && (
        <div className="mt-6 w-full max-w-md">
          <button
            onClick={onSendGift}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-pink-600 hover:shadow-xl"
          >
            <Gift className="w-5 h-5" />
            Send a Gift
          </button>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Choose a special gift for Deborah
          </p>
        </div>
      )}

      {renderGiftSection()}

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
