import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const statusStyles = {
  'Hoàn thành': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Đã hủy': 'bg-slate-100 text-slate-600 border-slate-200',
  'Đang tìm thợ': 'bg-amber-50 text-amber-700 border-amber-200',
};

const getStatusBadge = (status) => statusStyles[status] || 'bg-purple-50 text-purple-700 border-purple-200';

const formatVND = (value) => (value ?? 0).toLocaleString('vi-VN');

const IconClose = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const CustomOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
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
    } finally {
      setLoadingOrders(false);
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
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi báo giá!");
    } finally {
      setSubmitting(false);
    }
  };

  const myOrders = orders.filter(o => user && o.userId === user.id);
  const otherOrders = orders.filter(o => !user || o.userId !== user.id);

  return (
      <div className="min-h-screen bg-slate-50/50 font-sans py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-slate-800 selection:bg-pink-100 selection:text-pink-700">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 pb-8 border-b border-slate-200/60">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight">
                Đặt gia công <span className="text-pink-500 font-medium italic">theo ý thích</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 font-light">Nơi kết nối những ý tưởng độc đáo và những bàn tay khéo léo</p>
            </div>
            <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-pink-600 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Đăng yêu cầu mới
            </button>
          </header>

          {loadingOrders && (
              <div className="space-y-4 mb-16">
                {[0, 1].map(i => (
                    <div key={i} className="flex flex-col sm:flex-row gap-6 bg-white p-5 rounded-2xl border border-slate-200/60 animate-pulse">
                      <div className="w-full sm:w-36 h-36 rounded-xl bg-slate-100 flex-shrink-0" />
                      <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                        <div className="space-y-2">
                          <div className="h-4 w-1/4 bg-slate-100 rounded" />
                          <div className="h-6 w-2/3 bg-slate-100 rounded" />
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded" />
                        <div className="h-4 w-5/6 bg-slate-100 rounded" />
                      </div>
                    </div>
                ))}
              </div>
          )}

          {!loadingOrders && (
              <>
                {user && myOrders.length > 0 && (
                    <section className="mb-16">
                      <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Yêu cầu của tôi</h2>
                        <div className="flex-1 h-px bg-slate-200/80" />
                      </div>

                      <div className="space-y-4">
                        {myOrders.map(order => {
                          const bidCount = order.Bids?.length || 0;
                          const hasNewBids = bidCount > 0 && order.status === 'Đang tìm thợ';

                          return (
                              <Link
                                  key={order.id}
                                  to={`/custom-order/${order.id}`}
                                  className="flex flex-col sm:flex-row items-stretch gap-6 bg-slate-900 text-white p-5 rounded-2xl hover:bg-slate-800/95 transition-all group relative shadow-md shadow-slate-900/5 border border-slate-950"
                              >
                                <div className="w-full sm:w-32 h-36 sm:h-32 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                  <img
                                      src={order.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.title)}&background=fbcfe8&color=ec4899`}
                                      alt={order.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 w-full flex flex-col justify-between py-0.5">
                                  <div>
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <p className="text-xs font-medium text-pink-400 tracking-wide">
                                        Ngân sách: <span className="font-semibold text-white">{formatVND(order.budget)}đ</span>
                                      </p>
                                      {hasNewBids ? (
                                          <span className="bg-pink-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse flex-shrink-0">
                                            <span className="size-1.5 bg-white rounded-full" />
                                            {bidCount} báo giá
                                          </span>
                                      ) : (
                                          <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border flex-shrink-0
                                            ${order.status === 'Hoàn thành' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                              order.status === 'Đã hủy' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                                  'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                                          >
                                            {order.status === 'Đang tìm thợ' && bidCount === 0 ? 'Chưa có báo giá' : order.status}
                                          </span>
                                      )}
                                    </div>

                                    <h3 className="text-lg font-serif font-medium truncate mb-1 text-slate-100 group-hover:text-pink-300 transition-colors">{order.title}</h3>
                                    <p className="text-slate-400 text-sm font-light line-clamp-2 leading-relaxed">
                                      {order.description}
                                    </p>
                                  </div>

                                  <div className="mt-4 sm:mt-0 flex items-center justify-between pt-3 border-t border-slate-800">
                                    <span className="text-xs font-medium text-slate-500">
                                      {bidCount === 0 ? 'Chưa có ai báo giá' : `${bidCount} thợ đã báo giá`}
                                    </span>
                                    <span className="text-xs font-medium text-pink-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                      Chi tiết <span>→</span>
                                    </span>
                                  </div>
                                </div>
                              </Link>
                          );
                        })}
                      </div>
                    </section>
                )}

                {user && myOrders.length > 0 && otherOrders.length > 0 && (
                    <div className="flex items-center gap-4 mb-10">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs font-semibold text-slate-400 tracking-wider">
                        Yêu cầu từ cộng đồng
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                )}

                <div className="space-y-4">
                  {otherOrders.map(order => {
                    const bidCount = order.Bids?.length || 0;
                    return (
                        <div
                            key={order.id}
                            className="flex flex-col sm:flex-row gap-6 bg-white p-5 rounded-2xl border border-slate-200/70 hover:border-slate-300 shadow-sm transition-all group"
                        >
                          <div className="w-full sm:w-36 h-40 sm:h-36 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                            <img
                                src={order.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.title)}&background=fbcfe8&color=ec4899`}
                                alt={order.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-1.5">
                                <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                                  {order.status}
                                </span>
                                <div className="text-right flex-shrink-0">
                                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ngân sách</span>
                                  <span className="font-semibold text-base text-pink-600 whitespace-nowrap">
                                    {formatVND(order.budget)}đ
                                  </span>
                                </div>
                              </div>
                              <h3 className="text-xl font-serif font-medium text-slate-900 mb-1 truncate group-hover:text-pink-600 transition-colors">{order.title}</h3>
                              <p className="text-slate-500 text-sm font-light line-clamp-2 leading-relaxed">
                                {order.description}
                              </p>
                            </div>

                            <div className="mt-4 sm:mt-0 flex items-center justify-between pt-3 border-t border-slate-100">
                              <span className="text-xs font-medium text-slate-400">
                                {bidCount === 0 ? 'Chưa có ai báo giá' : `${bidCount} thợ đã báo giá`}
                              </span>
                              <button
                                  onClick={() => setSelectedOrderId(order.id)}
                                  className="bg-slate-50 hover:bg-slate-900 border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-white px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-95 flex-shrink-0"
                              >
                                Gửi báo giá
                              </button>
                            </div>
                          </div>
                        </div>
                    );
                  })}

                  {otherOrders.length === 0 && myOrders.length === 0 && (
                      <div className="text-center py-20 bg-white border border-slate-200/60 rounded-2xl">
                        <p className="text-3xl mb-2">🧶</p>
                        <p className="font-serif italic text-slate-400 text-lg">Chưa có yêu cầu gia công nào. Hãy là người đầu tiên!</p>
                      </div>
                  )}

                  {otherOrders.length === 0 && myOrders.length > 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-serif italic">
                          Không có yêu cầu nào khác từ cộng đồng.
                        </p>
                      </div>
                  )}
                </div>
              </>
          )}

          {showForm && (
              <div
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                  onClick={() => !submitting && setShowForm(false)}
              >
                <form
                    onSubmit={handlePostRequest}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 space-y-5 shadow-xl relative max-h-[90vh] overflow-y-auto border border-slate-100"
                >
                  <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      aria-label="Đóng"
                      className="absolute top-5 right-5 size-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <IconClose className="size-4" />
                  </button>

                  <div>
                    <h3 className="text-2xl font-serif text-slate-900 pr-8">Bạn muốn làm món đồ gì?</h3>
                    <p className="text-slate-400 text-xs mt-1">Mô tả chi tiết để thợ dễ đưa ra báo giá chính xác nhất.</p>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 pl-1">Tên sản phẩm</label>
                      <input
                          type="text"
                          placeholder="VD: Túi len đeo chéo hình mèo"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-pink-400 focus:bg-white p-3 rounded-xl outline-none text-sm transition-all"
                          value={newRequest.title}
                          onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                          required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 pl-1">Mô tả chi tiết yêu cầu</label>
                      <textarea
                          placeholder="Kích thước, màu sắc sắc nét, chất liệu len xù hay len thường..."
                          className="w-full bg-slate-50 border border-slate-200 focus:border-pink-400 focus:bg-white p-3 rounded-xl outline-none text-sm transition-all resize-none"
                          rows="4"
                          value={newRequest.description}
                          onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                          required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 pl-1">Ngân sách dự kiến (VNĐ)</label>
                      <input
                          type="number"
                          placeholder="VD: 250000"
                          min="0"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-pink-400 focus:bg-white p-3 rounded-xl outline-none text-sm transition-all"
                          value={newRequest.budget}
                          onChange={e => setNewRequest({ ...newRequest, budget: e.target.value })}
                          required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 pl-1">Ảnh đính kèm (Không bắt buộc)</label>
                      <div className="flex gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Dán URL hình ảnh vào đây..."
                            className="flex-1 bg-slate-50 border border-slate-200 focus:border-pink-400 focus:bg-white p-3 rounded-xl outline-none text-sm transition-all"
                            value={newRequest.image}
                            onChange={e => setNewRequest({ ...newRequest, image: e.target.value })}
                        />
                        <label className="flex-shrink-0 size-[46px] bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl cursor-pointer transition-all flex items-center justify-center border border-dashed border-pink-200 group" title="Tải ảnh lên">
                          <svg xmlns="http://www.w3.org/2000/svg" className="size-5 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                          />
                        </label>
                      </div>

                      {uploadingImage && (
                          <p className="text-xs text-pink-500 font-medium animate-pulse pl-1 mt-1">
                            Đang tải hình ảnh lên hệ thống...
                          </p>
                      )}

                      {!uploadingImage && newRequest.image && (
                          <div className="flex items-center gap-3 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <img
                                src={newRequest.image}
                                alt="Xem trước"
                                className="size-12 object-cover rounded-lg border bg-white"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <button
                                type="button"
                                onClick={() => setNewRequest({ ...newRequest, image: '' })}
                                className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                            >
                              Xóa ảnh này
                            </button>
                          </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                        type="submit"
                        disabled={submitting || uploadingImage}
                        className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold text-sm shadow-sm transition-all disabled:opacity-50 active:scale-95"
                    >
                      {submitting ? 'Đang tạo...' : 'Đăng yêu cầu'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
          )}


          {selectedOrderId && (
              <div
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                  onClick={() => !submitting && setSelectedOrderId(null)}
              >
                <form
                    onSubmit={handleSendBid}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-md rounded-2xl p-6 md:p-8 space-y-5 shadow-xl relative border border-slate-100"
                >
                  <button
                      type="button"
                      onClick={() => setSelectedOrderId(null)}
                      aria-label="Đóng"
                      className="absolute top-5 right-5 size-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <IconClose className="size-4" />
                  </button>

                  <div>
                    <h3 className="text-2xl font-serif text-slate-900 pr-8">Gửi báo giá của bạn</h3>
                    <p className="text-slate-400 text-xs mt-1">Thông tin minh bạch giúp bạn tăng tỉ lệ được chọn làm thợ.</p>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 pl-1">Chi phí thực hiện (VNĐ)</label>
                      <input
                          type="number"
                          placeholder="VD: 200000"
                          min="0"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-pink-400 focus:bg-white p-3 rounded-xl outline-none text-sm transition-all"
                          value={bidData.price}
                          onChange={e => setBidData({ ...bidData, price: e.target.value })}
                          required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 pl-1">Lời nhắn gửi khách hàng</label>
                      <textarea
                          placeholder="Cam kết thời gian hoàn thành, loại phụ kiện hoặc chất liệu sử dụng..."
                          className="w-full bg-slate-50 border border-slate-200 focus:border-pink-400 focus:bg-white p-3 rounded-xl outline-none text-sm transition-all resize-none"
                          rows="3"
                          value={bidData.message}
                          onChange={e => setBidData({ ...bidData, message: e.target.value })}
                          required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 pl-1">Phương thức liên hệ</label>
                      <input
                          type="text"
                          placeholder="Số điện thoại hoặc link Zalo cá nhân"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-pink-400 focus:bg-white p-3 rounded-xl outline-none text-sm transition-all"
                          value={bidData.contactInfo}
                          onChange={e => setBidData({ ...bidData, contactInfo: e.target.value })}
                          required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-slate-900 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95"
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi báo giá'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedOrderId(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all active:scale-95"
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