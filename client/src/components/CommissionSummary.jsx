/**
 * CommissionSummary — Hiển thị tóm tắt hoa hồng
 * Dùng ở: CustomOrderDetail (sau khi chọn thợ) + AdminDashboard
 *
 * Props:
 *   agreedPrice      — Giá thỏa thuận
 *   commissionRate   — Tỷ lệ % hoa hồng
 *   commissionAmount — Tiền shop thu
 *   makerEarning     — Tiền thợ nhận
 *   compact          — Hiển thị dạng nhỏ gọn (dùng trong list)
 */

import React from 'react';
import { COMMISSION } from '../constants/business';

const CommissionSummary = ({
  agreedPrice,
  commissionRate,
  commissionAmount,
  makerEarning,
  compact = false,
}) => {
  if (!agreedPrice) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>💰 {COMMISSION.format(agreedPrice)}</span>
        <span className="text-gray-300">|</span>
        <span className="text-green-600">Thợ nhận: {COMMISSION.format(makerEarning)}</span>
        <span className="text-gray-300">|</span>
        <span className="text-pink-500">Shop: {COMMISSION.format(commissionAmount)} ({commissionRate}%)</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
        Chi tiết tài chính đơn
      </p>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Giá thỏa thuận</span>
        <span className="font-bold text-gray-900">{COMMISSION.format(agreedPrice)}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Phí kết nối ({commissionRate}%)
          <span className="text-[10px] text-gray-400 block">Shop thu để duy trì sàn</span>
        </span>
        <span className="font-bold text-pink-500">- {COMMISSION.format(commissionAmount)}</span>
      </div>

      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
        <span className="text-sm font-bold text-gray-700">Thợ thực nhận</span>
        <span className="font-black text-green-600 text-lg">{COMMISSION.format(makerEarning)}</span>
      </div>
    </div>
  );
};

export default CommissionSummary;
