import React from 'react';
import { Link } from 'react-router-dom';
import { allProducts } from '../data'; 

const Home = () => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      
      <section className="relative bg-pink-50/50 py-32 md:py-48 overflow-hidden">
        <div className="absolute top-0 right-0 size-96 bg-pink-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 size-80 bg-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-white border border-pink-100 text-pink-500 text-xs font-black px-6 py-2 rounded-full mb-8 shadow-sm tracking-[0.2em] uppercase">
            Handmade with Love
          </span>
          <h1 className="text-6xl md:text-8xl font-serif text-gray-950 mb-10 leading-[1.1] tracking-tighter">
            Trao Gửi <span className="text-pink-400 italic">Cảm Xúc</span> <br /> 
            Qua Từng Sản Phẩm
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto font-light leading-relaxed">
            Khám phá thế giới đồ thủ công tinh tế, nơi mỗi món quà đều kể một câu chuyện riêng về sự tỉ mỉ và tâm huyết.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/products" 
              className="bg-pink-400 hover:bg-pink-500 text-white px-14 py-5 rounded-full text-lg font-bold transition-all duration-300 shadow-xl shadow-pink-100 transform hover:scale-105 active:scale-95"
            >
              Mua sắm ngay
            </Link>
            <button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-14 py-5 rounded-full text-lg font-bold transition-all shadow-sm">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Nến thơm', 'Phụ kiện', 'Trang trí'].map((cat, index) => (
              <div key={cat} className="group relative h-64 rounded-[2.5rem] overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="text-white text-3xl font-serif tracking-widest">{cat}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-6">
            <div>
                <span className="text-pink-400 font-bold tracking-widest uppercase text-xs mb-3 block">Bản tin tháng 4</span>
                <h3 className="text-4xl md:text-6xl font-serif text-gray-950 tracking-tighter leading-none">
                  Vừa <span className="italic text-pink-400">Ra Mắt</span>
                </h3>
            </div>
            <Link to="/products" className="text-gray-900 font-bold hover:text-pink-500 border-b-2 border-pink-100 hover:border-pink-500 pb-1 transition-all flex items-center gap-2">
              Tất cả sản phẩm
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {allProducts.slice(0, 3).map((p) => (
            <Link to={`/product/${p.id}`} key={p.id} className="group flex flex-col transform hover:-translate-y-3 transition-all duration-500">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-pink-50 border border-gray-100 group-hover:border-pink-200 transition-colors duration-500">
                <img 
                  src={p.img} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" 
                />
                <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-500">
                  {p.category}
                </div>
              </div>

              <div className="pt-8 text-center px-4">
                <h4 className="font-semibold text-2xl mb-3 text-gray-900 group-hover:text-pink-500 transition truncate">
                  {p.name}
                </h4>
                <p className="text-pink-500 font-black text-2xl font-serif italic">
                  {formatPrice(p.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-gray-950 text-gray-400 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h5 className="text-3xl font-extrabold text-pink-400 mb-8 tracking-tighter">PinkyCrafts</h5>
            <p className="text-lg font-light max-w-sm leading-relaxed">
              Ngôi nhà của những tác phẩm thủ công đích thực, nơi tình yêu được dệt vào từng sợi len, nặn vào từng thớ gốm.
            </p>
          </div>
          <div>
            <h6 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Shop</h6>
            <ul className="space-y-4 text-sm">
              <li><Link to="/products" className="hover:text-pink-400 transition">Tất cả sản phẩm</Link></li>
              <li><Link to="#" className="hover:text-pink-400 transition">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="hover:text-pink-400 transition">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Liên hệ</h6>
            <ul className="space-y-4 text-sm font-light">
              <li>hello@pinkycrafts.vn</li>
              <li>Quận 1, TP. Hồ Chí Minh</li>
              <li className="text-pink-400 font-bold italic">Instagram / Facebook</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-20 pt-10 border-t border-gray-900 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">
          © 2026 PinkyCrafts Studio. Crafted by your passion.
        </div>
      </footer>
    </div>
  );
};

export default Home;