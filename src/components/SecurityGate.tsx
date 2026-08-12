'use client';

import React, { useEffect, useRef } from 'react';

interface SecurityGateProps {
  isTurnstilePassed: boolean;
  onTurnstileSuccess: (token: string) => void;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({ isTurnstilePassed }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const renderWidget = () => {
      if (containerRef.current && (window as any).turnstile) {
        try {
          if (widgetIdRef.current) {
            (window as any).turnstile.remove(widgetIdRef.current);
          }
          widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAENuyoUuTRh2b7uR',
            theme: 'light',
            callback: (token: string) => {
              if (typeof (window as any).onTurnstileSuccess === 'function') {
                (window as any).onTurnstileSuccess(token);
              }
            },
            'expired-callback': () => {
              if (typeof (window as any).onTurnstileExpired === 'function') {
                (window as any).onTurnstileExpired();
              }
            },
            'error-callback': () => {
              if (typeof (window as any).onTurnstileError === 'function') {
                (window as any).onTurnstileError();
              }
            }
          });
        } catch {
          // ignore double render warnings
        }
      }
    };

    renderWidget();
    timer = setTimeout(renderWidget, 400);

    return () => {
      clearTimeout(timer);
      if (widgetIdRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-slate-700">
          {isTurnstilePassed ? 'Xác thực thành công! Đang chuyển tiếp...' : 'Vui lòng xác thực để tiếp tục'}
        </p>

        {/* Cloudflare Turnstile Clean Container */}
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
      </div>
    </div>
  );
};
