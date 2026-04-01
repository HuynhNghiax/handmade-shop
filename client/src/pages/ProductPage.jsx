import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { allProducts } from '../data';

const categories = ["Tất cả", "Nến thơm", "Phụ kiện", "Túi len", "Trang trí"];

const ProductPage = () => {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filteredProducts = activeCategory === "Tất cả" 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="bg-pink-50/30 py-20 border-b border-pink-100/50 text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-gray-950 tracking-tighter mb-4">
          Cửa Hàng <span className="italic text-pink-400">Trực Tuyến</span>
        </h1>
        <p className="text-gray-500 font-light italic">Mỗi món đồ là một tác phẩm nghệ thuật thu nhỏ</p>
      </div>

      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${
                activeCategory === cat 
                ? 'bg-pink-400 border-pink-400 text-white shadow-lg shadow-pink-100' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-pink-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-20">
          {filteredProducts.map((p) => (
            <div key={p.id} className="group relative flex flex-col transform transition duration-500 hover:-translate-y-2">
              <Link to={`/product/${p.id}`} className="relative aspect-[3/4] overflow-hidden rounded-[3rem] bg-pink-50 border border-gray-100 group-hover:border-pink-200 transition-all duration-500">
                <img 
                  src={p.img} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all"></div>
                <div className="absolute bottom-6 left-6 right-6 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  <button className="w-full bg-white/90 backdrop-blur-md text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                    Chi tiết sản phẩm
                  </button>
                </div>
              </Link>
              
              <div className="mt-8 text-center px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 mb-2 block">{p.category}</span>
                <h4 className="text-xl font-bold text-gray-950 mb-2 truncate group-hover:text-pink-500 transition-colors">{p.name}</h4>
                <p className="text-xl font-serif text-gray-600 italic">{formatPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-40 italic text-gray-400">Hiện chưa có sản phẩm nào trong mục này...</div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;