import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "dark" | "outline";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-blush-400 text-white shadow-[0_6px_16px_-4px_rgba(217,137,139,0.45)] hover:opacity-90",
  dark: "bg-beige-800 text-cream hover:opacity-90",
  outline:
    "bg-transparent text-beige-600 border border-beige-200 hover:border-blush-400 hover:text-blush-600",
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] transition-all active:scale-[0.97] ${VARIANT_CLASSES[variant]} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
