const router = require("express").Router();
const { Op } = require("sequelize");
const User = require("../models/User");
const MakerProfile = require("../models/MakerProfile");
const Review = require("../models/Review");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const mailer = require("../utils/mailer");

const recalculateMakerRating = async (makerId) => {
  const reviews = await Review.findAll({ where: { makerId } });
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await MakerProfile.update(
    { rating: Math.round(avg * 10) / 10 },
    { where: { id: makerId } },
  );
};

//  PUBLIC: DANH SÁCH THỢ
router.get("/", async (req, res) => {
  try {
    const { skills, sort } = req.query;
    const where = { status: "da_duyet" };
    if (skills) where.skills = { [Op.iLike]: `%${skills}%` };

    const order = [];
    if (sort === "rating") order.push(["rating", "DESC"]);
    if (sort === "totalDone") order.push(["totalDone", "DESC"]);

    const makers = await MakerProfile.findAll({
      where,
      order: order.length ? order : [["rating", "DESC"]],
      include: [
        { model: User, as: "User", attributes: ["name", "avatar", "id"] },
      ],
    });
    res.json(makers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách thợ", error: err.message });
  }
});

//  PROTECTED: XEM HỒ SƠ CỦA CHÍNH MÌNH
//  PHẢI ĐẶT TRƯỚC GET /:id — nếu không "my-profile" sẽ bị /:id chặn mất
router.get("/my-profile", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: "User", attributes: ["name", "avatar"] }],
    });
    if (!profile) return res.status(404).json({ message: "Chưa có hồ sơ thợ" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy hồ sơ", error: err.message });
  }
});

//  PUBLIC: HỒ SƠ THỢ THEO ID
router.get("/:id", async (req, res) => {
  try {
    const maker = await MakerProfile.findByPk(req.params.id, {
      include: [
        { model: User, as: "User", attributes: ["name", "avatar", "id"] },
        {
          model: Review,
          as: "Reviews",
          limit: 10,
          order: [["createdAt", "DESC"]],
          include: [
            { model: User, as: "Reviewer", attributes: ["name", "avatar"] },
          ],
        },
      ],
    });
    if (!maker)
      return res.status(404).json({ message: "Không tìm thấy hồ sơ thợ" });
    res.json(maker);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy hồ sơ thợ", error: err.message });
  }
});

//  PROTECTED: ĐĂNG KÝ LÀM THỢ
router.post("/register", verifyToken, async (req, res) => {
  try {
    const existing = await MakerProfile.findOne({
      where: { userId: req.user.id },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Bạn đã có hồ sơ thợ rồi!", profile: existing });
    }

    const { bio, skills, portfolio } = req.body;
    const profile = await MakerProfile.create({
      userId: req.user.id,
      bio,
      skills,
      portfolio: portfolio || [],
      status: "cho_duyet",
    });
    await User.update({ isMaker: true }, { where: { id: req.user.id } });

    res.status(201).json({
      message: "Đăng ký thành công! Hồ sơ đang chờ Admin duyệt.",
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi đăng ký", error: err.message });
  }
});

//  PROTECTED: CẬP NHẬT HỒ SƠ
router.put("/my-profile", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({
      where: { userId: req.user.id },
    });
    if (!profile)
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    const { bio, skills, portfolio } = req.body;
    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills;
    if (portfolio !== undefined) profile.portfolio = portfolio;

    await profile.save();
    res.json({ message: "Cập nhật hồ sơ thành công", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

//  ADMIN: HỒ SƠ CHỜ DUYỆT
router.get("/admin/pending", verifyAdmin, async (req, res) => {
  try {
    const pending = await MakerProfile.findAll({
      where: { status: "cho_duyet" },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "email", "avatar", "phone", "createdAt"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
});

//  ADMIN: TẤT CẢ THỢ
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const all = await MakerProfile.findAll({
      include: [
        { model: User, as: "User", attributes: ["name", "email", "avatar"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
});

//  ADMIN: DUYỆT HỒ SƠ
router.put("/admin/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const profile = await MakerProfile.findByPk(req.params.id);
    if (!profile)
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    profile.status = "da_duyet";
    await profile.save();

    //  Thông báo cho thợ
    const user = await User.findByPk(profile.userId, {
      attributes: ["name", "email"],
    });
    mailer.notifyMakerApproved({ to: user.email, makerName: user.name });

    res.json({ message: "Đã duyệt hồ sơ thợ thành công", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi duyệt", error: err.message });
  }
});

//  ADMIN: TỪ CHỐI HỒ SƠ
router.put("/admin/:id/reject", verifyAdmin, async (req, res) => {
  try {
    const profile = await MakerProfile.findByPk(req.params.id);
    if (!profile)
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    profile.status = "tu_choi";
    await profile.save();
    await User.update({ isMaker: false }, { where: { id: profile.userId } });

    //  Thông báo cho thợ
    const user = await User.findByPk(profile.userId, {
      attributes: ["name", "email"],
    });
    mailer.notifyMakerRejected({ to: user.email, makerName: user.name });

    res.json({ message: "Đã từ chối hồ sơ thợ", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi từ chối", error: err.message });
  }
});

module.exports = router;
module.exports.recalculateMakerRating = recalculateMakerRating;
