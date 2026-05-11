import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [info, setInfo] = useState({ address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + 30000;

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!user) return alert("Bạn cần đăng nhập để thanh toán!");
    if (cartItems.length === 0) return alert("Giỏ hàng trống!");

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/orders', {
        products: cartItems,
        totalAmount: total,
        address: info.address,
        phone: info.phone
      }, {
        headers: { token: `Bearer ${user.accessToken}` }
      });

      alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã tin tưởng PinkyCrafts.");
      clearCart();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xử lý đơn hàng"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/20 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* CỘT TRÁI: NHẬP THÔNG TIN */}
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl shadow-pink-100">
          <h2 className="text-3xl font-serif mb-10 italic">Địa chỉ <span className="text-pink-400">nhận hàng</span></h2>
          <form onSubmit={handleOrder} className="space-y-6">
            <input 
              type="text" placeholder="Họ và tên người nhận" required
              className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 transition-all border border-transparent"
              defaultValue={user?.name}
            />
            <input 
              type="text" placeholder="Số điện thoại" required
              className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 transition-all border border-transparent"
              onChange={e => setInfo({...info, phone: e.target.value})}
            />
            <textarea 
              placeholder="Địa chỉ giao hàng chi tiết" required rows="4"
              className="w-full bg-gray-50 p-5 rounded-3xl outline-none focus:ring-2 focus:ring-pink-100 transition-all border border-transparent"
              onChange={e => setInfo({...info, address: e.target.value})}
            ></textarea>
            
            <button 
              disabled={loading}
              className="w-full bg-gray-950 text-white py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-pink-400 transition-all"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm">
            <h3 className="text-xl font-serif mb-6 italic">Đơn hàng của bạn</h3>
            <div className="max-h-64 overflow-y-auto space-y-4 mb-8 pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{item.name} <b className="text-gray-950 ml-1">x{item.quantity}</b></span>
                  <span className="font-bold">{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-xs uppercase font-bold text-gray-400">
                <span>Phí vận chuyển</span>
                <span>30.000đ</span>
              </div>
              <div className="flex justify-between text-2xl font-serif font-bold text-pink-500 pt-2">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          <div className="bg-pink-400 text-white p-8 rounded-[2.5rem] flex items-center gap-4">
             <div className="size-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">📦</div>
             <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
               Thanh toán tiền mặt khi nhận hàng (COD). <br/> Kiểm tra hàng trước khi nhận.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;