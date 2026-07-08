"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./Container";
import Logo from "./Logo";
import Button from "./Button";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-beige-100 bg-cream/90 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium uppercase tracking-[0.08em] transition-colors ${
                  active ? "text-blush-600" : "text-beige-600 hover:text-blush-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/contact" variant="dark" className="!px-6 !py-3">
            Get the app
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-beige-100 text-beige-800"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            {open ? (
              <path
                d="M1 1L17 13M17 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <>
                <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="1.6" />
                <line x1="0" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.6" />
                <line x1="0" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.6" />
              </>
            )}
          </svg>
        </button>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-beige-100 bg-cream">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-beige-800 hover:bg-blush-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-beige-800 px-3 py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-cream"
            >
              Get the app
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
