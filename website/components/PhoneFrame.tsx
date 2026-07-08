import { ReactNode } from "react";

/**
 * Placeholder phone mockup used wherever a real app screenshot should go.
 * Swap the `children` for an <Image> of an actual screenshot when available —
 * the bezel/notch chrome can stay as-is.
 */
export default function PhoneFrame({
  label,
  children,
  className = "",
}: {
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-[260px] rounded-[40px] border-[6px] border-beige-800 bg-beige-800 shadow-[0_30px_70px_-20px_rgba(31,31,31,0.35)] ${className}`}
    >
      <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-beige-800" />
      <div className="aspect-[9/19.5] w-full overflow-hidden rounded-[34px] bg-sky-50">
        {children ?? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="4"
                  stroke="#7A9AB0"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 16l5-5 4 4 5-6 4 5"
                  stroke="#7A9AB0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-sky-600">
              Screenshot placeholder
            </p>
            <p className="text-xs font-light leading-relaxed text-sky-800/70">
              {label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
