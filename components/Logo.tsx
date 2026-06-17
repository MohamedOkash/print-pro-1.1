"use client";

// Print Pro brand mark — a printer fused with an open book, in the brand's
// blue→purple gradient. Rebuilt as inline SVG so it stays razor-sharp at any
// size (favicon → hero) and inherits no external asset.

export function LogoIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  const id = "ppgrad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="12" y1="14" x2="86" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5468FF" />
          <stop offset="0.55" stopColor="#6D5CF0" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* top paper / open book with folded corner */}
      <path
        d="M32 16 H56 L66 26 V40 H32 Z"
        fill={`url(#${id})`}
        stroke="#3A33B0"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M56 16 V26 H66" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />

      {/* printer body */}
      <rect x="20" y="34" width="60" height="35" rx="11" fill={`url(#${id})`} stroke="#3A33B0" strokeWidth="3" />

      {/* open-book dip across the top of the body */}
      <path d="M33 35 Q50 50 67 35" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />

      {/* left indicator slot */}
      <rect x="27" y="47" width="9" height="4.5" rx="2.25" fill="#fff" opacity="0.85" />

      {/* output sheet with text lines */}
      <path
        d="M35 60 H65 V77 Q65 80 62 80 H38 Q35 80 35 77 Z"
        fill={`url(#${id})`}
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <line x1="41" y1="68" x2="59" y2="68" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
      <line x1="41" y1="74" x2="55" y2="74" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function Logo({
  size = 40,
  showText = true,
  subtitle,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <div className="leading-none">
          <h1 className="font-900 text-lg logo-gradient">Print Pro</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

export default Logo;
