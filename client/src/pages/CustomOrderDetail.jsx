import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CommissionSummary from '../components/CommissionSummary';
import MakerBadge from '../components/MakerBadge';

//  Constants 
const STATUS_STEPS = ['Đang tìm thợ', 'Đã chọn thợ', 'Đang thực hiện', 'Chờ xác nhận', 'Hoàn thành'];

const STATUS_COLOR = {
  'Đang tìm thợ': 'bg-blue-50   text-blue-600',
  'Đã chọn thợ': 'bg-purple-50 text-purple-600',
  'Đang thực hiện': 'bg-yellow-50 text-yellow-600',
  'Chờ xác nhận': 'bg-orange-50 text-orange-600',
  'Hoàn thành': 'bg-green-50  text-green-600',
  'Đã hủy': 'bg-gray-100  text-gray-500',
};

//  Sub-components 
const STEP_CONFIG = [
  { status: 'Đang tìm thợ', icon: 'ti-user-search', label: 'Tìm thợ', sub: 'Chờ báo giá' },
  { status: 'Đã chọn thợ', icon: 'ti-user-check', label: 'Đã chọn thợ', sub: 'Thợ chuẩn bị' },
  { status: 'Đang thực hiện', icon: 'ti-hammer', label: 'Đang làm', sub: 'Thợ đang làm' },
  { status: 'Chờ xác nhận', icon: 'ti-package-export', label: 'Đang giao', sub: 'Chờ bạn xác nhận' },
  { status: 'Hoàn thành', icon: 'ti-circle-check', label: 'Hoàn thành', sub: 'Đã nhận hàng' },
];

const StatusTimeline = ({ current }) => {
  const idx = STEP_CONFIG.findIndex(s => s.status === current);

  if (current === 'Đã hủy') return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full w-fit">
      <span className="size-2 bg-gray-400 rounded-full" />
      <span className="text-xs font-bold text-gray-500 uppercase">Đã hủy</span>
    </div>
  );

  return (
    <div className="flex items-start overflow-x-auto pb-2 gap-0">
      {STEP_CONFIG.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        const pending = i > idx;

        return (
          <React.Fragment key={step.status}>
            {/* Step node */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`size-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                ${done ? 'bg-green-50 border-green-500 text-green-600' : ''}
                ${active ? 'bg-white border-purple-500 text-purple-600 shadow-[0_0_0_4px_#ede9fe]' : ''}
                ${pending ? 'bg-gray-100 border-gray-200 text-gray-400' : ''}
              `}>
                {done
                  ? <svg className="size-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  : <i className={`ti ${step.icon} text-base`} aria-hidden="true" />
                }
              </div>

              <p className={`text-[10px] font-bold mt-2 text-center w-20 leading-tight
                ${pending ? 'text-gray-400' : 'text-gray-800'}`}>
                {step.label}
              </p>

              {done && (
                <span className="text-[8px] bg-green-50 text-green-700 rounded-full px-2 py-0.5 mt-1 font-bold">
                  Xong
                </span>
              )}
              {active && (
                <span className="text-[8px] bg-purple-50 text-purple-600 rounded-full px-2 py-0.5 mt-1 font-bold animate-pulse">
                  Hiện tại
                </span>
              )}
              {pending && (
                <p className="text-[9px] text-gray-400 text-center w-20 leading-tight mt-0.5">
                  {step.sub}
                </p>
              )}
            </div>

            {/* Connector */}
            {i < STEP_CONFIG.length - 1 && (
              <div className={`h-0.5 w-9 flex-shrink-0 mx-1 mt-5 rounded-full transition-all
                ${i < idx ? 'bg-green-400' : 'bg-gray-200'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const StarRating = ({ rating }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <svg key={n} className={`size-4 ${n <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

//  Main Component 
const CustomOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/custom-orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('[CustomOrderDetail] fetchOrder:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const authHeader = () => ({ headers: { token: `Bearer ${user?.accessToken}` } });

  const action = async (endpoint, method = 'post', body = {}) => {
    setActing(true);
    try {
      const fn = method === 'post' ? axios.post : axios.put;
      await fn(`http://localhost:5000/api/custom-orders/${id}/${endpoint}`, body, authHeader());
      await fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setActing(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewSaving(true);
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        customOrderId: order.id,
        makerId: order.makerId,
        rating: reviewRating,
        comment: reviewComment,
      }, authHeader());
      await fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi gửi đánh giá!');
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">
      Đang tải đơn...
    </div>
  );
  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-serif italic text-gray-400 text-xl">Không tìm thấy đơn này.</p>
      <Link to="/custom-order" className="text-pink-500 font-bold underline text-sm">← Quay lại</Link>
    </div>
  );

  const isOwner = user?.id === order.userId;
  const isMaker = user?.id === order.makerId;
  const canReview = isOwner && order.status === 'Hoàn thành' && !order.Review;

  return (
    <div className="min-h-screen bg-white font-sans py-16 px-6">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-pink-500 transition-all mb-10"
        >
          ← Quay lại
        </button>

        {/* Header card */}
        <div className="bg-gray-950 text-white rounded-[3rem] p-10 md:p-14 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase mb-6 ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-500'}`}>
              {order.status}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif italic tracking-tighter mb-4">{order.title}</h1>
            <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>💰 Ngân sách: <span className="text-pink-400">{order.budget?.toLocaleString('vi-VN')}đ</span></span>
              {order.agreedPrice && (
                <span>✅ Giá chốt: <span className="text-green-400">{order.agreedPrice?.toLocaleString('vi-VN')}đ</span></span>
              )}
              {order.deadline && <span>📅 Hạn: {new Date(order.deadline).toLocaleDateString('vi-VN')}</span>}
              <span>👤 Đăng bởi: {order.Customer?.name}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 rounded-3xl p-8 mb-8 overflow-x-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Tiến trình đơn</p>
          <StatusTimeline current={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <div className="bg-gray-50 rounded-3xl p-8">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Mô tả yêu cầu</h2>
              <p className="text-gray-700 leading-relaxed">{order.description}</p>
              {order.image && (
                <img src={order.image} alt="ref" className="mt-6 rounded-2xl max-h-64 object-cover" />
              )}
            </div>

            {/* Commission info — hiển thị sau khi đã chốt thợ */}
            {order.agreedPrice && (isOwner || isMaker) && (
              <CommissionSummary
                agreedPrice={order.agreedPrice}
                commissionRate={order.commissionRate}
                commissionAmount={order.commissionAmount}
                makerEarning={order.makerEarning}
              />
            )}

            {/* Maker info (when assigned) */}
            {order.Maker && (
              <div className="bg-purple-50 border border-purple-100 rounded-3xl p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4">Thợ đang thực hiện</h2>
                <div className="flex items-center gap-4">
                  {order.Maker.avatar ? (
                    <img src={order.Maker.avatar} alt="" className="size-12 rounded-full object-cover" />
                  ) : (
                    <div className="size-12 bg-purple-200 text-purple-600 rounded-full flex items-center justify-center font-bold">
                      {order.Maker.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-950">{order.Maker.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bids list — chỉ chủ đơn thấy */}
            {isOwner && order.Bids?.length > 0 && (
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  Báo giá nhận được ({order.Bids.length})
                </h2>
                <div className="space-y-4">
                  {order.Bids.map(bid => {
                    const isAccepted = bid.id === order.acceptedBidId;
                    const makerProfile = bid.MakerUser?.MakerProfile;

                    return (
                      <div
                        key={bid.id}
                        className={`rounded-3xl p-6 border-2 transition-all ${isAccepted ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-gray-50'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {bid.MakerUser?.avatar ? (
                              <img src={bid.MakerUser.avatar} alt="" className="size-10 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="size-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                {bid.MakerUser?.name?.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-bold text-gray-950">{bid.MakerUser?.name}</p>
                                {isAccepted && (
                                  <span className="text-[9px] bg-pink-500 text-white px-2 py-0.5 rounded-full">Đã chọn</span>
                                )}
                                {/* Huy hiệu thợ */}
                                {makerProfile?.badge && (
                                  <MakerBadge badge={makerProfile.badge} badgeEmoji={makerProfile.badgeEmoji} />
                                )}
                              </div>

                              {makerProfile && (
                                <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">
                                  ⭐ {makerProfile.rating > 0 ? makerProfile.rating.toFixed(1) : 'Chưa có'} · {makerProfile.totalDone} đơn
                                </p>
                              )}
                              <p className="text-sm text-gray-500 italic">"{bid.message}"</p>
                              <p className="text-[9px] text-gray-400 font-bold mt-1">📞 {bid.contactInfo}</p>

                              {/* Preview phí kết nối khi hover chọn */}
                              {!isAccepted && order.status === 'Đang tìm thợ' && makerProfile && (
                                <p className="text-[9px] text-gray-400 mt-2">
                                  Thợ nhận: ~{((bid.price * (100 - (makerProfile.commissionRate || 10)) / 100)).toLocaleString('vi-VN')}đ
                                  (sau phí {makerProfile.commissionRate || 10}%)
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 flex-shrink-0">
                            <p className="text-xl font-bold text-pink-500">{bid.price?.toLocaleString('vi-VN')}đ</p>
                            {!isAccepted && order.status === 'Đang tìm thợ' && (
                              <button
                                onClick={() => action('accept-bid', 'post', { bidId: bid.id })}
                                disabled={acting}
                                className="bg-gray-950 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase hover:bg-pink-500 transition-all disabled:opacity-50"
                              >
                                Chọn báo giá này
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review đã có */}
            {order.Review && (
              <div className="bg-green-50 border border-green-100 rounded-3xl p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-4">Đánh giá của đơn này</h2>
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={order.Review.rating} />
                  <span className="font-bold text-gray-950">{order.Review.rating}/5 sao</span>
                </div>
                {order.Review.comment && (
                  <p className="text-gray-600 italic">"{order.Review.comment}"</p>
                )}
              </div>
            )}

            {/* Form đánh giá */}
            {canReview && (
              <form onSubmit={submitReview} className="bg-yellow-50 border border-yellow-100 rounded-3xl p-8">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-6">Đánh giá thợ</h2>
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">Chọn số sao:</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        className={`size-10 rounded-full text-lg transition-all ${n <= reviewRating ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Nhận xét về thợ (tùy chọn)..."
                  rows={3}
                  className="w-full bg-white border border-yellow-200 rounded-2xl p-4 text-sm outline-none focus:border-yellow-400 resize-none mb-4"
                />
                <button
                  type="submit"
                  disabled={reviewSaving}
                  className="w-full bg-yellow-400 text-gray-950 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 transition-all disabled:opacity-50"
                >
                  {reviewSaving ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            )}
          </div>

          {/* Right sidebar: Actions */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-3xl p-6 space-y-3 sticky top-28">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Thao tác</p>

              {isOwner && ['Đang tìm thợ', 'Đã chọn thợ'].includes(order.status) && (
                <button
                  onClick={() => { if (window.confirm('Xác nhận hủy đơn?')) action('cancel'); }}
                  disabled={acting}
                  className="w-full border-2 border-red-100 text-red-500 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  Hủy đơn
                </button>
              )}

              {isOwner && order.status === 'Chờ xác nhận' && (
                <button
                  onClick={() => { if (window.confirm('Xác nhận đã nhận hàng?')) action('confirm'); }}
                  disabled={acting}
                  className="w-full bg-gray-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-pink-500 transition-all shadow-xl disabled:opacity-50"
                >
                  ✅ Đã nhận hàng
                </button>
              )}

              {isMaker && order.status === 'Đã chọn thợ' && (
                <button
                  onClick={() => action('start')}
                  disabled={acting}
                  className="w-full bg-purple-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-purple-600 transition-all shadow-xl disabled:opacity-50"
                >
                  🔨 Bắt đầu thực hiện
                </button>
              )}

              {isMaker && order.status === 'Đang thực hiện' && (
                <button
                  onClick={() => action('complete')}
                  disabled={acting}
                  className="w-full bg-green-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-green-600 transition-all shadow-xl disabled:opacity-50"
                >
                  📦 Báo hoàn thành
                </button>
              )}

              {order.status === 'Đã hủy' && (
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase">Đơn đã bị hủy</p>
              )}
              {order.status === 'Hoàn thành' && (
                <p className="text-center text-[10px] font-bold text-green-600 uppercase">🎉 Đơn hoàn thành!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderDetail;
