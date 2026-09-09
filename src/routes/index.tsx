import { createFileRoute, Link } from "@tanstack/react-router";
import { party, mapEmbedUrl } from "@/lib/party";
import celebrantImg from "@/assets/celebrant.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Happy 50th Birthday — ${party.title}` },
      {
        name: "description",
        content: `Join us on ${party.date} at ${party.time} to celebrate ${party.celebrant}'s 50th birthday. Please RSVP.`,
      },
      { property: "og:title", content: `Happy 50th Birthday — ${party.title}` },
      {
        property: "og:description",
        content: `Join us on ${party.date} at ${party.time}. Tap to confirm your attendance.`,
      },
    ],
  }),
  component: Index,
});

function Confetti() {
  const pieces = Array.from({ length: 28 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 12) * 0.6}s`,
            animationDuration: `${5 + (i % 5)}s`,
            backgroundColor:
              i % 3 === 0
                ? "oklch(0.85 0.15 90)"
                : i % 3 === 1
                  ? "oklch(0.6 0.18 258)"
                  : "oklch(0.95 0.01 250)",
          }}
        />
      ))}
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen w-full bg-background">
      {/* Full-width hero, blends portrait into the page */}
      <section className="relative flex min-h-svh w-full flex-col overflow-hidden bg-ink">
        <img
          src={celebrantImg}
          alt={`Portrait of ${party.celebrant}, the birthday celebrant`}
          width={1280}
          height={1920}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-90"
        />
        {/* Blend overlays: bottom fade into page background + vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30" />

        <Confetti />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-end px-4 pb-16 pt-24 text-center sm:pb-24">
          <p className="animate-fade-up text-xs uppercase tracking-[0.4em] text-white/80 sm:text-sm">
            You're invited to
          </p>
          <h1 className="animate-fade-up mt-4 font-display text-5xl font-bold leading-none text-white drop-shadow-lg [animation-delay:150ms] sm:text-7xl lg:text-8xl">
            Happy <span className="shimmer-text">50th</span> Birthday
          </h1>
          <p className="animate-fade-up mt-4 font-display text-2xl font-semibold text-white/95 [animation-delay:300ms] sm:text-3xl">
            {party.celebrant}
          </p>
          <p className="animate-fade-up mt-3 max-w-md text-sm leading-relaxed text-white/80 [animation-delay:450ms] sm:text-base">
            {party.date} · {party.time} · {party.venue}
          </p>

          <Link
            to="/rsvp"
            className="animate-fade-up mt-8 inline-flex w-full max-w-xs items-center justify-center rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105 [animation-delay:600ms] sm:max-w-none sm:px-14"
          >
            RSVP Now
          </Link>
          <p className="animate-fade-up mt-3 text-xs text-white/60 [animation-delay:700ms]">
            Kindly confirm your attendance so we can plan seating and food.
          </p>
        </div>
      </section>

      {/* Details section */}
      <section className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-card px-4 py-5 text-center shadow-card">
            <p className="text-2xl">📅</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{party.date}</p>
          </div>
          <div className="rounded-2xl bg-card px-4 py-5 text-center shadow-card">
            <p className="text-2xl">⏰</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Time</p>
            <p className="font-medium text-foreground">{party.time}</p>
          </div>
          <div className="rounded-2xl bg-card px-4 py-5 text-center shadow-card">
            <p className="text-2xl">📍</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Venue</p>
            <p className="font-medium text-foreground">{party.venue}</p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
          {party.message}
        </p>

        {/* Venue map */}
        <div className="mt-8 overflow-hidden rounded-3xl shadow-card">
          <div className="flex items-center justify-between gap-3 bg-card px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Find your way
              </p>
              <p className="truncate font-medium text-foreground">{party.venueAddress}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(party.venueAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Open in Maps
            </a>
          </div>
          <iframe
            title={`Map showing the venue: ${party.venueAddress}`}
            src={mapEmbedUrl()}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full border-0 sm:h-80"
          />
        </div>
        <div className="mt-8 text-center">
          <Link to="/auth" className="text-xs text-muted-foreground underline">
            Organizer login
          </Link>
        </div>
      </section>
    </main>
  );
}
