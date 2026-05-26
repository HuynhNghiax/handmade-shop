const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { COMMISSION, MAKER_BADGE } = require("../constants/business");

const MakerProfile = sequelize.define(
  "MakerProfile",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    skills: { type: DataTypes.STRING, allowNull: true },

    portfolio: {
      type: DataTypes.JSONB,
      defaultValue: [],
      get() {
        const val = this.getDataValue("portfolio");
        return Array.isArray(val) ? val : [];
      },
    },

    //  THÔNG TIN NGÂN HÀNG (để admin chuyển tiền)
    bankInfo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "Số tài khoản NH - Tên ngân hàng - Tên chủ TK. VD: 12345678 - Vietcombank - Nguyen Van A",
    },

    status: {
      type: DataTypes.ENUM("cho_duyet", "da_duyet", "tu_choi"),
      defaultValue: "cho_duyet",
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Admin khóa thợ vi phạm — true thì không được báo giá",
    },
    banReason: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Lý do khóa để thợ biết",
    },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalDone: { type: DataTypes.INTEGER, defaultValue: 0 },
    badge: {
      type: DataTypes.STRING,
      defaultValue: "Thợ Mới",
      comment:
        "Cache huy hiệu — tính lại mỗi khi totalDone hoặc rating thay đổi",
    },
    badgeEmoji: {
      type: DataTypes.STRING,
      defaultValue: "🌱",
    },
    commissionRate: {
      type: DataTypes.FLOAT,
      defaultValue: COMMISSION.DEFAULT_RATE,
      comment: `Tỷ lệ % shop thu. Default = ${COMMISSION.DEFAULT_RATE}%. Admin có thể chỉnh.`,
      validate: {
        min: COMMISSION.MIN_RATE,
        max: COMMISSION.MAX_RATE,
      },
    },
    totalEarning: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment:
        "Tổng tiền thợ đã nhận từ tất cả đơn hoàn thành (makerEarning cộng dồn)",
    },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["status"] }, { fields: ["userId"] }],
  },
);

MakerProfile.prototype.recalculateBadge = async function () {
  const tier = MAKER_BADGE.calculate(this.totalDone, this.rating);
  this.badge = tier.label;
  this.badgeEmoji = tier.emoji;
  await this.save();
};

module.exports = MakerProfile;
