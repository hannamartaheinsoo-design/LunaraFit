import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import Accordion, { QA } from "@/components/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about tracking accuracy, data ownership, and pricing.",
};

// PLACEHOLDER Q&A — edit freely, these are written to be realistic but not final copy.
const CATEGORIES: { title: string; items: QA[] }[] = [
  {
    title: "Tracking & accuracy",
    items: [
      {
        question: "How accurate is the cycle prediction?",
        answer:
          "Predictions improve the more cycles you log. After 2–3 logged cycles, Lunara Fit can estimate your current phase and predict upcoming period and ovulation windows. Like any cycle app, predictions are estimates, not medical facts — irregular cycles will show wider prediction ranges.",
      },
      {
        question: "What if my cycle is irregular?",
        answer:
          "You can log period days, spotting, and symptoms manually at any time, and workouts still adapt to your logged phase even without long-range predictions. We're continuing to improve support for irregular cycles.",
      },
      {
        question: "Does Lunara Fit give medical advice?",
        answer:
          "No. Lunara Fit is a fitness and tracking tool, not a medical device or diagnostic service. Always talk to a healthcare provider about medical questions related to your cycle or health.",
      },
    ],
  },
  {
    title: "Data ownership",
    items: [
      {
        question: "Who owns my cycle and health data?",
        answer:
          "You do. Your data is yours — you can export it or permanently delete it from the app at any time. See our Privacy & Data Security page for the full details.",
      },
      {
        question: "Do you sell my data to third parties?",
        answer:
          "No. We never sell your health or cycle data, and we don't share it with advertisers or data brokers. See our Privacy & Data Security page for specifics.",
      },
      {
        question: "Can I delete my account and all my data?",
        answer:
          "Yes — you can clear all of your data from inside the app's settings, any time, without contacting support.",
      },
    ],
  },
  {
    title: "Subscription & cost",
    items: [
      {
        question: "Is Lunara Fit free?",
        answer:
          "Yes. The free plan includes full cycle tracking and up to 10 logged workouts per month. Premium removes the monthly workout cap and unlocks deeper insights — see our Pricing page for details.",
      },
      {
        question: "Can I cancel anytime?",
        answer:
          "Yes, premium subscriptions can be cancelled at any time from your device's app store subscription settings — no phone calls or retention flows.",
      },
      {
        question: "Is there a free trial for premium?",
        answer:
          "Placeholder — confirm current trial terms before publishing. Trial length and availability may vary by region and app store.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Common questions"
        subtitle="Can't find what you're looking for? Reach out on the Contact page and we'll get back to you."
      />

      <section className="pb-24">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-14">
            {CATEGORIES.map((cat) => (
              <div key={cat.title}>
                <h2 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-blush-600">
                  {cat.title}
                </h2>
                <Accordion items={cat.items} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
