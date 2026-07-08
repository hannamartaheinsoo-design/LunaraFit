import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import PhoneFrame from "@/components/PhoneFrame";

export const metadata: Metadata = {
  title: "Features",
  description:
    "How Lunara Fit tracks your cycle and turns it into a workout plan that matches your energy.",
};

const CYCLE_POINTS = [
  "Log period days, spotting, mood and symptoms in a few taps",
  "Automatic phase prediction once you've logged a couple of cycles",
  "A simple monthly calendar view — tap any day to log or edit",
  "Private by default: your cycle data is never sold or shared",
];

const WORKOUT_POINTS = [
  "Every plan is tagged with the phase it was designed for",
  "Intensity, volume and exercise selection shift automatically as your phase changes",
  "Full workout logging: sets, reps, weight, and HYROX-style station tracking",
  "Free plan includes 10 logged workouts a month — premium removes the cap",
];

const INSIGHT_POINTS = [
  "A daily readiness score built from your current phase",
  "Three actionable tips per day, tailored to phase-appropriate training",
  "Progress and pattern views across Body, Training, Wellbeing and Cycle",
  "28-day heatmap and progression charts so trends are easy to spot",
];

const PHASES = [
  {
    name: "Menstruation",
    energy: "Low",
    focus: "Rest, mobility, and light movement while your body recovers.",
  },
  {
    name: "Follicular",
    energy: "Rising",
    focus: "Energy builds — a good window to add intensity and skill work.",
  },
  {
    name: "Ovulation",
    energy: "Peak",
    focus: "Typically your strongest window for heavy lifts and high output.",
  },
  {
    name: "Luteal",
    energy: "Declining",
    focus: "Steady, moderate training with more focus on recovery.",
  },
];

function FeatureSection({
  id,
  eyebrow,
  title,
  body,
  points,
  reverse = false,
  screenshotLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  reverse?: boolean;
  screenshotLabel: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 sm:py-20">
      <Container
        className={`grid items-center gap-14 lg:grid-cols-2 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-600">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-beige-800 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-beige-600">
            {body}
          </p>
          <ul className="mt-7 flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush-100">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="#A85A5C"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[14px] font-light leading-relaxed text-beige-600">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <PhoneFrame label={screenshotLabel} />
      </Container>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Two systems, one plan"
        subtitle="Lunara Fit is a cycle tracker and a workout planner built as a single connected experience — not two apps bolted together."
      />

      <FeatureSection
        id="cycle-tracking"
        eyebrow="Cycle tracking"
        title="Understand your cycle without the spreadsheet"
        body="A few taps a day builds a private, accurate picture of your cycle — period days, spotting, mood and symptoms — that gets smarter the longer you use it."
        points={CYCLE_POINTS}
        screenshotLabel="Cycle calendar — logged days, predicted period and ovulation window"
      />

      <FeatureSection
        id="phase-workouts"
        eyebrow="Phase-based plans"
        title="Workouts that shift with your hormones"
        body="Instead of a fixed weekly split, your plan adapts session by session to the phase you're in — so intensity matches the energy you actually have."
        points={WORKOUT_POINTS}
        reverse
        screenshotLabel="Workout plan — phase-tagged sessions and logging screen"
      />

      <FeatureSection
        id="insights"
        eyebrow="Readiness & insights"
        title="Know what kind of day it is before you train"
        body="Today's Readiness turns your cycle data into a plain-language recommendation, and the Insights tab shows how training, energy and cycle connect over time."
        points={INSIGHT_POINTS}
        screenshotLabel="Insights — readiness score, hormone chips and pattern detection"
      />

      {/* ── How the phases connect ── */}
      <section id="progress" className="scroll-mt-24 bg-sky-50 py-20 sm:py-28">
        <Container>
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
              How the two connect
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-beige-800 sm:text-4xl">
              Four phases, four approaches to training
            </h2>
            <p className="mt-5 text-[15px] font-light leading-relaxed text-beige-600">
              Lunara Fit maps each phase of your cycle to a training focus.
              Your plan updates automatically as you move through the month.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PHASES.map((phase) => (
              <div
                key={phase.name}
                className="rounded-[22px] bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
              >
                <span className="inline-block rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-sky-600">
                  {phase.energy} energy
                </span>
                <h3 className="mt-4 text-base font-semibold text-beige-800">
                  {phase.name}
                </h3>
                <p className="mt-2 text-[13px] font-light leading-relaxed text-beige-600">
                  {phase.focus}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
