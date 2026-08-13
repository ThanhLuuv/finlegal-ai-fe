'use client';

import React from 'react';
import { AuditReport } from '../types';
import { ShieldAlert, ShieldCheck, FileText, Database, ArrowRightLeft, TrendingDown } from 'lucide-react';

interface AuditCardProps {
  report: AuditReport;
}

export const AuditCard: React.FC<AuditCardProps> = ({ report }) => {
  if (!report) return null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          label: 'CẢNH BÁO SAI LỆCH CAO',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: ShieldAlert
        };
      case 'MEDIUM':
        return {
          label: 'SAI LỆCH TRUNG BÌNH',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: ShieldAlert
        };
      case 'LOW':
        return {
          label: 'SAI LỆCH THẤP',
          bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          icon: ShieldAlert
        };
      default:
        return {
          label: 'ĐỐI SOÁT KHỚP HOÀN TOÀN',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: ShieldCheck
        };
    }
  };

  const badge = getRiskBadge(report.riskLevel);
  const BadgeIcon = badge.icon;

  return (
    <div className={`my-4 rounded-xl border p-4 transition-all shadow-2xs ${badge.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <BadgeIcon className="w-4 h-4" />
          <span className="font-bold text-xs uppercase tracking-wide">{badge.label}</span>
        </div>
        {report.variancePercentage !== undefined && report.variancePercentage !== null && (
          <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-semibold shadow-2xs">
            <TrendingDown className="w-3 h-3 text-rose-600" />
            <span>Chênh lệch: {report.variancePercentage.toFixed(1)}% ({report.varianceUsd ? `$${report.varianceUsd.toLocaleString()}` : ''})</span>
          </span>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* PDF Contract Claim */}
        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1.5 text-blue-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Nội dung quy định trong Hợp đồng</span>
          </div>
          <p className="text-slate-800 text-xs leading-relaxed">
            {report.pdfClaim || 'Không tìm thấy thông tin trong PDF.'}
          </p>
        </div>

        {/* Database System Record */}
        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1.5 text-emerald-700 text-xs font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>Số liệu ghi nhận trong Hệ thống</span>
          </div>
          <p className="text-slate-800 text-xs leading-relaxed">
            {report.dbRecord || 'Không có bản ghi tương ứng trong hệ thống.'}
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 mb-1 text-slate-500 text-[11px] font-semibold">
          <ArrowRightLeft className="w-3 h-3" />
          <span>Tổng hợp Phân tích Đối soát</span>
        </div>
        <p className="text-slate-800 text-xs leading-relaxed">
          {report.explanation}
        </p>
      </div>
    </div>
  );
};
