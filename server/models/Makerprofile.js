const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MakerProfile = sequelize.define(
  "MakerProfile",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

    bio: { type: DataTypes.TEXT, allowNull: true },
    skills: { type: DataTypes.STRING, allowNull: true }, // CSV: "đan,thêu,may"

    portfolio: {
      type: DataTypes.JSONB,
      defaultValue: [],
      get() {
        const val = this.getDataValue("portfolio");
        return Array.isArray(val) ? val : [];
      },
    },

    status: {
      type: DataTypes.ENUM("cho_duyet", "da_duyet", "tu_choi"),
      defaultValue: "cho_duyet",
    },

    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalDone: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true },
);

module.exports = MakerProfile;
