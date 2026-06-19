import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [info, setInfo] = useState({ address: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
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
      const orderRes = await axios.post('http://localhost:5000/api/orders', {
        products: cartItems,
        totalAmount: total,
        address: info.address,
        phone: info.phone,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending'
      }, {
        headers: { token: `Bearer ${user.accessToken}` }
      });

      const newOrder = orderRes.data;

      if (paymentMethod === 'ZaloPay') {
        const zpRes = await axios.post('http://localhost:5000/api/zalopay/create-shop-order-payment', {
          orderId: newOrder.id
        }, {
          headers: { token: `Bearer ${user.accessToken}` }
        });

        if (zpRes.data && zpRes.data.order_url) {
          clearCart();
          window.location.href = zpRes.data.order_url;
          return;
        } else {
          alert("Lỗi tạo hóa đơn ZaloPay, vui lòng thử lại hoặc chọn phương thức khác.");
        }
      } else {
        alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã tin tưởng PinkyCrafts.");
        clearCart();
        navigate('/profile');
      }
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
              onChange={e => setInfo({ ...info, phone: e.target.value })}
            />
            <textarea
              placeholder="Địa chỉ giao hàng chi tiết" required rows="4"
              className="w-full bg-gray-50 p-5 rounded-3xl outline-none focus:ring-2 focus:ring-pink-100 transition-all border border-transparent"
              onChange={e => setInfo({ ...info, address: e.target.value })}
            ></textarea>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Phương thức thanh toán</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'COD' ? 'border-pink-400 bg-pink-50/20 text-gray-950 font-bold' : 'border-gray-100 text-gray-400 hover:border-pink-100'}`}
                >
                  <span className="text-2xl">💵</span>
                  <span className="text-[10px] uppercase tracking-wider font-black">COD (Tiền mặt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ZaloPay')}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'ZaloPay' ? 'border-pink-400 bg-pink-50/20 text-gray-950 font-bold' : 'border-gray-100 text-gray-400 hover:border-pink-100'}`}
                >
                  <span className="text-2xl">💳</span>
                  <span className="text-[10px] uppercase tracking-wider font-black">Ví ZaloPay</span>
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-gray-950 text-white py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-pink-400 transition-all shadow-xl"
            >
              {loading ? "Đang xử lý..." : paymentMethod === 'ZaloPay' ? "Thanh toán qua ZaloPay" : "Xác nhận đặt hàng"}
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
              <div className="flex justify-between text-xl font-bold text-pink-500 pt-2">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          <div className="bg-pink-400 text-white p-8 rounded-[2.5rem] flex items-center gap-4 shadow-lg shadow-pink-500/20">
            <div className="size-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              {paymentMethod === 'ZaloPay' ? '💳' : '📦'}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {paymentMethod === 'ZaloPay' 
                ? "Thanh toán an toàn qua cổng ZaloPay. Hóa đơn sẽ được duyệt thanh toán ngay khi hoàn thành giao dịch."
                : "Thanh toán tiền mặt khi nhận hàng (COD). Kiểm tra hàng trước khi nhận."
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;