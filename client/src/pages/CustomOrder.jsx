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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          token: `Bearer ${user.accessToken}`
        }
      });
      setNewRequest({ ...newRequest, image: res.data.url });
    } catch (err) {
      alert('Lỗi tải ảnh lên!');
    } finally {
      setUploadingImage(false);
    }
  };

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

            <div className="flex flex-col gap-6">
              {myOrders.map(order => {
                const bidCount = order.Bids?.length || 0;
                const hasNewBids = bidCount > 0 && order.status === 'Đang tìm thợ';

                return (
                  <Link
                    key={order.id}
                    to={`/custom-order/${order.id}`}
                    className="flex flex-col md:flex-row items-center gap-6 bg-gray-950 text-white p-6 rounded-[2.5rem] hover:bg-gray-800 transition-all group relative overflow-hidden"
                  >
                    <img 
                      src={order.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.title)}&background=fbcfe8&color=ec4899`} 
                      alt={order.title} 
                      className="w-full md:w-32 h-48 md:h-32 object-cover rounded-[1.5rem] flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0 w-full relative">
                      {/* Badge báo giá mới */}
                      {hasNewBids && (
                        <div className="absolute top-0 right-0 md:top-auto md:right-0 bg-pink-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                          <span className="size-1.5 bg-white rounded-full" />
                          {bidCount} báo giá mới
                        </div>
                      )}

                      {/* Badge trạng thái (không phải đang tìm thợ) */}
                      {!hasNewBids && (
                        <span className={`absolute top-0 right-0 md:top-auto md:right-0 text-[9px] font-black px-3 py-1.5 rounded-full
                          ${order.status === 'Hoàn thành' ? 'bg-green-500 text-white' :
                            order.status === 'Đã hủy' ? 'bg-gray-600 text-gray-300' :
                              order.status === 'Đang tìm thợ' ? 'bg-gray-700 text-gray-400' :
                                'bg-purple-500 text-white'}`}
                        >
                          {order.status === 'Đang tìm thợ' && bidCount === 0 ? 'Chưa có báo giá' : order.status}
                        </span>
                      )}

                      <p className="text-[9px] font-black uppercase text-pink-400 tracking-[0.2em] mb-2 mt-2 md:mt-0">
                        Ngân sách: {order.budget?.toLocaleString('vi-VN')}đ
                      </p>
                      <h3 className="text-xl font-serif italic mb-2 md:pr-24 truncate">{order.title}</h3>
                      <p className="text-gray-400 text-sm font-light line-clamp-2 leading-relaxed mb-4">
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
        <div className="flex flex-col gap-8">
          {otherOrders.map(order => (
            <div
              key={order.id}
              className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-[3rem] border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <img 
                src={order.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.title)}&background=fbcfe8&color=ec4899`} 
                alt={order.title} 
                className="w-full md:w-48 h-56 md:h-48 object-cover rounded-[2rem] flex-shrink-0" 
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black uppercase text-pink-400 tracking-[0.2em]">
                      {order.status}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Ngân sách</span>
                      <span className="font-bold text-lg text-pink-500">
                        {order.budget?.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-serif italic mb-2 text-gray-900 truncate">{order.title}</h3>
                  <p className="text-gray-500 font-light mb-6 line-clamp-2 leading-relaxed">
                    {order.description}
                  </p>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="bg-white px-8 py-3 rounded-full border border-gray-200 text-[10px] font-black uppercase hover:bg-gray-950 hover:text-white transition-all shadow-sm"
                  >
                    Gửi báo giá
                  </button>
                </div>
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
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-2">Ảnh minh họa (không bắt buộc)</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Dán link ảnh vào đây..."
                    className="w-full sm:flex-1 bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200"
                    value={newRequest.image}
                    onChange={e => setNewRequest({ ...newRequest, image: e.target.value })}
                  />
                  <label className="flex-shrink-0 size-[62px] bg-pink-50 text-pink-500 rounded-2xl cursor-pointer hover:bg-pink-100 transition-all flex items-center justify-center border-2 border-dashed border-pink-200 hover:border-pink-300 group relative" title="Tải ảnh lên">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-7 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
                {uploadingImage && <p className="text-[10px] text-pink-500 font-black tracking-widest uppercase animate-pulse pl-2 mt-2">Đang tải ảnh lên...</p>}
              </div>
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
