/**
 * seedAll.js — Seed toàn bộ database local PinkyCrafts
 * Chạy: node server/seedAll.js
 *
 * Thứ tự seed: Users → Products → Orders → MakerProfiles → CustomOrders → Bids → Reviews → Logs
 * Dùng { force: true } → XÓA SẠCH tất cả bảng và tạo lại.
 * CHỈ DÙNG CHO MÔI TRƯỜNG LOCAL / DEVELOPMENT!
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
require("./models/associations");

// ─── DỮ LIỆU MẪU ────────────────────────────────────────────────────────────

const usersData = [
  {
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
    // index 1 — khách hàng thường, cũng là thợ đã được duyệt
    name: "Nguyễn Thị Lan",
    email: "lan@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true,
    phone: "0912345678",
    address: "45 Lê Lợi, Q.3, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Nguyen+Thi+Lan&background=fbcfe8&color=ec4899&size=128",
  },
  {
    // index 2 — khách hàng thường, cũng là thợ đã được duyệt
    name: "Trần Văn Minh",
    email: "minh@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true,
    phone: "0987654321",
    address: "78 Trần Hưng Đạo, Q.5, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Tran+Van+Minh&background=dbeafe&color=3b82f6&size=128",
  },
  {
    // index 3 — khách hàng thường, thợ đang chờ duyệt
    name: "Phạm Thị Hoa",
    email: "hoa@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: true,
    phone: "0976543210",
    address: "12 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Pham+Thi+Hoa&background=d1fae5&color=059669&size=128",
  },
  {
    // index 4 — khách hàng thuần, không làm thợ
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
    // index 5 — thợ bị từ chối
    name: "Võ Thị Mai",
    email: "mai@gmail.com",
    password: "user123",
    isAdmin: false,
    isMaker: false,
    phone: "0954321098",
    address: "56 Cách Mạng Tháng 8, Q.3, TP.HCM",
    avatar:
      "https://ui-avatars.com/api/?name=Vo+Thi+Mai&background=ede9fe&color=7c3aed&size=128",
  },
];

// ─── GIỮ NGUYÊN PRODUCTS (ảnh hoạt động) ────────────────────────────────────
const productsData = [
  {
    name: "Vòng Tay Đá Tự Nhiên",
    price: 185000,
    category: "Trang sức",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
    desc: "Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.",
  },
  {
    name: "Gối Tựa Lưng Thêu Tay",
    price: 280000,
    category: "Trang trí",
    img: "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800",
    desc: "Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.",
  },
  {
    name: "Nến Thơm Handmade Tinh Dầu",
    price: 210000,
    category: "Quà tặng",
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
    desc: "Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.",
  },
  {
    name: "Vòng Tay Đá Tự Nhiên",
    price: 185000,
    category: "Trang sức",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
    desc: "Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.",
  },
  {
    name: "Gối Tựa Lưng Thêu Tay",
    price: 280000,
    category: "Trang trí",
    img: "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800",
    desc: "Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.",
  },
  {
    name: "Nến Thơm Handmade Tinh Dầu",
    price: 210000,
    category: "Quà tặng",
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
    desc: "Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.",
  },
  {
    name: "Vòng Tay Đá Tự Nhiên",
    price: 185000,
    category: "Trang sức",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800",
    desc: "Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.",
  },
  {
    name: "Gối Tựa Lưng Thêu Tay",
    price: 280000,
    category: "Trang trí",
    img: "https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800",
    desc: "Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.",
  },
  {
    name: "Nến Thơm Handmade Tinh Dầu",
    price: 210000,
    category: "Quà tặng",
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
    desc: "Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.",
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
    console.log("✅ [1/9] Kết nối database thành công.");

    // 2. Sync tất cả models — xóa và tạo lại toàn bộ bảng
    await sequelize.sync({ force: true });
    console.log("✅ [2/9] Đã tạo lại toàn bộ bảng (force sync).");

    // 3. Seed Users (hash password)
    const hashedUsers = await Promise.all(
      usersData.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      })),
    );
    const createdUsers = await User.bulkCreate(hashedUsers);
    console.log(`✅ [3/9] Đã tạo ${createdUsers.length} người dùng.`);
    console.log("   📌 Tài khoản admin: admin@pinky.com / admin123");
    console.log("   📌 Tài khoản user:  lan@gmail.com   / user123\n");

    const userId_Admin = createdUsers[0].id;
    const userId_Lan = createdUsers[1].id;
    const userId_Minh = createdUsers[2].id;
    const userId_Hoa = createdUsers[3].id;
    const userId_Bao = createdUsers[4].id;
    const userId_Mai = createdUsers[5].id;

    // 4. Seed Products
    const createdProducts = await Product.bulkCreate(productsData);
    console.log(`✅ [4/9] Đã tạo ${createdProducts.length} sản phẩm.`);

    // 5. Seed Orders — đủ mọi trạng thái để demo filter
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
    console.log(`✅ [5/9] Đã tạo ${createdOrders.length} đơn hàng.`);

    // 6. Seed MakerProfiles
    //    Lan & Minh → da_duyet (có thể nhận đơn gia công)
    //    Hoa        → cho_duyet (đang chờ Admin)
    //    Mai        → tu_choi
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
        status: "da_duyet",
        rating: 4.7,
        totalDone: 23,
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
        status: "da_duyet",
        rating: 4.4,
        totalDone: 15,
      },
      {
        userId: userId_Hoa,
        bio: "Hoa yêu thích vẽ tranh màu nước và thêu tay. Nhận đơn vẽ tranh chân dung, phong cảnh hoặc thêu tên lên quần áo, phụ kiện theo yêu cầu.",
        skills: "vẽ tranh,thêu",
        portfolio: [
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400",
          "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=400",
        ],
        status: "cho_duyet",
        rating: 0,
        totalDone: 0,
      },
      {
        userId: userId_Mai,
        bio: "Mai nhận làm đồ handmade đủ loại.",
        skills: "may,đan",
        portfolio: [],
        status: "tu_choi",
        rating: 0,
        totalDone: 0,
      },
    ];
    const createdMakerProfiles =
      await MakerProfile.bulkCreate(makerProfilesData);
    console.log(`✅ [6/9] Đã tạo ${createdMakerProfiles.length} hồ sơ thợ.`);
    console.log(`   → da_duyet: Lan, Minh | cho_duyet: Hoa | tu_choi: Mai`);

    // MakerProfile id mapping (theo thứ tự insert)
    const makerProfile_Lan = createdMakerProfiles[0]; // id của MakerProfile Lan
    const makerProfile_Minh = createdMakerProfiles[1]; // id của MakerProfile Minh

    // 7. Seed CustomOrders + Bids
    //    Scenario A: Lan đang tìm thợ (bids mở)
    //    Scenario B: Bao đã chọn thợ Minh, đang thực hiện
    //    Scenario C: Bao đã hoàn thành đơn với Lan → có review
    //    Scenario D: Minh đang tìm thợ
    //    Scenario E: Hoa đăng yêu cầu chưa ai báo giá
    const customOrdersData = [
      {
        // [0] Lan đăng, đang tìm thợ, có 2 bid
        userId: userId_Lan,
        makerId: null,
        acceptedBidId: null,
        title: "Túi tote len hình mèo Sanrio",
        description:
          "Muốn đặt một chiếc túi tote len có hình mèo Hello Kitty phong cách Sanrio, màu hồng pastel, size vừa đủ đựng laptop 13 inch. Thêm tai và nơ cho mèo càng tốt ạ.",
        budget: 600000,
        status: "Đang tìm thợ",
      },
      {
        // [1] Bao đăng, đã chọn thợ Lan, đang thực hiện
        userId: userId_Bao,
        makerId: userId_Lan,
        acceptedBidId: null, // sẽ update sau khi tạo bid
        title: "Nến thơm mùi cà phê sữa Việt Nam",
        description:
          "Tôi muốn đặt nến thơm mùi cà phê sữa đá kiểu Việt Nam, kết hợp thoáng mùi sữa đặc. Nến phải cháy được ít nhất 40 tiếng. Đựng trong hũ thủy tinh bo tròn.",
        budget: 350000,
        status: "Đang thực hiện",
      },
      {
        // [2] Bao đăng, đã hoàn thành với Minh → sẽ tạo review
        userId: userId_Bao,
        makerId: userId_Minh,
        acceptedBidId: null, // sẽ update sau
        title: "Ví da bò handmade đựng thẻ và tiền mặt",
        description:
          "Cần ví da bò thật dạng gấp đôi, có ngăn đựng 6-8 thẻ và ngăn tiền mặt. Màu nâu cognac. Khâu tay toàn bộ, chỉ sáp màu vàng đồng.",
        budget: 800000,
        status: "Hoàn thành",
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
      },
      {
        // [4] Hoa đăng, chưa có bid nào
        userId: userId_Hoa,
        makerId: null,
        acceptedBidId: null,
        title: "Tranh thêu tay chân dung thú cưng",
        description:
          "Mình muốn thêu chân dung chú mèo vàng nhà mình lên khung 20x20cm. Màu sắc trung thành với ảnh gốc. Dùng làm quà sinh nhật nên cần xong trong 2 tuần.",
        budget: 450000,
        status: "Đang tìm thợ",
      },
      {
        // [5] Lan đăng, đã hủy
        userId: userId_Lan,
        makerId: null,
        acceptedBidId: null,
        title: "Móc chìa khóa len hình gấu trúc",
        description:
          "Đặt 10 cái móc chìa khóa len hình gấu trúc mini làm quà tặng bạn bè. Mỗi cái khoảng 5-6cm.",
        budget: 200000,
        status: "Đã hủy",
      },
    ];
    const createdCustomOrders = await CustomOrder.bulkCreate(customOrdersData);
    console.log(`   → Đã tạo ${createdCustomOrders.length} yêu cầu gia công.`);

    // Bids
    const bidsData = [
      {
        // bid cho customOrder[0] (Lan tìm thợ) — người báo: Minh
        customOrderId: createdCustomOrders[0].id,
        makerId: userId_Minh,
        price: 550000,
        message:
          "Mình đan len được hơn 3 năm, chuyên làm túi theo yêu cầu. Hoàn thành trong 7-10 ngày. Len cotton Hàn Quốc cao cấp, mềm và bền màu.",
        contactInfo: "0987654321",
      },
      {
        // bid cho customOrder[0] — người báo: Hoa (chưa được duyệt, nhưng seed thẳng vào DB để demo giao diện)
        customOrderId: createdCustomOrders[0].id,
        makerId: userId_Hoa,
        price: 580000,
        message:
          "Mình chuyên làm đồ Sanrio, có kinh nghiệm đan hình thú cute. Giao trong 5-7 ngày. Tặng kèm móc khóa mèo mini nếu bạn chọn mình.",
        contactInfo: "0976543210",
      },
      {
        // bid cho customOrder[1] (Bao chọn Lan) — người báo: Lan ← đây là bid được chấp nhận
        customOrderId: createdCustomOrders[1].id,
        makerId: userId_Lan,
        price: 320000,
        message:
          "Mình chuyên làm nến handmade theo yêu cầu, đã làm hơn 50 đơn. Sẽ gửi mẫu mùi trước khi đổ nến chính để bạn duyệt. Thời gian: 3-5 ngày.",
        contactInfo: "0912345678",
      },
      {
        // bid cho customOrder[2] (Bao - Minh đã hoàn thành) — người báo: Minh ← được chấp nhận
        customOrderId: createdCustomOrders[2].id,
        makerId: userId_Minh,
        price: 750000,
        message:
          "Mình làm đồ da 5 năm, chuyên ví và túi da bò thật. Khâu tay toàn bộ bằng chỉ sáp Mỹ. Giao hàng trong 10-14 ngày. Bảo hành 6 tháng.",
        contactInfo: "0987654321",
      },
      {
        // bid cho customOrder[3] (Minh tìm thợ) — người báo: Lan
        customOrderId: createdCustomOrders[3].id,
        makerId: userId_Lan,
        price: 260000,
        message:
          "Mình hay làm vòng tay đá theo mệnh cho bạn bè. Sẽ tư vấn thêm loại đá phù hợp nhất cho mệnh Thổ của bạn.",
        contactInfo: "0912345678",
      },
    ];
    const createdBids = await Bid.bulkCreate(bidsData);
    console.log(`   → Đã tạo ${createdBids.length} báo giá.`);

    // Cập nhật acceptedBidId cho customOrder[1] và customOrder[2]
    await createdCustomOrders[1].update({ acceptedBidId: createdBids[2].id });
    await createdCustomOrders[2].update({ acceptedBidId: createdBids[3].id });
    console.log(`✅ [7/9] Seed CustomOrders & Bids hoàn tất.`);

    // 8. Seed Reviews (chỉ cho đơn Hoàn thành — customOrder[2])
    //    Bao đánh giá Minh sau khi nhận ví da
    const reviewsData = [
      {
        customOrderId: createdCustomOrders[2].id,
        reviewerId: userId_Bao,
        makerId: makerProfile_Minh.id, // MakerProfile.id, không phải userId
        rating: 5,
        comment:
          "Ví đẹp hơn mình tưởng! Da bò thật, mùi thơm tự nhiên, đường chỉ rất thẳng và đều. Anh Minh tư vấn nhiệt tình, giao hàng đúng hẹn. Sẽ quay lại đặt tiếp.",
      },
    ];
    const createdReviews = await Review.bulkCreate(reviewsData);
    console.log(`✅ [8/9] Đã tạo ${createdReviews.length} đánh giá.`);

    // Cập nhật lại rating trung bình cho Minh sau khi có review
    // Minh: 1 review 5 sao → rating = 5.0, totalDone đã là 15 (seed sẵn trong MakerProfile)
    await makerProfile_Minh.update({ rating: 5.0 });

    // 9. Seed Logs
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
    ];
    await Log.bulkCreate(logsData);
    console.log(`✅ [9/9] Đã tạo ${logsData.length} bản ghi nhật ký.`);

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
    console.log(`   🎨 CustomOrders:   ${createdCustomOrders.length}`);
    console.log(`   💬 Bids:           ${createdBids.length}`);
    console.log(`   ⭐ Reviews:        ${createdReviews.length}`);
    console.log(`   🕵️  Logs:           ${logsData.length}`);
    console.log("\n🔑 Tài khoản mẫu để đăng nhập:");
    console.log("   Admin:  admin@pinky.com  /  admin123");
    console.log(
      "   Thợ 1:  lan@gmail.com    /  user123   (da_duyet, rating 4.7)",
    );
    console.log(
      "   Thợ 2:  minh@gmail.com   /  user123   (da_duyet, rating 5.0)",
    );
    console.log("   Thợ 3:  hoa@gmail.com    /  user123   (cho_duyet)");
    console.log("   Khách:  bao@gmail.com    /  user123   (không làm thợ)");
    console.log("   Thợ 4:  mai@gmail.com    /  user123   (tu_choi)\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ LỖI SEED DATABASE:", err.message);
    console.error(err);
    process.exit(1);
  }
};

seedAll();
