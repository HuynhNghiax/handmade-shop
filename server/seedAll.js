/**
 * seedAll.js — Seed toàn bộ database local PinkyCrafts
 * Chạy: node server/seedAll.js
 *
 * Thứ tự seed: Users → Products → Orders → CustomOrders → Bids → Logs
 * Dùng { force: true } → XÓA SẠCH tất cả bảng và tạo lại.
 * CHỈ DÙNG CHO MÔI TRƯỜNG LOCAL / DEVELOPMENT!
 */

require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcryptjs');

const sequelize   = require('./config/db');
const User        = require('./models/User');
const Product     = require('./models/Product');
const Order       = require('./models/Order');
const CustomOrder = require('./models/CustomOrder');
const Bid         = require('./models/Bid');
const Log         = require('./models/Log');
const OtpCode     = require('./models/OtpCode');

// ─── DỮ LIỆU MẪU ────────────────────────────────────────────────────────────

const usersData = [
  {
    name: 'Admin Pinky',
    email: 'admin@pinky.com',
    password: 'admin123',
    isAdmin: true,
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Pinky&background=f43f5e&color=fff&size=128',
  },
  {
    name: 'Nguyễn Thị Lan',
    email: 'lan@gmail.com',
    password: 'user123',
    isAdmin: false,
    phone: '0912345678',
    address: '45 Lê Lợi, Q.3, TP.HCM',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Thi+Lan&background=fbcfe8&color=ec4899&size=128',
  },
  {
    name: 'Trần Văn Minh',
    email: 'minh@gmail.com',
    password: 'user123',
    isAdmin: false,
    phone: '0987654321',
    address: '78 Trần Hưng Đạo, Q.5, TP.HCM',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Van+Minh&background=dbeafe&color=3b82f6&size=128',
  },
  {
    name: 'Phạm Thị Hoa',
    email: 'hoa@gmail.com',
    password: 'user123',
    isAdmin: false,
    phone: '0976543210',
    address: '12 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM',
    avatar: null,
  },
];

const productsData = [
  {
    name: 'Vòng Tay Đá Tự Nhiên',
    price: 185000,
    category: 'Trang sức',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800',
    desc: 'Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.',
  },
  {
    name: 'Gối Tựa Lưng Thêu Tay',
    price: 280000,
    category: 'Trang trí',
    img: 'https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800',
    desc: 'Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.',
  },
  {
    name: 'Nến Thơm Handmade Tinh Dầu',
    price: 210000,
    category: 'Quà tặng',
    img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800',
    desc: 'Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.',
  },{
    name: 'Vòng Tay Đá Tự Nhiên',
    price: 185000,
    category: 'Trang sức',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800',
    desc: 'Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.',
  },
  {
    name: 'Gối Tựa Lưng Thêu Tay',
    price: 280000,
    category: 'Trang trí',
    img: 'https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800',
    desc: 'Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.',
  },
  {
    name: 'Nến Thơm Handmade Tinh Dầu',
    price: 210000,
    category: 'Quà tặng',
    img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800',
    desc: 'Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.',
  },
  {
    name: 'Vòng Tay Đá Tự Nhiên',
    price: 185000,
    category: 'Trang sức',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800',
    desc: 'Sự kết hợp giữa đá thạch anh và các hạt charm bạc, mang lại vẻ đẹp thanh lịch và bình an.',
  },
  {
    name: 'Gối Tựa Lưng Thêu Tay',
    price: 280000,
    category: 'Trang trí',
    img: 'https://images.unsplash.com/photo-1584132905271-512c958d674a?q=80&w=800',
    desc: 'Vỏ gối vải linen thêu họa tiết cỏ cây, mang thiên nhiên vào không gian sống của bạn.',
  },
  {
    name: 'Nến Thơm Handmade Tinh Dầu',
    price: 210000,
    category: 'Quà tặng',
    img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800',
    desc: 'Nến sáp đậu nành hòa quyện cùng tinh dầu thiên nhiên, giúp thư giãn sau ngày dài làm việc.',
  }
];

// ─── HÀM SEED CHÍNH ──────────────────────────────────────────────────────────

const seedAll = async () => {
  try {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║   🌸 PINKYCRAFTS — SEED DATABASE 🌸   ║');
    console.log('╚══════════════════════════════════════╝\n');

    // 1. Kết nối DB
    await sequelize.authenticate();
    console.log('✅ [1/7] Kết nối database thành công.');

    // 2. Sync tất cả models — xóa và tạo lại toàn bộ bảng
    await sequelize.sync({ force: true });
    console.log('✅ [2/7] Đã tạo lại toàn bộ bảng (force sync).');

    // 3. Seed Users (hash password)
    const hashedUsers = await Promise.all(
      usersData.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );
    const createdUsers = await User.bulkCreate(hashedUsers);
    console.log(`✅ [3/7] Đã tạo ${createdUsers.length} người dùng.`);
    console.log('   📌 Tài khoản admin: admin@pinky.com / admin123');
    console.log('   📌 Tài khoản user:  lan@gmail.com  / user123\n');

    // 4. Seed Products
    const createdProducts = await Product.bulkCreate(productsData);
    console.log(`✅ [4/7] Đã tạo ${createdProducts.length} sản phẩm.`);

    // 5. Seed Orders (dùng userId từ user đã tạo)
    const userId_Lan  = createdUsers[1].id; // Lan
    const userId_Minh = createdUsers[2].id; // Minh
    const userId_Hoa  = createdUsers[3].id; // Hoa

    const ordersData = [
      {
        userId: userId_Lan,
        products: [
          { id: createdProducts[0].id, name: createdProducts[0].name, price: 280000, quantity: 2 },
          { id: createdProducts[3].id, name: createdProducts[3].name, price: 185000, quantity: 1 },
        ],
        totalAmount: 775000,
        address: '45 Lê Lợi, Q.3, TP.HCM',
        phone: '0912345678',
        status: 'Hoàn thành',
      },
      {
        userId: userId_Minh,
        products: [
          { id: createdProducts[5].id, name: createdProducts[5].name, price: 450000, quantity: 1 },
        ],
        totalAmount: 480000,
        address: '78 Trần Hưng Đạo, Q.5, TP.HCM',
        phone: '0987654321',
        status: 'Đang giao',
      },
      {
        userId: userId_Hoa,
        products: [
          { id: createdProducts[1].id, name: createdProducts[1].name, price: 250000, quantity: 1 },
          { id: createdProducts[7].id, name: createdProducts[7].name, price: 390000, quantity: 1 },
        ],
        totalAmount: 670000,
        address: '12 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM',
        phone: '0976543210',
        status: 'Chờ xác nhận',
      },
      {
        userId: userId_Lan,
        products: [
          { id: createdProducts[6].id, name: createdProducts[6].name, price: 380000, quantity: 2 },
        ],
        totalAmount: 790000,
        address: '45 Lê Lợi, Q.3, TP.HCM',
        phone: '0912345678',
        status: 'Chờ xác nhận',
      },
    ];
    const createdOrders = await Order.bulkCreate(ordersData);
    console.log(`✅ [5/7] Đã tạo ${createdOrders.length} đơn hàng.`);

    // 6. Seed CustomOrders + Bids
    const customOrdersData = [
      {
        userId: userId_Lan,
        title: 'Túi len hình mèo Sanrio',
        description: 'Muốn đặt một chiếc túi tote len có hình mèo Hello Kitty phong cách Sanrio, màu hồng pastel, size vừa đủ đựng laptop 13 inch. Thêm tai và nơ cho mèo càng tốt ạ.',
        budget: 600000,
        status: 'Đang tìm thợ',
      },
      {
        userId: userId_Minh,
        title: 'Nến thơm mùi cà phê sữa Việt Nam',
        description: 'Tôi muốn đặt nến thơm mùi cà phê sữa đá kiểu Việt Nam, có thể kết hợp thêm thoáng mùi sữa đặc. Nến phải cháy được ít nhất 40 tiếng. Đựng trong hũ thủy tinh bo tròn.',
        budget: 350000,
        status: 'Đang tìm thợ',
      },
      {
        userId: userId_Hoa,
        title: 'Vòng tay đá tự nhiên theo mệnh Thổ',
        description: 'Cần vòng tay đá tự nhiên phù hợp mệnh Thổ, màu vàng nâu ấm. Ưu tiên đá mắt hổ và đá thạch anh vàng. Size tay nữ, chu vi 16cm.',
        budget: 280000,
        status: 'Đang tìm thợ',
      },
    ];
    const createdCustomOrders = await CustomOrder.bulkCreate(customOrdersData);
    console.log(`   → Đã tạo ${createdCustomOrders.length} yêu cầu gia công.`);

    // Bids: Minh và Hoa báo giá cho yêu cầu của Lan; Lan báo giá cho yêu cầu của Minh
    const bidsData = [
      {
        customOrderId: createdCustomOrders[0].id, // yêu cầu của Lan
        makerId: userId_Minh,
        price: 550000,
        message: 'Mình đan len được hơn 3 năm, chuyên làm túi len theo yêu cầu. Có thể hoàn thành trong 7-10 ngày. Len sợi cotton Hàn Quốc cao cấp.',
        contactInfo: '0987654321',
      },
      {
        customOrderId: createdCustomOrders[0].id, // yêu cầu của Lan
        makerId: userId_Hoa,
        price: 580000,
        message: 'Mình có kinh nghiệm đan len hình thú cute, chuyên về Sanrio. Giao hàng trong 5-7 ngày. Có thể làm thêm móc khóa mèo đi kèm miễn phí.',
        contactInfo: '0976543210',
      },
      {
        customOrderId: createdCustomOrders[1].id, // yêu cầu của Minh
        makerId: userId_Lan,
        price: 320000,
        message: 'Mình chuyên làm nến handmade theo yêu cầu. Sẽ thử pha hương trước khi đổ nến chính thức để bạn duyệt mùi. Thời gian: 3-5 ngày.',
        contactInfo: '0912345678',
      },
    ];
    const createdBids = await Bid.bulkCreate(bidsData);
    console.log(`   → Đã tạo ${createdBids.length} báo giá.`);
    console.log(`✅ [6/7] Seed CustomOrders & Bids hoàn tất.`);

    // 7. Seed Logs
    const logsData = [
      {
        userId: createdUsers[1].id,
        userName: 'Nguyễn Thị Lan',
        action: 'Đăng nhập thành công',
        details: 'Đăng nhập bằng email/password',
        status: 'Thành công',
      },
      {
        userId: createdUsers[2].id,
        userName: 'Trần Văn Minh',
        action: 'Đặt hàng',
        details: `Đã đặt đơn hàng #${createdOrders[1].id} - Tổng: 480,000đ`,
        status: 'Thành công',
      },
      {
        userId: createdUsers[3].id,
        userName: 'Phạm Thị Hoa',
        action: 'Cố gắng truy cập trái phép',
        details: 'Người dùng này đã cố mò vào trang Dashboard',
        status: 'Bị chặn',
      },
      {
        userId: createdUsers[1].id,
        userName: 'Nguyễn Thị Lan',
        action: 'Đăng yêu cầu gia công',
        details: 'Đăng yêu cầu: Túi len hình mèo Sanrio',
        status: 'Thành công',
      },
      {
        userId: null,
        userName: 'Khách vãng lai',
        action: 'Xem sản phẩm',
        details: 'Truy cập trang sản phẩm không cần đăng nhập',
        status: 'Thành công',
      },
    ];
    await Log.bulkCreate(logsData);
    console.log(`✅ [7/7] Đã tạo ${logsData.length} bản ghi nhật ký.`);

    // ─── TỔNG KẾT ────────────────────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║         ✨ SEED HOÀN TẤT ✨            ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('\n📊 Tóm tắt dữ liệu đã tạo:');
    console.log(`   👥 Users:         ${createdUsers.length} (1 admin + ${createdUsers.length - 1} user)`);
    console.log(`   🧶 Products:      ${createdProducts.length}`);
    console.log(`   📦 Orders:        ${createdOrders.length}`);
    console.log(`   🎨 CustomOrders:  ${createdCustomOrders.length}`);
    console.log(`   💬 Bids:          ${createdBids.length}`);
    console.log(`   🕵️  Logs:          ${logsData.length}`);
    console.log('\n🔑 Tài khoản mẫu để đăng nhập:');
    console.log('   Admin:  admin@pinky.com  /  admin123');
    console.log('   User 1: lan@gmail.com    /  user123');
    console.log('   User 2: minh@gmail.com   /  user123');
    console.log('   User 3: hoa@gmail.com    /  user123\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ LỖI SEED DATABASE:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seedAll();
