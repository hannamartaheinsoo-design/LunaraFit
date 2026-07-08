import Link from "next/link";
import Container from "./Container";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy & data security" },
      { href: "/legal/privacy-policy", label: "Privacy policy" },
      { href: "/legal/terms", label: "Terms of service" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-beige-100 bg-white">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-beige-600">
              Workouts that move with your cycle, not against it. Built in
              Estonia, for bodies everywhere.
            </p>
            <a
              href="mailto:lunarafitapp@gmail.com"
              className="mt-4 inline-block text-sm font-medium text-blush-600 hover:text-blush-400"
            >
              lunarafitapp@gmail.com
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-beige-400">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-beige-600 hover:text-blush-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-beige-100 pt-8 text-xs text-beige-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lunara Fit OÜ. All rights reserved.</p>
          <p>Registered in Estonia · Built for the EU/EEA · GDPR compliant</p>
        </div>
      </Container>
    </footer>
  );
}
