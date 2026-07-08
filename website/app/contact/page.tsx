import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Lunara Fit team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you"
        subtitle="Questions, feedback, or partnership ideas — reach out directly or use the form below."
      />

      <section className="pb-24">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-beige-800">Email us directly</h2>
            <a
              href="mailto:lunarafitapp@gmail.com"
              className="mt-3 inline-block text-xl font-medium text-blush-600 hover:text-blush-400"
            >
              lunarafitapp@gmail.com
            </a>
            <p className="mt-4 max-w-sm text-[14px] font-light leading-relaxed text-beige-600">
              We read every message ourselves — expect a reply from a real
              person, usually within a couple of business days.
            </p>

            <div className="mt-10 rounded-[22px] bg-sky-50 p-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-sky-600">
                Company
              </h3>
              <p className="mt-2 text-[14px] font-light leading-relaxed text-beige-600">
                Lunara Fit OÜ
                <br />
                Estonia
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-beige-100 bg-white p-8">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
