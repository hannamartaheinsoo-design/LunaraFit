import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Lunara Fit pricing — free forever, or go premium monthly or yearly.",
};

// PLACEHOLDER PRICING — confirm final prices and feature lists before publishing.
const TIERS = [
  {
    name: "Free",
    price: "€0",
    per: "forever",
    tagline: "Full cycle tracking, capped workout logging.",
    features: [
      "Unlimited cycle logging & predictions",
      "Phase-based workout recommendations",
      "Up to 10 logged workouts / month",
      "Today's Readiness card",
      "Export or delete your data anytime",
    ],
    cta: "Get started free",
    popular: false,
  },
  {
    name: "Premium Monthly",
    price: "€6.99",
    per: "/ month",
    tagline: "Everything, billed month to month.",
    features: [
      "Everything in Free",
      "Unlimited workout logging",
      "Full Insights: Body, Training, Wellbeing, Patterns",
      "28-day heatmap & progression tracking",
      "Cancel anytime",
    ],
    cta: "Start premium",
    popular: true,
  },
  {
    name: "Premium Yearly",
    price: "€49.99",
    per: "/ year",
    tagline: "Best value — about €4.17 / month.",
    features: [
      "Everything in Premium Monthly",
      "2 months free vs. paying monthly",
      "Priority support",
      "Early access to new features",
      "Cancel anytime",
    ],
    cta: "Start premium",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple pricing, no surprises"
        subtitle="Start free. Upgrade only if you want unlimited workout logging and deeper insights."
      />

      <section className="pb-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-[26px] border p-8 ${
                  tier.popular
                    ? "border-blush-400 bg-white shadow-[0_20px_50px_-20px_rgba(217,137,139,0.35)]"
                    : "border-beige-100 bg-white"
                }`}
              >
                {tier.popular && (
                  <span className="absolute left-6 top-0 -translate-y-1/2 rounded-full bg-blush-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-base font-semibold text-beige-800">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-beige-800">
                    {tier.price}
                  </span>
                  <span className="text-sm font-light text-beige-400">{tier.per}</span>
                </div>
                <p className="mt-3 text-[13.5px] font-light text-beige-600">{tier.tagline}</p>

                <ul className="mt-7 flex flex-1 flex-col gap-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
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
                      <span className="text-[13.5px] font-light leading-relaxed text-beige-600">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href="/contact"
                  variant={tier.popular ? "primary" : "outline"}
                  className="mt-8 w-full"
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs font-light text-beige-400">
            Prices shown are placeholders pending final App Store / Google
            Play pricing. All plans can be cancelled anytime from your
            device&apos;s subscription settings.
          </p>
        </Container>
      </section>
    </>
  );
}
