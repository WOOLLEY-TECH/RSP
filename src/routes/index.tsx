import { createFileRoute, Link } from "@tanstack/react-router";
import { party } from "@/lib/party";
import { useState, useEffect, useCallback } from "react";
import mum1 from "@/assets/mum1.jpeg";
import mum2 from "@/assets/mum2.jpeg";
import mum3 from "@/assets/mum3.jpeg";
import mum4 from "@/assets/mum4.jpeg";
import mum5 from "@/assets/mum5.jpeg";
import {
  PartyPopper,
  Gift,
  Heart,
  Sparkles,
  Music,
  Crown,
  Cake,
  Calendar,
  MessageSquare,
  Phone,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Happy 70th Birthday — ${party.title}` },
      {
        name: "description",
        content: `Celebrating 70 years of faith, grace, and love with Deborah Woolley. Join us October 23–25, 2026 for three days of praise, celebration, and thanksgiving.`,
      },
      { property: "og:title", content: `Happy 70th Birthday — Deborah Woolley` },
      {
        property: "og:description",
        content: `Celebrating 70 years of faith, grace, and love. Join us October 23–25, 2026 for Praise Night, 70th Birthday Celebration, and Thanksgiving Service.`,
      },
      { property: "og:image", content: mum5 },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `Happy 70th Birthday — Deborah Woolley` },
      {
        name: "twitter:description",
        content: `Celebrating 70 years of faith, grace, and love. Join us October 23–25, 2026.`,
      },
      { name: "twitter:image", content: mum5 },
    ],
  }),
  component: Index,
});

const mumImages = [mum1, mum2, mum3, mum4, mum5];

const birthdayIcons = [
  { Icon: PartyPopper, color: "oklch(0.65 0.22 15)" },
  { Icon: Gift, color: "oklch(0.75 0.18 85)" },
  { Icon: Heart, color: "oklch(0.6 0.22 20)" },
  { Icon: Sparkles, color: "oklch(0.85 0.15 90)" },
  { Icon: Star, color: "oklch(0.8 0.12 60)" },
  { Icon: Music, color: "oklch(0.7 0.18 280)" },
  { Icon: Crown, color: "oklch(0.75 0.15 65)" },
  { Icon: Cake, color: "oklch(0.65 0.2 350)" },
];

function Countdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
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
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 lg:gap-4">
      {[
        { label: "Days", value: timeLeft.days.toString().padStart(2, "0") },
        { label: "Hours", value: timeLeft.hours.toString().padStart(2, "0") },
        { label: "Minutes", value: timeLeft.minutes.toString().padStart(2, "0") },
        { label: "Seconds", value: timeLeft.seconds.toString().padStart(2, "0") },
      ].map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-5 lg:px-6 py-2 sm:py-3 lg:py-4 border border-white/20 min-w-[60px] sm:min-w-[70px] lg:min-w-[80px]"
        >
          <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tabular-nums leading-tight">
            {item.value}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/70 mt-0.5">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.addEventListener("touchstart", handleTouchStart, { passive: true });
      node.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStart(null);
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mumImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mumImages.length) % mumImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    >
      {mumImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Memory ${i + 1} of ${party.celebrant}`}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        />
      ))}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-20"
        aria-hidden="true"
      />

      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Previous photo"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Next photo"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-30">
        {mumImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? "bg-white w-5 sm:w-6" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === currentIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 35 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-25">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 12) * 0.6}s`,
            animationDuration: `${5 + (i % 5)}s`,
            backgroundColor:
              i % 4 === 0
                ? "oklch(0.85 0.15 90)"
                : i % 4 === 1
                  ? "oklch(0.6 0.18 258)"
                  : i % 4 === 2
                    ? "oklch(0.75 0.18 85)"
                    : "oklch(0.95 0.01 250)",
          }}
        />
      ))}
    </div>
  );
}

function FloatingBalloons() {
  const balloons = Array.from({ length: 12 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-15">
      {balloons.map((_, i) => (
        <div
          key={i}
          className="absolute bottom-full"
          style={{
            left: `${(i * 83) % 100}%`,
            animationDelay: `${(i % 10) * 0.8}s`,
            animationDuration: `${8 + (i % 6)}s`,
          }}
        >
          <span
            className="balloon"
            style={{
              background: birthdayIcons[i % birthdayIcons.length].color,
              width: `${16 + (i % 3) * 8}px`,
              height: `${22 + (i % 3) * 10}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}



function EventCard({ event }: { event: (typeof party.events)[0] & { featured?: boolean } }) {
  const gradientClass = `bg-gradient-to-br ${event.color}`;
  const isFeatured = event.featured;

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl bg-card shadow-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isFeatured
          ? "border-2 border-primary/50 ring-2 ring-primary/20 scale-[1.02] z-10"
          : "border border-border"
      }`}
    >
      <div
        className={`absolute inset-0 ${gradientClass} opacity-10 group-hover:opacity-15 transition-opacity ${
          isFeatured ? "opacity-15 group-hover:opacity-20" : ""
        }`}
      />
      {isFeatured && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-pulse-subtle">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 text-primary-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-lg">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground/50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-foreground" />
            </span>
            Main Celebration
          </span>
        </div>
      )}
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-2xl ${gradientClass} flex items-center justify-center text-3xl shadow-lg ${
              isFeatured ? "ring-4 ring-primary/30" : ""
            }`}
          >
            {event.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {event.day}
              </span>
              <span className="w-px h-4 bg-border mx-1" />
              <time className="text-sm font-medium text-foreground">{event.date}</time>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-1">{event.name}</h3>
            <p className="text-primary font-semibold mb-3">{event.time}</p>
            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-2 sm:gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1 flex-wrap">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="break-words">{event.venue}</span>
              </span>
              <span className="flex items-center gap-1 flex-wrap">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="break-words">{event.address}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-border/50">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                Dress code: {event.dressCode}
              </span>
            </div>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
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
        <FloatingBalloons />
        

        <div className="relative z-30 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-20 text-center sm:pb-24 sm:pt-24">
          <p className="animate-fade-up text-xs sm:text-sm uppercase tracking-[0.4em] text-white/90 mb-4 [animation-delay:100ms]">
            You're cordially invited to celebrate
          </p>

          <h1 className="animate-fade-up mt-2 font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-white drop-shadow-xl [animation-delay:200ms]">
            <span className="shimmer-text relative inline-block">70th</span> Birthday
          </h1>

          <p className="animate-fade-up mt-4 font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-white/95 [animation-delay:300ms]">
            {party.celebrant}
          </p>

          <div className="animate-fade-up mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-white/80 [animation-delay:400ms]">
            <span className="flex items-center gap-1.5 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              October 23–25, 2026
            </span>
          </div>

          <Countdown />

          <div className="animate-fade-up mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 [animation-delay:600ms]">
            <Link
              to="/rsvp"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-purple-100 px-8 sm:px-12 py-4 text-base sm:text-lg font-semibold text-purple-900 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-purple-200 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-200/50"
            >
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
              RSVP Now
            </Link>
          </div>

          <p className="animate-fade-up mt-4 max-w-md text-sm sm:text-base leading-relaxed text-white/70 [animation-delay:700ms]">
            Join us for three unforgettable days of praise, celebration, and thanksgiving as we
            honor 70 years of faith, grace, and love.
          </p>
        </div>

        <div
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-30"
          aria-hidden="true"
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-2">
            Event Schedule
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            Celebration Program
          </h2>
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
              src={`https://www.google.com/maps?q=${encodeURIComponent(party.events[1].mapQuery)}&output=embed`}
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
                src={`https://www.google.com/maps?q=${encodeURIComponent(event.mapQuery)}&output=embed`}
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://wa.me/233555313216"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-green-500" />
            Contact Us for Event Planning: 0555313216 (WhatsApp)
          </a>
        </div>

        <div className="mt-6 text-center">
          <Link to="/auth" className="text-xs text-muted-foreground underline">
            Organizer login
          </Link>
        </div>
      </section>
    </main>
  );
}
