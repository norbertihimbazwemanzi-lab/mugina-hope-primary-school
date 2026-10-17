import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform`}>
        {/* SVG Recreation of Muginahope School Crest Emblem */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Laurel Green */}
            <linearGradient id="laurelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            {/* Sun Gold */}
            <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            {/* Deep Navy */}
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f2b5c" />
              <stop offset="100%" stopColor="#091834" />
            </linearGradient>
            {/* Gold Ribbon border */}
            <linearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Left Laurel Wreath Leaves */}
          <g fill="url(#laurelGrad)">
            <path d="M 45 130 C 35 150 40 180 65 190 C 70 170 65 145 45 130 Z" />
            <path d="M 40 170 C 25 190 30 220 58 230 C 65 210 60 185 40 170 Z" />
            <path d="M 42 210 C 25 230 35 260 62 268 C 70 248 65 225 42 210 Z" />
            <path d="M 52 250 C 40 270 52 295 78 300 C 84 280 76 260 52 250 Z" />
            <path d="M 68 285 C 60 305 75 325 102 325 C 105 305 92 290 68 285 Z" />
          </g>

          {/* Right Laurel Wreath Leaves */}
          <g fill="url(#laurelGrad)">
            <path d="M 355 130 C 365 150 360 180 335 190 C 330 170 335 145 355 130 Z" />
            <path d="M 360 170 C 375 190 370 220 342 230 C 335 210 340 185 360 170 Z" />
            <path d="M 358 210 C 375 230 365 260 338 268 C 330 248 335 225 358 210 Z" />
            <path d="M 348 250 C 360 270 348 295 322 300 C 316 280 324 260 348 250 Z" />
            <path d="M 332 285 C 340 305 325 325 298 325 C 295 305 308 290 332 285 Z" />
          </g>

          {/* Main Shield Outline & Background */}
          <path
            d="M 200 40 L 320 65 C 320 180 310 280 200 375 C 90 280 80 180 80 65 Z"
            fill="url(#shieldGrad)"
            stroke="#ffffff"
            strokeWidth="10"
          />
          <path
            d="M 200 52 L 310 74 C 310 175 300 270 200 360 C 100 270 90 175 90 74 Z"
            fill="none"
            stroke="#facc15"
            strokeWidth="3.5"
          />

          {/* Top Half-Circle Sun & Radiating Sun Rays */}
          <g>
            {/* Sun Body */}
            <circle cx="200" cy="155" r="55" fill="url(#sunGrad)" />

            {/* Sun Rays */}
            <polygon points="200,65 194,95 206,95" fill="url(#sunGrad)" />
            <polygon points="170,75 170,105 181,100" fill="url(#sunGrad)" />
            <polygon points="230,75 219,100 230,105" fill="url(#sunGrad)" />
            <polygon points="145,95 152,120 162,112" fill="url(#sunGrad)" />
            <polygon points="255,95 238,112 248,120" fill="url(#sunGrad)" />
            <polygon points="130,125 142,142 150,132" fill="url(#sunGrad)" />
            <polygon points="270,125 250,132 258,142" fill="url(#sunGrad)" />
          </g>

          {/* Open Book Graphics */}
          <g>
            {/* Book Base (White Pages) */}
            <path
              d="M 200 195 Q 150 165 105 175 L 105 235 Q 150 220 200 248 Q 250 220 295 235 L 295 175 Q 250 165 200 195 Z"
              fill="#ffffff"
              stroke="#0f2b5c"
              strokeWidth="4"
            />
            {/* Book Inner Page Curves */}
            <path d="M 115 185 Q 155 175 190 200 L 190 235 Q 155 210 115 222 Z" fill="#0f2b5c" opacity="0.1" />
            <path d="M 285 185 Q 245 175 210 200 L 210 235 Q 245 210 285 222 Z" fill="#0f2b5c" opacity="0.1" />
          </g>

          {/* Center Vertical Pencil */}
          <g>
            {/* Pencil Shaft */}
            <rect x="193" y="135" width="14" height="65" fill="#0f2b5c" stroke="#ffffff" strokeWidth="2" />
            <line x1="200" y1="135" x2="200" y2="200" stroke="#facc15" strokeWidth="2.5" />
            {/* Pencil Sharpened Cone */}
            <polygon points="193,135 207,135 200,105" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
            {/* Lead Tip */}
            <polygon points="197,117 203,117 200,105" fill="#0f2b5c" />
          </g>

          {/* Central Main Ribbon (Navy with Gold borders) */}
          <g>
            <path
              d="M 25 250 L 375 250 L 390 295 L 360 285 L 340 315 L 340 295 L 60 295 L 60 315 L 40 285 L 10 295 Z"
              fill="#0f2b5c"
              stroke="url(#goldBorder)"
              strokeWidth="5"
            />

            {/* School Name on Ribbon */}
            <text
              x="200"
              y="256"
              fill="#ffffff"
              fontSize="28"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              letterSpacing="2"
            >
              MUGINAPHOPE
            </text>

            <text
              x="200"
              y="282"
              fill="#facc15"
              fontSize="14"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              letterSpacing="1"
            >
              PRIMARY AND NURSERY SCHOOL
            </text>
          </g>

          {/* Lower Motto Plaque: "We learn for our better future" */}
          <g>
            <path
              d="M 95 305 Q 200 325 305 305 Q 200 355 95 305 Z"
              fill="#ffffff"
              stroke="#facc15"
              strokeWidth="2.5"
            />
            <text
              x="200"
              y="323"
              fill="#0f2b5c"
              fontSize="14"
              fontStyle="italic"
              fontWeight="700"
              fontFamily="Georgia, serif"
              textAnchor="middle"
            >
              We learn for our
            </text>
            <text
              x="200"
              y="341"
              fill="#0f2b5c"
              fontSize="16"
              fontStyle="italic"
              fontWeight="800"
              fontFamily="Georgia, serif"
              textAnchor="middle"
            >
              better future
            </text>
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display">
            Mugina Hope Academy
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Primary & Nursery · Kamonyi
          </span>
        </div>
      )}
    </div>
  );
};
