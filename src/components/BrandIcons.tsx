import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  withGlow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {/* Background radial atmosphere glow */}
      {withGlow && (
        <div
          className="absolute -inset-1 bg-gradient-to-tr from-teal-500 via-cyan-400 to-emerald-400 rounded-2xl blur-md opacity-50 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* SVG Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dim} relative z-10 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md`}
      >
        <defs>
          <linearGradient id="safaLogoGradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="safaCoreGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          <linearGradient id="safaRingBackdrop" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <radialGradient id="safaCenterAperture" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0F766E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#042F2E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Container Tile */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#safaRingBackdrop)"
          stroke="rgba(45, 212, 191, 0.35)"
          strokeWidth="2.5"
        />

        {/* Inner Soft Ambient Field */}
        <circle cx="50" cy="50" r="34" fill="url(#safaCenterAperture)" />

        {/* Outer Focus Precision Ring */}
        <circle
          cx="50"
          cy="50"
          r="33"
          stroke="url(#safaLogoGradient)"
          strokeWidth="3"
          strokeDasharray="18 6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Mid Optical Orbit */}
        <circle
          cx="50"
          cy="50"
          r="23"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.75"
          strokeDasharray="4 4"
        />

        {/* Precision Crosshair Ticks */}
        <line x1="50" y1="12" x2="50" y2="20" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="80" x2="50" y2="88" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="50" x2="20" y2="50" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="80" y1="50" x2="88" y2="50" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Diagonal Neural Bridge Beams */}
        <circle cx="28" cy="28" r="2.5" fill="#5EEAD4" />
        <circle cx="72" cy="28" r="2.5" fill="#38BDF8" />
        <circle cx="28" cy="72" r="2.5" fill="#38BDF8" />
        <circle cx="72" cy="72" r="2.5" fill="#5EEAD4" />

        {/* Core Focal Serenity Iris (صفاء) */}
        <circle
          cx="50"
          cy="50"
          r="12.5"
          fill="url(#safaCoreGrad)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* Ultra-pure Radiant Center Diamond Point */}
        <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export type GameIconType =
  | 'sart'
  | 'chess'
  | 'nback'
  | 'stroop'
  | 'corsi'
  | 'flanker'
  | 'tol'
  | 'taskswitch'
  | 'posner'
  | 'reading'
  | 'challenge'
  | 'science'
  | 'progress';

interface ProgramLogoProps {
  type: GameIconType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProgramLogo: React.FC<ProgramLogoProps> = ({
  type,
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dim = sizeMap[size] || sizeMap.md;

  const renderIconContent = () => {
    switch (type) {
      case 'chess':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 32h12v2H14v-2zm-2 4h16v1.5H12V36zm9-28c-3 0-5 2.5-5 5.5 0 2 .8 3.8 2 4.8V22c-1.5.5-3 2-3 4v4h10v-4c0-2-1.5-3.5-3-4v-3.7c1.2-1 2-2.8 2-4.8 0-3-2-5.5-5-5.5z"
              fill="currentColor"
            />
            <path
              d="M17 11.5c-1-1-3-1.5-4 0-.8 1.2-.5 3 .5 4 1.5 1.5 3.5 2.5 5 2.5v-3c-1 0-2.5-.5-3.5-1.5z"
              fill="currentColor"
              opacity="0.85"
            />
            <circle cx="20" cy="8.5" r="1.5" fill="#FFFFFF" />
            <circle cx="28" cy="14" r="2" fill="#818CF8" />
            <line x1="24" y1="16" x2="28" y2="14" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="1 1" />
          </svg>
        );

      case 'nback':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Dual memory depth planes */}
            <rect x="7" y="13" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="3 2" />
            <rect x="15" y="7" width="18" height="18" rx="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.2" />
            <text x="24" y="20" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">
              N
            </text>
            <path d="M11 20l4-4m-4 4l4 4" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'stroop':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Chromatic Conflict Prism */}
            <circle cx="16" cy="18" r="9" fill="#F43F5E" fillOpacity="0.75" />
            <circle cx="24" cy="22" r="9" fill="#38BDF8" fillOpacity="0.75" />
            <circle cx="20" cy="20" r="5" fill="#FBBF24" fillOpacity="0.9" />
            <path d="M20 7v5m0 16v5M7 20h5m16 0h5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        );

      case 'corsi':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* 3x3 Visuospatial constellation with active pathway */}
            <rect x="8" y="8" width="6" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
            <rect x="26" y="7" width="7" height="7" rx="2" fill="#38BDF8" />
            <rect x="10" y="24" width="7" height="7" rx="2" fill="#38BDF8" />
            <rect x="25" y="25" width="6" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
            <rect x="17" y="16" width="7" height="7" rx="2" fill="#5EEAD4" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Sequence line */}
            <path d="M29 11l-9 7l-7 8" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
          </svg>
        );

      case 'flanker':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Flanker Tri-Arrows */}
            <path d="M10 20h-4m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <path d="M30 20h4m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <circle cx="20" cy="20" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
            <path d="M22 16l-4 4l4 4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'tol':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Tower of London 3 Pegs & Discs */}
            <line x1="6" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* 3 Rods */}
            <line x1="12" y1="12" x2="12" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="18" x2="20" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="24" x2="28" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* Balls */}
            <circle cx="12" cy="29" r="3.5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="12" cy="22" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="12" cy="15" r="3.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="20" cy="29" r="3.5" fill="#F59E0B" opacity="0.7" />
          </svg>
        );

      case 'taskswitch':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Dual Orbital Cognitive Track Switch */}
            <path d="M10 14h12c4 0 7 3 7 7s-3 7-7 7H10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M30 26H18c-4 0-7-3-7-7s3-7 7-7h12" stroke="#A855F7" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 2" />
            <circle cx="10" cy="14" r="4" fill="#C084FC" />
            <polygon points="30,22 35,26 30,30" fill="#A855F7" />
            <polygon points="10,10 5,14 10,18" fill="currentColor" />
          </svg>
        );

      case 'posner':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Central Fixation Cross & Peripheral Spatial Radar Spotlight */}
            <line x1="20" y1="16" x2="20" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* Left & Right Target Windows */}
            <rect x="6" y="15" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
            <rect x="26" y="15" width="8" height="10" rx="2" fill="#06B6D4" fillOpacity="0.3" stroke="#22D3EE" strokeWidth="2" />
            <circle cx="30" cy="20" r="2.5" fill="#FFFFFF" />
            {/* Cue Arrow */}
            <path d="M19 20l4-2v4l-4-2z" fill="#22D3EE" />
          </svg>
        );

      case 'sart':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Sustained Attention Target */}
            <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
            <circle cx="20" cy="20" r="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="3.5" fill="#2DD4BF" />
            <line x1="20" y1="3" x2="20" y2="8" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="32" x2="20" y2="37" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="20" x2="8" y2="20" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="20" x2="37" y2="20" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'reading':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Rapid Serial Visual Presentation Guide */}
            <rect x="6" y="12" width="28" height="16" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" />
            <line x1="20" y1="8" x2="20" y2="12" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="28" x2="20" y2="32" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="20" x2="29" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="20" r="3" fill="#2DD4BF" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
        );

      case 'challenge':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* 14-Day Neuroplasticity Progression Shield */}
            <path
              d="M20 6l11 4v9c0 7-5 13-11 15c-6-2-11-8-11-15v-9l11-4z"
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M15 19l4 4l7-7" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'science':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Neural Synapse / Atom */}
            <ellipse cx="20" cy="20" rx="14" ry="6" stroke="currentColor" strokeWidth="1.8" transform="rotate(-30 20 20)" strokeOpacity="0.7" />
            <ellipse cx="20" cy="20" rx="14" ry="6" stroke="currentColor" strokeWidth="1.8" transform="rotate(30 20 20)" strokeOpacity="0.7" />
            <circle cx="20" cy="20" r="4.5" fill="#2DD4BF" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
        );

      case 'progress':
        return (
          <svg viewBox="0 0 40 40" fill="none" className={dim} xmlns="http://www.w3.org/2000/svg">
            {/* Multi-metric radar / curve */}
            <path d="M8 30h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 26l7-8l6 4l10-12" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="15" cy="18" r="2.5" fill="#FFFFFF" />
            <circle cx="21" cy="22" r="2.5" fill="#FFFFFF" />
            <circle cx="31" cy="10" r="3" fill="#2DD4BF" stroke="#FFFFFF" strokeWidth="1.2" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      {renderIconContent()}
    </div>
  );
};
