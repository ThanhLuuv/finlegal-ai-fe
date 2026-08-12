'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface SecurityGateProps {
  isTurnstilePassed: boolean;
  onTurnstileSuccess: (token: string) => void;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({ isTurnstilePassed }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-slate-900 p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Accent Pattern */}
      <div className="absolute inset-0 bg-radial from-blue-100/40 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center space-y-6 relative z-10">
        {/* Logo & Security Icon Badge */}
        <div className="relative">
          <img 
            src="/logo.png" 
            alt="FinLegal AI Logo" 
            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#0B1727] text-white shadow-xs">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-[#0B1727] tracking-tight">FinLegal AI Security Gate</h1>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Vui lòng hoàn thành xác thực **Cloudflare Turnstile** bên dưới để truy cập hệ thống.
          </p>
        </div>

        {/* Cloudflare Turnstile Light Theme Widget */}
        <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-center shadow-inner min-h-[75px] items-center">
          <div 
            className="cf-turnstile" 
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAENuyoUuTRh2b7uR'} 
            data-callback="onTurnstileSuccess"
            data-expired-callback="onTurnstileExpired"
            data-error-callback="onTurnstileError"
            data-theme="light"
          ></div>
        </div>

        {/* Auto Pass Status Indicator */}
        <div className="w-full space-y-3">
          {isTurnstilePassed ? (
            <div className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 animate-pulse">
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Xác thực thành công! Đang chuyển vào hệ thống...</span>
            </div>
          ) : (
            <button
              disabled={true}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 opacity-75 cursor-not-allowed text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              <span>Vui lòng tích chọn xác thực ở ô trên</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-4 w-full justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bảo vệ an ninh bởi Cloudflare</span>
        </div>
      </div>
    </div>
  );
};
