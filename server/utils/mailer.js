const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BASE = `
  <div style="font-family: sans-serif; max-width: 520px; margin: auto; border: 1px solid #fce7f3; border-radius: 16px; overflow: hidden;">
    <div style="background: #f43f5e; padding: 20px 28px;">
      <h2 style="color: white; margin: 0; font-size: 20px;">🧶 PinkyCrafts</h2>
    </div>
    <div style="padding: 28px;">
      {{BODY}}
    </div>
    <div style="background: #fff1f2; padding: 14px 28px; font-size: 12px; color: #999;">
      Email tự động từ PinkyCrafts — Vui lòng không reply trực tiếp.
    </div>
  </div>
`;

const wrap = (body) => BASE.replace("{{BODY}}", body);

const send = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"PinkyCrafts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Không throw để lỗi email không làm crash API
    console.error("❌ Lỗi gửi email:", err.message);
  }
};

// ── TEMPLATES ────────────────────────────────────────────────────────────────

/**
 * Gửi cho KHÁCH khi có báo giá mới vào đơn của họ
 */
exports.notifyNewBid = ({
  to,
  customerName,
  orderTitle,
  makerName,
  bidPrice,
  orderUrl,
}) =>
  send({
    to,
    subject: `💬 Báo giá mới cho đơn "${orderTitle}" — PinkyCrafts`,
    html: wrap(`
      <p>Xin chào <b>${customerName}</b>!</p>
      <p>Thợ <b>${makerName}</b> vừa gửi báo giá cho yêu cầu gia công của bạn:</p>
      <div style="background:#fff1f2; border-left: 4px solid #f43f5e; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <p style="margin:0; font-size:15px;">📦 <b>${orderTitle}</b></p>
        <p style="margin:6px 0 0; font-size:18px; color:#f43f5e; font-weight: bold;">
          ${Number(bidPrice).toLocaleString("vi-VN")}đ
        </p>
      </div>
      <p>Vào xem và chọn báo giá phù hợp nhé!</p>
      <a href="${orderUrl}" style="display:inline-block; background:#f43f5e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xem báo giá ngay →
      </a>
    `),
  });

/**
 * Gửi cho THỢ khi báo giá của họ được chọn
 */
exports.notifyBidAccepted = ({
  to,
  makerName,
  orderTitle,
  customerName,
  orderUrl,
}) =>
  send({
    to,
    subject: `🎉 Báo giá của bạn được chọn! — PinkyCrafts`,
    html: wrap(`
      <p>Chúc mừng <b>${makerName}</b>!</p>
      <p>Khách hàng <b>${customerName}</b> đã chấp nhận báo giá của bạn cho đơn:</p>
      <div style="background:#f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <p style="margin:0; font-size:16px; font-weight:bold;">📦 ${orderTitle}</p>
      </div>
      <p>Hãy vào xác nhận bắt đầu thực hiện đơn nhé!</p>
      <a href="${orderUrl}" style="display:inline-block; background:#22c55e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xem đơn của tôi →
      </a>
    `),
  });

/**
 * Gửi cho KHÁCH khi thợ báo hoàn thành (Chờ xác nhận)
 */
exports.notifyOrderReadyToConfirm = ({
  to,
  customerName,
  orderTitle,
  makerName,
  orderUrl,
}) =>
  send({
    to,
    subject: `📦 Đơn "${orderTitle}" đã xong — Vui lòng xác nhận nhận hàng`,
    html: wrap(`
      <p>Xin chào <b>${customerName}</b>!</p>
      <p>Thợ <b>${makerName}</b> đã hoàn thành đơn gia công của bạn:</p>
      <div style="background:#fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <p style="margin:0; font-size:16px; font-weight:bold;">📦 ${orderTitle}</p>
        <p style="margin:6px 0 0; font-size:13px; color:#92400e;">Đang chờ bạn xác nhận đã nhận hàng</p>
      </div>
      <p>Sau khi nhận hàng, hãy nhớ đánh giá thợ để giúp cộng đồng nhé!</p>
      <a href="${orderUrl}" style="display:inline-block; background:#f59e0b; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xác nhận nhận hàng →
      </a>
    `),
  });

/**
 * Gửi cho KHÁCH khi thợ bắt đầu thực hiện
 */
exports.notifyOrderStarted = ({
  to,
  customerName,
  orderTitle,
  makerName,
  orderUrl,
}) =>
  send({
    to,
    subject: `🔨 Thợ đã bắt đầu làm đơn "${orderTitle}"`,
    html: wrap(`
      <p>Xin chào <b>${customerName}</b>!</p>
      <p>Thợ <b>${makerName}</b> vừa xác nhận bắt đầu thực hiện đơn của bạn.</p>
      <div style="background:#f0f9ff; border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <p style="margin:0; font-size:16px; font-weight:bold;">📦 ${orderTitle}</p>
        <p style="margin:6px 0 0; font-size:13px; color:#0369a1;">Trạng thái: Đang thực hiện</p>
      </div>
      <a href="${orderUrl}" style="display:inline-block; background:#38bdf8; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Theo dõi tiến trình →
      </a>
    `),
  });

/**
 * Gửi cho THỢ khi hồ sơ được duyệt
 */
exports.notifyMakerApproved = ({ to, makerName }) =>
  send({
    to,
    subject: `✅ Hồ sơ thợ của bạn đã được duyệt — PinkyCrafts`,
    html: wrap(`
      <p>Xin chào <b>${makerName}</b>!</p>
      <p>🎉 Hồ sơ thợ của bạn trên PinkyCrafts đã được <b>Admin phê duyệt</b>.</p>
      <p>Từ bây giờ bạn có thể:</p>
      <ul style="color:#4b5563; line-height:2;">
        <li>Xem và gửi báo giá cho các yêu cầu gia công</li>
        <li>Nhận đơn và xây dựng hồ sơ thợ của mình</li>
        <li>Nhận đánh giá từ khách hàng</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/custom-order" style="display:inline-block; background:#f43f5e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xem đơn gia công ngay →
      </a>
    `),
  });

/**
 * Gửi cho THỢ khi hồ sơ bị từ chối
 */
exports.notifyMakerRejected = ({ to, makerName }) =>
  send({
    to,
    subject: `❌ Hồ sơ thợ chưa được duyệt — PinkyCrafts`,
    html: wrap(`
      <p>Xin chào <b>${makerName}</b>!</p>
      <p>Rất tiếc, hồ sơ thợ của bạn <b>chưa đạt yêu cầu</b> để được duyệt lần này.</p>
      <p>Bạn có thể cập nhật lại hồ sơ (bổ sung ảnh portfolio, kỹ năng, giới thiệu chi tiết hơn) và gửi lại để Admin xem xét.</p>
      <a href="${process.env.CLIENT_URL}/become-maker" style="display:inline-block; background:#6b7280; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Cập nhật hồ sơ →
      </a>
    `),
  });
