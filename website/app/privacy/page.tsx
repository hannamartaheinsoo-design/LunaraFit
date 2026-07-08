import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Data Security",
  description:
    "How Lunara Fit stores, protects and never sells the health data you trust us with.",
};

const PROMISES = [
  {
    title: "Encrypted in transit and at rest",
    body: "Your data is encrypted between your device and our servers, and encrypted in our database.",
  },
  {
    title: "Never sold, never shared for ads",
    body: "We don't sell cycle or health data, and we don't share it with advertisers or data brokers — ever.",
  },
  {
    title: "GDPR compliant by design",
    body: "Lunara Fit OÜ is an Estonian company, so GDPR isn't a checkbox — it's the baseline we're built on.",
  },
  {
    title: "You're always in control",
    body: "Export or permanently delete all of your data from inside the app, any time, no support ticket needed.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy & data security"
        title="Your body's data, handled with care"
        subtitle="Lunara Fit stores sensitive health data — your cycle, symptoms, and workouts. Here's exactly how we protect it and what we do (and never do) with it."
      />

      {/* ── Quick promises ── */}
      <section className="py-16">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-beige-100 bg-white p-6"
              >
                <h3 className="text-[14px] font-semibold text-beige-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] font-light leading-relaxed text-beige-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Detailed explanation ── */}
      {/*
        PLACEHOLDER CONTENT: the copy in this section is written to sound
        accurate to how the app is described elsewhere in this codebase
        (Convex backend, Convex Auth, GDPR / Estonian OÜ), but it should be
        reviewed against the actual production data-handling setup — and
        ideally by counsel — before this page goes live.
      */}
      <section className="pb-24">
        <Container className="max-w-3xl">
          <div className="prose-section flex flex-col gap-14">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-beige-800">
                What we collect
              </h2>
              <p className="mt-4 text-[15px] font-light leading-relaxed text-beige-600">
                To make cycle-synced training work, Lunara Fit collects: your
                account email, basic profile details (birth date, height,
                weight, and body composition if you choose to add them),
                cycle logs (period days, spotting, mood, symptoms), and your
                workout history. We only ask for what&apos;s needed to power
                the features you use.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-beige-800">
                How it&apos;s stored
              </h2>
              <p className="mt-4 text-[15px] font-light leading-relaxed text-beige-600">
                Your data lives in our backend database, hosted on
                infrastructure within the EU/EEA where possible, with
                encryption in transit (TLS) and at rest. Authentication is
                handled separately from your health data, and passwords are
                never stored in plain text.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-beige-800">
                Who can see it
              </h2>
              <p className="mt-4 text-[15px] font-light leading-relaxed text-beige-600">
                Only you can see your cycle and health data inside the app.
                Our team can access data only when strictly necessary for
                support or security, and never for marketing purposes. We do
                not sell your data, and we do not share it with advertisers,
                data brokers, or any third party for their own use. Limited,
                anonymized, aggregate data may be used internally to improve
                the app — never in a way that could identify you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-beige-800">
                Your rights under GDPR
              </h2>
              <p className="mt-4 text-[15px] font-light leading-relaxed text-beige-600">
                Because Lunara Fit OÜ is registered in Estonia, every user —
                regardless of location — gets GDPR-level protections. You
                have the right to access, correct, export, or permanently
                delete your data at any time. You can clear all of your data
                directly from the app&apos;s settings, or contact us and
                we&apos;ll handle it for you within the legally required
                timeframe.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-beige-800">
                Data retention
              </h2>
              <p className="mt-4 text-[15px] font-light leading-relaxed text-beige-600">
                We keep your data only for as long as your account is active,
                or as long as needed to provide the service. If you delete
                your account, your personal data is removed from our
                production systems, aside from what we&apos;re legally
                required to retain (such as billing records).
              </p>
            </div>

            <div className="rounded-[22px] bg-sky-50 p-7">
              <h2 className="text-lg font-semibold text-beige-800">
                Questions about your data?
              </h2>
              <p className="mt-3 text-[14px] font-light leading-relaxed text-beige-600">
                For anything not covered here, or to submit a data request,
                email us directly and we&apos;ll get back to you personally —
                not a bot.
              </p>
              <a
                href="mailto:lunarafitapp@gmail.com"
                className="mt-4 inline-block text-sm font-medium text-blush-600 hover:text-blush-400"
              >
                lunarafitapp@gmail.com
              </a>
            </div>

            <p className="text-xs font-light text-beige-400">
              See also our{" "}
              <Link href="/legal/privacy-policy" className="underline hover:text-blush-400">
                full Privacy Policy
              </Link>{" "}
              for the legal terms governing data processing.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
