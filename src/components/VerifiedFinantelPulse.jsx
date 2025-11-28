// =====================================================
// VERIFIED FINANTEL PULSE BADGE
// =====================================================
// Badge de verificado con pulso animado estilo "Prestige Mode"
// =====================================================

import React from 'react';

export function VerifiedFinantelPulse() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulso */}
      <div
        className="
          absolute 
          w-[16px] 
          h-[16px] 
          rounded-full
          bg-[#4DA3FF]
          opacity-40
          animate-ping
        "
      ></div>
      {/* Badge principal */}
      <div
        className="
          w-[16px]
          h-[16px]
          rounded-full
          bg-[#4DA3FF]
          shadow-[0_0_10px_rgba(77,163,255,0.8)]
          flex
          items-center
          justify-center
          relative
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[10px] h-[10px]"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

export default VerifiedFinantelPulse;

