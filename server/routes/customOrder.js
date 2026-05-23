const router = require("express").Router();
const User = require("../models/User");
const CustomOrder = require("../models/CustomOrder");
const MakerProfile = require("../models/MakerProfile");
const Bid = require("../models/Bid");
const Review = require("../models/Review");
const { verifyToken } = require("../middleware/authMiddleware");
const mailer = require("../utils/mailer");

const CLIENT = process.env.CLIENT_URL || "http://localhost:5173";
const orderUrl = (id) => `${CLIENT}/custom-order/${id}`;

/** Lấy User kèm email — dùng để gửi mail */
const getUser = (id) =>
  User.findByPk(id, { attributes: ["id", "name", "email"] });

//  ĐĂNG YÊU CẦU GIA CÔNG
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, budget, image, deadline } = req.body;
    const order = await CustomOrder.create({
      userId: req.user.id,
      title,
      description,
      budget,
      image,
      deadline,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Lỗi đăng yêu cầu", error: err.message });
  }
});

//  DANH SÁCH ĐƠN (PUBLIC)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const orders = await CustomOrder.findAll({
      where,
      include: [
        { model: User, as: "Customer", attributes: ["name", "avatar"] },
        // Chỉ lấy id để đếm — không kéo toàn bộ dữ liệu bid
        { model: Bid, as: "Bids", attributes: ["id"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
});

//  THÔNG BÁO BÁO GIÁ CHO KHÁCH (PROTECTED)
// Trả về số đơn của user đang có báo giá mới chưa xử lý
router.get("/my-bid-count", verifyToken, async (req, res) => {
  try {
    const orders = await CustomOrder.findAll({
      where: { userId: req.user.id, status: "Đang tìm thợ" },
      include: [{ model: Bid, as: "Bids", attributes: ["id"] }],
    });
    const count = orders.filter((o) => o.Bids?.length > 0).length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});

//  CHI TIẾT ĐƠN (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id, {
      include: [
        { model: User, as: "Customer", attributes: ["id", "name", "avatar"] },
        { model: User, as: "Maker", attributes: ["id", "name", "avatar"] },
        {
          model: Bid,
          as: "Bids",
          include: [
            {
              model: User,
              as: "MakerUser",
              attributes: ["id", "name", "avatar"],
              include: [
                {
                  model: MakerProfile,
                  as: "MakerProfile",
                  attributes: ["id", "rating", "totalDone", "status"],
                },
              ],
            },
          ],
          order: [["createdAt", "ASC"]],
        },
        { model: Bid, as: "AcceptedBid" },
        {
          model: Review,
          as: "Review",
          include: [
            { model: User, as: "Reviewer", attributes: ["name", "avatar"] },
          ],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy chi tiết đơn", error: err.message });
  }
});

//  GỬI BÁO GIÁ
router.post("/:id/bid", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.status !== "Đang tìm thợ")
      return res
        .status(400)
        .json({ message: "Đơn này không còn nhận báo giá nữa!" });

    if (order.userId === req.user.id)
      return res
        .status(400)
        .json({ message: "Không thể tự báo giá đơn của chính mình!" });

    const makerProfile = await MakerProfile.findOne({
      where: { userId: req.user.id, status: "da_duyet" },
    });
    if (!makerProfile)
      return res.status(403).json({
        message: "Bạn cần là thợ được Admin duyệt mới có thể báo giá!",
      });

    const existingBid = await Bid.findOne({
      where: { customOrderId: req.params.id, makerId: req.user.id },
    });
    if (existingBid)
      return res
        .status(400)
        .json({ message: "Bạn đã gửi báo giá cho đơn này rồi!" });

    const bid = await Bid.create({
      customOrderId: req.params.id,
      makerId: req.user.id,
      price: req.body.price,
      message: req.body.message,
      contactInfo: req.body.contactInfo,
    });

    // Thông báo cho KHÁCH có báo giá mới
    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(req.user.id),
    ]);

    mailer.notifyNewBid({
      to: customer.email,
      customerName: customer.name,
      orderTitle: order.title,
      makerName: maker.name,
      bidPrice: req.body.price,
      orderUrl: orderUrl(order.id),
    });

    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ message: "Lỗi gửi báo giá", error: err.message });
  }
});

//  KHÁCH CHỌN BÁO GIÁ
router.post("/:id/accept-bid", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });

    if (order.status !== "Đang tìm thợ")
      return res
        .status(400)
        .json({ message: "Đơn này không còn ở trạng thái tìm thợ!" });

    const bid = await Bid.findOne({
      where: { id: req.body.bidId, customOrderId: req.params.id },
    });
    if (!bid)
      return res.status(404).json({ message: "Không tìm thấy báo giá" });

    order.acceptedBidId = bid.id;
    order.makerId = bid.makerId;
    order.status = "Đã chọn thợ";
    await order.save();

    //  Thông báo cho THỢ rằng báo giá được chọn
    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(bid.makerId),
    ]);

    mailer.notifyBidAccepted({
      to: maker.email,
      makerName: maker.name,
      orderTitle: order.title,
      customerName: customer.name,
      orderUrl: orderUrl(order.id),
    });

    res.json({ message: "Đã chọn báo giá thành công!", order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi chọn báo giá", error: err.message });
  }
});

//  THỢ XÁC NHẬN BẮT ĐẦU THỰC HIỆN
router.post("/:id/start", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.makerId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Bạn không phải thợ của đơn này!" });

    if (order.status !== "Đã chọn thợ")
      return res
        .status(400)
        .json({ message: "Đơn không ở trạng thái chờ bắt đầu!" });

    order.status = "Đang thực hiện";
    await order.save();

    //  Thông báo cho KHÁCH thợ đã bắt đầu
    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(req.user.id),
    ]);

    mailer.notifyOrderStarted({
      to: customer.email,
      customerName: customer.name,
      orderTitle: order.title,
      makerName: maker.name,
      orderUrl: orderUrl(order.id),
    });

    res.json({ message: "Đã xác nhận bắt đầu thực hiện!", order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

//  THỢ BÁO HOÀN THÀNH
router.post("/:id/complete", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.makerId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Bạn không phải thợ của đơn này!" });

    if (order.status !== "Đang thực hiện")
      return res
        .status(400)
        .json({ message: 'Đơn phải đang ở trạng thái "Đang thực hiện"!' });

    order.status = "Chờ xác nhận";
    await order.save();

    //  Thông báo cho KHÁCH xác nhận nhận hàng
    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(req.user.id),
    ]);

    mailer.notifyOrderReadyToConfirm({
      to: customer.email,
      customerName: customer.name,
      orderTitle: order.title,
      makerName: maker.name,
      orderUrl: orderUrl(order.id),
    });

    res.json({ message: "Đã báo hoàn thành, chờ khách xác nhận!", order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

//  KHÁCH XÁC NHẬN NHẬN HÀNG
router.post("/:id/confirm", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });

    if (order.status !== "Chờ xác nhận")
      return res
        .status(400)
        .json({ message: "Đơn không ở trạng thái chờ xác nhận!" });

    order.status = "Hoàn thành";
    await order.save();

    await MakerProfile.increment("totalDone", {
      by: 1,
      where: { userId: order.makerId },
    });

    res.json({ message: "Xác nhận hoàn thành thành công!", order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xác nhận", error: err.message });
  }
});

//  KHÁCH HỦY ĐƠN
router.post("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });

    if (!["Đang tìm thợ", "Đã chọn thợ"].includes(order.status))
      return res.status(400).json({
        message: "Không thể hủy đơn đang thực hiện hoặc đã hoàn thành!",
      });

    order.status = "Đã hủy";
    await order.save();
    res.json({ message: "Đã hủy đơn", order });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hủy đơn", error: err.message });
  }
});

module.exports = router;
