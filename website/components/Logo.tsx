import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 28, text: "text-base" },
    md: { icon: 34, text: "text-lg" },
    lg: { icon: 44, text: "text-2xl" },
  }[size];

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 shrink-0">
      <svg
        width={sizes.icon}
        height={sizes.icon}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9898B" />
            <stop offset="100%" stopColor="#EE9F80" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="68" fill="#FDF1F2" />
        <circle cx="80" cy="80" r="58" fill="none" stroke="#F5D4D6" strokeWidth="9" />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="9"
          strokeDasharray="303 91"
          strokeDashoffset="46"
          strokeLinecap="round"
        />
        <circle cx="80" cy="80" r="43" fill="none" stroke="#F5D4D6" strokeWidth="7" />
        <circle
          cx="80"
          cy="80"
          r="43"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="7"
          strokeDasharray="165 105"
          strokeDashoffset="26"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 44 80 C 51 68, 58 68, 65 80 C 72 92, 79 92, 86 80 C 93 68, 100 68, 107 80 C 114 92, 121 92, 116 80"
          fill="none"
          stroke="#D9898B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="65" cy="80" r="3" fill="#D9898B" />
        <circle cx="86" cy="80" r="3" fill="#D9898B" />
        <circle cx="107" cy="80" r="3" fill="#EE9F80" />
      </svg>
      <span className={`${sizes.text} leading-none tracking-tight`}>
        <span className="font-semibold text-beige-800">Lunara</span>
        <span className="font-light text-blush-400 ml-0.5">Fit</span>
      </span>
    </Link>
  );
}
