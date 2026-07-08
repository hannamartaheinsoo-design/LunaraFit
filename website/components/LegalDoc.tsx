import Container from "./Container";

export type LegalSection = { heading: string; body: string[] };

export default function LegalDoc({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-600">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-beige-800 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-light text-beige-400">
          Effective date: {effectiveDate} — placeholder text pending legal review
        </p>
        <p className="mt-6 text-[15px] font-light leading-relaxed text-beige-600">
          {intro}
        </p>

        <div className="mt-12 flex flex-col gap-10">
          {sections.map((section, i) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold text-beige-800">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((paragraph, j) => (
                  <p
                    key={j}
                    className="text-[14.5px] font-light leading-relaxed text-beige-600"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
