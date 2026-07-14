export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="brand-sky" x1="6" y1="5" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2997ff" />
          <stop offset="1" stopColor="#0066cc" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#brand-sky)" />
      <circle cx="16" cy="15" r="8" fill="none" stroke="white" strokeWidth="1.6" />
      <path d="M8.5 15h15M16 7c2 2.2 3.1 5 3.1 8S18 20.8 16 23c-2-2.2-3.1-5-3.1-8S14 9.2 16 7Z" fill="none" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
      <path d="m21.1 7.2 5.3-2.1-2.1 5.3-1-1-2.8 2.8-1.6-1.6 2.8-2.8-0.6-0.6Z" fill="white" />
    </svg>
  );
}
