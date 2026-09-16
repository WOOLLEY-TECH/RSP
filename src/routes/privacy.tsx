import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Deborah Woolley's 70th Birthday Celebration" },
      {
        name: "description",
        content:
          "Privacy policy for the Deborah Woolley 70th Birthday Celebration RSVP application.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-8"
        >
          ← Back to Home
        </Link>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: September 16, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              1. Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to the RSVP application for Deborah Woolley's 70th Birthday Celebration
              ("we," "us," or "our"). This Privacy Policy explains how we collect, use, and
              protect your personal information when you use our RSVP service to confirm your
              attendance for the celebration events taking place October 23–25, 2026.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              When you submit an RSVP through our application, we collect the following
              personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Full name</strong> — to identify you on the
                guest list.
              </li>
              <li>
                <strong className="text-foreground">Email address</strong> — to send you RSVP
                confirmation emails and event-related updates.
              </li>
              <li>
                <strong className="text-foreground">Phone number</strong> — for event coordination
                and last-minute communication if needed.
              </li>
              <li>
                <strong className="text-foreground">Attendance preferences</strong> — which of the
                three event days you plan to attend.
              </li>
              <li>
                <strong className="text-foreground">Guest names</strong> — names of additional
                guests you are registering on your behalf (up to 19).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use your personal information solely for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Managing and confirming your RSVP for the celebration events.</li>
              <li>Sending you a confirmation email with your RSVP details and event information.</li>
              <li>
                Helping the event organizers plan seating, catering, and logistics based on
                attendance numbers.
              </li>
              <li>
                Communicating any important updates or changes related to the celebration.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              4. Data Storage & Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information is stored securely in a cloud-hosted PostgreSQL database (Neon).
              We take reasonable measures to protect your data from unauthorized access, loss, or
              misuse. However, no method of electronic transmission or storage is completely
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              5. Data Sharing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We do <strong className="text-foreground">not</strong> sell, trade, or share your
              personal information with third parties. Your data is accessible only to the event
              organizers and is used exclusively for the purposes described in this policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              6. Email Communications
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When you provide your email address, we will send you a confirmation email
              containing your RSVP details and event information. You may also receive
              event-related updates if there are changes to the schedule or venues. We use Gmail
              (Google Workspace) to send these emails via a secure server. We will not use your
              email address for any marketing purposes unrelated to this event.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              7. Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We will retain your personal information for the duration needed to manage the
              celebration events and any post-event follow-up. After the events have concluded
              and all necessary communications have been completed, your data will be retained
              for a reasonable period and then securely deleted.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              8. Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction of inaccurate personal data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Withdraw your consent at any time by contacting the event organizers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be reflected
              on this page with an updated "Last updated" date. We encourage you to review this
              policy periodically.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              10. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or how your data is
              handled, please contact the event organizers. You can also reach us by replying to
              any confirmation email you receive from this application.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
