import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Deborah Woolley's 70th Birthday Celebration" },
      {
        name: "description",
        content:
          "Terms of service for the Deborah Woolley 70th Birthday Celebration RSVP application.",
      },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: September 16, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using the RSVP application for Deborah Woolley's 70th Birthday
              Celebration ("the Application"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Application.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              2. Purpose of the Application
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This Application is provided solely to allow invited guests to confirm their
              attendance for the celebration events honoring Deborah Woolley, scheduled for
              October 23–25, 2026, in the Dallas–Fort Worth, Texas area. The events include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">PRAISE NIGHT</strong> — Friday, October 23,
                2026, at International Charismatic Church (ICC), Grand Prairie, TX.
              </li>
              <li>
                <strong className="text-foreground">70th Birthday Celebration</strong> — Saturday,
                October 24, 2026, at Bob Duncan Center, Arlington, TX.
              </li>
              <li>
                <strong className="text-foreground">Thanksgiving Service</strong> — Sunday, October
                25, 2026, at International Charismatic Church (ICC), Grand Prairie, TX.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              3. RSVP Terms
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                You may submit only one RSVP per person. Duplicate submissions may be merged or
                removed by the event organizers.
              </li>
              <li>
                You may register up to 19 additional guests under your RSVP. You are responsible
                for ensuring that all guest information is accurate.
              </li>
              <li>
                You are required to provide a valid email address to receive your RSVP
                confirmation. You are responsible for ensuring your email address is correct.
              </li>
              <li>
                Event organizers reserve the right to modify, limit, or decline RSVPs at their
                discretion, including due to venue capacity constraints.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              4. Cancellation & Changes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are unable to attend after confirming your RSVP, we ask that you notify the
              event organizers as soon as possible so that we may adjust our planning
              accordingly. You may update your RSVP by contacting the event organizers directly
              or by replying to your confirmation email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              5. Event Conduct
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All guests are expected to behave respectfully and courteously toward the
              celebrant, fellow guests, and event staff. The event organizers reserve the right
              to ask any guest to leave if their behavior is disruptive, unsafe, or
              inappropriate. This includes but is not limited to harassment, intoxication that
              endangers others, or破坏ive behavior.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              6. Assumption of Risk & Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By attending the celebration events, you acknowledge that participation is
              voluntary and you assume all risks associated with attendance. The event
              organizers, hosts, and venue owners are not responsible for any injury, loss, or
              damage to personal property that may occur during the events. You agree to release
              and hold harmless the event organizers from any claims arising from your
              attendance.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              7. Photography & Media
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The celebration events may be photographed or recorded for personal and family
              memory purposes. By attending, you consent to being photographed or recorded and
              to the use of such images or recordings by the event organizers for non-commercial
              purposes, including sharing with family and friends.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              8. Prohibited Uses
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Application for any unlawful or fraudulent purpose.</li>
              <li>
                Submit false or misleading information in your RSVP (e.g., fake guest names).
              </li>
              <li>
                Attempt to gain unauthorized access to the Application or its underlying systems.
              </li>
              <li>
                Use automated tools (bots, scripts) to interact with the Application.
              </li>
              <li>Interfere with or disrupt the Application's functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              9. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Application is provided "as is" and "as available" without warranties of any
              kind, either express or implied. We do not warrant that the Application will be
              uninterrupted, error-free, or secure. We disclaim all warranties, including
              implied warranties of merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, the event organizers shall not
              be liable for any indirect, incidental, special, consequential, or punitive
              damages arising out of or related to your use of the Application or attendance at
              the celebration events. Our total liability shall not exceed the amount you paid
              (if anything) to use the Application.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              11. Modifications to These Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be
              effective upon posting to this page. Your continued use of the Application after
              any changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              12. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the
              laws of the State of Texas, United States, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              13. Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact the event
              organizers by replying to any confirmation email or reaching out through the
              contact information provided on the event invitation.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
