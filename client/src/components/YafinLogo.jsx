import React from 'react';

export default function YafinLogo({ className = "h-10 w-10", withText = false, textClassName = "text-xl" }) {
  return (
    <div className="inline-flex items-center space-x-2.5">
      {/* SVG Icon Emblem */}
      <div className={`relative flex-shrink-0 ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Emerald to Teal Core Gradient */}
            <linearGradient id="yafinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>

            {/* Sapphire Blue Accent Gradient */}
            <linearGradient id="yafinAccent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            <linearGradient id="yafinBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="100%" stopColor="#022C22" />
            </linearGradient>
          </defs>

          {/* Rounded Squircle Container */}
          <rect width="100" height="100" rx="26" fill="url(#yafinGrad)" />

          {/* Subtle Inner Highlight Border */}
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="23"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="2"
          />

          {/* Stylized Interlocking "Y" with Growth Ascender */}
          {/* Left Wing of Y */}
          <path
            d="M26 28 L45 52 L45 74 C45 76.2 46.8 78 49 78 C51.2 78 53 76.2 53 74 L53 52 L72 28 C73.5 26.2 72.8 24 70.5 24 L60 24 C58.5 24 57.2 24.8 56.5 26.2 L49 39 L41.5 26.2 C40.8 24.8 39.5 24 38 24 L27.5 24 C25.2 24 24.5 26.2 26 28 Z"
            fill="white"
          />

          {/* Dynamic Financial Growth Arrow traversing across the Y stem */}
          <path
            d="M48 68 L68 44 M68 44 L55 44 M68 44 L68 57"
            stroke="#FEF08A"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upward Apex Dot */}
          <circle cx="73" cy="22" r="4.5" fill="#FEF08A" />
        </svg>
      </div>

      {/* Brand Text if requested */}
      {withText && (
        <div>
          <div className={`font-black tracking-tight text-slate-900 leading-none ${textClassName}`}>
            YA<span className="text-emerald-600">FIN</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-0.5">
            Finance & Ledger
          </span>
        </div>
      )}
    </div>
  );
}
