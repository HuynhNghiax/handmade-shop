/**
 * seedAll.js — Seed toàn bộ database local PinkyCrafts
 * Chạy: node server/seedAll.js
 *
 * Thứ tự seed: Users → Products → Orders → MakerProfiles → CustomOrders → Bids → Reviews → ProductReviews → CommissionDebts → MakerPayouts → Logs
 * Dùng { force: true } → XÓA SẠCH tất cả bảng và tạo lại.
 * CHỈ DÙNG CHO MÔI TRƯỜNG LOCAL / DEVELOPMENT!
 */

require("dotenv").config({ path: __dirname + "/.env" });
const bcrypt = require("bcryptjs");

const sequelize = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const ProductReview = require("./models/ProductReview");
const Order = require("./models/Order");
const CustomOrder = require("./models/CustomOrder");
const Bid = require("./models/Bid");
const Log = require("./models/Log");
const MakerProfile = require("./models/Makerprofile");
const Review = require("./models/Review");
const CommissionDebt = require("./models/Commissiondebt");
const MakerPayout = require("./models/makerpayout");
const { COMMISSION, MAKER_BADGE } = require("./constants/business");
require("./models/associations");

// Helper tạo ngày lùi về quá khứ
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const calc = (price, rate = 10) => COMMISSION.calculate(price, rate);

// ─── 1. USERS (12 người) ──────────────────────────────────────────────────
const usersData = [
  {
    name: "Admin PinkyCrafts",
    email: "admin@pinkycrafts.vn",
    password: "admin123",
    isAdmin: true,
    isMaker: false,
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    avatar: "/uploads/avatar_admin.png",
  },
  {
    name: "Nguyễn Thị Lan",
    email: "lan@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true,
    phone: "0912345678",
    address: "45 Lê Lợi, Q.3, TP.HCM",
    avatar: "/uploads/avatar_lan.png",
  },
  {
    name: "Trần Văn Minh",
    email: "minh@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true,
    phone: "0987654321",
    address: "78 Trần Hưng Đạo, Q.5, TP.HCM",
    avatar: "/uploads/avatar_minh.png",
  },
  {
    name: "Lê Thị Thu Hà",
    email: "ha@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true,
    phone: "0933221144",
    address: "22 Pasteur, Q.1, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Le+Thi+Thu+Ha&background=fde68a&color=b45309&size=128",
  },
  {
    name: "Phạm Thị Hoa",
    email: "hoa@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0976543210",
    address: "12 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Pham+Thi+Hoa&background=d1fae5&color=059669&size=128",
  },
  {
    name: "Võ Thị Mai",
    email: "mai@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0954321098",
    address: "56 Cách Mạng Tháng 8, Q.3, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Vo+Thi+Mai&background=ede9fe&color=7c3aed&size=128",
  },
  {
    name: "Lê Quốc Bảo",
    email: "bao@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0965432109",
    address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Le+Quoc+Bao&background=fef3c7&color=d97706&size=128",
  },
  {
    name: "Võ Minh Khoa",
    email: "khoa@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0942113355",
    address: "34 Cống Quỳnh, Q.1, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Vo+Minh+Khoa&background=ede9fe&color=7c3aed&size=128",
  },
  {
    name: "Nguyễn Bảo Châu",
    email: "chau@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0919887766",
    address: "5 Lý Tự Trọng, Q.1, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Bao+Chau&background=fce7f3&color=db2777&size=128",
  },
  {
    name: "Trần Thị Linh",
    email: "linh@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0911223344",
    address: "200 Lê Văn Sỹ, Q.3, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Tran+Thi+Linh&background=e0f2fe&color=0369a1&size=128",
  },
  {
    name: "Nguyễn Anh Tuấn",
    email: "tuan@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true,
    phone: "0988776655",
    address: "10 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Anh+Tuan&background=dcfce7&color=16a34a&size=128",
  },
  {
    name: "Đinh Thị Nga",
    email: "nga@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0977665544",
    address: "88 Hoàng Diệu, Q.4, TP.HCM",
    avatar: "https://ui-avatars.com/api/?name=Dinh+Thi+Nga&background=fff7ed&color=ea580c&size=128",
  },
];

// ─── 2. PRODUCTS (20 sản phẩm) ──────────────────────────────────────────────
const productsData = [
  {
    name: "Vòng Tay Đá Phong Thủy Hạt Đen",
    price: 185000,
    category: "Trang sức",
    img: "/uploads/download.webp",
    desc: "Vòng tay đá phong thủy đính hạt charm bạc chạm khắc tinh xảo, mang lại may mắn, bình an và năng lượng mạnh mẽ.",
    quantity: 25,
  },
  {
    name: "Vòng Tay Charm Nơ Ngọc Trai Pastel",
    price: 120000,
    category: "Trang sức",
    img: "/uploads/download (1).webp",
    desc: "Vòng tay charm nơ điệu đà đính ngọc trai nhân tạo và các hạt màu hồng phấn nhẹ nhàng cho các nàng thơ phong cách bánh bèo.",
    quantity: 15,
  },
  {
    name: "Vòng Tay Chỉ Đỏ Thắt Charm Hoa Đào",
    price: 85000,
    category: "Trang sức",
    img: "/uploads/download (2).webp",
    desc: "Vòng tay chỉ đỏ may mắn được tết thủ công khéo léo kết hợp charm hoa đào xinh xắn, thích hợp đeo đôi hoặc tặng bạn bè.",
    quantity: 40,
  },
  {
    name: "Trâm Cài Áo Hoa Hồng Xanh Coban",
    price: 150000,
    category: "Trang sức",
    img: "/uploads/download (3).webp",
    desc: "Trâm cài hoa hồng làm bằng vải voan và lụa thủ công cao cấp màu xanh Coban rực rỡ, đính hạt ngọc trai thanh lịch.",
    quantity: 20,
  },
  {
    name: "Trâm Hoa Cài Áo Phấn Hồng Daisy",
    price: 165000,
    category: "Trang sức",
    img: "/uploads/download (4).webp",
    desc: "Trâm hoa cài áo handmade hình hoa cúc Daisy màu hồng phấn ngọt ngào, đựng trong hộp quà đen sang trọng.",
    quantity: 18,
  },
  {
    name: "Trâm Cài Áo Hoa Hồng Kem Cổ Điển",
    price: 150000,
    category: "Trang sức",
    img: "/uploads/download (5).webp",
    desc: "Bông hoa cài áo màu kem chế tác thủ công tinh xảo, làm tăng thêm điểm nhấn quý phái cho áo vest, váy tiệc.",
    quantity: 12,
  },
  {
    name: "Túi Xách Da Handmade Hồng Thắt Nơ Lụa",
    price: 1250000,
    category: "Đồ da",
    img: "/uploads/1a567905f6b827cc073cd777623c4c3c.jpg",
    desc: "Túi xách da thật khâu tay 100% màu hồng phấn sang trọng, quai xách được quấn khăn lụa phong cách Paris thời thượng.",
    quantity: 5,
  },
  {
    name: "Túi Da Đeo Chéo Monogram Họa Tiết",
    price: 1450000,
    category: "Đồ da",
    img: "/uploads/OIP.webp",
    desc: "Túi đeo chéo chất liệu da cao cấp dập nổi monogram độc đáo kết hợp da màu hồng pastel, khóa kim loại mạ vàng sang trọng.",
    quantity: 8,
  },
  {
    name: "Túi Hộp Da Khâu Tay Nơ Lụa",
    price: 1350000,
    category: "Đồ da",
    img: "/uploads/OIP (1).webp",
    desc: "Mẫu túi hộp da thật khâu tay tỉ mỉ với nơ lụa quấn quai tinh tế, ngăn chứa rộng rãi, thích hợp diện đi tiệc hay dạo phố.",
    quantity: 6,
  },
  {
    name: "Túi Da Mini Crossbody Cổ Điển",
    price: 980000,
    category: "Đồ da",
    img: "/uploads/OIP (2).webp",
    desc: "Túi da đeo chéo mini màu kem dịu nhẹ dập vân chìm sang trọng, khóa xoay kim loại chắc chắn.",
    quantity: 10,
  },
  {
    name: "Túi Da Tròn Họa Tiết Hoa Đào",
    price: 1100000,
    category: "Đồ da",
    img: "/uploads/OIP (3).webp",
    desc: "Thiết kế túi da dáng tròn độc đáo vẽ/in họa tiết hoa đào nở rộ trên nền da nâu đen cá tính, dây xích đeo chéo sang xịn.",
    quantity: 7,
  },
  {
    name: "Túi Da Đeo Vai Dập Vân Chữ Nổi",
    price: 1550000,
    category: "Đồ da",
    img: "/uploads/OIP (4).webp",
    desc: "Túi đeo vai dáng chữ nhật da thật dập vân thương hiệu cao cấp, đi kèm dây đeo xích vàng mảnh thời thượng.",
    quantity: 4,
  },
  {
    name: "Vòng Tay Hạt Ngọc Ngôi Sao Lấp Lánh",
    price: 95000,
    category: "Trang sức",
    img: "/uploads/OIP (5).webp",
    desc: "Vòng tay thiết kế nhẹ nhàng với các hạt đá thạch anh tím nhạt xen kẽ charm ngôi sao phản quang lấp lánh.",
    quantity: 30,
  },
  {
    name: "Vòng Tay Dây Tết Vintage LEO",
    price: 70000,
    category: "Trang sức",
    img: "/uploads/OIP (6).webp",
    desc: "Vòng tay dây cói và dây da tết tay phong cách vintage, mộc mạc, phù hợp cho cả nam và nữ yêu thích sự giản dị.",
    quantity: 25,
  },
  {
    name: "Vòng Tay Chỉ Ngũ Sắc May Mắn",
    price: 60000,
    category: "Trang sức",
    img: "/uploads/OIP (7).webp",
    desc: "Vòng tay tết chỉ ngũ sắc theo phong cách truyền thống hộ mệnh, mang lại may mắn, bình an cho người đeo.",
    quantity: 50,
  },
  {
    name: "Trâm Cài Áo Hoa Trà Nâu Đỏ Quý Phái",
    price: 155000,
    category: "Trang sức",
    img: "/uploads/OIP (8).webp",
    desc: "Bông hoa trà cài áo màu nâu đỏ ấm áp, nhụy hoa đính ngọc trai viền hạt đá lấp lánh sang trọng.",
    quantity: 15,
  },
  {
    name: "Hộp Hoa Cài Áo Lụa Tam Sắc",
    price: 280000,
    category: "Quà tặng",
    img: "/uploads/OIP (9).webp",
    desc: "Bộ 3 bông hoa cài áo bằng lụa cao cấp phối màu tam sắc tinh tế (Hồng - Vàng - Trắng) đặt trong hộp quà trang nhã.",
    quantity: 12,
  },
  {
    name: "Mũ Cói Rộng Vành Đính Nơ Cam",
    price: 240000,
    category: "Len & Đan",
    img: "/uploads/OIP (10).webp",
    desc: "Mũ cói đi biển đan tay thủ công từ sợi cói tự nhiên mềm mại, đính nơ ruy băng màu cam đất vintage cực xinh.",
    quantity: 20,
  },
  {
    name: "Mũ Cói Đan Hoa Xanh Cỏ",
    price: 250000,
    category: "Len & Đan",
    img: "/uploads/OIP (11).webp",
    desc: "Mũ cói rộng vành đan tay cách điệu, đính kèm bông hoa len xanh lá đan móc tinh xảo làm điểm nhấn nổi bật.",
    quantity: 15,
  },
  {
    name: "Mũ Cói Tròn Vintage Che Nắng",
    price: 230000,
    category: "Len & Đan",
    img: "/uploads/OIP (12).webp",
    desc: "Dáng mũ cói tròn cổ điển, vành vừa phải thời trang, chất liệu cói tự nhiên thoáng mát thích hợp đi dã ngoại.",
    quantity: 15,
  },
  {
    name: "Mũ Cói Hoa Hướng Dương Vàng",
    price: 260000,
    category: "Len & Đan",
    img: "/uploads/OIP (13).webp",
    desc: "Mũ cói màu vàng rơm ấm áp nổi bật với bông hoa hướng dương len đan móc thủ công to bản ở bên hông vành mũ.",
    quantity: 10,
  },
  {
    name: "Mũ Cói Thắt Nơ Xanh Lục Bảo",
    price: 245000,
    category: "Len & Đan",
    img: "/uploads/OIP (14).webp",
    desc: "Mũ cói rộng vành đan thủ công mềm mại phối cùng nơ vải voan màu xanh lục bảo thanh lịch.",
    quantity: 12,
  },
  {
    name: "Giày Oxford Da Cá Sấu Xanh Emerald",
    price: 2850000,
    category: "Đồ da",
    img: "/uploads/OIP (15).webp",
    desc: "Đôi giày Oxford nam làm từ da thật dập vân cá sấu đánh màu patina xanh Emerald độc đáo, khâu đế Goodyear đẳng cấp.",
    quantity: 3,
  },
  {
    name: "Giày Da Nam Patina Nâu Cổ Điển",
    price: 2450000,
    category: "Đồ da",
    img: "/uploads/OIP (16).webp",
    desc: "Giày da nam cao cấp khâu tay toàn bộ, gót và thân giày đánh màu patina nâu hổ phách cổ điển, sang trọng.",
    quantity: 5,
  },
  {
    name: "Giày Oxford Da Cá Sấu Vàng Bò",
    price: 2800000,
    category: "Đồ da",
    img: "/uploads/OIP (17).webp",
    desc: "Giày Oxford da thật dập vân cá sấu phối màu vàng bò patina sang trọng lịch lãm cho quý ông công sở.",
    quantity: 4,
  },
  {
    name: "Giày Loafer Da Cá Sấu Chuông Tua Rua",
    price: 2650000,
    category: "Đồ da",
    img: "/uploads/OIP (18).webp",
    desc: "Giày da nam kiểu Loafer trẻ trung đính chuông tua rua cá tính, chất da thật dập vân cá sấu phối màu vàng Patina cực chất.",
    quantity: 6,
  },
  {
    name: "Giày Tây Da Thật Xanh Patina Goodyear",
    price: 2950000,
    category: "Đồ da",
    img: "/uploads/OIP (19).webp",
    desc: "Đôi giày tây nam da bò thật cao cấp khâu Goodyear siêu bền, lên màu patina xanh ngọc lục bảo huyền bí.",
    quantity: 3,
  },
  {
    name: "Giày Lười Len Móc Cầu Vồng Sinh Động",
    price: 320000,
    category: "Len & Đan",
    img: "/uploads/OIP (20).webp",
    desc: "Đôi giày lười được đan móc tay bằng sợi len cotton sắc màu cầu vồng nổi bật, đế cao su êm ái thoáng chân.",
    quantity: 10,
  },
];

const seedAll = async () => {
  try {
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║   🌸  PINKYCRAFTS — SEED DATABASE 🌸     ║");
    console.log("╚══════════════════════════════════════════╝\n");

    // 1. Kết nối DB
    await sequelize.authenticate();
    console.log("✅ [1/11] Kết nối database thành công.");

    // 2. Sync tất cả models
    await sequelize.sync({ force: true });
    console.log("✅ [2/11] Đã tạo lại toàn bộ bảng (force sync).");

    // 3. Seed Users
    const hashedUsers = await Promise.all(
      usersData.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );
    const createdUsers = await User.bulkCreate(hashedUsers);
    console.log(`✅ [3/11] Đã tạo ${createdUsers.length} người dùng.`);

    const uid = {
      admin: createdUsers[0].id,
      lan: createdUsers[1].id,
      minh: createdUsers[2].id,
      ha: createdUsers[3].id,
      hoa: createdUsers[4].id,
      mai: createdUsers[5].id,
      bao: createdUsers[6].id,
      khoa: createdUsers[7].id,
      chau: createdUsers[8].id,
      linh: createdUsers[9].id,
      tuan: createdUsers[10].id,
      nga: createdUsers[11].id,
    };

    // 4. Seed Products
    const createdProducts = await Product.bulkCreate(productsData);
    console.log(`✅ [4/11] Đã tạo ${createdProducts.length} sản phẩm.`);

    const P = createdProducts; // shorthand

    // 5. Seed Orders (đơn hàng shop thường - 12 đơn)
    const ordersData = [
      {
        userId: uid.bao,
        products: [
          { id: P[0].id, name: P[0].name, img: P[0].img, price: 185000, quantity: 2 },
          { id: P[9].id, name: P[9].name, img: P[9].img, price: 210000, quantity: 1 },
        ],
        totalAmount: 610000,
        address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
        phone: "0965432109",
        status: "Hoàn thành",
        paymentMethod: "ZaloPay",
        paymentStatus: "paid",
        zpTransId: "seed_shop_order_1",
        zpPaidAt: daysAgo(25),
        createdAt: daysAgo(30),
        updatedAt: daysAgo(25),
      },
      {
        userId: uid.bao,
        products: [
          { id: P[16].id, name: P[16].name, img: P[16].img, price: 680000, quantity: 1 },
        ],
        totalAmount: 710000,
        address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
        phone: "0965432109",
        status: "Đang giao",
        paymentMethod: "COD",
        paymentStatus: "pending",
        createdAt: daysAgo(3),
        updatedAt: daysAgo(2),
      },
      {
        userId: uid.bao,
        products: [
          { id: P[10].id, name: P[10].name, img: P[10].img, price: 360000, quantity: 1 },
        ],
        totalAmount: 390000,
        address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
        phone: "0965432109",
        status: "Đã hủy",
        paymentMethod: "COD",
        paymentStatus: "pending",
        createdAt: daysAgo(10),
        updatedAt: daysAgo(9),
      },
      {
        userId: uid.khoa,
        products: [
          { id: P[4].id, name: P[4].name, img: P[4].img, price: 280000, quantity: 1 },
          { id: P[6].id, name: P[6].name, img: P[6].img, price: 520000, quantity: 1 },
        ],
        totalAmount: 830000,
        address: "34 Cống Quỳnh, Q.1, TP.HCM",
        phone: "0942113355",
        status: "Hoàn thành",
        paymentMethod: "ZaloPay",
        paymentStatus: "paid",
        zpTransId: "seed_shop_order_2",
        zpPaidAt: daysAgo(20),
        createdAt: daysAgo(25),
        updatedAt: daysAgo(20),
      },
      {
        userId: uid.khoa,
        products: [
          { id: P[11].id, name: P[11].name, img: P[11].img, price: 75000, quantity: 3 },
          { id: P[9].id, name: P[9].name, img: P[9].img, price: 210000, quantity: 2 },
        ],
        totalAmount: 645000,
        address: "34 Cống Quỳnh, Q.1, TP.HCM",
        phone: "0942113355",
        status: "Chờ xác nhận",
        paymentMethod: "COD",
        paymentStatus: "pending",
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      {
        userId: uid.chau,
        products: [
          { id: P[1].id, name: P[1].name, img: P[1].img, price: 320000, quantity: 1 },
          { id: P[2].id, name: P[2].name, img: P[2].img, price: 95000, quantity: 2 },
        ],
        totalAmount: 540000,
        address: "5 Lý Tự Trọng, Q.1, TP.HCM",
        phone: "0919887766",
        status: "Chờ xác nhận",
        paymentMethod: "COD",
        paymentStatus: "pending",
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        userId: uid.chau,
        products: [
          { id: P[13].id, name: P[13].name, img: P[13].img, price: 390000, quantity: 1 },
          { id: P[14].id, name: P[14].name, img: P[14].img, price: 265000, quantity: 2 },
        ],
        totalAmount: 950000,
        address: "5 Lý Tự Trọng, Q.1, TP.HCM",
        phone: "0919887766",
        status: "Hoàn thành",
        paymentMethod: "ZaloPay",
        paymentStatus: "paid",
        zpTransId: "seed_shop_order_3",
        zpPaidAt: daysAgo(15),
        createdAt: daysAgo(18),
        updatedAt: daysAgo(15),
      },
      {
        userId: uid.linh,
        products: [
          { id: P[5].id, name: P[5].name, img: P[5].img, price: 450000, quantity: 1 },
          { id: P[12].id, name: P[12].name, img: P[12].img, price: 180000, quantity: 2 },
        ],
        totalAmount: 840000,
        address: "200 Lê Văn Sỹ, Q.3, TP.HCM",
        phone: "0911223344",
        status: "Hoàn thành",
        paymentMethod: "ZaloPay",
        paymentStatus: "paid",
        zpTransId: "seed_shop_order_4",
        zpPaidAt: daysAgo(12),
        createdAt: daysAgo(14),
        updatedAt: daysAgo(12),
      },
      {
        userId: uid.nga,
        products: [
          { id: P[3].id, name: P[3].name, img: P[3].img, price: 250000, quantity: 1 },
          { id: P[8].id, name: P[8].name, img: P[8].img, price: 340000, quantity: 1 },
        ],
        totalAmount: 620000,
        address: "88 Hoàng Diệu, Q.4, TP.HCM",
        phone: "0977665544",
        status: "Đang giao",
        paymentMethod: "COD",
        paymentStatus: "pending",
        createdAt: daysAgo(2),
        updatedAt: daysAgo(1),
      },
      {
        userId: uid.bao,
        products: [
          { id: P[15].id, name: P[15].name, img: P[15].img, price: 230000, quantity: 1 },
        ],
        totalAmount: 260000,
        address: "99 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM",
        phone: "0965432109",
        status: "Hoàn thành",
        paymentMethod: "COD",
        paymentStatus: "paid",
        createdAt: daysAgo(60),
        updatedAt: daysAgo(55),
      },
      {
        userId: uid.khoa,
        products: [
          { id: P[18].id, name: P[18].name, img: P[18].img, price: 850000, quantity: 1 },
        ],
        totalAmount: 880000,
        address: "34 Cống Quỳnh, Q.1, TP.HCM",
        phone: "0942113355",
        status: "Hoàn thành",
        paymentMethod: "ZaloPay",
        paymentStatus: "paid",
        zpTransId: "seed_shop_order_5",
        zpPaidAt: daysAgo(45),
        createdAt: daysAgo(50),
        updatedAt: daysAgo(45),
      },
      {
        userId: uid.chau,
        products: [
          { id: P[17].id, name: P[17].name, img: P[17].img, price: 145000, quantity: 3 },
          { id: P[9].id, name: P[9].name, img: P[9].img, price: 210000, quantity: 1 },
        ],
        totalAmount: 645000,
        address: "5 Lý Tự Trọng, Q.1, TP.HCM",
        phone: "0919887766",
        status: "Hoàn thành",
        paymentMethod: "ZaloPay",
        paymentStatus: "paid",
        zpTransId: "seed_shop_order_6",
        zpPaidAt: daysAgo(40),
        createdAt: daysAgo(42),
        updatedAt: daysAgo(40),
      },
      // ── BỔ SUNG 30 đơn để biểu đồ đa dạng (trải 60 ngày qua) ──
      // --- Ngày 1-3 ---
      {
        userId: uid.hoa, products: [{ id: P[0].id, name: P[0].name, img: P[0].img, price: 185000, quantity: 1 }, { id: P[2].id, name: P[2].name, img: P[2].img, price: 85000, quantity: 2 }],
        totalAmount: 355000, address: "12 Hai Bà Trưng, Q.BT, TP.HCM", phone: "0976543210",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(1), updatedAt: daysAgo(1),
      },
      {
        userId: uid.mai, products: [{ id: P[16].id, name: P[16].name, img: P[16].img, price: 280000, quantity: 1 }],
        totalAmount: 280000, address: "56 CMT8, Q.3, TP.HCM", phone: "0954321098",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_7", zpPaidAt: daysAgo(2),
        createdAt: daysAgo(2), updatedAt: daysAgo(2),
      },
      {
        userId: uid.tuan, products: [{ id: P[6].id, name: P[6].name, img: P[6].img, price: 1250000, quantity: 1 }],
        totalAmount: 1250000, address: "77 Lê Đại Hành, Q.11, TP.HCM", phone: "0988112233",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_8", zpPaidAt: daysAgo(3),
        createdAt: daysAgo(3), updatedAt: daysAgo(3),
      },
      // --- Ngày 4-7 ---
      {
        userId: uid.nga, products: [{ id: P[12].id, name: P[12].name, img: P[12].img, price: 95000, quantity: 3 }, { id: P[13].id, name: P[13].name, img: P[13].img, price: 70000, quantity: 2 }],
        totalAmount: 425000, address: "88 Hoàng Diệu, Q.4, TP.HCM", phone: "0977665544",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(5), updatedAt: daysAgo(4),
      },
      {
        userId: uid.linh, products: [{ id: P[17].id, name: P[17].name, img: P[17].img, price: 240000, quantity: 2 }],
        totalAmount: 480000, address: "200 Lê Văn Sỹ, Q.3, TP.HCM", phone: "0911223344",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_9", zpPaidAt: daysAgo(5),
        createdAt: daysAgo(6), updatedAt: daysAgo(5),
      },
      {
        userId: uid.bao, products: [{ id: P[8].id, name: P[8].name, img: P[8].img, price: 1350000, quantity: 1 }],
        totalAmount: 1350000, address: "99 Đinh Tiên Hoàng, Q.BT, TP.HCM", phone: "0965432109",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(7), updatedAt: daysAgo(6),
      },
      // --- Ngày 8-12 ---
      {
        userId: uid.khoa, products: [{ id: P[1].id, name: P[1].name, img: P[1].img, price: 120000, quantity: 2 }, { id: P[4].id, name: P[4].name, img: P[4].img, price: 165000, quantity: 1 }],
        totalAmount: 405000, address: "34 Cống Quỳnh, Q.1, TP.HCM", phone: "0942113355",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_10", zpPaidAt: daysAgo(8),
        createdAt: daysAgo(9), updatedAt: daysAgo(8),
      },
      {
        userId: uid.chau, products: [{ id: P[15].id, name: P[15].name, img: P[15].img, price: 155000, quantity: 2 }, { id: P[3].id, name: P[3].name, img: P[3].img, price: 150000, quantity: 1 }],
        totalAmount: 460000, address: "5 Lý Tự Trọng, Q.1, TP.HCM", phone: "0919887766",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(10), updatedAt: daysAgo(9),
      },
      {
        userId: uid.hoa, products: [{ id: P[20].id, name: P[20].name, img: P[20].img, price: 320000, quantity: 1 }],
        totalAmount: 320000, address: "12 Hai Bà Trưng, Q.BT, TP.HCM", phone: "0976543210",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_11", zpPaidAt: daysAgo(11),
        createdAt: daysAgo(12), updatedAt: daysAgo(11),
      },
      // --- Ngày 13-17 ---
      {
        userId: uid.mai, products: [{ id: P[9].id, name: P[9].name, img: P[9].img, price: 980000, quantity: 1 }, { id: P[14].id, name: P[14].name, img: P[14].img, price: 60000, quantity: 3 }],
        totalAmount: 1160000, address: "56 CMT8, Q.3, TP.HCM", phone: "0954321098",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_12", zpPaidAt: daysAgo(13),
        createdAt: daysAgo(14), updatedAt: daysAgo(13),
      },
      {
        userId: uid.tuan, products: [{ id: P[16].id, name: P[16].name, img: P[16].img, price: 280000, quantity: 1 }, { id: P[17].id, name: P[17].name, img: P[17].img, price: 240000, quantity: 1 }],
        totalAmount: 520000, address: "77 Lê Đại Hành, Q.11, TP.HCM", phone: "0988112233",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(15), updatedAt: daysAgo(15),
      },
      {
        userId: uid.nga, products: [{ id: P[7].id, name: P[7].name, img: P[7].img, price: 1450000, quantity: 1 }],
        totalAmount: 1450000, address: "88 Hoàng Diệu, Q.4, TP.HCM", phone: "0977665544",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_13", zpPaidAt: daysAgo(16),
        createdAt: daysAgo(17), updatedAt: daysAgo(16),
      },
      // --- Ngày 18-22 ---
      {
        userId: uid.linh, products: [{ id: P[5].id, name: P[5].name, img: P[5].img, price: 150000, quantity: 2 }],
        totalAmount: 300000, address: "200 Lê Văn Sỹ, Q.3, TP.HCM", phone: "0911223344",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(18), updatedAt: daysAgo(18),
      },
      {
        userId: uid.bao, products: [{ id: P[19].id, name: P[19].name, img: P[19].img, price: 250000, quantity: 1 }, { id: P[18].id, name: P[18].name, img: P[18].img, price: 245000, quantity: 1 }],
        totalAmount: 495000, address: "99 Đinh Tiên Hoàng, Q.BT, TP.HCM", phone: "0965432109",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_14", zpPaidAt: daysAgo(19),
        createdAt: daysAgo(20), updatedAt: daysAgo(19),
      },
      {
        userId: uid.khoa, products: [{ id: P[10].id, name: P[10].name, img: P[10].img, price: 1100000, quantity: 1 }],
        totalAmount: 1100000, address: "34 Cống Quỳnh, Q.1, TP.HCM", phone: "0942113355",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_15", zpPaidAt: daysAgo(21),
        createdAt: daysAgo(22), updatedAt: daysAgo(21),
      },
      // --- Ngày 23-28 ---
      {
        userId: uid.chau, products: [{ id: P[0].id, name: P[0].name, img: P[0].img, price: 185000, quantity: 3 }],
        totalAmount: 555000, address: "5 Lý Tự Trọng, Q.1, TP.HCM", phone: "0919887766",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(23), updatedAt: daysAgo(23),
      },
      {
        userId: uid.hoa, products: [{ id: P[11].id, name: P[11].name, img: P[11].img, price: 1550000, quantity: 1 }],
        totalAmount: 1550000, address: "12 Hai Bà Trưng, Q.BT, TP.HCM", phone: "0976543210",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_16", zpPaidAt: daysAgo(24),
        createdAt: daysAgo(25), updatedAt: daysAgo(24),
      },
      {
        userId: uid.mai, products: [{ id: P[2].id, name: P[2].name, img: P[2].img, price: 85000, quantity: 4 }, { id: P[12].id, name: P[12].name, img: P[12].img, price: 95000, quantity: 2 }],
        totalAmount: 530000, address: "56 CMT8, Q.3, TP.HCM", phone: "0954321098",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(26), updatedAt: daysAgo(26),
      },
      {
        userId: uid.tuan, products: [{ id: P[21].id, name: P[21].name, img: P[21].img, price: 2850000, quantity: 1 }],
        totalAmount: 2850000, address: "77 Lê Đại Hành, Q.11, TP.HCM", phone: "0988112233",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_17", zpPaidAt: daysAgo(27),
        createdAt: daysAgo(28), updatedAt: daysAgo(27),
      },
      // --- Ngày 29-35 ---
      {
        userId: uid.nga, products: [{ id: P[3].id, name: P[3].name, img: P[3].img, price: 150000, quantity: 2 }, { id: P[5].id, name: P[5].name, img: P[5].img, price: 150000, quantity: 1 }],
        totalAmount: 450000, address: "88 Hoàng Diệu, Q.4, TP.HCM", phone: "0977665544",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(29), updatedAt: daysAgo(29),
      },
      {
        userId: uid.linh, products: [{ id: P[22].id, name: P[22].name, img: P[22].img, price: 2450000, quantity: 1 }],
        totalAmount: 2450000, address: "200 Lê Văn Sỹ, Q.3, TP.HCM", phone: "0911223344",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_18", zpPaidAt: daysAgo(31),
        createdAt: daysAgo(32), updatedAt: daysAgo(31),
      },
      {
        userId: uid.bao, products: [{ id: P[20].id, name: P[20].name, img: P[20].img, price: 320000, quantity: 2 }],
        totalAmount: 640000, address: "99 Đinh Tiên Hoàng, Q.BT, TP.HCM", phone: "0965432109",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(34), updatedAt: daysAgo(33),
      },
      // --- Ngày 36-45 ---
      {
        userId: uid.khoa, products: [{ id: P[4].id, name: P[4].name, img: P[4].img, price: 165000, quantity: 2 }, { id: P[1].id, name: P[1].name, img: P[1].img, price: 120000, quantity: 3 }],
        totalAmount: 690000, address: "34 Cống Quỳnh, Q.1, TP.HCM", phone: "0942113355",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_19", zpPaidAt: daysAgo(36),
        createdAt: daysAgo(37), updatedAt: daysAgo(36),
      },
      {
        userId: uid.chau, products: [{ id: P[23].id, name: P[23].name, img: P[23].img, price: 2800000, quantity: 1 }],
        totalAmount: 2800000, address: "5 Lý Tự Trọng, Q.1, TP.HCM", phone: "0919887766",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_20", zpPaidAt: daysAgo(38),
        createdAt: daysAgo(39), updatedAt: daysAgo(38),
      },
      {
        userId: uid.hoa, products: [{ id: P[14].id, name: P[14].name, img: P[14].img, price: 60000, quantity: 5 }],
        totalAmount: 300000, address: "12 Hai Bà Trưng, Q.BT, TP.HCM", phone: "0976543210",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(41), updatedAt: daysAgo(41),
      },
      {
        userId: uid.mai, products: [{ id: P[8].id, name: P[8].name, img: P[8].img, price: 1350000, quantity: 1 }, { id: P[16].id, name: P[16].name, img: P[16].img, price: 280000, quantity: 1 }],
        totalAmount: 1630000, address: "56 CMT8, Q.3, TP.HCM", phone: "0954321098",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_21", zpPaidAt: daysAgo(43),
        createdAt: daysAgo(44), updatedAt: daysAgo(43),
      },
      // --- Ngày 46-60 (tháng trước) ---
      {
        userId: uid.tuan, products: [{ id: P[13].id, name: P[13].name, img: P[13].img, price: 70000, quantity: 4 }, { id: P[0].id, name: P[0].name, img: P[0].img, price: 185000, quantity: 2 }],
        totalAmount: 650000, address: "77 Lê Đại Hành, Q.11, TP.HCM", phone: "0988112233",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(47), updatedAt: daysAgo(46),
      },
      {
        userId: uid.nga, products: [{ id: P[24].id, name: P[24].name, img: P[24].img, price: 2650000, quantity: 1 }],
        totalAmount: 2650000, address: "88 Hoàng Diệu, Q.4, TP.HCM", phone: "0977665544",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_22", zpPaidAt: daysAgo(49),
        createdAt: daysAgo(50), updatedAt: daysAgo(49),
      },
      {
        userId: uid.linh, products: [{ id: P[19].id, name: P[19].name, img: P[19].img, price: 250000, quantity: 2 }, { id: P[17].id, name: P[17].name, img: P[17].img, price: 240000, quantity: 1 }],
        totalAmount: 740000, address: "200 Lê Văn Sỹ, Q.3, TP.HCM", phone: "0911223344",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(52), updatedAt: daysAgo(52),
      },
      {
        userId: uid.bao, products: [{ id: P[7].id, name: P[7].name, img: P[7].img, price: 1450000, quantity: 1 }, { id: P[2].id, name: P[2].name, img: P[2].img, price: 85000, quantity: 2 }],
        totalAmount: 1620000, address: "99 Đinh Tiên Hoàng, Q.BT, TP.HCM", phone: "0965432109",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_23", zpPaidAt: daysAgo(54),
        createdAt: daysAgo(55), updatedAt: daysAgo(54),
      },
      {
        userId: uid.khoa, products: [{ id: P[25].id, name: P[25].name, img: P[25].img, price: 2950000, quantity: 1 }],
        totalAmount: 2950000, address: "34 Cống Quỳnh, Q.1, TP.HCM", phone: "0942113355",
        status: "Hoàn thành", paymentMethod: "ZaloPay", paymentStatus: "paid",
        zpTransId: "seed_shop_order_24", zpPaidAt: daysAgo(56),
        createdAt: daysAgo(57), updatedAt: daysAgo(56),
      },
      {
        userId: uid.chau, products: [{ id: P[18].id, name: P[18].name, img: P[18].img, price: 245000, quantity: 2 }, { id: P[3].id, name: P[3].name, img: P[3].img, price: 150000, quantity: 2 }],
        totalAmount: 790000, address: "5 Lý Tự Trọng, Q.1, TP.HCM", phone: "0919887766",
        status: "Hoàn thành", paymentMethod: "COD", paymentStatus: "paid",
        createdAt: daysAgo(59), updatedAt: daysAgo(58),
      },
    ];

    const createdOrders = await Order.bulkCreate(ordersData);
    console.log(`✅ [5/11] Đã tạo ${createdOrders.length} đơn hàng.`);

    // 6. Seed MakerProfiles
    const tier_Lan = MAKER_BADGE.calculate(52, 4.9);
    const tier_Minh = MAKER_BADGE.calculate(28, 4.6);
    const tier_Ha = MAKER_BADGE.calculate(7, 4.2);
    const tier_Tuan = MAKER_BADGE.calculate(3, 4.0);

    const makerProfilesData = [
      {
        userId: uid.lan,
        bio: "Mình là Lan, đam mê thủ công từ nhỏ. Chuyên đan len, làm nến thơm và thêu tay. Hơn 8 năm kinh nghiệm, đã hoàn thành hơn 50 đơn hàng với 100% khách hàng hài lòng. Mỗi sản phẩm mình đều đổ cả tâm huyết vào để khách nhận được điều tốt nhất.",
        skills: "đan len,làm nến,thêu tay,móc crochet",
        category: "dan_len",
        yearsExp: 8,
        province: "TP.HCM",
        priceFrom: 150000,
        priceTo: 800000,
        portfolio: [
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400",
          "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400",
          "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=400",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400",
        ],
        bankInfo: "9988001122 · Vietcombank · Nguyen Thi Lan",
        status: "da_duyet",
        rating: 4.9,
        totalDone: 52,
        badge: tier_Lan.label,
        badgeEmoji: tier_Lan.emoji,
        commissionRate: 10,
        totalEarning: 28500000,
        submittedAt: daysAgo(180),
      },
      {
        userId: uid.minh,
        bio: "Minh — thợ thủ công 5 năm kinh nghiệm về đồ da và đan len. Nhận làm túi xách, ví, thắt lưng da bò thật theo yêu cầu. Cam kết chất lượng, giao đúng hẹn. Tất cả sản phẩm đều được khâu tay và đánh bóng thủ công.",
        skills: "làm đồ da,đan,may da,khắc laser",
        category: "da",
        yearsExp: 5,
        province: "TP.HCM",
        priceFrom: 200000,
        priceTo: 2000000,
        portfolio: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400",
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400",
          "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=400",
          "https://images.unsplash.com/photo-1614116999117-2f29a01eab14?q=80&w=400",
        ],
        bankInfo: "1234567890 · Techcombank · Tran Van Minh",
        status: "da_duyet",
        rating: 4.6,
        totalDone: 28,
        badge: tier_Minh.label,
        badgeEmoji: tier_Minh.emoji,
        commissionRate: 10,
        totalEarning: 15750000,
        submittedAt: daysAgo(120),
      },
      {
        userId: uid.ha,
        bio: "Hà tốt nghiệp ĐH Mỹ Thuật TP.HCM, chuyên gốm thủ công và tranh màu nước. Nhận làm bình hoa, bát đĩa, đèn gốm theo yêu cầu. Cũng nhận vẽ tranh chân dung, phong cảnh, thú cưng bằng màu nước.",
        skills: "gốm thủ công,vẽ màu nước,khắc gốm,men màu",
        category: "gom",
        yearsExp: 3,
        province: "TP.HCM",
        priceFrom: 250000,
        priceTo: 1500000,
        portfolio: [
          "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=400",
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400",
          "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=400",
        ],
        bankInfo: "5566778899 · MBBank · Le Thi Thu Ha",
        status: "da_duyet",
        rating: 4.2,
        totalDone: 7,
        badge: tier_Ha.label,
        badgeEmoji: tier_Ha.emoji,
        commissionRate: 10,
        totalEarning: 3200000,
        submittedAt: daysAgo(60),
      },
      {
        userId: uid.hoa,
        bio: "Hoa yêu thích vẽ tranh màu nước và thêu tay từ thời sinh viên. Nhận đơn vẽ tranh chân dung, phong cảnh hoặc thêu tên lên quần áo, phụ kiện theo yêu cầu. Đang xây dựng portfolio.",
        skills: "vẽ tranh màu nước,thêu tay,in áo",
        category: "theu",
        yearsExp: 2,
        province: "TP.HCM",
        priceFrom: 100000,
        priceTo: 500000,
        portfolio: [
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400",
          "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=400",
        ],
        bankInfo: "",
        status: "cho_duyet",
        rating: 0,
        totalDone: 0,
        badge: "Thợ Mới",
        badgeEmoji: "🌱",
        commissionRate: 10,
        totalEarning: 0,
        submittedAt: daysAgo(3),
      },
      {
        userId: uid.mai,
        bio: "Mai nhận làm đồ handmade đủ loại.",
        skills: "may,đan",
        category: "vai",
        yearsExp: 1,
        province: "TP.HCM",
        portfolio: [],
        bankInfo: "",
        status: "tu_choi",
        rejectReason: "Portfolio chưa đủ, chưa cung cấp CCCD xác minh danh tính.",
        rating: 0,
        totalDone: 0,
        badge: "Thợ Mới",
        badgeEmoji: "🌱",
        commissionRate: 10,
        totalEarning: 0,
        submittedAt: daysAgo(7),
      },
      {
        userId: uid.tuan,
        bio: "Tuấn chuyên thêu và in ấn handmade. Nhận đơn thêu tên, logo lên quần áo, túi vải, mũ nón. Có máy thêu vi tính lẫn thêu tay truyền thống.",
        skills: "thêu vi tính,thêu tay,in nhiệt,may vá",
        category: "theu",
        yearsExp: 2,
        province: "TP.HCM",
        priceFrom: 80000,
        priceTo: 500000,
        portfolio: [
          "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=400",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400",
        ],
        bankInfo: "6677889900 · Agribank · Nguyen Anh Tuan",
        status: "da_duyet",
        rating: 4.0,
        totalDone: 3,
        badge: tier_Tuan.label,
        badgeEmoji: tier_Tuan.emoji,
        commissionRate: 10,
        totalEarning: 850000,
        submittedAt: daysAgo(30),
      },
    ];
    const createdMakerProfiles = await MakerProfile.bulkCreate(makerProfilesData);
    console.log(`✅ [6/11] Đã tạo ${createdMakerProfiles.length} hồ sơ thợ.`);

    const mp_Lan = createdMakerProfiles[0];
    const mp_Minh = createdMakerProfiles[1];
    const mp_Ha = createdMakerProfiles[2];
    const mp_Tuan = createdMakerProfiles[5];

    // 7. Seed CustomOrders + Bids
    const c0 = { price: 480000, rate: 10 };  // Bảo→Lan hoàn thành
    const c1 = { price: 950000, rate: 10 };  // Khoa→Minh hoàn thành
    const c2 = { price: 620000, rate: 10 };  // Châu→Hà hoàn thành
    const c3 = { price: 320000, rate: 10 };  // Bảo→Lan đang làm
    const c4 = { price: 750000, rate: 10 };  // Khoa→Minh đã chọn thợ
    const c5 = { price: 700000, rate: 10 };  // Châu→Hà chờ xác nhận
    const c9 = { price: 400000, rate: 10 };  // Bảo→Lan hủy mất cọc
    const c11 = { price: 550000, rate: 10 };  // Khoa→Hà đang làm
    const c12 = { price: 350000, rate: 10 };  // Linh→Tuấn hoàn thành (thợ mới)

    const cm0 = calc(c0.price, c0.rate);
    const cm1 = calc(c1.price, c1.rate);
    const cm2 = calc(c2.price, c2.rate);
    const cm3 = calc(c3.price, c3.rate);
    const cm4 = calc(c4.price, c4.rate);
    const cm5 = calc(c5.price, c5.rate);
    const cm9d = calc(Math.round(c9.price * 0.5), c9.rate); // HH trên tiền cọc
    const cm11 = calc(c11.price, c11.rate);
    const cm12 = calc(c12.price, c12.rate);

    const customOrdersData = [
      // [0] Bảo → Lan | Hoàn thành
      {
        userId: uid.bao, makerId: uid.lan, acceptedBidId: null,
        title: "Nến thơm mùi cà phê sữa Việt Nam",
        description: "Tôi muốn đặt nến thơm mùi cà phê sữa đá kiểu Việt Nam. Nến phải cháy được ít nhất 40 tiếng. Đựng trong hũ thủy tinh bo tròn dạng mason jar. Số lượng: 3 hũ.",
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
        budget: 500000, deadline: null,
        status: "Hoàn thành",
        agreedPrice: c0.price, commissionRate: c0.rate,
        commissionAmount: cm0.commissionAmount, shopEarning: cm0.shopEarning, makerEarning: cm0.makerEarning,
        depositAmount: Math.round(c0.price * 0.5), finalAmount: c0.price - Math.round(c0.price * 0.5),
        paymentStatus: "paid", depositStatus: "paid", finalStatus: "paid",
        depositTransId: "seed_d_bao_lan_1", depositPaidAt: daysAgo(20),
        finalTransId: "seed_f_bao_lan_1", finalPaidAt: daysAgo(14),
        zpPaidAt: daysAgo(14),
        createdAt: daysAgo(25), updatedAt: daysAgo(14),
      },
      // [1] Khoa → Minh | Hoàn thành
      {
        userId: uid.khoa, makerId: uid.minh, acceptedBidId: null,
        title: "Ví da bò gấp đôi khâu tay theo yêu cầu",
        description: "Cần ví da bò thật (full grain) dạng gấp đôi, có 8 ngăn thẻ, 1 ngăn dây kéo, 1 ngăn tiền mặt. Màu tan/cognac. Khâu tay toàn bộ bằng chỉ sáp Mỹ màu vàng đồng. Đóng gói hộp giấy kraft.",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800",
        budget: 1000000, deadline: null,
        status: "Hoàn thành",
        agreedPrice: c1.price, commissionRate: c1.rate,
        commissionAmount: cm1.commissionAmount, shopEarning: cm1.shopEarning, makerEarning: cm1.makerEarning,
        depositAmount: Math.round(c1.price * 0.5), finalAmount: c1.price - Math.round(c1.price * 0.5),
        paymentStatus: "paid", depositStatus: "paid", finalStatus: "paid",
        depositTransId: "seed_d_khoa_minh_1", depositPaidAt: daysAgo(30),
        finalTransId: "seed_f_khoa_minh_1", finalPaidAt: daysAgo(18),
        zpPaidAt: daysAgo(18),
        createdAt: daysAgo(35), updatedAt: daysAgo(18),
      },
      // [2] Châu → Hà | Hoàn thành
      {
        userId: uid.chau, makerId: uid.ha, acceptedBidId: null,
        title: "Bình gốm men xanh cắm hoa khô phong cách Nhật",
        description: "Muốn đặt bình gốm phong cách wabi-sabi Nhật Bản. Men màu xanh lam trơn, có thể có vệt men không đều (tự nhiên). Cao khoảng 20-22cm, miệng nhỏ 4-5cm để cắm hoa khô pampa. Tặng sinh nhật mẹ.",
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800",
        budget: 650000, deadline: null,
        status: "Hoàn thành",
        agreedPrice: c2.price, commissionRate: c2.rate,
        commissionAmount: cm2.commissionAmount, shopEarning: cm2.shopEarning, makerEarning: cm2.makerEarning,
        depositAmount: Math.round(c2.price * 0.5), finalAmount: c2.price - Math.round(c2.price * 0.5),
        paymentStatus: "paid", depositStatus: "paid", finalStatus: "paid",
        depositTransId: "seed_d_chau_ha_1", depositPaidAt: daysAgo(25),
        finalTransId: "seed_f_chau_ha_1", finalPaidAt: daysAgo(16),
        zpPaidAt: daysAgo(16),
        createdAt: daysAgo(28), updatedAt: daysAgo(16),
      },
      // [3] Bảo → Lan | Đang thực hiện, đã cọc
      {
        userId: uid.bao, makerId: uid.lan, acceptedBidId: null,
        title: "Túi tote len hình mèo Hello Kitty",
        description: "Muốn đặt túi tote móc len có hình mèo Hello Kitty phong cách Sanrio, màu hồng pastel, size vừa đủ đựng laptop 13 inch. Thêm tai và nơ cho mèo. Len cotton Hàn Quốc cao cấp.",
        image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800",
        budget: 380000, deadline: null,
        status: "Đang thực hiện",
        agreedPrice: c3.price, commissionRate: c3.rate,
        commissionAmount: cm3.commissionAmount, shopEarning: cm3.shopEarning, makerEarning: cm3.makerEarning,
        depositAmount: Math.round(c3.price * 0.5), finalAmount: c3.price - Math.round(c3.price * 0.5),
        paymentStatus: "unpaid", depositStatus: "paid", finalStatus: "unpaid",
        depositTransId: "seed_d_bao_lan_2", depositPaidAt: daysAgo(5),
        createdAt: daysAgo(8), updatedAt: daysAgo(5),
      },
      // [4] Khoa → Minh | Đã chọn thợ, chưa cọc
      {
        userId: uid.khoa, makerId: uid.minh, acceptedBidId: null,
        title: "Dây đeo thẻ da bò khắc tên công ty",
        description: "Cần 20 dây đeo thẻ da bò thật, khắc laser tên công ty và logo. Da màu đen, móc màu vàng đồng. Mỗi cái khắc tên nhân viên riêng. Làm quà tặng tổng kết cuối năm.",
        image: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=800",
        budget: 800000, deadline: null,
        status: "Đã chọn thợ",
        agreedPrice: c4.price, commissionRate: c4.rate,
        commissionAmount: cm4.commissionAmount, shopEarning: cm4.shopEarning, makerEarning: cm4.makerEarning,
        depositAmount: Math.round(c4.price * 0.5), finalAmount: c4.price - Math.round(c4.price * 0.5),
        paymentStatus: "unpaid", depositStatus: "unpaid", finalStatus: "unpaid",
        createdAt: daysAgo(6), updatedAt: daysAgo(4),
      },
      // [5] Châu → Hà | Chờ xác nhận (thợ báo xong)
      {
        userId: uid.chau, makerId: uid.ha, acceptedBidId: null,
        title: "Tranh màu nước chân dung thú cưng size A4",
        description: "Mình muốn vẽ chân dung chú mèo Anh lông ngắn nhà mình bằng màu nước. Size A4, nền trắng, phong cách minimalist. Dùng khung IKEA RIBBA. Cần trong 2 tuần.",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400",
        budget: 750000, deadline: null,
        status: "Chờ xác nhận",
        agreedPrice: c5.price, commissionRate: c5.rate,
        commissionAmount: cm5.commissionAmount, shopEarning: cm5.shopEarning, makerEarning: cm5.makerEarning,
        depositAmount: Math.round(c5.price * 0.5), finalAmount: c5.price - Math.round(c5.price * 0.5),
        paymentStatus: "unpaid", depositStatus: "paid", finalStatus: "unpaid",
        depositTransId: "seed_d_chau_ha_2", depositPaidAt: daysAgo(8),
        createdAt: daysAgo(12), updatedAt: daysAgo(1),
      },
      // [6] Lan đăng | Đang tìm thợ (2 bid: Minh + Hà)
      {
        userId: uid.lan, makerId: null, acceptedBidId: null,
        title: "Vòng tay đá tự nhiên theo mệnh Thổ",
        description: "Cần vòng tay đá tự nhiên phù hợp mệnh Thổ, màu vàng nâu ấm. Ưu tiên đá mắt hổ và đá thạch anh vàng. Size tay nữ, chu vi 16cm. Cần mua thêm cho mẹ size 17cm.",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
        budget: 280000, deadline: null,
        status: "Đang tìm thợ",
        paymentStatus: "unpaid", depositStatus: "unpaid", finalStatus: "unpaid",
        createdAt: daysAgo(4), updatedAt: daysAgo(4),
      },
      // [7] Khoa đăng | Đang tìm thợ (1 bid: Lan)
      {
        userId: uid.khoa, makerId: null, acceptedBidId: null,
        title: "Gối tựa lưng macramé phòng khách",
        description: "Cần 2 chiếc gối tựa lưng macramé sợi cotton tự nhiên, tông be/trắng kem. Size 45x45cm. Muốn họa tiết hình học đơn giản, không quá rườm rà. Sofa màu xám.",
        image: "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800",
        budget: 600000, deadline: null,
        status: "Đang tìm thợ",
        paymentStatus: "unpaid", depositStatus: "unpaid", finalStatus: "unpaid",
        createdAt: daysAgo(3), updatedAt: daysAgo(3),
      },
      // [8] Bảo đăng | Đang tìm thợ (chưa có bid)
      {
        userId: uid.bao, makerId: null, acceptedBidId: null,
        title: "Bộ móc chìa khóa len hình động vật nhỏ (set 10 cái)",
        description: "Đặt 10 cái móc chìa khóa len amigurumi hình các con vật: 2 gấu trúc, 2 mèo, 2 thỏ, 2 chó corgi, 2 voi. Mỗi cái khoảng 5-6cm. Làm quà tặng bạn bè dịp Giáng Sinh.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
        budget: 350000, deadline: null,
        status: "Đang tìm thợ",
        paymentStatus: "unpaid", depositStatus: "unpaid", finalStatus: "unpaid",
        createdAt: daysAgo(1), updatedAt: daysAgo(1),
      },
      // [9] Bảo → Lan | Đã hủy SAU KHI CỌC (mất cọc)
      {
        userId: uid.bao, makerId: uid.lan, acceptedBidId: null,
        title: "Móc len thỏ bông size 30cm",
        description: "Muốn đặt thỏ bông móc len size 30cm, màu trắng kem, tai hồng nhạt. Nhồi bông PP siêu nhẹ. Làm quà tặng bạn gái nhân ngày Valentine.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
        budget: 450000, deadline: null,
        status: "Đã hủy",
        agreedPrice: c9.price, commissionRate: c9.rate,
        commissionAmount: cm9d.commissionAmount, shopEarning: cm9d.shopEarning, makerEarning: cm9d.makerEarning,
        depositAmount: Math.round(c9.price * 0.5), finalAmount: c9.price - Math.round(c9.price * 0.5),
        paymentStatus: "unpaid", depositStatus: "paid", finalStatus: "unpaid",
        depositTransId: "seed_d_bao_lan_cancel", depositPaidAt: daysAgo(3),
        createdAt: daysAgo(5), updatedAt: daysAgo(2),
      },
      // [10] Châu đăng | Đã hủy trước cọc
      {
        userId: uid.chau, makerId: null, acceptedBidId: null,
        title: "Khung ảnh gỗ khắc laser kỷ niệm",
        description: "Cần khung ảnh gỗ thông 15x20cm, khắc laser dòng chữ và ngày kỷ niệm lên góc khung. Nhẵn, sơn lót bảo vệ gỗ.",
        image: "https://tse1.mm.bing.net/th/id/OIP.pLO7XCkwIx4inS_GcElSvwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        budget: 200000, deadline: null,
        status: "Đã hủy",
        paymentStatus: "unpaid", depositStatus: "unpaid", finalStatus: "unpaid",
        createdAt: daysAgo(10), updatedAt: daysAgo(8),
      },
      // [11] Khoa → Hà | Đang thực hiện, đã cọc
      {
        userId: uid.khoa, makerId: uid.ha, acceptedBidId: null,
        title: "Bộ 6 tách uống trà gốm thủ công",
        description: "Cần 6 cái tách trà gốm thủ công, phong cách Nhật/Hàn. Dung tích 150ml, không quai. Men màu tro xanh hoặc xanh olive. Làm quà hộp kèm túi kraft.",
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800",
        budget: 600000, deadline: null,
        status: "Đang thực hiện",
        agreedPrice: c11.price, commissionRate: c11.rate,
        commissionAmount: cm11.commissionAmount, shopEarning: cm11.shopEarning, makerEarning: cm11.makerEarning,
        depositAmount: Math.round(c11.price * 0.5), finalAmount: c11.price - Math.round(c11.price * 0.5),
        paymentStatus: "unpaid", depositStatus: "paid", finalStatus: "unpaid",
        depositTransId: "seed_d_khoa_ha_1", depositPaidAt: daysAgo(4),
        createdAt: daysAgo(6), updatedAt: daysAgo(4),
      },
      // [12] Linh → Tuấn | Hoàn thành (test thợ mới)
      {
        userId: uid.linh, makerId: uid.tuan, acceptedBidId: null,
        title: "Thêu tên lên 5 chiếc áo đồng phục lớp",
        description: "Cần thêu tên 5 học sinh lên áo đồng phục trường, font chữ đẹp, màu chỉ xanh navy. Áo màu trắng. Kích thước chữ khoảng 4-5cm.",
        image: "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=800",
        budget: 400000, deadline: null,
        status: "Hoàn thành",
        agreedPrice: c12.price, commissionRate: c12.rate,
        commissionAmount: cm12.commissionAmount, shopEarning: cm12.shopEarning, makerEarning: cm12.makerEarning,
        depositAmount: Math.round(c12.price * 0.5), finalAmount: c12.price - Math.round(c12.price * 0.5),
        paymentStatus: "paid", depositStatus: "paid", finalStatus: "paid",
        depositTransId: "seed_d_linh_tuan_1", depositPaidAt: daysAgo(15),
        finalTransId: "seed_f_linh_tuan_1", finalPaidAt: daysAgo(10),
        zpPaidAt: daysAgo(10),
        createdAt: daysAgo(18), updatedAt: daysAgo(10),
      },
      // [13] Nga đăng | Đang tìm thợ (chưa bid)
      {
        userId: uid.nga, makerId: null, acceptedBidId: null,
        title: "Tranh thêu hoa sen size A3 tặng mẹ",
        description: "Muốn đặt tranh thêu tay hình hoa sen, màu sắc truyền thống Việt Nam. Size A3, khung gỗ mộc. Tặng mẹ nhân ngày Phụ Nữ Việt Nam 20/10.",
        image: "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=800",
        budget: 350000, deadline: null,
        status: "Đang tìm thợ",
        paymentStatus: "unpaid", depositStatus: "unpaid", finalStatus: "unpaid",
        createdAt: daysAgo(2), updatedAt: daysAgo(2),
      },
    ];

    const createdCO = await CustomOrder.bulkCreate(customOrdersData);
    console.log(`   → Đã tạo ${createdCO.length} yêu cầu gia công.`);

    // ── Bids ──────────────────────────────────────────────────────────────────
    const bidsData = [
      {
        customOrderId: createdCO[0].id, makerId: uid.lan, price: 480000,
        message: "Mình chuyên làm nến handmade theo yêu cầu, đã làm hơn 80 đơn. Sẽ gửi mẫu mùi trước khi đổ nến chính để bạn duyệt. Thời gian: 3-5 ngày.", contactInfo: "0912345678"
      },
      {
        customOrderId: createdCO[1].id, makerId: uid.minh, price: 950000,
        message: "Mình làm đồ da 5 năm, chuyên ví và túi da bò thật. Khâu tay toàn bộ bằng chỉ sáp Mỹ. Giao trong 12-15 ngày. Bảo hành 6 tháng.", contactInfo: "0987654321"
      },
      {
        customOrderId: createdCO[2].id, makerId: uid.ha, price: 620000,
        message: "Mình tốt nghiệp ĐH Mỹ Thuật, chuyên gốm thủ công. Sẽ làm 2-3 mẫu thử men trước khi nung chính. Dự kiến 2-3 tuần. Mỗi chiếc là tác phẩm độc bản.", contactInfo: "0933221144"
      },
      {
        customOrderId: createdCO[3].id, makerId: uid.lan, price: 320000,
        message: "Mình đan len được hơn 8 năm, đã làm nhiều mẫu Sanrio. Len cotton Hàn Quốc cao cấp, mềm và bền màu. Hoàn thành trong 7-10 ngày.", contactInfo: "0912345678"
      },
      {
        customOrderId: createdCO[4].id, makerId: uid.minh, price: 750000,
        message: "Mình chuyên khắc laser da bò, đã làm quà doanh nghiệp cho nhiều công ty. 20 cái trong 7 ngày, có thể nhanh hơn nếu cần gấp.", contactInfo: "0987654321"
      },
      {
        customOrderId: createdCO[4].id, makerId: uid.lan, price: 820000,
        message: "Mình cũng làm được da nhẹ, nhưng có thể hơi lâu hơn một chút. Chất lượng đảm bảo, bao gói cẩn thận.", contactInfo: "0912345678"
      },
      {
        customOrderId: createdCO[5].id, makerId: uid.ha, price: 700000,
        message: "Mình chuyên vẽ thú cưng bằng màu nước, đã vẽ hơn 30 tác phẩm. Sẽ gửi sketch trước khi tô màu để bạn duyệt. Thời gian: 5-7 ngày.", contactInfo: "0933221144"
      },
      {
        customOrderId: createdCO[6].id, makerId: uid.minh, price: 260000,
        message: "Mình hay làm vòng tay đá theo mệnh. Sẽ tư vấn thêm loại đá phù hợp nhất cho mệnh Thổ, tặng kèm túi nhung đựng.", contactInfo: "0987654321"
      },
      {
        customOrderId: createdCO[6].id, makerId: uid.ha, price: 280000,
        message: "Mình có thể làm vòng tay đá tự nhiên đẹp, phối màu hài hòa theo mệnh Thổ. Giao trong 3-5 ngày.", contactInfo: "0933221144"
      },
      {
        customOrderId: createdCO[7].id, makerId: uid.lan, price: 580000,
        message: "Mình chuyên macramé và đan len. Có thể làm 2 gối trong 10-12 ngày. Cotton tự nhiên 100%, nhuộm màu thực vật an toàn.", contactInfo: "0912345678"
      },
      {
        customOrderId: createdCO[9].id, makerId: uid.lan, price: 400000,
        message: "Mình móc len thỏ bông rất cute, đã làm nhiều size khác nhau. Len cotton cao cấp, bông nhồi PP. Giao trong 5-7 ngày.", contactInfo: "0912345678"
      },
      {
        customOrderId: createdCO[11].id, makerId: uid.ha, price: 550000,
        message: "Mình làm gốm nhiều năm, chuyên đồ uống trà phong cách Nhật. Sẽ làm thử 1 mẫu trước để bạn duyệt men. Hoàn thành 2-3 tuần.", contactInfo: "0933221144"
      },
      {
        customOrderId: createdCO[12].id, makerId: uid.tuan, price: 350000,
        message: "Mình có máy thêu vi tính, font chữ đẹp và đều. 5 áo trong 2-3 ngày. Bảo đảm không nhòe, không phai.", contactInfo: "0988776655"
      },
      {
        customOrderId: createdCO[12].id, makerId: uid.lan, price: 400000,
        message: "Mình thêu tay được, chữ nghệ thuật hơn nhưng lâu hơn. Khoảng 5-7 ngày. Nếu bạn muốn thêu tay truyền thống thì mình phù hợp.", contactInfo: "0912345678"
      },
    ];

    const createdBids = await Bid.bulkCreate(bidsData);
    console.log(`   → Đã tạo ${createdBids.length} báo giá.`);

    // Update acceptedBidId
    await createdCO[0].update({ acceptedBidId: createdBids[0].id });
    await createdCO[1].update({ acceptedBidId: createdBids[1].id });
    await createdCO[2].update({ acceptedBidId: createdBids[2].id });
    await createdCO[3].update({ acceptedBidId: createdBids[3].id });
    await createdCO[4].update({ acceptedBidId: createdBids[4].id });
    await createdCO[5].update({ acceptedBidId: createdBids[6].id });
    await createdCO[9].update({ acceptedBidId: createdBids[10].id });
    await createdCO[11].update({ acceptedBidId: createdBids[11].id });
    await createdCO[12].update({ acceptedBidId: createdBids[12].id });

    console.log(`✅ [7/11] Seed CustomOrders & Bids hoàn tất.`);

    // 8. Seed Reviews (đánh giá custom order)
    const reviewsData = [
      {
        customOrderId: createdCO[0].id,
        reviewerId: uid.bao,
        makerId: mp_Lan.id,
        rating: 5,
        comment: "Chị Lan làm nến cực đẹp và thơm! Mùi cà phê sữa đúng như mong muốn, hũ thủy tinh rất sang. Giao hàng trước deadline 2 ngày. Sẽ đặt tiếp cho những dịp khác nhau.",
      },
      {
        customOrderId: createdCO[1].id,
        reviewerId: uid.khoa,
        makerId: mp_Minh.id,
        rating: 5,
        comment: "Ví đẹp hơn mình tưởng! Da bò thật, mùi thơm tự nhiên, đường chỉ rất thẳng và đều. Anh Minh tư vấn nhiệt tình, trả lời tin nhắn nhanh. Bảo hành 6 tháng rất yên tâm.",
      },
      {
        customOrderId: createdCO[2].id,
        reviewerId: uid.chau,
        makerId: mp_Ha.id,
        rating: 4,
        comment: "Bình gốm rất đẹp, men màu xanh tự nhiên đúng ý muốn. Hơi trễ hẹn 2 ngày nhưng chị Hà đã báo trước và xin lỗi. Nhìn chung rất hài lòng, mẹ mình thích lắm!",
      },
      {
        customOrderId: createdCO[12].id,
        reviewerId: uid.linh,
        makerId: mp_Tuan.id,
        rating: 5,
        comment: "Anh Tuấn thêu rất đẹp, chữ sắc nét, không nhòe. Giao đúng hẹn, đóng gói cẩn thận. Các bạn trong lớp rất thích. Sẽ đặt lại khi cần!",
      },
    ];
    const createdReviews = await Review.bulkCreate(reviewsData);
    // Cập nhật rating thợ
    await mp_Lan.update({ rating: 4.9 });
    await mp_Minh.update({ rating: 4.6 });
    await mp_Ha.update({ rating: 4.2 });
    await mp_Tuan.update({ rating: 4.0 });
    console.log(`✅ [8/11] Đã tạo ${createdReviews.length} đánh giá thợ.`);

    // 9. Seed ProductReviews (đánh giá sản phẩm shop)
    const productReviewsData = [
      { productId: P[0].id, userId: uid.bao, rating: 5, comment: "Vòng tay đẹp lắm! Đá tự nhiên sáng, làm cẩn thận. Mua tặng bạn gái, bạn rất thích. Shop tư vấn nhiệt tình!", adminReply: null },
      { productId: P[0].id, userId: uid.linh, rating: 4, comment: "Đá đẹp, màu đúng như ảnh. Giao hàng nhanh. Chi hơi tiếc là dây hơi ngắn với tay mình.", adminReply: "Cảm ơn bạn đã phản hồi! Bạn có thể liên hệ shop để được hỗ trợ điều chỉnh kích thước dây nhé 💕" },
      { productId: P[5].id, userId: uid.linh, rating: 5, comment: "Bình gốm cực kỳ đẹp, men xanh tự nhiên mỗi chiếc một vẻ. Cắm hoa khô vào trông sang trọng hẳn.", adminReply: "Cảm ơn bạn rất nhiều! Chúc bạn và gia đình luôn vui vẻ với những chiếc bình gốm nhé 🏺" },
      { productId: P[9].id, userId: uid.khoa, rating: 4, comment: "Nến thơm mùi hoa nhài tự nhiên rất dễ chịu. Cháy được hơn 48 tiếng như quảng cáo.", adminReply: null },
      { productId: P[9].id, userId: uid.nga, rating: 5, comment: "Mùi thơm cực kỳ! Nhà mình bây giờ lúc nào cũng thơm. Đã mua lần 3, sẽ tiếp tục ủng hộ shop.", adminReply: "Cảm ơn bạn Nga đã ủng hộ shop nhiều lần! Shop sẽ cố gắng ra thêm nhiều mùi mới nhé 🌸" },
      { productId: P[12].id, userId: uid.linh, rating: 5, comment: "Bộ kit thêu rất đầy đủ, chỉ màu tươi sáng, kim đủ loại. Mẫu hoa sen Việt Nam rất đẹp.", adminReply: null },
      { productId: P[16].id, userId: uid.khoa, rating: 5, comment: "Ví da bò thật cực kỳ chất lượng! Khâu tay tỉ mỉ, đường chỉ đẹp. Mùi da rất thơm. Xứng đáng với giá tiền.", adminReply: "Cảm ơn anh Khoa! Nếu sau thời gian sử dụng cần đánh bóng thêm thì liên hệ shop nhé 🌟" },
      { productId: P[1].id, userId: uid.chau, rating: 4, comment: "Đá mắt hổ đẹp, ánh sáng lung linh. Dây inox chắc chắn.", adminReply: null },
      { productId: P[4].id, userId: uid.nga, rating: 5, comment: "Gối thêu tay đẹp mê li! Thêu hoa lavender tinh tế, vải linen mềm mịn.", adminReply: null },
      { productId: P[13].id, userId: uid.bao, rating: 5, comment: "Túi tote len hình gấu trúc cực dễ thương, len dệt mịn không bị xù.", adminReply: "Cảm ơn bạn Bảo đã ủng hộ shop! Chúc bạn có trải nghiệm tuyệt vời với chiếc túi gấu trúc nhé 🐼" },
    ];
    const createdPR = await ProductReview.bulkCreate(productReviewsData);
    console.log(`✅ [9/11] Đã tạo ${createdPR.length} đánh giá sản phẩm.`);

    // 10. Seed CommissionDebts + MakerPayouts
    const debtsPayouts = [
      {
        debt: {
          makerId: mp_Lan.id, customOrderId: createdCO[0].id,
          amount: cm0.commissionAmount, agreedPrice: c0.price, commissionRate: c0.rate,
          status: "da_thu", paidAt: daysAgo(14), note: "Thu tự động qua ZaloPay",
        },
        payout: {
          makerId: mp_Lan.id, customOrderId: createdCO[0].id,
          amount: cm0.makerEarning, agreedPrice: c0.price, commissionRate: c0.rate,
          bankInfo: "9988001122 · Vietcombank · Nguyen Thi Lan", status: "da_tra",
          note: "Admin đã chuyển khoản", paidAt: daysAgo(12),
        },
      },
      {
        debt: {
          makerId: mp_Minh.id, customOrderId: createdCO[1].id,
          amount: cm1.commissionAmount, agreedPrice: c1.price, commissionRate: c1.rate,
          status: "da_thu", paidAt: daysAgo(18), note: "Thu tự động qua ZaloPay",
        },
        payout: {
          makerId: mp_Minh.id, customOrderId: createdCO[1].id,
          amount: cm1.makerEarning, agreedPrice: c1.price, commissionRate: c1.rate,
          bankInfo: "1234567890 · Techcombank · Tran Van Minh", status: "cho_tra",
          note: "Chờ admin xử lý cuối tháng",
        },
      },
      {
        debt: {
          makerId: mp_Ha.id, customOrderId: createdCO[2].id,
          amount: cm2.commissionAmount, agreedPrice: c2.price, commissionRate: c2.rate,
          status: "da_thu", paidAt: daysAgo(16), note: "Thu tự động qua ZaloPay",
        },
        payout: {
          makerId: mp_Ha.id, customOrderId: createdCO[2].id,
          amount: cm2.makerEarning, agreedPrice: c2.price, commissionRate: c2.rate,
          bankInfo: "5566778899 · MBBank · Le Thi Thu Ha", status: "cho_tra",
          note: "Chờ admin chuyển khoản",
        },
      },
      {
        debt: {
          makerId: mp_Lan.id, customOrderId: createdCO[9].id,
          amount: cm9d.commissionAmount, agreedPrice: Math.round(c9.price * 0.5), commissionRate: c9.rate,
          status: "da_thu", paidAt: daysAgo(2),
          note: "Hoa hồng từ tiền cọc — khách hủy đơn sau khi cọc",
        },
        payout: {
          makerId: mp_Lan.id, customOrderId: createdCO[9].id,
          amount: cm9d.makerEarning, agreedPrice: Math.round(c9.price * 0.5), commissionRate: c9.rate,
          bankInfo: "9988001122 · Vietcombank · Nguyen Thi Lan", status: "cho_tra",
          note: "Khách hủy đơn sau khi cọc — thợ giữ cọc trừ hoa hồng",
        },
      },
      {
        debt: {
          makerId: mp_Tuan.id, customOrderId: createdCO[12].id,
          amount: cm12.commissionAmount, agreedPrice: c12.price, commissionRate: c12.rate,
          status: "da_thu", paidAt: daysAgo(10), note: "Thu tự động qua ZaloPay",
        },
        payout: {
          makerId: mp_Tuan.id, customOrderId: createdCO[12].id,
          amount: cm12.makerEarning, agreedPrice: c12.price, commissionRate: c12.rate,
          bankInfo: "6677889900 · Agribank · Nguyen Anh Tuan", status: "cho_tra",
          note: "Chờ admin chuyển khoản",
        },
      },
    ];

    for (const item of debtsPayouts) {
      await CommissionDebt.create(item.debt);
      await MakerPayout.create(item.payout);
    }
    console.log(`✅ [10/11] Đã tạo CommissionDebts & MakerPayouts.`);

    // 11. Seed Logs
    const logsData = [
      { userId: uid.admin, userName: "Admin PinkyCrafts", action: "Duyệt thợ", details: "Admin đã duyệt hồ sơ thợ: Nguyễn Thị Lan", status: "Thành công" },
      { userId: uid.admin, userName: "Admin PinkyCrafts", action: "Duyệt thợ", details: "Admin đã duyệt hồ sơ thợ: Trần Văn Minh", status: "Thành công" },
      { userId: uid.admin, userName: "Admin PinkyCrafts", action: "Duyệt thợ", details: "Admin đã duyệt hồ sơ thợ: Lê Thị Thu Hà", status: "Thành công" },
      { userId: uid.admin, userName: "Admin PinkyCrafts", action: "Duyệt thợ", details: "Admin đã duyệt hồ sơ thợ: Nguyễn Anh Tuấn", status: "Thành công" },
      { userId: uid.admin, userName: "Admin PinkyCrafts", action: "Từ chối thợ", details: "Admin từ chối hồ sơ: Võ Thị Mai — lý do: chưa đủ portfolio, thiếu CCCD", status: "Thành công" },
      { userId: uid.admin, userName: "Admin PinkyCrafts", action: "Thêm sản phẩm", details: "Admin thêm sản phẩm mới: Ốp Lưng Da Khắc Tên Theo Yêu Cầu", status: "Thành công" },
      { userId: uid.admin, userName: "Admin PinkyCrafts", action: "Phản hồi review", details: "Phản hồi đánh giá sản phẩm Vòng Tay Đá Thạch Anh của Trần Thị Linh", status: "Thành công" },
      { userId: uid.lan, userName: "Nguyễn Thị Lan", action: "Đăng nhập thành công", details: "Đăng nhập bằng email/password", status: "Thành công" },
      { userId: uid.bao, userName: "Lê Quốc Bảo", action: "Hủy đơn hàng", details: `Hủy đơn hàng #${createdOrders[2].id}`, status: "Thành công" },
      { userId: uid.bao, userName: "Lê Quốc Bảo", action: "Thanh toán ZaloPay", details: `Thanh toán thành công đơn hàng #${createdOrders[0].id} — 610,000đ`, status: "Thành công" },
      { userId: uid.khoa, userName: "Võ Minh Khoa", action: "Thanh toán ZaloPay", details: `Thanh toán thành công đơn hàng #${createdOrders[3].id} — 830,000đ`, status: "Thành công" },
      { userId: uid.chau, userName: "Nguyễn Bảo Châu", action: "Xác nhận nhận hàng", details: `Đã xác nhận nhận bình gốm — Đơn gia công #${createdCO[2].id} hoàn thành`, status: "Thành công" },
      { userId: uid.bao, userName: "Lê Quốc Bảo", action: "Hủy đơn gia công sau khi cọc", details: `Hủy đơn #${createdCO[9].id} — mất cọc ${Math.round(c9.price * 0.5).toLocaleString("vi-VN")}đ`, status: "Thành công" },
      { userId: uid.hoa, userName: "Phạm Thị Hoa", action: "Đăng ký làm thợ", details: "Hồ sơ đã nộp, đang chờ admin duyệt", status: "Thành công" },
      { userId: uid.mai, userName: "Võ Thị Mai", action: "Đăng ký làm thợ", details: "Hồ sơ bị từ chối — thiếu portfolio và CCCD", status: "Bị từ chối" },
      { userId: uid.tuan, userName: "Nguyễn Anh Tuấn", action: "Đăng ký làm thợ", details: "Hồ sơ đã được duyệt thành công", status: "Thành công" },
      { userId: null, userName: "Khách vãng lai", action: "Xem sản phẩm", details: "Truy cập trang sản phẩm không cần đăng nhập", status: "Thành công" },
      { userId: uid.lan, userName: "Nguyễn Thị Lan", action: "Đăng yêu cầu gia công", details: `Đăng yêu cầu: "${createdCO[6].title}"`, status: "Thành công" },
      { userId: uid.linh, userName: "Trần Thị Linh", action: "Thanh toán ZaloPay", details: `Thanh toán cọc đơn gia công #${createdCO[12].id} — 175,000đ`, status: "Thành công" },
      { userId: uid.linh, userName: "Trần Thị Linh", action: "Đánh giá sản phẩm", details: `Đánh giá Bộ Tranh Thêu Chữ Thập Kit DIY ⭐5`, status: "Thành công" },
      { userId: uid.khoa, userName: "Võ Minh Khoa", action: "Đánh giá sản phẩm", details: `Đánh giá Ví Da Bò Gấp Đôi ⭐5`, status: "Thành công" },
    ];
    await Log.bulkCreate(logsData);
    console.log(`✅ [11/11] Đã tạo ${logsData.length} bản ghi nhật ký.`);

    // ─── TỔNG KẾT ────────────────────────────────────────────────────────────
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║          ✨ SEED HOÀN TẤT ✨              ║");
    console.log("╚══════════════════════════════════════════╝");
    console.log("\n📊 Tóm tắt dữ liệu đã tạo:");
    console.log(`   👥 Users:           ${createdUsers.length} (1 admin + ${createdUsers.length - 1} user)`);
    console.log(`   🧶 Products:        ${createdProducts.length} (Trang sức / Trang trí / Quà tặng / Len & Đan / Đồ da)`);
    console.log(`   📦 Orders:          ${createdOrders.length} (Hoàn thành / Đang giao / Chờ XN / Đã hủy)`);
    console.log(`   🛠  MakerProfiles:   ${createdMakerProfiles.length} (4 duyệt / 1 chờ / 1 từ chối)`);
    console.log(`   🎨 CustomOrders:    ${createdCO.length} (hoàn thành / đang làm / tìm thợ / hủy mất cọc / hủy thường)`);
    console.log(`   💬 Bids:            ${createdBids.length}`);
    console.log(`   ⭐ Reviews:         ${createdReviews.length}`);
    console.log(`   🌟 ProductReviews:  ${createdPR.length}`);
    console.log(`   💰 CommissionDebts: ${debtsPayouts.length}`);
    console.log(`   💵 MakerPayouts:    ${debtsPayouts.length}`);
    console.log(`   🕵️  Logs:            ${logsData.length}`);

    console.log("\n🔑 Tài khoản mẫu:");
    console.log("   Admin:   admin@pinkycrafts.vn  /  admin123");
    console.log("   Thợ 1:   lan@gmail.com          /  user123   (Thợ Vàng 🥇, 52 đơn)");
    console.log("   Thợ 2:   minh@gmail.com         /  user123   (Thợ Bạc 🥈, 28 đơn)");
    console.log("   Thợ 3:   ha@gmail.com           /  user123   (Thợ Đồng 🥉, 7 đơn)");
    console.log("   Thợ 4:   tuan@gmail.com         /  user123   (Thợ Mới 🌱, 3 đơn)");
    console.log("   Thợ 5:   hoa@gmail.com          /  user123   (chờ duyệt)");
    console.log("   Khách 1: bao@gmail.com          /  user123");
    console.log("   Khách 2: khoa@gmail.com         /  user123");
    console.log("   Khách 3: chau@gmail.com         /  user123");
    console.log("   Khách 4: linh@gmail.com         /  user123");
    console.log("   Khách 5: nga@gmail.com          /  user123");
    console.log("   Thợ X:   mai@gmail.com          /  user123   (bị từ chối)");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ LỖI SEED DATABASE:", err.message);
    console.error(err);
    process.exit(1);
  }
};

seedAll();
