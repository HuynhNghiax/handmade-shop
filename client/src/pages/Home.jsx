import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        // Lấy 3 sản phẩm đầu tiên (Backend đã sắp xếp theo mới nhất)
        setLatestProducts(res.data.slice(0, 3));
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm trang chủ:", err);
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* HERO SECTION */}
      <section className="bg-pink-50/50 py-32 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 size-96 bg-pink-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="bg-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-500 border border-pink-100 mb-8 inline-block shadow-sm">
            Handmade with Love
          </span>
          <h1 className="text-6xl md:text-8xl font-serif text-gray-950 tracking-tighter mb-10 leading-[1.1]">
            Nét Đẹp <span className="text-pink-400 italic">Thủ Công</span> <br />
            Trong Từng Hơi Thở
          </h1>
          <Link to="/products" className="bg-pink-400 text-white px-12 py-5 rounded-full font-bold shadow-xl shadow-pink-100 hover:bg-pink-500 transition-all inline-block uppercase text-xs tracking-widest">
            Khám phá cửa hàng
          </Link>
        </div>
      </section>

      {/* LATEST PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-16">
          <h3 className="text-4xl font-serif tracking-tighter italic">Sản phẩm mới nhất</h3>
          <Link to="/products" className="text-xs font-black uppercase tracking-widest text-pink-400 hover:text-pink-600 border-b-2 border-pink-100 pb-1">Xem tất cả</Link>
        </div>

        {loading ? (
          <div className="text-center py-20 font-serif italic text-gray-400 text-xl">Đang nạp những món đồ xinh...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {latestProducts.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} className="group text-center">
                <div className="rounded-[3.5rem] overflow-hidden aspect-[4/5] bg-pink-50 border border-pink-100 mb-8 shadow-sm group-hover:shadow-2xl group-hover:shadow-pink-100 transition-all duration-700">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-1000"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=fbcfe8&color=ec4899&size=400&bold=true`;
                    }}
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-2 block">{p.category}</span>
                <h4 className="text-2xl font-bold group-hover:text-pink-500 transition mb-2 tracking-tight">{p.name}</h4>
                <p className="text-gray-500 font-semibold text-base">
                  {p.price.toLocaleString('vi-VN')}đ
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;