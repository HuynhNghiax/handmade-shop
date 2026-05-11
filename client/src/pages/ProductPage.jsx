import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortOption, setSortOption] = useState("default");
  const [loading, setLoading] = useState(true);

  // --- QUẢN LÝ CHIA TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = ["Tất cả", "Nến thơm", "Phụ kiện", "Túi len", "Trang trí"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Mỗi khi lọc hoặc sắp xếp thay đổi, phải đưa người dùng về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOption]);

  // --- LOGIC XỬ LÝ DỮ LIỆU (Lọc & Sắp xếp) ---
  const getProcessedProducts = () => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Tất cả" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortOption === "priceAsc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "priceDesc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  const allFilteredProducts = getProcessedProducts();

  // --- LOGIC CHIA TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allFilteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allFilteredProducts.length / itemsPerPage);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-2xl animate-pulse text-pink-400">
      Đang chuẩn bị kệ hàng...
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* HEADER & SEARCH SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b pb-12 border-pink-50">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif tracking-tighter italic mb-2 text-gray-950">
              Cửa hàng <span className="text-pink-400">Pinky</span>
            </h1>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Gói trọn yêu thương trong từng món quà</p>
          </div>
          
          <div className="w-full max-w-md space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm món đồ bạn yêu thích..." 
                className="bg-gray-50 px-8 py-4 rounded-2xl w-full outline-none focus:ring-2 focus:ring-pink-100 transition-all tracking-tight text-sm border border-gray-100"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <label className="text-[10px] font-black uppercase tracking-tight text-gray-400">Sắp xếp:</label>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white border border-gray-200 text-xs font-bold rounded-xl px-4 py-2 outline-none cursor-pointer"
              >
                <option value="default">Mới nhất</option>
                <option value="priceAsc">Giá thấp đến cao</option>
                <option value="priceDesc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* SIDEBAR CATEGORIES */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-6 h-[1px] bg-pink-200"></span> Phân loại
              </h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 tracking-tight ${
                        selectedCategory === cat 
                        ? "bg-gray-950 text-white shadow-xl shadow-gray-200" 
                        : "text-gray-500 hover:bg-pink-50 hover:text-pink-500"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* PRODUCT GRID & PAGINATION */}
          <div className="flex-grow">
            <div className="mb-8 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Hiển thị {currentItems.length} trên {allFilteredProducts.length} sản phẩm</span>
            </div>

            {currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-14">
                  {currentItems.map(p => (
                    <Link to={`/product/${p.id}`} key={p.id} className="group">
                      <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-50 group-hover:border-pink-100 transition-all duration-500 mb-5 relative shadow-sm group-hover:shadow-xl">
                        <img 
                          src={p.img} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" 
                        />
                      </div>
                      <div className="px-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-pink-400 mb-1">{p.category}</p>
                        <h3 className="font-bold text-gray-900 group-hover:text-pink-500 transition-colors truncate tracking-tight text-base mb-1">
                          {p.name}
                        </h3>
                        <p className="font-serif italic text-gray-500 text-lg">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="mt-20 flex justify-center items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`size-12 rounded-full border flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-pink-50 border-gray-200'}`}
                    >
                      ←
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`size-12 rounded-full text-xs font-bold transition-all ${
                          currentPage === i + 1 
                          ? "bg-pink-400 text-white shadow-lg shadow-pink-100" 
                          : "hover:bg-gray-50 text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`size-12 rounded-full border flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-pink-50 border-gray-200'}`}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="font-serif italic text-gray-400 text-xl">Rất tiếc, Pinky không tìm thấy món đồ này...</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductPage;