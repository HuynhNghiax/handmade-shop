import React, { useState } from 'react';

const products = [
  { id: 1, name: "Nến Thơm Hoa Hồng Khô Đại", price: 250000, img: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=500", category: "Trang trí" },
  { id: 2, name: "Vòng Tay Đá Thạch Anh Phấn", price: 150000, img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500", category: "Phụ kiện" },
  { id: 3, name: "Túi Len Handmade Màu Pastel", price: 580000, img: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=500", category: "Thời trang" },
  { id: 4, name: "Bộ 10 Thiệp Hoa Khô Vintage", price: 120000, img: "https://images.unsplash.com/photo-1592997571659-0b21ff64313b?w=500", category: "Quà tặng" },
  { id: 5, name: "Lọ Hoa Gốm Thủ Công Sắc Hồng", price: 395000, img: "https://images.unsplash.com/photo-1581212356586-89689585675e?w=500", category: "Trang trí" },
  { id: 6, name: "Kẹp Tóc Đính Ngọc Trai Nhân Tạo", price: 95000, img: "https://images.unsplash.com/photo-1632761611181-a9667793d9be?w=500", category: "Phụ kiện" },
];

function App() {
  const [cartCount, setCartCount] = useState(0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 antialiased">
      
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center">
          <a href="/" className="text-3xl font-extrabold text-pink-500 tracking-tighter">
            Pinky<span className="text-gray-900">Crafts</span>
          </a>

          <nav className="hidden md:flex items-center gap-10 text-base font-semibold text-gray-700">
            {['Trang chủ', 'Sản phẩm', 'Quà tặng', 'Bộ sưu tập'].map(item => (
              <a key={item} href="#" className="hover:text-pink-500 transition-colors duration-200">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button className="relative text-gray-700 hover:text-pink-500 transition p-2.5 rounded-full hover:bg-pink-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.263-12c.078-.744.704-1.293 1.45-1.293h12.295c.746 0 1.372.549 1.45 1.293Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-pink-500 text-white text-xs font-bold size-5 flex items-center justify-center rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="text-sm font-bold text-gray-700 bg-gray-100 px-6 py-3 rounded-full hover:bg-gray-200 transition">
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      <section className="bg-pink-50/70 py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-white text-pink-600 text-xs font-bold px-5 py-2 rounded-full mb-8 shadow-sm border border-pink-100 tracking-wider uppercase">
            Gửi gắm trái tim vào từng chi tiết
          </span>

          <h2 className="text-6xl md:text-8xl font-serif text-gray-950 mb-10 leading-none max-w-4xl mx-auto tracking-tighter">
            Nét Đẹp Thủ Công, <span className="text-pink-400">Ngọt Ngào</span> 
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-16 max-w-3xl mx-auto font-light leading-relaxed">
            Khám phá bộ sưu tập quà tặng, trang trí và phụ kiện thủ công tinh tế, được làm từ vật liệu tự nhiên với trọn vẹn sự tỉ mỉ.
          </p>
          <button className="bg-pink-400 hover:bg-pink-500 text-white px-14 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-lg transform hover:scale-105">
            Xem Bộ Sưu Tập Mới
          </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
        <div className="flex items-center justify-between mb-20">
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight">
              Sản phẩm <span className="text-pink-500">Mới Nhất</span>
            </h3>
            <a href="#" className="text-pink-500 font-semibold hover:underline flex items-center gap-2">
              Xem tất cả
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {products.map((p) => (
            <div key={p.id} className="group bg-white rounded-3xl relative flex flex-col overflow-hidden transition-all duration-300 transform hover:-translate-y-2">
              {/* Category Tag */}
              <span className="absolute top-5 left-5 z-10 bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                {p.category}
              </span>

              <div className="overflow-hidden rounded-3xl aspect-[10/11] bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-pink-100">
                <img 
                  src={p.img} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                />
              </div>

              <div className="pt-8 pb-5 flex flex-col flex-grow px-2">
                <h4 className="font-semibold text-2xl mb-4 text-gray-900 group-hover:text-pink-600 transition truncate">
                  {p.name}
                </h4>
                
                <div className="flex items-end justify-between gap-4 mt-auto pt-6 border-t border-gray-100">
                  <p className="text-pink-500 font-extrabold text-3xl">
                    {formatPrice(p.price)}
                  </p>
                  <button 
                    onClick={() => setCartCount(c => c + 1)}
                    className="size-14 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-500 hover:text-white transition duration-200 flex items-center justify-center active:scale-95 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-950 text-gray-300 py-24 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h5 className="text-3xl font-extrabold text-pink-400 mb-8 tracking-tighter">PinkyCrafts</h5>
            <p className="text-gray-400 font-light text-lg max-w-md leading-relaxed">Ngôi nhà của những món đồ handmade tinh tế, được làm tỉ mỉ với trọn vẹn sự yêu thương và vật liệu tự nhiên.</p>
          </div>
          <div>
            <h6 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Hỗ trợ</h6>
            <ul className="space-y-4 text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-white transition">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-white transition">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Kết nối</h6>
            <ul className="space-y-4 text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition">contact@pinkycrafts.vn</a></li>
              <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-20 pt-10 border-t border-gray-800 text-center text-gray-500 text-sm font-light">
          © 2026 PinkyCrafts Shop. Tất cả quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
};

export default App;