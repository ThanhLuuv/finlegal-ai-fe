'use client';

import React from 'react';

interface SecurityGateProps {
  isTurnstilePassed: boolean;
  onTurnstileSuccess: (token: string) => void;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({ isTurnstilePassed }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-slate-700">
          {isTurnstilePassed ? 'Xác thực thành công! Đang chuyển tiếp...' : 'Vui lòng xác thực để tiếp tục'}
        </p>

        {/* Cloudflare Turnstile Light Theme Widget */}
        <div 
          className="cf-turnstile" 
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAENuyoUuTRh2b7uR'} 
          data-callback="onTurnstileSuccess"
          data-expired-callback="onTurnstileExpired"
          data-error-callback="onTurnstileError"
          data-theme="light"
        ></div>
      </div>
    </div>
  );
};
