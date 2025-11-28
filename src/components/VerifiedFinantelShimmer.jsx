// =====================================================
// VERIFIED FINANTEL SHIMMER BADGE
// =====================================================
// Badge estilo Twitter/X con estrella y efecto shimmer premium
// =====================================================

import React from 'react';

export function VerifiedFinantelShimmer() {
  return (
    <div className="relative w-[18px] h-[18px]">
        {/* ⭐ Estrella tipo Twitter con degradado Finantel */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-full h-full drop-shadow-[0_0_4px_rgba(77,163,255,0.5)]"
        >
          <defs>
            <linearGradient id="finantelGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4DA3FF" />
              <stop offset="100%" stopColor="#6D59FF" />
            </linearGradient>
          </defs>

          <path
            d="M12 2l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1L3.2 8.4l6.1-.9L12 2z"
            fill="url(#finantelGrad)"
            stroke="white"
            strokeWidth="1.2"
          />
        </svg>

        {/* ✨ Shimmer Animado */}
        <div
          className="
            absolute 
            inset-0 
            rounded-full
            overflow-hidden
            pointer-events-none
          "
        >
          <div
            className="
              absolute
              w-[40%]
              h-full
              -left-full
              top-0
              bg-white/40
              opacity-0
              -skew-x-[25deg]
            "
            style={{
              animation: 'shimmer-finantel 2.2s infinite'
            }}
          ></div>
        </div>
    </div>
  );
}

export default VerifiedFinantelShimmer;

