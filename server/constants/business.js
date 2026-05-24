const COMMISSION = {
  /** Tỷ lệ hoa hồng mặc định khi thợ mới đăng ký (%) */
  DEFAULT_RATE: 10,

  /** Tỷ lệ tối thiểu có thể set cho thợ (%) */
  MIN_RATE: 5,

  /** Tỷ lệ tối đa có thể set cho thợ (%) */
  MAX_RATE: 20,

  /**
   * Tính tiền hoa hồng shop thu
   * @param {number} agreedPrice - Giá thợ và khách thỏa thuận
   * @param {number} rate - Tỷ lệ % của thợ đó
   * @returns {{ commissionAmount: number, shopEarning: number, makerEarning: number }}
   */
  calculate(agreedPrice, rate) {
    const commissionAmount = Math.round((agreedPrice * rate) / 100);
    return {
      commissionAmount,
      shopEarning: commissionAmount,
      makerEarning: agreedPrice - commissionAmount,
    };
  },
};

const MAKER_BADGE = {
  /**
   * Tính huy hiệu dựa trên số đơn hoàn thành và rating
   * Thêm tier mới ở đây khi cần, không cần sửa chỗ khác
   */
  TIERS: [
    { label: "Thợ Vàng", emoji: "🥇", minDone: 50, minRating: 4.8 },
    { label: "Thợ Bạc", emoji: "🥈", minDone: 20, minRating: 4.5 },
    { label: "Thợ Đồng", emoji: "🥉", minDone: 5, minRating: 0 },
    { label: "Thợ Mới", emoji: "🌱", minDone: 0, minRating: 0 },
  ],

  calculate(totalDone, rating) {
    return (
      this.TIERS.find((t) => totalDone >= t.minDone && rating >= t.minRating) ||
      this.TIERS[this.TIERS.length - 1]
    );
  },
};

const ORDER_STATUS = {
  FINDING: "Đang tìm thợ",
  SELECTED: "Đã chọn thợ",
  IN_PROGRESS: "Đang thực hiện",
  WAITING: "Chờ xác nhận",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

module.exports = { COMMISSION, MAKER_BADGE, ORDER_STATUS };
