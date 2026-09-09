import { createFileRoute, Link } from "@tanstack/react-router";
import { party, mapEmbedUrl } from "@/lib/party";
import { useState, useEffect, useCallback } from "react";
import mum1 from "@/assets/mum1.jpeg";
import mum2 from "@/assets/mum2.jpeg";
import mum3 from "@/assets/mum3.jpeg";
import mum4 from "@/assets/mum4.jpeg";
import mum5 from "@/assets/mum5.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Happy 70th Birthday — ${party.title}` },
      {
        name: "description",
        content: `Join us October 23-25, 2026 to celebrate ${party.celebrant}'s 70th birthday with three days of faith, grace, and love.`,
      },
      { property: "og:title", content: `Happy 70th Birthday — ${party.title}` },
      {
        property: "og:description",
        content: `Three days of celebration: Praise Night (Oct 23), 70th Birthday (Oct 24), Thanksgiving (Oct 25). Tap to RSVP.`,
      },
    ],
  }),
  component: Index,
});

const mumImages = [mum1, mum2, mum3, mum4, mum5];

function Countdown() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(party.dateISO).getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6">
      {[
        { label: "Days", value: timeLeft.days.toString().padStart(2, "0") },
        { label: "Hours", value: timeLeft.hours.toString().padStart(2, "0") },
        { label: "Minutes", value: timeLeft.minutes.toString().padStart(2, "0") },
        { label: "Seconds", value: timeLeft.seconds.toString().padStart(2, "0") },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 sm:px-6 sm:py-4 border border-white/20">
          <span className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">{item.value}</span>
          <span className="text-xs uppercase tracking-wider text-white/70 mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mumImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mumImages.length) % mumImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ width: '100%', height: '100%' }}>
      {mumImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Memory ${i + 1} of ${party.celebrant}`}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30" />
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        aria-label="Previous photo"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        aria-label="Next photo"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {mumImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

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

function EventCard({ event }: { event: typeof party.events[0] }) {
  const gradientClass = `bg-gradient-to-br ${event.color}`;
  
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-card shadow-card border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className={`absolute inset-0 ${gradientClass} opacity-10 group-hover:opacity-15 transition-opacity`} />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${gradientClass} flex items-center justify-center text-3xl shadow-lg`}>
            {event.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{event.day}</span>
              <span className="w-px h-4 bg-border mx-1" />
              <time className="text-sm font-medium text-foreground">{event.date}</time>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-1">{event.name}</h3>
            <p className="text-primary font-semibold mb-3">{event.time}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[200px]">{event.venue}</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[200px]">{event.address}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border/50">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                {event.dressCode}
              </span>
              {event.note && (
                <span className="text-xs text-muted-foreground/80 italic">{event.note}</span>
              )}
            </div>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Get Directions
        </a>
      </div>
    </article>
  );
}

function Index() {
  return (
    <main className="min-h-screen w-full bg-background">
      <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-ink">
        <ImageSlider />
        <Confetti />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-end px-4 pb-16 pt-24 text-center sm:pb-24">
          <p className="animate-fade-up text-xs uppercase tracking-[0.4em] text-primary/80 sm:text-sm">
            You're invited to
          </p>
          <h1 className="animate-fade-up mt-4 font-display text-5xl font-bold leading-none text-primary drop-shadow-lg [animation-delay:150ms] sm:text-7xl lg:text-8xl">
            Happy <span className="shimmer-text">70th</span> Birthday
          </h1>
          <p className="animate-fade-up mt-4 font-display text-2xl font-semibold text-primary [animation-delay:300ms] sm:text-3xl">
            {party.celebrant}
          </p>
          <p className="animate-fade-up mt-3 max-w-md text-sm leading-relaxed text-primary/80 [animation-delay:450ms] sm:text-base">
            Three Days of Celebration · October 23–25, 2026
          </p>

          <Countdown />

          <Link
            to="/rsvp"
            className="animate-fade-up mt-8 inline-flex w-full max-w-xs items-center justify-center rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105 [animation-delay:600ms] sm:max-w-none sm:px-14"
          >
            RSVP Now
          </Link>
          <p className="animate-fade-up mt-3 text-xs text-primary/60 [animation-delay:700ms]">
            Kindly confirm your attendance so we can plan seating and food.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-2">Event Schedule</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            Three Days of <span className="text-primary">Faith, Grace & Love</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            {party.message}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {party.events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-16">
          <div className="rounded-3xl bg-card shadow-card border border-border overflow-hidden">
            <div className="flex items-center justify-between gap-3 bg-muted px-5 py-4 border-b border-border">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Main Celebration Venue
                </p>
                <p className="truncate font-medium text-foreground">
                  {party.events[1].venue} · {party.events[1].address}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(party.events[1].mapQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Open in Maps
              </a>
            </div>
            <iframe
              title={`Map showing the venue: ${party.events[1].venue}`}
              src={mapEmbedUrl(party.events[1].mapQuery)}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="h-64 w-full border-0 sm:h-80"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {party.events.map((event) => (
            <div
              key={`map-${event.id}`}
              className="rounded-2xl bg-card shadow-card border border-border overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h4 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-xl">{event.icon}</span>
                  {event.venue}
                </h4>
              </div>
              <iframe
                title={`Map showing ${event.venue}`}
                src={mapEmbedUrl(event.mapQuery)}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-48 w-full border-0"
              />
              <div className="p-4 bg-muted/50">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/auth" className="text-xs text-muted-foreground underline">
            Organizer login
          </Link>
        </div>
      </section>
    </main>
  );
}