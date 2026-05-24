/**
 * Business constants
 * Dùng để hiển thị thông tin commission, badge đúng với backend
 */

export const COMMISSION = {
  DEFAULT_RATE: 10,

  /** Tính tiền để hiển thị preview trước khi submit */
  calculate(agreedPrice, rate = 10) {
    const commissionAmount = Math.round((agreedPrice * rate) / 100);
    return {
      commissionAmount,
      shopEarning: commissionAmount,
      makerEarning: agreedPrice - commissionAmount,
    };
  },

  format(amount) {
    return amount?.toLocaleString("vi-VN") + "đ";
  },
};

export const ORDER_STATUS = {
  FINDING: "Đang tìm thợ",
  SELECTED: "Đã chọn thợ",
  IN_PROGRESS: "Đang thực hiện",
  WAITING: "Chờ xác nhận",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const BADGE_COLOR = {
  "Thợ Vàng": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Thợ Bạc": "bg-gray-100   text-gray-600   border-gray-300",
  "Thợ Đồng": "bg-orange-100 text-orange-700 border-orange-300",
  "Thợ Mới": "bg-green-50   text-green-600  border-green-200",
};
