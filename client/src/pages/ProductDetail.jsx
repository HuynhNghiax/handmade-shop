import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState({ canReview: false, hasReviewed: false, review: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [replyForm, setReplyForm] = useState({ reviewId: null, adminReply: '' });

  const fetchProductAndReviews = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
      
      const resReviews = await axios.get(`http://localhost:5000/api/product-reviews/${id}`);
      setReviews(resReviews.data);

      if (user) {
        const resEl = await axios.get(`http://localhost:5000/api/product-reviews/${id}/eligibility`, {
          headers: { token: `Bearer ${user.accessToken}` }
        });
        setEligibility(resEl.data);
        if (resEl.data.hasReviewed && resEl.data.review) {
          setReviewForm({ rating: resEl.data.review.rating, comment: resEl.data.review.comment || '' });
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Lỗi lấy chi tiết sản phẩm:", err);
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchProductAndReviews();
    window.scrollTo(0, 0);
  }, [fetchProductAndReviews]);

  const handleQuantity = (type) => {
    if (type === 'dec') {
      quantity > 1 && setQuantity(quantity - 1);
    } else {
      setQuantity(quantity + 1);
    }
  };

  const handleAction = (isRedirect) => {
    if (!product) return;
    addToCart(product, quantity);
    if (isRedirect) navigate('/cart');
    else alert(`Đã thêm ${quantity} món "${product.name}" vào giỏ hàng!`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && eligibility.review) {
        await axios.put(`http://localhost:5000/api/product-reviews/${eligibility.review.id}`, reviewForm, {
          headers: { token: `Bearer ${user.accessToken}` }
        });
        alert("Sửa đánh giá thành công!");
        setIsEditing(false);
      } else {
        await axios.post(`http://localhost:5000/api/product-reviews/${id}`, reviewForm, {
          headers: { token: `Bearer ${user.accessToken}` }
        });
        alert("Cảm ơn bạn đã đánh giá!");
      }
      fetchProductAndReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi đánh giá");
    }
  };

  const deleteReview = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/product-reviews/${eligibility.review.id}`, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      alert("Đã xóa đánh giá!");
      setReviewForm({ rating: 5, comment: '' });
      setIsEditing(false);
      setEligibility({ ...eligibility, hasReviewed: false, review: null });
      fetchProductAndReviews();
    } catch (err) {
      alert("Lỗi xóa đánh giá");
    }
  };

  const submitReply = async (reviewId) => {
    try {
      await axios.put(`http://localhost:5000/api/product-reviews/${reviewId}/reply`, { adminReply: replyForm.adminReply }, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      alert("Trả lời đánh giá thành công!");
      setReplyForm({ reviewId: null, adminReply: '' });
      fetchProductAndReviews();
    } catch (err) {
      alert("Lỗi gửi câu trả lời");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-2xl text-pink-400 animate-pulse">
      Đang chuẩn bị hàng...
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans">
      <h2 className="text-2xl font-serif mb-4 text-gray-400 italic">Sản phẩm không tồn tại</h2>
      <button onClick={() => navigate('/products')} className="text-pink-500 font-bold underline uppercase text-[10px] tracking-widest">
        Quay lại cửa hàng
      </button>
    </div>
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((a,c) => a + c.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-20">
        
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-pink-500 transition-all mb-12"
        >
          ← Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7">
            <div className="rounded-[3rem] lg:rounded-[5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-2xl shadow-pink-100/30 aspect-[4/5]">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=fbcfe8&color=ec4899&size=800&bold=true`;
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="space-y-8">
              <div>
                <span className="bg-pink-50 text-pink-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                  {product.category}
                </span>
                <h1 className="text-5xl lg:text-7xl font-serif tracking-tighter text-gray-950 leading-[1.1] mb-6">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-pink-500">
                  {product.price.toLocaleString('vi-VN')}đ
                </p>
              </div>

              <div className="h-[1px] bg-gray-100 w-full"></div>

              <div className="relative pt-4">
                <p className="text-gray-500 font-light leading-relaxed tracking-tight italic text-lg lg:text-xl border-l-4 border-pink-100 pl-6">
                  {product.desc || "Sản phẩm được chế tác hoàn toàn thủ công từ những vật liệu tự nhiên, mang đến nét đẹp riêng biệt và đầy cảm hứng cho không gian sống của bạn."}
                </p>
              </div>

              <div className="pt-8 space-y-6">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-100 rounded-2xl p-1 bg-gray-50">
                    <button
                      onClick={() => handleQuantity('dec')}
                      className="size-12 flex items-center justify-center hover:bg-white rounded-xl transition font-bold text-xl"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                    <button
                      onClick={() => handleQuantity('inc')}
                      className="size-12 flex items-center justify-center hover:bg-white rounded-xl transition font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => handleAction(false)}
                    className="flex-1 border-2 border-gray-950 text-gray-950 font-black py-6 rounded-full hover:bg-gray-950 hover:text-white transition-all uppercase text-xs tracking-widest active:scale-95"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => handleAction(true)}
                    className="flex-1 bg-pink-400 text-white font-black py-6 rounded-full shadow-2xl shadow-pink-200 hover:bg-pink-500 transition-all uppercase text-xs tracking-widest active:scale-95"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 opacity-30 pt-10">
                <span className="text-[9px] font-bold uppercase tracking-widest italic">Giao hàng toàn quốc</span>
                <span className="size-1 bg-gray-300 rounded-full"></span>
                <span className="text-[9px] font-bold uppercase tracking-widest italic">Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION ĐÁNH GIÁ SẢN PHẨM */}
        <div className="mt-32 max-w-4xl mx-auto border-t border-gray-100 pt-20">

          {/* Tổng quan Đánh giá */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 bg-gradient-to-br from-pink-50/40 to-transparent p-8 md:p-12 rounded-[2.5rem] border border-pink-100/40">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-950 mb-2">Khách hàng nói gì?</h2>
              <p className="text-gray-400 text-sm font-light">Ý kiến đóng góp từ những người đã trải nghiệm sản phẩm.</p>
            </div>
            <div className="flex items-center gap-6 bg-white px-8 py-5 rounded-3xl shadow-sm border border-gray-100">
              <div className="text-center">
                <span className="text-4xl font-black text-gray-950 block leading-none mb-1">{avgRating}</span>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">trên 5</span>
              </div>
              <div className="h-10 w-[1px] bg-gray-100"></div>
              <div>
                <div className="flex text-amber-400 text-xl mb-1 tracking-tight">
                  {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                </div>
                <span className="text-gray-500 text-xs font-medium block">({reviews.length} đánh giá thực tế)</span>
              </div>
            </div>
          </div>

          {/* Form viết đánh giá MỚI (Chỉ hiển thị khi CHƯA từng đánh giá và ĐỦ điều kiện) */}
          {user && !user.isAdmin && eligibility.canReview && !eligibility.hasReviewed && (
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] mb-16 border border-gray-100 shadow-xl shadow-gray-500/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-pink-400"></div>
                <form onSubmit={submitReview} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-serif text-gray-950 mb-1">Chia sẻ trải nghiệm của bạn</h3>
                    <p className="text-xs text-gray-400 font-light">Ý kiến của bạn giúp chúng tôi hoàn thiện sản phẩm mỗi ngày.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Mức độ hài lòng</label>
                      <div className="relative">
                        <select
                            value={reviewForm.rating}
                            onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 outline-none transition-all appearance-none cursor-pointer text-gray-800"
                        >
                          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Sao {n === 5 ? '😎' : n === 1 ? '😢' : '⭐'}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-xs">▼</div>
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Lời nhận xét</label>
                      <textarea
                          rows="1"
                          value={reviewForm.comment}
                          onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 outline-none transition-all resize-none min-h-[54px] text-gray-800"
                          placeholder="Sản phẩm có đúng như kỳ vọng của bạn không?..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        className="px-8 py-3.5 bg-pink-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all duration-300 transform active:scale-95"
                    >
                      Gửi đánh giá đi
                    </button>
                  </div>
                </form>
              </div>
          )}

          {/* Thông báo chưa mua hàng / Không có quyền đánh giá */}
          {user && !user.isAdmin && !eligibility.canReview && !eligibility.hasReviewed && (
              <div className="text-center py-8 bg-gray-50 rounded-[2.5rem] mb-16 border border-gray-100/60 p-6">
                <p className="text-sm text-gray-400 font-medium italic">🔒 Chức năng đánh giá chỉ dành cho khách hàng đã mua và nhận hàng thành công.</p>
              </div>
          )}

          {/* Nhắc nhở Đăng nhập */}
          {!user && (
              <div className="text-center py-10 bg-gray-50 rounded-[2.5rem] mb-16 border border-gray-100/60 p-8">
                <p className="text-sm text-gray-500 font-light mb-5 italic">Đăng nhập tài khoản để gửi phản hồi về sản phẩm này.</p>
                <button onClick={() => navigate('/login')} className="px-8 py-3.5 bg-gray-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all duration-300 shadow-md">Đăng nhập ngay</button>
              </div>
          )}

          {/* Danh sách bình luận */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-serif italic text-lg">Hiện tại chưa có đánh giá nào.</p>
                  <p className="text-xs text-gray-400 font-light mt-1">Hãy là người đầu tiên sở hữu và đánh giá sản phẩm này!</p>
                </div>
            ) : (
                reviews.map(review => {
                  const isMyReview = eligibility.hasReviewed && eligibility.review?.id === review.id;

                  return (
                      <div key={review.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-gray-200/60 transition-all duration-300 group">

                        {/* KHU VỰC HIỂN THỊ THÔNG TIN USER (GIỮ NGUYÊN) */}
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div className="flex items-center gap-4">
                            <img
                                src={review.User?.avatar || `https://ui-avatars.com/api/?name=${review.User?.name || 'U'}&background=fbcfe8&color=ec4899&bold=true`}
                                alt="avatar"
                                className="size-12 rounded-2xl object-cover ring-4 ring-pink-50"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-950 text-base leading-snug">{review.User?.name}</p>
                                {isMyReview && (
                                    <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider">Bạn</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                {/* Ẩn số sao tĩnh nếu đang trong chế độ sửa */}
                                {!isEditing || !isMyReview ? (
                                    <div className="flex text-amber-400 text-xs tracking-tight">
                                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                ) : (
                                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Đang chỉnh sửa...</span>
                                )}
                                <span className="size-1 bg-gray-300 rounded-full"></span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-tight">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* ICON SỬA/XÓA (Ẩn nút sửa đi nếu bản thân nó đang mở chế độ sửa) */}
                          {isMyReview && (
                              <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {!isEditing && (
                                    <button
                                        onClick={() => {
                                          setReviewForm({ rating: review.rating, comment: review.comment || '' });
                                          setIsEditing(true);
                                        }}
                                        title="Chỉnh sửa đánh giá"
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                      </svg>
                                    </button>
                                )}

                                <button
                                    onClick={deleteReview}
                                    title="Xóa đánh giá này"
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors duration-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                          )}
                        </div>

                        {/* KHU VỰC NỘI DUNG: CHUYỂN ĐỔI GIỮA FORM SỬA VÀ TEXT HIỂN THỊ */}
                        {isMyReview && isEditing ? (
                            /* ĐÂY LÀ INLINE FORM - Xuất hiện thay thế nội dung text khi nhấn Sửa */
                            <form onSubmit={submitReview} className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 animate-fadeIn">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                                <div className="sm:col-span-1">
                                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Số sao</label>
                                  <div className="relative">
                                    <select
                                        value={reviewForm.rating}
                                        onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 outline-none appearance-none cursor-pointer text-gray-800"
                                    >
                                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Sao</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-[10px]">▼</div>
                                  </div>
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nội dung nhận xét</label>
                                  <input
                                      type="text"
                                      value={reviewForm.comment}
                                      onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 outline-none text-gray-800"
                                      placeholder="Nhập nhận xét mới..."
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-300 transition-all"
                                >
                                  Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-pink-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-pink-600 transition-all"
                                >
                                  Cập nhật
                                </button>
                              </div>
                            </form>
                        ) : (
                            /* KHÔNG SỬA: Hiển thị text bình thường */
                            review.comment && (
                                <p className="text-gray-700 text-sm leading-relaxed pl-1 mb-2 font-light">
                                  {review.comment}
                                </p>
                            )
                        )}

                        {/* PHẢN HỒI CỦA ADMIN (GIỮ NGUYÊN) */}
                        {review.adminReply && (
                            <div className="mt-5 bg-pink-50/50 p-5 rounded-2xl border-l-2 border-pink-400 ml-1 relative">
                              <div className="absolute top-3 right-4 opacity-10 text-pink-500 font-serif text-4xl select-none">”</div>
                              <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <span className="inline-block size-1 bg-pink-500 rounded-full animate-pulse"></span>
                                Phản hồi từ PinkyCrafts
                              </p>
                              <p className="text-sm text-gray-800 font-light leading-relaxed">{review.adminReply}</p>
                            </div>
                        )}

                        {/* VÙNG TƯƠNG TÁC CỦA ADMIN (GIỮ NGUYÊN) */}
                        {user?.isAdmin && !review.adminReply && replyForm.reviewId !== review.id && (
                            <button
                                onClick={() => setReplyForm({ reviewId: review.id, adminReply: '' })}
                                className="mt-3 ml-1 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-1"
                            >
                              ↳ Trả lời khách hàng
                            </button>
                        )}
                        {user?.isAdmin && replyForm.reviewId === review.id && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                              <input
                                  type="text"
                                  value={replyForm.adminReply}
                                  onChange={e => setReplyForm({...replyForm, adminReply: e.target.value})}
                                  placeholder="Nhập câu trả lời của quản trị viên..."
                                  className="flex-grow bg-white border border-gray-100 rounded-xl px-5 py-2.5 text-sm focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 outline-none transition-all text-gray-800"
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button onClick={() => submitReply(review.id)} className="px-5 py-2.5 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all duration-300">Gửi</button>
                                <button onClick={() => setReplyForm({ reviewId: null, adminReply: '' })} className="px-5 py-2.5 bg-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-300 transition-all duration-300">Hủy</button>
                              </div>
                            </div>
                        )}
                      </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;