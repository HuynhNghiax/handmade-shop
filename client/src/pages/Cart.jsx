import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeItem, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 30000 : 0;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">

        <div className="mb-16 border-b border-pink-50 pb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif text-gray-950 tracking-tighter">
              Túi đồ của <span className="text-pink-400 italic">bạn</span>
            </h1>
            <p className="text-gray-400 mt-4 font-light tracking-tight uppercase text-[10px] font-black">
              Có {cartItems.length} món đồ xinh đang chờ bạn
            </p>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">

            {/* DANH SÁCH SẢN PHẨM */}
            <div className="lg:col-span-2 space-y-12">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-8 pb-12 border-b border-gray-50 group relative">
                  {/* Nút Xóa (Thùng rác) */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Xóa khỏi giỏ"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>

                  <div className="size-44 rounded-[3rem] overflow-hidden bg-pink-50 border border-pink-100 flex-shrink-0 shadow-sm">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=fbcfe8&color=ec4899&size=200&bold=true`;
                      }}
                    />
                  </div>

                  <div className="flex-grow text-center sm:text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-400 mb-2 block">{item.category}</span>
                    <h3 className="font-bold text-gray-950 mb-2 tracking-tight text-2xl font-serif italic">{item.name}</h3>
                    <p className="text-gray-400 font-serif text-lg">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center border-2 border-gray-100 rounded-2xl p-1 bg-gray-50">
                    <button onClick={() => updateQuantity(item.id, -1)} className="size-10 flex items-center justify-center hover:bg-white rounded-xl transition font-bold">-</button>
                    <span className="w-10 text-center font-black">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="size-10 flex items-center justify-center hover:bg-white rounded-xl transition font-bold">+</button>
                  </div>

                  <div className="text-right hidden md:block w-32">
                    <p className="font-bold text-lg text-pink-500">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* TỔNG KẾT */}
            <aside className="lg:col-span-1">
              <div className="bg-gray-950 text-white rounded-[3.5rem] p-10 sticky top-32 shadow-2xl shadow-pink-100">
                <h4 className="text-2xl font-serif mb-10 tracking-tight italic">Tóm tắt đơn hàng</h4>
                <div className="space-y-5 mb-10 pb-10 border-b border-white/10">
                  <div className="flex justify-between text-sm text-gray-400 font-light">
                    <span>Tạm tính</span>
                    <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 font-light">
                    <span>Phí vận chuyển</span>
                    <span className="text-white font-bold">{formatPrice(shipping)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end mb-12">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Tổng cộng</span>
                  <span className="text-3xl font-bold">
                    {formatPrice(subtotal + shipping)}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-pink-400 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-gray-950 transition-all shadow-lg shadow-pink-400/20"
                >
                  Tiến hành thanh toán
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div className="text-center py-40">
            <h2 className="text-3xl font-serif italic text-gray-400 mb-8">Giỏ hàng của bạn đang trống...</h2>
            <Link to="/products" className="inline-block bg-gray-950 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-400 transition-all">
              Quay lại cửa hàng ngay
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;