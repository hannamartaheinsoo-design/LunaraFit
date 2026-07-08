/**
 * App Store / Google Play badges. `href` values are placeholders —
 * swap for the real listing URLs once the app is published.
 */
export default function StoreBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href="#"
        aria-label="Download on the App Store (placeholder link)"
        className="flex h-14 items-center gap-3 rounded-2xl bg-beige-800 px-5 text-cream transition-opacity hover:opacity-90"
      >
        <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor">
          <path d="M16.365 12.63c-.028-2.796 2.284-4.14 2.388-4.204-1.303-1.9-3.33-2.16-4.05-2.19-1.723-.176-3.365 1.017-4.24 1.017-.875 0-2.226-.993-3.66-.965-1.883.028-3.62 1.096-4.588 2.78-1.958 3.39-.5 8.407 1.406 11.156.936 1.345 2.05 2.85 3.508 2.795 1.408-.056 1.94-.91 3.643-.91 1.703 0 2.183.91 3.67.882 1.518-.028 2.478-1.372 3.406-2.72 1.073-1.56 1.516-3.07 1.538-3.148-.034-.014-2.955-1.135-2.983-4.493h-.038zM13.72 4.32c.775-.94 1.298-2.24 1.155-3.53-1.116.045-2.47.744-3.27 1.685-.72.833-1.35 2.163-1.183 3.44 1.24.096 2.51-.63 3.298-1.595z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-light">Download on the</span>
          <span className="block text-sm font-medium">App Store</span>
        </span>
      </a>

      <a
        href="#"
        aria-label="Get it on Google Play (placeholder link)"
        className="flex h-14 items-center gap-3 rounded-2xl bg-beige-800 px-5 text-cream transition-opacity hover:opacity-90"
      >
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
          <path
            d="M1 1.27C1 .6 1.4.1 1.98.02L13.3 10 1.98 21.98C1.4 21.9 1 21.4 1 20.73V1.27z"
            fill="#EE9F80"
          />
          <path d="M13.3 10L1.98.02c.16-.02.33 0 .5.06l11.98 6.85L13.3 10z" fill="#D9898B" />
          <path d="M13.3 10l1.16 3.07-11.98 6.85c-.17.06-.34.08-.5.06L13.3 10z" fill="#D9898B" />
          <path
            d="M14.46 6.93L18.2 9.1c.53.3.53 1.08 0 1.38l-3.74 2.16-2.3-3.32 2.3-2.4z"
            fill="#7A9AB0"
          />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-light">Get it on</span>
          <span className="block text-sm font-medium">Google Play</span>
        </span>
      </a>
    </div>
  );
}
