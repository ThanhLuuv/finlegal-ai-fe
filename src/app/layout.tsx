import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'LexiFin AI - Trợ Lý AI Pháp Lý & Kiểm Toán Tài Chính Doanh Nghiệp',
  description: 'Tra cứu hợp đồng, số liệu doanh thu và kiểm toán rủi ro tự động',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <Script 
          src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
          strategy="afterInteractive" 
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 min-h-screen selection:bg-[#0f172a] selection:text-white">
        {children}
      </body>
    </html>
  );
}
