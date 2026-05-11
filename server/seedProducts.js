const sequelize = require('./config/db');
const Product = require('./models/Product');

const sampleProducts = [
  { name: "Nến Thơm Midnight Rose", price: 280000, category: "Nến thơm", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500", desc: "Hương hoa hồng đen bí ẩn kết hợp với gỗ đàn hương trầm ấm." },
  { name: "Nến Thơm Lavender Dream", price: 250000, category: "Nến thơm", img: "https://images.unsplash.com/photo-1596433809252-260c2745dfdd?w=500", desc: "Giúp bạn đi sâu vào giấc ngủ với hương oải hương tinh khiết." },
  { name: "Vòng Tay Đá Moonstone", price: 185000, category: "Phụ kiện", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500", desc: "Đá mặt trăng tự nhiên giúp cân bằng cảm xúc." },
  { name: "Túi Tote Len Xanh Bơ", price: 450000, category: "Túi len", img: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=500", desc: "Đan họa tiết nổi vặn thừng thủ công." },
  { name: "Lọ Hoa Gốm Men Hỏa Biến", price: 390000, category: "Trang trí", img: "https://images.unsplash.com/photo-1581212356586-89689585675e?w=500", desc: "Màu men độc bản thay đổi theo nhiệt độ lò nung." }
];

const seedDB = async () => {
  try {
    console.log("--- BẮT ĐẦU QUÁ TRÌNH SEED ---");
    
    // Kiểm tra kết nối trước
    await sequelize.authenticate();
    console.log("1. Kết nối Database thành công.");

    // Dùng force: true để XÓA BẢNG CŨ và TẠO MỚI (Để chắc chắn dữ liệu sạch)
    await sequelize.sync({ force: true });
    console.log("2. Đã xóa và tạo lại bảng Products mới.");

    // Chèn dữ liệu
    await Product.bulkCreate(sampleProducts);
    console.log(`3. Đã chèn thành công ${sampleProducts.length} sản phẩm.`);

    // Kiểm tra lại lần cuối bằng lệnh đếm
    const count = await Product.count();
    console.log(`4. Kiểm tra thực tế: Có ${count} dòng trong bảng Products.`);

    console.log("--- HOÀN TẤT: DỮ LIỆU ĐÃ NẰM TRONG DB ---");
    process.exit();
  } catch (err) {
    console.error("❌ LỖI RỒI SẾP ƠI:", err);
    process.exit(1);
  }
};

seedDB();