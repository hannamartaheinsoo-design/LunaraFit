import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the founders of Lunara Fit, an Estonian-built app syncing workout planning with menstrual cycle tracking.",
};

const FOUNDERS = [
  {
    name: "Kaisa Reena Linnupõld",
    role: "Co-founder",
    // PLACEHOLDER BIO — replace with Kaisa's own self-written bio.
    bio: "Kaisa's bio goes here. Replace this placeholder with a short, self-written paragraph covering her background, what led her to start Lunara Fit, and what she focuses on day-to-day.",
  },
  {
    name: "Hanna Marta Heinsoo",
    role: "Co-founder",
    // PLACEHOLDER BIO — replace with Hanna's own self-written bio.
    bio: "Hanna's bio goes here. Replace this placeholder with a short, self-written paragraph covering her background, what led her to start Lunara Fit, and what she focuses on day-to-day.",
  },
];

function PortraitPlaceholder({ initials }: { initials: string }) {
  return (
    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blush-100 to-blush-200 text-2xl font-semibold text-blush-600 sm:h-48 sm:w-48">
      {/* PLACEHOLDER PORTRAIT — swap this div for a real <Image> of a circular headshot */}
      {initials}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Lunara Fit"
        title="Built by two people tired of ignoring their cycle"
        subtitle="Lunara Fit started as a shared frustration: fitness apps that treat every day of the month the same. We're building the tool we wished we had."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-16 sm:grid-cols-2">
            {FOUNDERS.map((founder) => (
              <div key={founder.name} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <PortraitPlaceholder
                  initials={founder.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                />
                <h2 className="mt-6 text-xl font-semibold text-beige-800">
                  {founder.name}
                </h2>
                <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.1em] text-blush-600">
                  {founder.role}
                </p>
                <p className="mt-4 max-w-sm text-[14.5px] font-light leading-relaxed text-beige-600">
                  {founder.bio}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sky-50 py-20 sm:py-28">
        <Container className="max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
            The company
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-beige-800 sm:text-4xl">
            Lunara Fit OÜ
          </h2>
          <p className="mt-5 text-[15px] font-light leading-relaxed text-beige-600">
            {/* PLACEHOLDER — confirm registration details before publishing */}
            Lunara Fit is operated by Lunara Fit OÜ, a company registered in
            Estonia. Being Estonian means we build with GDPR and data
            transparency as defaults, not afterthoughts — see our{" "}
            <a href="/privacy" className="underline hover:text-blush-400">
              Privacy &amp; Data Security
            </a>{" "}
            page for details.
          </p>
        </Container>
      </section>
    </>
  );
}
