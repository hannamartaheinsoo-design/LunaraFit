import { ReactNode } from "react";
import Container from "./Container";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-sky-50 pb-16 pt-20 sm:pt-24">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blush-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <Container className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-600">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-beige-800 sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-beige-600 sm:text-lg">
            {subtitle}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
