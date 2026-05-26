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
    console.error("❌ Lỗi gửi email:", err.message);
  }
};

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
      <a href="${orderUrl}" style="display:inline-block; background:#f43f5e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xem báo giá ngay →
      </a>
    `),
  });

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
      <a href="${orderUrl}" style="display:inline-block; background:#22c55e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xem đơn của tôi →
      </a>
    `),
  });

exports.notifyOrderReadyToConfirm = ({
  to,
  customerName,
  orderTitle,
  makerName,
  orderUrl,
}) =>
  send({
    to,
    subject: `📦 Đơn "${orderTitle}" đã xong — Vui lòng thanh toán`,
    html: wrap(`
      <p>Xin chào <b>${customerName}</b>!</p>
      <p>Thợ <b>${makerName}</b> đã hoàn thành đơn gia công của bạn:</p>
      <div style="background:#fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <p style="margin:0; font-size:16px; font-weight:bold;">📦 ${orderTitle}</p>
        <p style="margin:6px 0 0; font-size:13px; color:#92400e;">Vui lòng thanh toán qua ZaloPay để hoàn tất</p>
      </div>
      <a href="${orderUrl}" style="display:inline-block; background:#f59e0b; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Thanh toán ngay →
      </a>
    `),
  });

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

exports.notifyMakerApproved = ({ to, makerName }) =>
  send({
    to,
    subject: `✅ Hồ sơ thợ của bạn đã được duyệt — PinkyCrafts`,
    html: wrap(`
      <p>Xin chào <b>${makerName}</b>!</p>
      <p>🎉 Hồ sơ thợ của bạn trên PinkyCrafts đã được <b>Admin phê duyệt</b>.</p>
      <p><b>Lưu ý quan trọng:</b> Hãy cập nhật <b>thông tin tài khoản ngân hàng</b> trong hồ sơ để nhận tiền từ các đơn gia công.</p>
      <a href="${process.env.CLIENT_URL}/become-maker" style="display:inline-block; background:#f43f5e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Cập nhật hồ sơ ngay →
      </a>
    `),
  });

exports.notifyMakerRejected = ({ to, makerName }) =>
  send({
    to,
    subject: `❌ Hồ sơ thợ chưa được duyệt — PinkyCrafts`,
    html: wrap(`
      <p>Xin chào <b>${makerName}</b>!</p>
      <p>Rất tiếc, hồ sơ thợ của bạn <b>chưa đạt yêu cầu</b> để được duyệt lần này.</p>
      <a href="${process.env.CLIENT_URL}/become-maker" style="display:inline-block; background:#6b7280; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Cập nhật hồ sơ →
      </a>
    `),
  });

// ── MỚI: Thông báo cho thợ khi khách thanh toán thành công ──────────────────
exports.notifyOrderPaidToMaker = ({
  to,
  makerName,
  customerName,
  orderTitle,
  makerEarning,
  orderUrl,
}) =>
  send({
    to,
    subject: `💰 Đơn "${orderTitle}" đã được thanh toán — PinkyCrafts`,
    html: wrap(`
      <p>Xin chào <b>${makerName}</b>!</p>
      <p>Khách hàng <b>${customerName}</b> vừa thanh toán thành công qua ZaloPay cho đơn:</p>
      <div style="background:#f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <p style="margin:0; font-size:16px; font-weight:bold;">📦 ${orderTitle}</p>
        <p style="margin:8px 0 0; font-size:20px; color:#16a34a; font-weight:bold;">
          Bạn nhận được: ${Number(makerEarning).toLocaleString("vi-VN")}đ
        </p>
        <p style="margin:6px 0 0; font-size:12px; color:#15803d;">
          Shop sẽ chuyển khoản cho bạn trong vòng 24-48 giờ làm việc
        </p>
      </div>
      <p>Hãy đảm bảo thông tin tài khoản ngân hàng trong hồ sơ của bạn là chính xác!</p>
      <a href="${orderUrl}" style="display:inline-block; background:#22c55e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xem đơn →
      </a>
    `),
  });

// ── MỚI: Thông báo cho thợ khi admin xác nhận đã chuyển tiền ────────────────
exports.notifyMakerPaid = ({ to, makerName, amount, orderTitle, note }) =>
  send({
    to,
    subject: `✅ PinkyCrafts đã chuyển tiền cho bạn — ${Number(amount).toLocaleString("vi-VN")}đ`,
    html: wrap(`
      <p>Xin chào <b>${makerName}</b>!</p>
      <p>PinkyCrafts vừa xác nhận đã chuyển khoản thu nhập cho bạn:</p>
      <div style="background:#f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
        <p style="margin:0; font-size:22px; font-weight:bold; color:#16a34a;">
          💵 ${Number(amount).toLocaleString("vi-VN")}đ
        </p>
        ${note ? `<p style="margin:8px 0 0; font-size:13px; color:#374151;">Ghi chú: ${note}</p>` : ""}
      </div>
      <p>Vui lòng kiểm tra tài khoản ngân hàng của bạn. Nếu chưa nhận được, hãy liên hệ admin.</p>
      <a href="${process.env.CLIENT_URL}/maker-dashboard" style="display:inline-block; background:#f43f5e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:8px;">
        Xem bảng điều khiển →
      </a>
    `),
  });
