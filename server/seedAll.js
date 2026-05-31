/**
 * seedAll.js — Seed toàn bộ database local PinkyCrafts
 * Chạy: node server/seedAll.js
 *
 * Thứ tự seed: Users → Products → Orders → MakerProfiles → CustomOrders → Bids → Reviews → CommissionDebts → MakerPayouts → Logs
 * Dùng { force: true } → XÓA SẠCH tất cả bảng và tạo lại.
 * CHỈ DÙNG CHO MÔI TRƯỜNG LOCAL / DEVELOPMENT!
 *
 * Thay đổi so với version cũ:
 *  - isMaker chỉ true khi status = da_duyet (fix: Hoa, Mai → false)
 *  - tu_choi không xuất hiện trong admin/all (đã fix ở backend)
 *  - CommissionDebt + MakerPayout được seed cho đơn hoàn thành
 *  - Thêm scenario đơn hủy mất cọc (customOrder[5])
 *  - agreedPrice, commissionRate, makerEarning... đầy đủ cho đơn đã chốt
 */

require("dotenv").config({ path: __dirname + "/.env" });
const bcrypt = require("bcryptjs");

const sequelize = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const CustomOrder = require("./models/CustomOrder");
const Bid = require("./models/Bid");
const Log = require("./models/Log");
const OtpCode = require("./models/OtpCode");
const MakerProfile = require("./models/MakerProfile");
const Review = require("./models/Review");
const CommissionDebt = require("./models/CommissionDebt");
const MakerPayout = require("./models/MakerPayout");
const { COMMISSION, MAKER_BADGE } = require("./constants/business");
require("./models/associations");

// ─── DỮ LIỆU MẪU ────────────────────────────────────────────────────────────

const usersData = [
  {
    // index 0 — Admin
    name: "Admin Pinky",
    email: "admin@pinky.com",
    password: "admin123",
    isAdmin: true,
    isMaker: false,
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Admin+Pinky&background=f43f5e&color=fff&size=128",
  },
  {
    // index 1 — Thợ đã được duyệt
    name: "Nguyễn Thị Lan",
    email: "lan@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true, // da_duyet → true
    phone: "0912345678",
    address: "45 Lê Lợi, Q.3, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Nguyen+Thi+Lan&background=fbcfe8&color=ec4899&size=128",
  },
  {
    // index 2 — Thợ đã được duyệt
    name: "Trần Văn Minh",
    email: "minh@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true, // da_duyet → true
    phone: "0987654321",
    address: "78 Trần Hưng Đạo, Q.5, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Tran+Van+Minh&background=dbeafe&color=3b82f6&size=128",
  },
  {
    // index 3 — Thợ đang chờ duyệt → isMaker: false (chưa được duyệt)
    name: "Phạm Thị Hoa",
    email: "hoa@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false, // FIX: cho_duyet → false, chỉ set true sau khi approve
    phone: "0976543210",
    address: "12 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Pham+Thi+Hoa&background=d1fae5&color=059669&size=128",
  },
  {
    // index 4 — Khách hàng thuần
    name: "Lê Quốc Bảo",
    email: "bao@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0965432109",
    address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Le+Quoc+Bao&background=fef3c7&color=d97706&size=128",
  },
  {
    // index 5 — Thợ bị từ chối → isMaker: false
    name: "Võ Thị Mai",
    email: "mai@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false, // tu_choi → false
    phone: "0954321098",
    address: "56 Cách Mạng Tháng 8, Q.3, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Vo+Thi+Mai&background=ede9fe&color=7c3aed&size=128",
  },
];

const productsData = [
  {
    name: "Vòng Tay Đá Tự Nhiên",
    price: 185000,
    category: "Trang sức",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
    desc: "Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.",
    quantity: 20,
  },
  {
    name: "Gối Tựa Lưng Thêu Tay",
    price: 280000,
    category: "Trang trí",
    img: "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800",
    desc: "Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.",
    quantity: 15,
  },
  {
    name: "Nến Thơm Handmade Tinh Dầu",
    price: 210000,
    category: "Quà tặng",
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
    desc: "Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.",
    quantity: 30,
  },
  {
    name: "Vòng Tay Đá Tự Nhiên",
    price: 185000,
    category: "Trang sức",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
    desc: "Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.",
    quantity: 10,
  },
  {
    name: "Gối Tựa Lưng Thêu Tay",
    price: 280000,
    category: "Trang trí",
    img: "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800",
    desc: "Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.",
    quantity: 8,
  },
  {
    name: "Nến Thơm Handmade Tinh Dầu",
    price: 210000,
    category: "Quà tặng",
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
    desc: "Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.",
    quantity: 25,
  },
  {
    name: "Vòng Tay Đá Tự Nhiên",
    price: 185000,
    category: "Trang sức",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
    desc: "Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.",
    quantity: 12,
  },
  {
    name: "Gối Tựa Lưng Thêu Tay",
    price: 280000,
    category: "Trang trí",
    img: "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800",
    desc: "Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.",
    quantity: 6,
  },
  {
    name: "Nến Thơm Handmade Tinh Dầu",
    price: 210000,
    category: "Quà tặng",
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
    desc: "Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.",
    quantity: 18,
  },
];

// ─── HÀM SEED CHÍNH ──────────────────────────────────────────────────────────

const seedAll = async () => {
  try {
    console.log("\n╔══════════════════════════════════════╗");
    console.log("║   🌸 PINKYCRAFTS — SEED DATABASE 🌸   ║");
    console.log("╚══════════════════════════════════════╝\n");

    // 1. Kết nối DB
    await sequelize.authenticate();
    console.log("✅ [1/10] Kết nối database thành công.");

    // 2. Sync tất cả models
    await sequelize.sync({ force: true });
    console.log("✅ [2/10] Đã tạo lại toàn bộ bảng (force sync).");

    // 3. Seed Users
    const hashedUsers = await Promise.all(
      usersData.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      })),
    );
    const createdUsers = await User.bulkCreate(hashedUsers);
    console.log(`✅ [3/10] Đã tạo ${createdUsers.length} người dùng.`);

    const userId_Admin = createdUsers[0].id;
    const userId_Lan = createdUsers[1].id;
    const userId_Minh = createdUsers[2].id;
    const userId_Hoa = createdUsers[3].id;
    const userId_Bao = createdUsers[4].id;
    const userId_Mai = createdUsers[5].id;

    // 4. Seed Products
    const createdProducts = await Product.bulkCreate(productsData);
    console.log(`✅ [4/10] Đã tạo ${createdProducts.length} sản phẩm.`);

    // 5. Seed Orders
    const ordersData = [
      {
        userId: userId_Lan,
        products: [
          {
            id: createdProducts[0].id,
            name: createdProducts[0].name,
            img: createdProducts[0].img,
            price: 185000,
            quantity: 2,
          },
          {
            id: createdProducts[2].id,
            name: createdProducts[2].name,
            img: createdProducts[2].img,
            price: 210000,
            quantity: 1,
          },
        ],
        totalAmount: 610000,
        address: "45 Lê Lợi, Q.3, TP.HCM",
        phone: "0912345678",
        status: "Hoàn thành",
      },
      {
        userId: userId_Minh,
        products: [
          {
            id: createdProducts[1].id,
            name: createdProducts[1].name,
            img: createdProducts[1].img,
            price: 280000,
            quantity: 1,
          },
        ],
        totalAmount: 310000,
        address: "78 Trần Hưng Đạo, Q.5, TP.HCM",
        phone: "0987654321",
        status: "Đang giao",
      },
      {
        userId: userId_Hoa,
        products: [
          {
            id: createdProducts[0].id,
            name: createdProducts[0].name,
            img: createdProducts[0].img,
            price: 185000,
            quantity: 1,
          },
          {
            id: createdProducts[1].id,
            name: createdProducts[1].name,
            img: createdProducts[1].img,
            price: 280000,
            quantity: 1,
          },
        ],
        totalAmount: 495000,
        address: "12 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM",
        phone: "0976543210",
        status: "Chờ xác nhận",
      },
      {
        userId: userId_Lan,
        products: [
          {
            id: createdProducts[2].id,
            name: createdProducts[2].name,
            img: createdProducts[2].img,
            price: 210000,
            quantity: 3,
          },
        ],
        totalAmount: 660000,
        address: "45 Lê Lợi, Q.3, TP.HCM",
        phone: "0912345678",
        status: "Chờ xác nhận",
      },
      {
        userId: userId_Bao,
        products: [
          {
            id: createdProducts[0].id,
            name: createdProducts[0].name,
            img: createdProducts[0].img,
            price: 185000,
            quantity: 1,
          },
        ],
        totalAmount: 215000,
        address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
        phone: "0965432109",
        status: "Đã hủy",
      },
      {
        userId: userId_Bao,
        products: [
          {
            id: createdProducts[1].id,
            name: createdProducts[1].name,
            img: createdProducts[1].img,
            price: 280000,
            quantity: 2,
          },
          {
            id: createdProducts[2].id,
            name: createdProducts[2].name,
            img: createdProducts[2].img,
            price: 210000,
            quantity: 1,
          },
        ],
        totalAmount: 800000,
        address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
        phone: "0965432109",
        status: "Hoàn thành",
      },
      {
        userId: userId_Minh,
        products: [
          {
            id: createdProducts[2].id,
            name: createdProducts[2].name,
            img: createdProducts[2].img,
            price: 210000,
            quantity: 2,
          },
        ],
        totalAmount: 450000,
        address: "78 Trần Hưng Đạo, Q.5, TP.HCM",
        phone: "0987654321",
        status: "Hoàn thành",
      },
    ];
    const createdOrders = await Order.bulkCreate(ordersData);
    console.log(`✅ [5/10] Đã tạo ${createdOrders.length} đơn hàng.`);

    // 6. Seed MakerProfiles
    //    Lan (da_duyet, 23 đơn, rating 4.7) → badge Thợ Bạc
    //    Minh (da_duyet, 15 đơn, rating 5.0) → badge Thợ Đồng
    //    Hoa (cho_duyet) — chưa được duyệt
    //    Mai (tu_choi)   — bị từ chối, KHÔNG xuất hiện trong admin/all
    const makerProfilesData = [
      {
        userId: userId_Lan,
        bio: "Mình là Lan, đam mê thủ công từ nhỏ. Chuyên đan len, làm nến thơm và thêu tay. Mỗi sản phẩm mình đều đổ cả tâm huyết vào để khách hàng nhận được điều tốt nhất.",
        skills: "đan,làm nến,thêu",
        portfolio: [
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400",
          "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400",
          "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=400",
        ],
        bankInfo: "9988001122 · Vietcombank · Nguyen Thi Lan",
        status: "da_duyet",
        rating: 4.7,
        totalDone: 23,
        badge: "Thợ Bạc",
        badgeEmoji: "🥈",
        commissionRate: 10,
        totalEarning: 5400000,
      },
      {
        userId: userId_Minh,
        bio: "Minh — thợ thủ công 5 năm kinh nghiệm về đồ da và đan len. Nhận làm túi xách, ví, thắt lưng da bò thật theo yêu cầu. Cam kết chất lượng, giao đúng hẹn.",
        skills: "làm đồ da,đan,may",
        portfolio: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400",
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400",
          "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=400",
        ],
        bankInfo: "1234567890 · Techcombank · Tran Van Minh",
        status: "da_duyet",
        rating: 5.0,
        totalDone: 15,
        badge: "Thợ Đồng",
        badgeEmoji: "🥉",
        commissionRate: 10,
        totalEarning: 3375000,
      },
      {
        userId: userId_Hoa,
        bio: "Hoa yêu thích vẽ tranh màu nước và thêu tay. Nhận đơn vẽ tranh chân dung, phong cảnh hoặc thêu tên lên quần áo, phụ kiện theo yêu cầu.",
        skills: "vẽ tranh,thêu",
        portfolio: [
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400",
          "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=400",
        ],
        bankInfo: "",
        status: "cho_duyet", // chưa được duyệt → isMaker vẫn false
        rating: 0,
        totalDone: 0,
        badge: "Thợ Mới",
        badgeEmoji: "🌱",
        commissionRate: 10,
        totalEarning: 0,
      },
      {
        userId: userId_Mai,
        bio: "Mai nhận làm đồ handmade đủ loại.",
        skills: "may,đan",
        portfolio: [],
        bankInfo: "",
        status: "tu_choi", // bị từ chối → không hiện trong admin/all
        rating: 0,
        totalDone: 0,
        badge: "Thợ Mới",
        badgeEmoji: "🌱",
        commissionRate: 10,
        totalEarning: 0,
      },
    ];
    const createdMakerProfiles =
      await MakerProfile.bulkCreate(makerProfilesData);
    console.log(`✅ [6/10] Đã tạo ${createdMakerProfiles.length} hồ sơ thợ.`);

    const makerProfile_Lan = createdMakerProfiles[0];
    const makerProfile_Minh = createdMakerProfiles[1];

    // 7. Seed CustomOrders + Bids
    //
    // [0] Lan tìm thợ       — đang tìm, có 2 bid (Minh + Hoa)
    // [1] Bao thuê Lan      — đang thực hiện, đã cọc 50%
    // [2] Bao thuê Minh     — Hoàn thành, đã thanh toán đủ (ZaloPay)
    // [3] Minh tìm thợ      — đang tìm, Lan đã bid
    // [4] Hoa tìm thợ       — chưa có bid
    // [5] Bao thuê Lan      — Đã hủy SAU KHI CỌC → Lan giữ cọc trừ HH
    // [6] Lan đã hủy trước cọc

    // Tính commission cho đơn [2] — hoàn thành đầy đủ
    const agreedPrice_C2 = 750000;
    const rate_C2 = 10;
    const comm_C2 = COMMISSION.calculate(agreedPrice_C2, rate_C2);

    // Tính commission cho đơn [5] — hủy mất cọc
    const agreedPrice_C5 = 400000;
    const depositAmount_C5 = Math.round(agreedPrice_C5 * 0.5); // 200000
    const rate_C5 = 10;
    const comm_C5_deposit = COMMISSION.calculate(depositAmount_C5, rate_C5);

    const customOrdersData = [
      {
        // [0] Lan đăng, đang tìm thợ
        userId: userId_Lan,
        makerId: null,
        acceptedBidId: null,
        title: "Túi tote len hình mèo Sanrio",
        description:
          "Muốn đặt một chiếc túi tote len có hình mèo Hello Kitty phong cách Sanrio, màu hồng pastel, size vừa đủ đựng laptop 13 inch. Thêm tai và nơ cho mèo càng tốt ạ.",
        budget: 600000,
        status: "Đang tìm thợ",
        paymentStatus: "unpaid",
        depositStatus: "unpaid",
        finalStatus: "unpaid",
      },
      {
        // [1] Bao thuê Lan — đã cọc, đang thực hiện
        userId: userId_Bao,
        makerId: userId_Lan,
        acceptedBidId: null, // update sau
        title: "Nến thơm mùi cà phê sữa Việt Nam",
        description:
          "Tôi muốn đặt nến thơm mùi cà phê sữa đá kiểu Việt Nam. Nến phải cháy được ít nhất 40 tiếng. Đựng trong hũ thủy tinh bo tròn.",
        budget: 350000,
        status: "Đang thực hiện",
        agreedPrice: 320000,
        commissionRate: 10,
        commissionAmount: COMMISSION.calculate(320000, 10).commissionAmount,
        shopEarning: COMMISSION.calculate(320000, 10).shopEarning,
        makerEarning: COMMISSION.calculate(320000, 10).makerEarning,
        depositAmount: Math.round(320000 * 0.5),
        finalAmount: 320000 - Math.round(320000 * 0.5),
        paymentStatus: "unpaid",
        depositStatus: "paid", // đã cọc
        depositTransId: "240101_pinky_seed_deposit_1",
        depositPaidAt: new Date(),
        finalStatus: "unpaid",
      },
      {
        // [2] Bao thuê Minh — hoàn thành, thanh toán đủ qua ZaloPay
        userId: userId_Bao,
        makerId: userId_Minh,
        acceptedBidId: null, // update sau
        title: "Ví da bò handmade đựng thẻ và tiền mặt",
        description:
          "Cần ví da bò thật dạng gấp đôi, có ngăn đựng 6-8 thẻ và ngăn tiền mặt. Màu nâu cognac. Khâu tay toàn bộ, chỉ sáp màu vàng đồng.",
        budget: 800000,
        status: "Hoàn thành",
        agreedPrice: agreedPrice_C2,
        commissionRate: rate_C2,
        commissionAmount: comm_C2.commissionAmount,
        shopEarning: comm_C2.shopEarning,
        makerEarning: comm_C2.makerEarning,
        depositAmount: Math.round(agreedPrice_C2 * 0.5),
        finalAmount: agreedPrice_C2 - Math.round(agreedPrice_C2 * 0.5),
        paymentStatus: "paid",
        depositStatus: "paid",
        depositTransId: "240101_pinky_seed_deposit_2",
        depositPaidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        finalStatus: "paid",
        finalTransId: "240101_pinky_seed_final_2",
        finalPaidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        zpPaidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        // [3] Minh đăng, đang tìm thợ
        userId: userId_Minh,
        makerId: null,
        acceptedBidId: null,
        title: "Vòng tay đá tự nhiên theo mệnh Thổ",
        description:
          "Cần vòng tay đá tự nhiên phù hợp mệnh Thổ, màu vàng nâu ấm. Ưu tiên đá mắt hổ và đá thạch anh vàng. Size tay nữ, chu vi 16cm.",
        budget: 280000,
        status: "Đang tìm thợ",
        paymentStatus: "unpaid",
        depositStatus: "unpaid",
        finalStatus: "unpaid",
      },
      {
        // [4] Hoa đăng, chưa có bid
        userId: userId_Hoa,
        makerId: null,
        acceptedBidId: null,
        title: "Tranh thêu tay chân dung thú cưng",
        description:
          "Mình muốn thêu chân dung chú mèo vàng nhà mình lên khung 20x20cm. Màu sắc trung thành với ảnh gốc. Dùng làm quà sinh nhật nên cần xong trong 2 tuần.",
        budget: 450000,
        status: "Đang tìm thợ",
        paymentStatus: "unpaid",
        depositStatus: "unpaid",
        finalStatus: "unpaid",
      },
      {
        // [5] Bao thuê Lan — HỦY SAU KHI CỌC → Lan giữ cọc trừ hoa hồng
        userId: userId_Bao,
        makerId: userId_Lan,
        acceptedBidId: null, // update sau
        title: "Móc len hình thỏ bông size lớn",
        description:
          "Muốn đặt thỏ bông móc len size 30cm, màu trắng, tai hồng. Làm quà cho bạn gái.",
        budget: 450000,
        status: "Đã hủy",
        agreedPrice: agreedPrice_C5,
        commissionRate: rate_C5,
        commissionAmount: comm_C5_deposit.commissionAmount, // HH trên cọc
        shopEarning: comm_C5_deposit.shopEarning,
        makerEarning: comm_C5_deposit.makerEarning, // thợ nhận cọc - HH
        depositAmount: depositAmount_C5,
        finalAmount: agreedPrice_C5 - depositAmount_C5,
        paymentStatus: "unpaid",
        depositStatus: "paid", // đã cọc trước khi hủy
        depositTransId: "240101_pinky_seed_deposit_5",
        depositPaidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        finalStatus: "unpaid",
      },
      {
        // [6] Lan đăng, hủy trước khi cọc
        userId: userId_Lan,
        makerId: null,
        acceptedBidId: null,
        title: "Móc chìa khóa len hình gấu trúc",
        description:
          "Đặt 10 cái móc chìa khóa len hình gấu trúc mini làm quà tặng bạn bè. Mỗi cái khoảng 5-6cm.",
        budget: 200000,
        status: "Đã hủy",
        paymentStatus: "unpaid",
        depositStatus: "unpaid",
        finalStatus: "unpaid",
      },
    ];
    const createdCustomOrders = await CustomOrder.bulkCreate(customOrdersData);
    console.log(`   → Đã tạo ${createdCustomOrders.length} yêu cầu gia công.`);

    // Bids
    const bidsData = [
      {
        // bid cho [0] — Minh báo giá
        customOrderId: createdCustomOrders[0].id,
        makerId: userId_Minh,
        price: 550000,
        message:
          "Mình đan len được hơn 3 năm, chuyên làm túi theo yêu cầu. Hoàn thành trong 7-10 ngày. Len cotton Hàn Quốc cao cấp, mềm và bền màu.",
        contactInfo: "0987654321",
      },
      {
        // bid cho [0] — Hoa báo giá (demo UI)
        customOrderId: createdCustomOrders[0].id,
        makerId: userId_Hoa,
        price: 580000,
        message:
          "Mình chuyên làm đồ Sanrio, có kinh nghiệm đan hình thú cute. Giao trong 5-7 ngày. Tặng kèm móc khóa mèo mini nếu bạn chọn mình.",
        contactInfo: "0976543210",
      },
      {
        // bid cho [1] — Lan báo giá (được chấp nhận)
        customOrderId: createdCustomOrders[1].id,
        makerId: userId_Lan,
        price: 320000,
        message:
          "Mình chuyên làm nến handmade theo yêu cầu, đã làm hơn 50 đơn. Sẽ gửi mẫu mùi trước khi đổ nến chính để bạn duyệt. Thời gian: 3-5 ngày.",
        contactInfo: "0912345678",
      },
      {
        // bid cho [2] — Minh báo giá (được chấp nhận)
        customOrderId: createdCustomOrders[2].id,
        makerId: userId_Minh,
        price: 750000,
        message:
          "Mình làm đồ da 5 năm, chuyên ví và túi da bò thật. Khâu tay toàn bộ bằng chỉ sáp Mỹ. Giao hàng trong 10-14 ngày. Bảo hành 6 tháng.",
        contactInfo: "0987654321",
      },
      {
        // bid cho [3] — Lan báo giá
        customOrderId: createdCustomOrders[3].id,
        makerId: userId_Lan,
        price: 260000,
        message:
          "Mình hay làm vòng tay đá theo mệnh cho bạn bè. Sẽ tư vấn thêm loại đá phù hợp nhất cho mệnh Thổ của bạn.",
        contactInfo: "0912345678",
      },
      {
        // bid cho [5] — Lan báo giá (được chấp nhận, sau đó Bao hủy mất cọc)
        customOrderId: createdCustomOrders[5].id,
        makerId: userId_Lan,
        price: 400000,
        message:
          "Mình móc len thỏ bông rất cute, đã làm nhiều size khác nhau. Giao trong 5-7 ngày.",
        contactInfo: "0912345678",
      },
    ];
    const createdBids = await Bid.bulkCreate(bidsData);
    console.log(`   → Đã tạo ${createdBids.length} báo giá.`);

    // Update acceptedBidId
    await createdCustomOrders[1].update({ acceptedBidId: createdBids[2].id });
    await createdCustomOrders[2].update({ acceptedBidId: createdBids[3].id });
    await createdCustomOrders[5].update({ acceptedBidId: createdBids[5].id });
    console.log(`✅ [7/10] Seed CustomOrders & Bids hoàn tất.`);

    // 8. Seed Reviews (chỉ đơn Hoàn thành — customOrder[2])
    const reviewsData = [
      {
        customOrderId: createdCustomOrders[2].id,
        reviewerId: userId_Bao,
        makerId: makerProfile_Minh.id,
        rating: 5,
        comment:
          "Ví đẹp hơn mình tưởng! Da bò thật, mùi thơm tự nhiên, đường chỉ rất thẳng và đều. Anh Minh tư vấn nhiệt tình, giao hàng đúng hẹn. Sẽ quay lại đặt tiếp.",
      },
    ];
    const createdReviews = await Review.bulkCreate(reviewsData);
    await makerProfile_Minh.update({ rating: 5.0 });
    console.log(`✅ [8/10] Đã tạo ${createdReviews.length} đánh giá.`);

    // 9. Seed CommissionDebts + MakerPayouts
    //
    // Đơn [2] hoàn thành — da_thu (ZaloPay tự thu)
    // Đơn [5] hủy mất cọc — da_thu (ZaloPay tự thu HH từ cọc)

    const debtsAndPayoutsData = [
      {
        // Đơn [2] hoàn thành
        debt: {
          makerId: makerProfile_Minh.id,
          customOrderId: createdCustomOrders[2].id,
          amount: comm_C2.commissionAmount,
          agreedPrice: agreedPrice_C2,
          commissionRate: rate_C2,
          status: "da_thu", // ZaloPay đã thu tự động
          paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          note: "Thu tự động qua ZaloPay",
        },
        payout: {
          makerId: makerProfile_Minh.id,
          customOrderId: createdCustomOrders[2].id,
          amount: comm_C2.makerEarning,
          agreedPrice: agreedPrice_C2,
          commissionRate: rate_C2,
          bankInfo: "1234567890 · Techcombank · Tran Van Minh",
          status: "cho_tra", // chờ admin chuyển khoản cho thợ
        },
      },
      {
        // Đơn [5] hủy mất cọc
        debt: {
          makerId: makerProfile_Lan.id,
          customOrderId: createdCustomOrders[5].id,
          amount: comm_C5_deposit.commissionAmount, // HH tính trên tiền cọc
          agreedPrice: depositAmount_C5,
          commissionRate: rate_C5,
          status: "da_thu", // ZaloPay đã thu tự động
          paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          note: "Hoa hồng từ tiền cọc — khách hủy đơn",
        },
        payout: {
          makerId: makerProfile_Lan.id,
          customOrderId: createdCustomOrders[5].id,
          amount: comm_C5_deposit.makerEarning, // cọc - HH
          agreedPrice: depositAmount_C5,
          commissionRate: rate_C5,
          bankInfo: "9988001122 · Vietcombank · Nguyen Thi Lan",
          status: "cho_tra",
          note: "Khách hủy đơn sau khi cọc — thợ giữ cọc trừ hoa hồng",
        },
      },
    ];

    for (const item of debtsAndPayoutsData) {
      await CommissionDebt.create(item.debt);
      await MakerPayout.create(item.payout);
    }
    console.log(`✅ [9/10] Đã tạo CommissionDebts & MakerPayouts.`);

    // 10. Seed Logs
    const logsData = [
      {
        userId: userId_Lan,
        userName: "Nguyễn Thị Lan",
        action: "Đăng nhập thành công",
        details: "Đăng nhập bằng email/password",
        status: "Thành công",
      },
      {
        userId: userId_Minh,
        userName: "Trần Văn Minh",
        action: "Đặt hàng",
        details: `Đã đặt đơn hàng #${createdOrders[1].id} - Tổng: 310,000đ`,
        status: "Thành công",
      },
      {
        userId: userId_Hoa,
        userName: "Phạm Thị Hoa",
        action: "Cố gắng truy cập trái phép",
        details: "Người dùng này đã cố mò vào trang Dashboard",
        status: "Bị chặn",
      },
      {
        userId: userId_Lan,
        userName: "Nguyễn Thị Lan",
        action: "Đăng yêu cầu gia công",
        details: "Đăng yêu cầu: Túi tote len hình mèo Sanrio",
        status: "Thành công",
      },
      {
        userId: null,
        userName: "Khách vãng lai",
        action: "Xem sản phẩm",
        details: "Truy cập trang sản phẩm không cần đăng nhập",
        status: "Thành công",
      },
      {
        userId: userId_Bao,
        userName: "Lê Quốc Bảo",
        action: "Hủy đơn hàng",
        details: `Hủy đơn hàng #${createdOrders[4].id}`,
        status: "Thành công",
      },
      {
        userId: userId_Bao,
        userName: "Lê Quốc Bảo",
        action: "Xác nhận nhận hàng",
        details: "Đã nhận ví da bò - Đơn gia công hoàn thành",
        status: "Thành công",
      },
      {
        userId: userId_Mai,
        userName: "Võ Thị Mai",
        action: "Cố gắng truy cập trái phép",
        details: "Người dùng này đã cố mò vào trang Dashboard",
        status: "Bị chặn",
      },
      {
        userId: userId_Minh,
        userName: "Trần Văn Minh",
        action: "Đăng ký làm thợ",
        details: "Hồ sơ thợ đã được duyệt bởi Admin",
        status: "Thành công",
      },
      {
        userId: userId_Bao,
        userName: "Lê Quốc Bảo",
        action: "Hủy đơn gia công sau khi cọc",
        details: `Hủy đơn #${createdCustomOrders[5].id} — mất cọc ${depositAmount_C5.toLocaleString("vi-VN")}đ`,
        status: "Thành công",
      },
    ];
    await Log.bulkCreate(logsData);
    console.log(`✅ [10/10] Đã tạo ${logsData.length} bản ghi nhật ký.`);

    // ─── TỔNG KẾT ────────────────────────────────────────────────────────────
    console.log("\n╔══════════════════════════════════════╗");
    console.log("║         ✨ SEED HOÀN TẤT ✨            ║");
    console.log("╚══════════════════════════════════════╝");
    console.log("\n📊 Tóm tắt dữ liệu đã tạo:");
    console.log(
      `   👥 Users:          ${createdUsers.length} (1 admin + ${createdUsers.length - 1} user)`,
    );
    console.log(`   🧶 Products:       ${createdProducts.length}`);
    console.log(
      `   📦 Orders:         ${createdOrders.length} (đủ mọi trạng thái)`,
    );
    console.log(
      `   🛠  MakerProfiles:  ${createdMakerProfiles.length} (2 duyệt / 1 chờ / 1 từ chối)`,
    );
    console.log(
      `   🎨 CustomOrders:   ${createdCustomOrders.length} (hoàn thành / đang làm / hủy mất cọc / hủy thường)`,
    );
    console.log(`   💬 Bids:           ${createdBids.length}`);
    console.log(`   ⭐ Reviews:        ${createdReviews.length}`);
    console.log(`   💰 CommissionDebts: 2 (da_thu — ZaloPay tự thu)`);
    console.log(`   💵 MakerPayouts:   2 (cho_tra — chờ admin chuyển khoản)`);
    console.log(`   🕵️  Logs:           ${logsData.length}`);
    console.log("\n🔑 Tài khoản mẫu:");
    console.log("   Admin:  admin@pinky.com  /  admin123");
    console.log(
      "   Thợ 1:  lan@gmail.com    /  user123   (da_duyet, Thợ Bạc 🥈)",
    );
    console.log(
      "   Thợ 2:  minh@gmail.com   /  user123   (da_duyet, Thợ Đồng 🥉)",
    );
    console.log(
      "   Thợ 3:  hoa@gmail.com    /  user123   (cho_duyet — chờ duyệt)",
    );
    console.log("   Khách:  bao@gmail.com    /  user123   (khách hàng thuần)");
    console.log(
      "   Thợ X:  mai@gmail.com    /  user123   (tu_choi — bị từ chối)\n",
    );

    console.log("📋 Scenario demo:");
    console.log("   [0] Túi tote len       — Đang tìm thợ (2 bid)");
    console.log("   [1] Nến thơm cà phê    — Đang thực hiện (đã cọc 50%)");
    console.log(
      "   [2] Ví da bò           — Hoàn thành (ZaloPay đủ, có review ⭐5)",
    );
    console.log("   [3] Vòng tay đá        — Đang tìm thợ (1 bid)");
    console.log("   [4] Tranh thêu thú     — Đang tìm thợ (chưa bid)");
    console.log(
      "   [5] Thỏ bông móc len   — Đã hủy SAU CỌC (Bao mất cọc, Lan giữ)",
    );
    console.log("   [6] Móc gấu trúc       — Đã hủy trước cọc\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ LỖI SEED DATABASE:", err.message);
    console.error(err);
    process.exit(1);
  }
};

seedAll();
