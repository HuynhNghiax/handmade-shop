/**
 * MakerBadge — Hiển thị huy hiệu của thợ
 * Dùng ở: MakerList, MakerProfile, CustomOrderDetail (danh sách bid)
 *
 * Props:
 *   badge      — string: 'Thợ Vàng' | 'Thợ Bạc' | 'Thợ Đồng' | 'Thợ Mới'
 *   badgeEmoji — string: '🥇' | '🥈' | '🥉' | '🌱'
 *   size       — 'sm' | 'md' (default: 'sm')
 */

import React from 'react';
import { BADGE_COLOR } from '../constants/business';

const MakerBadge = ({ badge, badgeEmoji, size = 'sm' }) => {
  if (!badge) return null;

  const colorClass = BADGE_COLOR[badge] || 'bg-gray-100 text-gray-500 border-gray-200';
  const sizeClass = size === 'md'
    ? 'text-xs px-3 py-1.5'
    : 'text-[9px] px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-black rounded-full border ${colorClass} ${sizeClass}`}>
      {badgeEmoji} {badge}
    </span>
  );
};

export default MakerBadge;
