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

    category: {
      type: DataTypes.ENUM(
        "theu",
        "dan_len",
        "go",
        "gom",
        "da",
        "vai",
        "trang_suc",
        "ve_tranh",
        "giay_dep",
        "khac"
      ),
      allowNull: true,
    },

    yearsExp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 50 },
    },

    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    priceFrom: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    priceTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    portfolio: {
      type: DataTypes.JSONB,
      defaultValue: [],
      get() {
        const val = this.getDataValue("portfolio");
        return Array.isArray(val) ? val : [];
      },
    },

    idCardFront: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    idCardBack: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bankInfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("cho_duyet", "da_duyet", "tu_choi", "can_bo_sung"),
      defaultValue: "cho_duyet",
    },

    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    rejectReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    banReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalDone: { type: DataTypes.INTEGER, defaultValue: 0 },

    badge: {
      type: DataTypes.STRING,
      defaultValue: "Thợ Mới",
    },

    badgeEmoji: {
      type: DataTypes.STRING,
      defaultValue: "🌱",
    },

    commissionRate: {
      type: DataTypes.FLOAT,
      defaultValue: COMMISSION.DEFAULT_RATE,
      validate: {
        min: COMMISSION.MIN_RATE,
        max: COMMISSION.MAX_RATE,
      },
    },

    totalEarning: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["status"] }, { fields: ["userId"] }],
  }
);

MakerProfile.prototype.recalculateBadge = async function () {
  const tier = MAKER_BADGE.calculate(this.totalDone, this.rating);
  this.badge = tier.label;
  this.badgeEmoji = tier.emoji;
  await this.save();
};

module.exports = MakerProfile;
