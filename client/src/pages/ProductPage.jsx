import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { allProducts } from '../data';

const categories = ["Tất cả", "Nến thơm", "Phụ kiện", "Túi len", "Trang trí"];

const ProductPage = () => {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState(""); // State để lưu từ khóa tìm kiếm
  const [sortBy, setSortBy] = useState("Mới nhất");

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // LOGIC LỌC TỔNG HỢP: Lọc theo Danh mục + Lọc theo Từ khóa
  const filteredProducts = allProducts.filter(p => {
    const matchesCategory = activeCategory === "Tất cả" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* 1. HEADER */}
      <div className="bg-pink-50/30 py-16 border-b border-pink-100/50 text-center">
        <h1 className="text-5xl md:text-6xl font-serif text-gray-950 tracking-tighter mb-4">
          Cửa Hàng <span className="italic text-pink-400">Trực Tuyến</span>
        </h1>
        <p className="text-gray-400 font-light italic text-sm tracking-widest uppercase">
          Khám phá những món đồ ngọt ngào nhất
        </p>
      </div>

      {/* 2. TOOLBAR (Sticky) - Nơi chứa Tìm kiếm và Lọc */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Thanh Tìm Kiếm (Mới thêm vào) */}
          <div className="relative w-full lg:w-96 group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Bạn đang tìm món đồ nào?..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent rounded-full pl-14 pr-6 py-3.5 text-sm outline-none focus:bg-white focus:border-pink-100 focus:ring-4 focus:ring-pink-50 transition-all duration-300"
            />
          </div>

          {/* Bộ Lọc Danh Mục */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-2 lg:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  activeCategory === cat 
                  ? 'bg-pink-400 border-pink-400 text-white shadow-lg shadow-pink-100' 
                  : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200 hover:text-pink-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sắp xếp (Ẩn trên mobile để gọn hơn) */}
          <div className="hidden xl:flex items-center gap-3">
             <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Sắp xếp:</span>
             <select className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer">
                <option>Mới nhất</option>
                <option>Giá tăng dần</option>
             </select>
          </div>
        </div>
      </div>

      {/* 3. GRID SẢN PHẨM */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {/* Thông báo kết quả tìm kiếm */}
        {searchTerm && (
          <p className="mb-10 text-gray-500 italic">
            Kết quả tìm kiếm cho: "<span className="text-pink-500 font-bold">{searchTerm}</span>" 
            ({filteredProducts.length} sản phẩm)
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((p) => (
            <div key={p.id} className="group relative flex flex-col transform transition duration-500 hover:-translate-y-2">
              <Link to={`/product/${p.id}`} className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-pink-50 border border-gray-100 group-hover:border-pink-200 transition-all duration-500 block">
                <img 
                  src={p.img} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute bottom-6 left-6 right-6 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  <button className="w-full bg-white/90 backdrop-blur-md text-gray-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">
                    Xem chi tiết
                  </button>
                </div>
              </Link>
              
              <div className="mt-8 text-center px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-300 mb-2 block">{p.category}</span>
                <h4 className="text-lg font-bold text-gray-950 mb-2 truncate group-hover:text-pink-500 transition-colors leading-tight">{p.name}</h4>
                <p className="text-xl font-serif text-gray-500 italic">{formatPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE - Khi không tìm thấy sản phẩm */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-40 animate-in fade-in duration-700">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-serif italic text-gray-950 mb-2">Không tìm thấy sản phẩm nào</h3>
            <p className="text-gray-400 font-light mb-10">Hãy thử đổi từ khóa hoặc chọn danh mục khác bạn nhé!</p>
            <button 
              onClick={() => {setSearchTerm(""); setActiveCategory("Tất cả")}}
              className="bg-gray-950 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-pink-500 transition-all"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;