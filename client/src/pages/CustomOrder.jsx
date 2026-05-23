import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CustomOrder = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', budget: '', image: '' });
  const [bidData, setBidData] = useState({ price: '', message: '', contactInfo: '' });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/custom-orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!user) return alert("Đăng nhập để đăng yêu cầu sếp ơi!");
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/custom-orders', newRequest, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      setShowForm(false);
      setNewRequest({ title: '', description: '', budget: '', image: '' });
      fetchOrders();
    } catch (err) {
      alert("Lỗi khi đăng yêu cầu!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/custom-orders/${selectedOrderId}/bid`, bidData, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      alert("Đã gửi báo giá! Khách hàng sẽ nhận được thông báo.");
      setSelectedOrderId(null);
      setBidData({ price: '', message: '', contactInfo: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi báo giá!");
    } finally {
      setSubmitting(false);
    }
  };

  // Đơn của chính mình
  const myOrders = orders.filter(o => user && o.userId === user.id);
  // Đơn của người khác (để thợ xem và báo giá)
  const otherOrders = orders.filter(o => !user || o.userId !== user.id);

  return (
    <div className="min-h-screen bg-white font-sans py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="flex justify-between items-end mb-20 border-b pb-10 border-pink-50">
          <div>
            <h1 className="text-5xl font-serif italic tracking-tighter">
              Đặt gia công <span className="text-pink-400">theo ý thích</span>
            </h1>
            <p className="text-gray-400 mt-2 font-light">Nơi kết nối những ý tưởng độc đáo và những bàn tay khéo léo</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-950 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-400 transition-all shadow-xl shadow-gray-200"
          >
            + Đăng yêu cầu mới
          </button>
        </header>

        {/* ĐƠN CỦA TÔI — chỉ hiển thị khi đã login và có đơn */}
        {user && myOrders.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Yêu cầu của tôi</h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myOrders.map(order => {
                const bidCount = order.Bids?.length || 0;
                const hasNewBids = bidCount > 0 && order.status === 'Đang tìm thợ';

                return (
                  <Link
                    key={order.id}
                    to={`/custom-order/${order.id}`}
                    className="block bg-gray-950 text-white p-8 rounded-[2.5rem] hover:bg-gray-800 transition-all group relative overflow-hidden"
                  >
                    {/* Badge báo giá mới */}
                    {hasNewBids && (
                      <div className="absolute top-5 right-5 bg-pink-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="size-1.5 bg-white rounded-full" />
                        {bidCount} báo giá mới
                      </div>
                    )}

                    {/* Badge trạng thái (không phải đang tìm thợ) */}
                    {!hasNewBids && (
                      <span className={`absolute top-5 right-5 text-[9px] font-black px-3 py-1.5 rounded-full
                        ${order.status === 'Hoàn thành' ? 'bg-green-500 text-white' :
                          order.status === 'Đã hủy' ? 'bg-gray-600 text-gray-300' :
                            order.status === 'Đang tìm thợ' ? 'bg-gray-700 text-gray-400' :
                              'bg-purple-500 text-white'}`}
                      >
                        {order.status === 'Đang tìm thợ' && bidCount === 0 ? 'Chưa có báo giá' : order.status}
                      </span>
                    )}

                    <p className="text-[9px] font-black uppercase text-pink-400 tracking-[0.2em] mb-3">
                      Ngân sách: {order.budget?.toLocaleString('vi-VN')}đ
                    </p>
                    <h3 className="text-xl font-serif italic mb-3 pr-24">{order.title}</h3>
                    <p className="text-gray-400 text-sm font-light line-clamp-2 leading-relaxed mb-6">
                      {order.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {bidCount === 0
                          ? 'Chưa có ai báo giá'
                          : `${bidCount} thợ đã báo giá`}
                      </span>
                      <span className="text-[10px] font-black text-pink-400 group-hover:translate-x-1 transition-transform">
                        Xem chi tiết →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ĐƯỜNG KẺ PHÂN CÁCH */}
        {user && myOrders.length > 0 && otherOrders.length > 0 && (
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
              Yêu cầu từ cộng đồng
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        )}

        {/* YÊU CẦU TỪ CỘNG ĐỒNG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {otherOrders.map(order => (
            <div
              key={order.id}
              className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <span className="text-[9px] font-black uppercase text-pink-400 tracking-[0.2em] mb-4 block">
                {order.status}
              </span>
              <h3 className="text-2xl font-serif italic mb-4 text-gray-900">{order.title}</h3>
              <p className="text-gray-500 font-light mb-8 line-clamp-3 leading-relaxed">
                {order.description}
              </p>

              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Ngân sách</span>
                  <span className="font-bold text-base text-pink-500">
                    {order.budget?.toLocaleString()}đ
                  </span>
                </div>

                <button
                  onClick={() => setSelectedOrderId(order.id)}
                  className="bg-white px-8 py-3 rounded-full border border-gray-200 text-[10px] font-black uppercase hover:bg-gray-950 hover:text-white transition-all shadow-sm"
                >
                  Gửi báo giá
                </button>
              </div>
            </div>
          ))}

          {otherOrders.length === 0 && myOrders.length === 0 && (
            <div className="col-span-2 text-center py-24 text-gray-400 font-serif italic text-xl">
              Chưa có yêu cầu gia công nào. Hãy là người đầu tiên!
            </div>
          )}

          {otherOrders.length === 0 && myOrders.length > 0 && (
            <div className="col-span-2 text-center py-16 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-serif italic text-lg">
                Không có yêu cầu nào từ cộng đồng.
              </p>
            </div>
          )}
        </div>

        {/* MODAL ĐĂNG YÊU CẦU */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <form onSubmit={handlePostRequest} className="bg-white w-full max-w-xl rounded-[4rem] p-14 space-y-4 shadow-2xl">
              <h3 className="text-3xl font-serif italic mb-6">Bạn muốn làm món đồ gì?</h3>
              <input
                type="text"
                placeholder="Tên sản phẩm (VD: Túi len hình mèo)"
                className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200"
                value={newRequest.title}
                onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Mô tả chi tiết yêu cầu của bạn..."
                className="w-full bg-gray-50 p-5 rounded-3xl outline-none border border-transparent focus:border-pink-200"
                rows="4"
                value={newRequest.description}
                onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Ngân sách dự kiến (VNĐ)"
                className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200"
                value={newRequest.budget}
                onChange={e => setNewRequest({ ...newRequest, budget: e.target.value })}
                required
              />
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-pink-400 text-white py-5 rounded-full font-bold shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Đang đăng...' : 'Đăng yêu cầu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 py-5 rounded-full font-bold hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL GỬI BÁO GIÁ */}
        {selectedOrderId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <form onSubmit={handleSendBid} className="bg-white w-full max-w-lg rounded-[3rem] p-12 space-y-4 shadow-2xl">
              <h3 className="text-2xl font-serif italic mb-6 text-pink-400">Báo giá của bạn</h3>
              <input
                type="number"
                placeholder="Giá bạn đưa ra (VNĐ)"
                className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200"
                value={bidData.price}
                onChange={e => setBidData({ ...bidData, price: e.target.value })}
                required
              />
              <textarea
                placeholder="Lời nhắn gửi đến khách hàng (Thời gian làm, chất liệu...)"
                className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200"
                rows="3"
                value={bidData.message}
                onChange={e => setBidData({ ...bidData, message: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Số điện thoại hoặc Zalo liên hệ"
                className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200"
                value={bidData.contactInfo}
                onChange={e => setBidData({ ...bidData, contactInfo: e.target.value })}
                required
              />
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gray-950 text-white py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-pink-100 disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi báo giá'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="flex-1 bg-gray-100 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrder;
