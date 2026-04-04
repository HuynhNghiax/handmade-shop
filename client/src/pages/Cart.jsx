import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { allProducts } from '../data';

const Cart = () => {
  // Giả lập dữ liệu giỏ hàng (Sau này sẽ lấy từ Context hoặc Redux)
  const [cartItems, setCartItems] = useState([
    { ...allProducts[0], quantity: 1 },
    { ...allProducts[2], quantity: 1 }
  ]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 30000;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        
        {/* Tiêu đề trang - Dùng font Serif sang trọng */}
        <div className="mb-16 border-b border-pink-50 pb-10">
          <h1 className="text-5xl md:text-6xl font-serif text-gray-950 tracking-tighter">
            Giỏ hàng của <span className="text-pink-400 italic">bạn</span>
          </h1>
          <p className="text-gray-400 mt-4 font-light tracking-tight">Bạn đang có {cartItems.length} sản phẩm trong túi đồ</p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* DANH SÁCH SẢN PHẨM (Bên trái) */}
            <div className="lg:col-span-2 space-y-10">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-gray-50 group">
                  {/* Ảnh sản phẩm */}
                  <div className="size-40 rounded-[2rem] overflow-hidden bg-pink-50 border border-pink-100 flex-shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="flex-grow text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-tight text-pink-400 mb-1 block">{item.category}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{item.name}</h3>
                    <p className="text-pink-500 font-serif italic text-lg mb-4">{formatPrice(item.price)}</p>
                    
                    {/* Nút xóa */}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-bold text-gray-300 hover:text-red-400 transition uppercase tracking-widest"
                    >
                      Xóa khỏi giỏ
                    </button>
                  </div>

                  {/* Bộ tăng giảm số lượng */}
                  <div className="flex items-center border-2 border-gray-100 rounded-full p-1 bg-gray-50/50">
                    <button onClick={() => updateQuantity(item.id, -1)} className="size-10 flex items-center justify-center hover:bg-white rounded-full transition font-bold">-</button>
                    <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="size-10 flex items-center justify-center hover:bg-white rounded-full transition font-bold">+</button>
                  </div>

                  {/* Tổng tiền món này */}
                  <div className="text-right hidden md:block w-32">
                    <p className="font-serif font-bold text-xl text-gray-950 tracking-tighter">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
              
              <Link to="/products" className="inline-block mt-10 text-sm font-bold text-pink-400 hover:text-pink-600 transition tracking-tight">
                ← Tiếp tục tìm thêm đồ xinh
              </Link>
            </div>

            {/* TỔNG KẾT ĐƠN HÀNG (Bên phải - Sticky) */}
            <aside className="lg:col-span-1">
              <div className="bg-gray-50 rounded-[3rem] p-10 sticky top-32 border border-gray-100">
                <h4 className="text-2xl font-serif text-gray-950 mb-8 tracking-tight">Tạm tính</h4>
                
                <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giá trị hàng hóa</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="font-bold">{formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-10">
                  <span className="text-sm font-bold uppercase tracking-widest">Tổng cộng</span>
                  <span className="text-3xl font-serif font-bold text-pink-500 tracking-tighter">
                    {formatPrice(subtotal + shipping)}
                  </span>
                </div>

                <button className="w-full bg-gray-950 text-white py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-pink-100 active:scale-95">
                  Tiến hành thanh toán
                </button>
                
                <div className="mt-8 flex items-center justify-center gap-4 opacity-30">
                   <span className="text-[10px] font-bold italic">Bảo mật 100%</span>
                   <span className="text-[10px] font-bold italic">Thanh toán đa dạng</span>
                </div>
              </div>
            </aside>

          </div>
        ) : (
          /* TRẠNG THÁI GIỎ TRỐNG */
          <div className="text-center py-40 animate-in fade-in duration-700">
            <div className="text-8xl mb-8">🧺</div>
            <h2 className="text-3xl font-serif italic text-gray-950 mb-4">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-400 font-light mb-12 max-w-sm mx-auto tracking-tight">Đừng để chiếc giỏ này cô đơn, hãy lấp đầy nó bằng những món đồ handmade tuyệt vời nhé!</p>
            <Link to="/products" className="bg-pink-400 text-white px-12 py-5 rounded-full font-bold shadow-lg hover:bg-pink-500 transition-all uppercase text-xs tracking-widest inline-block">
              Quay lại cửa hàng
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;