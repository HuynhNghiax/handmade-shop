const router = require("express").Router();
const { Op } = require("sequelize");
const User = require("../models/User");
const MakerProfile = require("../models/MakerProfile");
const Review = require("../models/Review");
const CommissionDebt = require("../models/CommissionDebt");
const CustomOrder = require("../models/CustomOrder");
const MakerPayout = require("../models/MakerPayout");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const mailer = require("../utils/mailer");

const ALLOWED_CATEGORIES = [
  "theu", "dan_len", "go", "gom", "da", "vai",
  "trang_suc", "ve_tranh", "giay_dep", "khac",
];

const recalculateMakerRating = async (makerId) => {
  const reviews = await Review.findAll({ where: { makerId } });
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await MakerProfile.update(
    { rating: Math.round(avg * 10) / 10 },
    { where: { id: makerId } }
  );
};

const pickProfileFields = (body) => {
  const {
    bio, skills, category, yearsExp, province,
    priceFrom, priceTo, portfolio, bankInfo,
    idCardFront, idCardBack,
  } = body;
  return {
    bio, skills, category, yearsExp, province,
    priceFrom, priceTo, portfolio, bankInfo,
    idCardFront, idCardBack,
  };
};

const validateProfilePayload = (data) => {
  const errors = [];
  if (!data.bio || data.bio.trim().length < 30)
    errors.push("Giới thiệu bản thân phải có ít nhất 30 ký tự.");
  if (!data.skills || data.skills.trim().length < 5)
    errors.push("Vui lòng nhập kỹ năng chuyên môn.");
  if (!data.category || !ALLOWED_CATEGORIES.includes(data.category))
    errors.push("Vui lòng chọn danh mục nghề hợp lệ.");
  if (data.yearsExp === undefined || data.yearsExp === null || data.yearsExp < 0)
    errors.push("Số năm kinh nghiệm không hợp lệ.");
  if (!data.province || data.province.trim().length < 2)
    errors.push("Vui lòng nhập tỉnh/thành phố.");
  if (!data.idCardFront)
    errors.push("Vui lòng upload ảnh mặt trước CCCD.");
  if (!data.idCardBack)
    errors.push("Vui lòng upload ảnh mặt sau CCCD.");
  if (data.priceFrom && data.priceTo && Number(data.priceFrom) > Number(data.priceTo))
    errors.push("Giá từ không được lớn hơn giá đến.");
  return errors;
};

router.get("/", async (req, res) => {
  try {
    const { category, skills, sort, province } = req.query;
    const where = { status: "da_duyet", isBanned: false };
    if (category) where.category = category;
    if (skills) where.skills = { [Op.iLike]: `%${skills}%` };
    if (province) where.province = { [Op.iLike]: `%${province}%` };
    const order = [];
    if (sort === "rating") order.push(["rating", "DESC"]);
    else if (sort === "totalDone") order.push(["totalDone", "DESC"]);
    else if (sort === "priceFrom") order.push(["priceFrom", "ASC"]);
    const makers = await MakerProfile.findAll({
      where,
      order: order.length ? order : [["rating", "DESC"]],
      include: [
        { model: User, as: "User", attributes: ["name", "avatar", "id"] },
      ],
    });
    res.json(makers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách thợ", error: err.message });
  }
});

router.get("/admin/pending", verifyAdmin, async (req, res) => {
  try {
    const pending = await MakerProfile.findAll({
      where: { status: { [Op.in]: ["cho_duyet", "can_bo_sung"] } },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "email", "avatar", "phone", "createdAt"],
        },
      ],
      order: [["submittedAt", "ASC"]],
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status
      ? { status }
      : { status: { [Op.in]: ["cho_duyet", "da_duyet", "tu_choi", "can_bo_sung"] } };
    const all = await MakerProfile.findAll({
      where,
      include: [
        { model: User, as: "User", attributes: ["name", "email", "avatar", "phone"] },
      ],
      order: [["updatedAt", "DESC"]],
    });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
});

router.get("/my-profile", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: "User", attributes: ["name", "avatar", "email", "phone"] }],
    });
    if (!profile) return res.status(404).json({ message: "Chưa có hồ sơ thợ" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy hồ sơ", error: err.message });
  }
});

router.get("/my-debts", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Bạn chưa có hồ sơ thợ" });

    const debts = await CommissionDebt.findAll({
      where: { makerId: profile.id },
      include: [
        { model: CustomOrder, as: "Order", attributes: ["id", "title", "agreedPrice", "updatedAt"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const totalPending = debts.filter((d) => d.status === "chua_thu").reduce((s, d) => s + d.amount, 0);
    const totalPaid = debts.filter((d) => d.status === "da_thu").reduce((s, d) => s + d.amount, 0);

    res.json({
      debts,
      summary: {
        totalPending,
        totalPaid,
        totalEarning: profile.totalEarning,
        pendingCount: debts.filter((d) => d.status === "chua_thu").length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy công nợ", error: err.message });
  }
});

router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Bạn chưa có hồ sơ thợ" });

    const orders = await CustomOrder.findAll({
      where: { makerId: req.user.id },
      include: [
        { model: User, as: "Customer", attributes: ["id", "name", "avatar"] },
      ],
      order: [["updatedAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đơn", error: err.message });
  }
});

router.get("/my-payouts", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Bạn chưa có hồ sơ thợ" });

    const payouts = await MakerPayout.findAll({
      where: { makerId: profile.id },
      include: [
        { model: CustomOrder, as: "Order", attributes: ["id", "title", "updatedAt"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const totalPending = payouts.filter((p) => p.status === "cho_tra").reduce((s, p) => s + p.amount, 0);
    const totalPaid = payouts.filter((p) => p.status === "da_tra").reduce((s, p) => s + p.amount, 0);

    res.json({
      payouts,
      summary: { totalPending, totalPaid, totalEarning: profile.totalEarning },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy payout", error: err.message });
  }
});

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
    if (!maker) return res.status(404).json({ message: "Không tìm thấy hồ sơ thợ" });
    res.json(maker);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy hồ sơ thợ", error: err.message });
  }
});

router.post("/register", verifyToken, async (req, res) => {
  try {
    const existing = await MakerProfile.findOne({ where: { userId: req.user.id } });

    if (existing) {
      if (existing.status === "da_duyet") {
        return res.status(400).json({ message: "Hồ sơ của bạn đã được duyệt." });
      }
      if (existing.status === "cho_duyet") {
        return res.status(400).json({ message: "Hồ sơ đang chờ duyệt, vui lòng đợi." });
      }
      if (existing.status === "tu_choi" || existing.status === "can_bo_sung") {
        return res.status(400).json({
          message: "Hồ sơ đã bị từ chối hoặc cần bổ sung. Vui lòng dùng API cập nhật và nộp lại.",
          profile: existing,
        });
      }
    }

    const data = pickProfileFields(req.body);
    const errors = validateProfilePayload(data);
    if (errors.length) return res.status(422).json({ message: "Dữ liệu không hợp lệ", errors });

    const profile = await MakerProfile.create({
      userId: req.user.id,
      ...data,
      portfolio: Array.isArray(data.portfolio) ? data.portfolio : [],
      status: "cho_duyet",
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: "Đăng ký thành công! Hồ sơ đang chờ Admin xét duyệt.",
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi đăng ký", error: err.message });
  }
});

router.put("/my-profile", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    const data = pickProfileFields(req.body);
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) profile[key] = val;
    });

    await profile.save();
    res.json({ message: "Cập nhật hồ sơ thành công", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

router.post("/my-profile/resubmit", verifyToken, async (req, res) => {
  try {
    const profile = await MakerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    if (!["tu_choi", "can_bo_sung"].includes(profile.status)) {
      return res.status(400).json({
        message: `Chỉ được nộp lại khi hồ sơ bị từ chối hoặc cần bổ sung. Trạng thái hiện tại: ${profile.status}`,
      });
    }

    const data = pickProfileFields(req.body);
    const errors = validateProfilePayload({ ...profile.toJSON(), ...data });
    if (errors.length) return res.status(422).json({ message: "Dữ liệu không hợp lệ", errors });

    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) profile[key] = val;
    });

    profile.status = "cho_duyet";
    profile.submittedAt = new Date();
    profile.adminNote = null;
    profile.rejectReason = null;

    await profile.save();
    res.json({ message: "Đã nộp lại hồ sơ thành công. Vui lòng chờ Admin xét duyệt.", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi nộp lại hồ sơ", error: err.message });
  }
});

router.put("/admin/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const profile = await MakerProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    profile.status = "da_duyet";
    profile.adminNote = req.body.adminNote || null;
    profile.rejectReason = null;
    await profile.save();

    await User.update({ isMaker: true }, { where: { id: profile.userId } });

    const user = await User.findByPk(profile.userId, { attributes: ["name", "email"] });
    try {
      mailer.notifyMakerApproved({ to: user.email, makerName: user.name });
    } catch (_) {}

    res.json({ message: "Đã duyệt hồ sơ thợ thành công", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi duyệt", error: err.message });
  }
});

router.put("/admin/:id/reject", verifyAdmin, async (req, res) => {
  try {
    const { rejectReason } = req.body;
    if (!rejectReason || rejectReason.trim().length < 10) {
      return res.status(422).json({ message: "Vui lòng nhập lý do từ chối (ít nhất 10 ký tự)." });
    }

    const profile = await MakerProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    profile.status = "tu_choi";
    profile.rejectReason = rejectReason.trim();
    profile.adminNote = req.body.adminNote || null;
    await profile.save();

    await User.update({ isMaker: false }, { where: { id: profile.userId } });

    const user = await User.findByPk(profile.userId, { attributes: ["name", "email"] });
    try {
      mailer.notifyMakerRejected({ to: user.email, makerName: user.name, reason: rejectReason });
    } catch (_) {}

    res.json({ message: "Đã từ chối hồ sơ thợ", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi từ chối", error: err.message });
  }
});

router.put("/admin/:id/request-update", verifyAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    if (!adminNote || adminNote.trim().length < 10) {
      return res.status(422).json({ message: "Vui lòng ghi rõ yêu cầu bổ sung (ít nhất 10 ký tự)." });
    }

    const profile = await MakerProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    profile.status = "can_bo_sung";
    profile.adminNote = adminNote.trim();
    await profile.save();

    const user = await User.findByPk(profile.userId, { attributes: ["name", "email"] });
    try {
      mailer.notifyMakerUpdateRequired({
        to: user.email,
        makerName: user.name,
        adminNote: adminNote.trim(),
      });
    } catch (_) {}

    res.json({ message: "Đã yêu cầu thợ bổ sung hồ sơ", profile });
  } catch (err) {
    res.status(500).json({ message: "Lỗi yêu cầu bổ sung", error: err.message });
  }
});

module.exports = router;
module.exports.recalculateMakerRating = recalculateMakerRating;
