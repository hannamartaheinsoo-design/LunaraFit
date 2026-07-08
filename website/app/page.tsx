import Container from "@/components/Container";
import PhoneFrame from "@/components/PhoneFrame";
import StoreBadges from "@/components/StoreBadges";
import Link from "next/link";

const HOW_IT_WORKS = [
  {
    icon: (
      <path
        d="M11 2a9 9 0 100 18 9 9 0 000-18zm0 4v5l3.5 2.1"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    title: "Log your cycle",
    body: "Track period days, spotting, mood and symptoms in a few taps. Lunara Fit learns your rhythm over time.",
  },
  {
    icon: (
      <path
        d="M6.5 17.5l4-4 3 3 6.5-7.5M4 20h16"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    title: "Get phase-matched workouts",
    body: "Every plan adapts to where you are in your cycle — higher intensity when your energy is high, recovery-focused when it's not.",
  },
  {
    icon: (
      <path
        d="M4 19V10m6 9V5m6 14v-7"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    title: "See your patterns",
    body: "Insights connect your training, energy and cycle data so you understand your body instead of guessing.",
  },
];

const FEATURE_TEASERS = [
  {
    title: "Cycle tracking",
    body: "Simple, private logging for period, symptoms, mood and predicted phases.",
    href: "/features#cycle-tracking",
    color: "bg-blush-50 text-blush-600",
  },
  {
    title: "Phase-based plans",
    body: "Workout programming that shifts with your hormones, not a generic weekly split.",
    href: "/features#phase-workouts",
    color: "bg-sky-50 text-sky-600",
  },
  {
    title: "Readiness insights",
    body: "A daily readiness score and tips so you know what kind of session suits today.",
    href: "/features#insights",
    color: "bg-coral-50 text-coral-600",
  },
  {
    title: "Progress tracking",
    body: "Watch strength and consistency trends across cycles, not just weeks.",
    href: "/features#progress",
    color: "bg-berry-50 text-berry-600",
  },
];

const ENERGY_PHASES = [
  { key: "Menstruation", value: 0.25 },
  { key: "Follicular", value: 0.65 },
  { key: "Ovulation", value: 1.0 },
  { key: "Luteal", value: 0.45 },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-50">
        <Container className="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-600">
              Cycle-synced training
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-beige-800 sm:text-5xl lg:text-6xl">
              Train with your cycle,
              <br />
              not against it.
            </h1>
            <p className="mt-6 max-w-md text-base font-light leading-relaxed text-beige-600 sm:text-lg">
              Lunara Fit connects your menstrual cycle to your workout plan, so
              every session matches the energy your body actually has that
              day.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <StoreBadges />
            </div>
            <Link
              href="/features"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-beige-800 hover:text-blush-600"
            >
              See how cycle-syncing works
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="relative mx-auto">
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-blush-100/40 blur-3xl" />
            <PhoneFrame label="App home screen — today's readiness card, phase pill and energy bar" />
          </div>
        </Container>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-beige-800 sm:text-4xl">
              Three steps to training smarter
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.title}
                className="rounded-[22px] bg-white p-7 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-200 to-blush-400">
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                    {step.icon}
                  </svg>
                </div>
                <h3 className="mt-5 text-base font-semibold text-beige-800">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] font-light leading-relaxed text-beige-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Energy across the cycle ── */}
      <section className="bg-sky-50 py-20 sm:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
              Why cycle-syncing works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-beige-800 sm:text-4xl">
              Your energy isn&apos;t the same every day
            </h2>
            <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-beige-600">
              Hormone shifts across the cycle change strength, recovery and
              motivation. Lunara Fit maps those shifts to training intensity
              so your plan works with your body&apos;s natural rhythm instead
              of a fixed weekly template.
            </p>
          </div>

          <div className="rounded-[26px] bg-white p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]">
            <div className="flex items-end justify-between gap-3">
              {ENERGY_PHASES.map((phase) => (
                <div key={phase.key} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-32 w-full items-end justify-center rounded-xl bg-sky-50">
                    <div
                      className="w-3/5 rounded-t-lg bg-gradient-to-t from-sky-400 to-sky-200"
                      style={{ height: `${phase.value * 100}%` }}
                    />
                  </div>
                  <span className="text-center text-[11px] font-medium uppercase tracking-[0.06em] text-beige-600">
                    {phase.key}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs font-light text-beige-400">
              Relative energy levels used to calibrate workout intensity —
              illustrative, and personalized as you log more cycles.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Feature teasers ── */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-600">
                What&apos;s inside
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-beige-800 sm:text-4xl">
                Everything to train in sync
              </h2>
            </div>
            <Link
              href="/features"
              className="text-sm font-medium text-beige-800 hover:text-blush-600"
            >
              View all features →
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURE_TEASERS.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-[22px] border border-beige-100 bg-white p-7 transition-colors hover:border-blush-200"
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] ${feature.color}`}
                >
                  {feature.title}
                </span>
                <p className="mt-4 text-[14px] font-light leading-relaxed text-beige-600">
                  {feature.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-beige-800 group-hover:text-blush-600">
                  Learn more <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA banner ── */}
      <section className="pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-[32px] bg-beige-800 px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blush-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
              Start training with your cycle today
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-[15px] font-light leading-relaxed text-beige-200">
              Free to start. No credit card required.
            </p>
            <div className="relative mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <StoreBadges />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
