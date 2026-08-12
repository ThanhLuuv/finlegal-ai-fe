import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinLegal AI - Enterprise Serverless Edge Multi-Agent Assistant',
  description: 'Enterprise RAG PDF & Cloudflare D1 Text-to-SQL Audit Assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
