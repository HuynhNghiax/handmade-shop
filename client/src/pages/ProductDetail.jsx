import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allProducts } from '../data';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  
  const product = allProducts.find(p => p.id === parseInt(id));

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-2xl font-serif italic text-gray-400">
      Sản phẩm không tồn tại... <Link to="/products" className="ml-4 text-pink-400 underline font-sans not-italic">Quay lại</Link>
    </div>
  );

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="min-h-screen bg-white">
      <nav className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-pink-500">PinkyCrafts</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-pink-500">Cửa hàng</Link>
          <span>/</span>
          <span className="text-pink-500">{product.name}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-6">
          <div className="aspect-[4/5] overflow-hidden rounded-[4rem] bg-pink-50 border border-pink-100 shadow-sm">
            <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-6">
             <div className="aspect-square rounded-3xl overflow-hidden border-2 border-pink-100 cursor-pointer opacity-50 hover:opacity-100 transition">
                <img src={product.img} className="w-full h-full object-cover" />
             </div>
             <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 cursor-pointer flex items-center justify-center text-gray-300">Image 2</div>
             <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 cursor-pointer flex items-center justify-center text-gray-300">Image 3</div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-pink-400 font-black tracking-[0.3em] uppercase text-xs mb-6">
            Handmade Collection / {product.category}
          </span>
          <h1 className="text-5xl lg:text-7xl font-serif text-gray-950 mb-8 tracking-tighter leading-[1.1]">
            {product.name}
          </h1>
          <p className="text-4xl font-extrabold text-pink-500 mb-12 font-serif italic tracking-tight">
            {formatPrice(product.price)}
          </p>
          
          <div className="bg-pink-50/40 p-10 rounded-[3rem] mb-12 border border-pink-100/50">
            <h5 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Mô tả sản phẩm:</h5>
            <p className="text-gray-600 leading-relaxed font-light italic text-lg">
              "{product.desc || "Sản phẩm được chế tác hoàn toàn bằng tay với sự tỉ mỉ trong từng chi tiết nhỏ nhất. Nguyên liệu hữu cơ an toàn và thân thiện."}"
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-10">
              <div className="flex items-center border-2 border-gray-100 rounded-full p-1 shadow-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="size-12 flex items-center justify-center hover:bg-pink-100 rounded-full transition text-xl font-bold">-</button>
                <span className="w-16 text-center font-black text-xl">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="size-12 flex items-center justify-center hover:bg-pink-100 rounded-full transition text-xl font-bold">+</button>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sản phẩm có sẵn</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button className="flex-1 bg-pink-400 hover:bg-pink-500 text-white font-black py-6 rounded-full shadow-2xl shadow-pink-200 transition-all transform active:scale-95 text-sm uppercase tracking-widest">
                Thêm vào giỏ
              </button>
              <button className="flex-1 bg-gray-950 text-white font-black py-6 rounded-full transition-all transform active:scale-95 text-sm uppercase tracking-widest hover:bg-black">
                Mua ngay
              </button>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-100 flex gap-12 items-center">
            <div className="text-center group">
              <div className="size-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-100 transition duration-500 text-2xl">🎁</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quà tặng</p>
            </div>
            <div className="text-center group">
              <div className="size-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-100 transition duration-500 text-2xl">🚚</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Giao nhanh</p>
            </div>
            <div className="text-center group">
              <div className="size-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-100 transition duration-500 text-2xl">🍃</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hữu cơ</p>
            </div>
          </div>
        </div>
      </main>

      <section className="bg-gray-50 py-24 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h3 className="text-3xl font-serif text-center mb-16 italic">Có thể bạn cũng sẽ thích...</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {allProducts.filter(p => p.id !== parseInt(id)).slice(0, 4).map(p => (
              <Link to={`/product/${p.id}`} key={p.id} className="group">
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm mb-4">
                  <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                </div>
                <h5 className="font-bold text-center text-sm group-hover:text-pink-500 transition-colors">{p.name}</h5>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;