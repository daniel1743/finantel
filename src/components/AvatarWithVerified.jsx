// =====================================================
// AVATAR WITH VERIFIED BADGE
// =====================================================
// Avatar con badge verificado posicionado (Shimmer Premium)
// =====================================================

import React from 'react';
import { VerifiedFinantelPulse } from './VerifiedFinantelPulse';

export function AvatarWithVerified({ logo = '/finantel-logo.png', fallback = 'F' }) {
  return (
    <div className="relative inline-block">
      {/* Avatar con logo de Finantel */}
      <div className="w-[42px] h-[42px] rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-[#1C8FA0] flex items-center justify-center overflow-hidden shadow-sm">
        <img
          src={logo}
          alt="Finantel"
          className="w-full h-full object-contain p-1.5"
          onError={(e) => {
            // Fallback si no se encuentra el logo - mostrar inicial
            const parent = e.target.parentElement;
            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-[#1C8FA0] text-white text-sm font-bold">${fallback}</div>`;
          }}
        />
      </div>

      {/* Badge verificado con pulso animado posicionado */}
      <div className="absolute bottom-[-2px] right-[-2px]">
        <VerifiedFinantelPulse />
      </div>
    </div>
  );
}

export default AvatarWithVerified;

