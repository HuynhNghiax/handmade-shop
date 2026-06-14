import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MakerBadge from '../components/MakerBadge';

const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';

const STATUS_COLOR = {
  'Đang tìm thợ': 'bg-blue-50   text-blue-600',
  'Đã chọn thợ': 'bg-purple-50 text-purple-600',
  'Đang thực hiện': 'bg-amber-50  text-amber-600',
  'Chờ xác nhận': 'bg-orange-50 text-orange-600',
  'Hoàn thành': 'bg-green-50  text-green-600',
  'Đã hủy': 'bg-gray-100  text-gray-500',
};

const CATEGORY_MAP = {
  theu: 'Thêu tay',
  dan_len: 'Đan len / Móc',
  go: 'Mộc / Khắc gỗ',
  gom: 'Gốm / Đất sét',
  da: 'Đồ da',
  vai: 'May vải / Patchwork',
  trang_suc: 'Trang sức thủ công',
  ve_tranh: 'Vẽ / Tranh nghệ thuật',
  giay_dep: 'Giày dép thủ công',
  khac: 'Khác',
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <svg key={n} className={`size-3.5 ${n <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// Modal xem chi tiết thợ + đơn của thợ
const MakerDetailModal = ({ maker, onClose, onBan, onUnban, onUpdateRate, onApprove, onReject, onRequestUpdate, headers }) => {
  const [orders, setOrders] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Lấy tất cả đơn gia công từ API custom-orders
        const [ordersRes, debtsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/custom-orders?makerId=${maker.userId}`, headers()),
          axios.get('http://localhost:5000/api/admin/debts', headers()),
        ]);
        // Lọc đơn của thợ này
        const allOrders = ordersRes.data || [];
        setOrders(allOrders.filter(o => o.makerId === maker.userId));
        // Lọc debt của thợ này
        const allDebts = debtsRes.data || [];
        const makerDebt = allDebts.find(d => d.makerId === maker.id);
        setDebts(makerDebt?.debts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [maker.id]);

  const activeOrders = orders.filter(o => ['Đã chọn thợ', 'Đang thực hiện', 'Chờ xác nhận'].includes(o.status));
  const doneOrders = orders.filter(o => o.status === 'Hoàn thành');
  const pendingDebt = debts.filter(d => d.status === 'chua_thu').reduce((s, d) => s + d.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-950 text-white p-8 rounded-t-[3rem] relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl">✕</button>
          <div className="flex items-center gap-4">
            {maker.User?.avatar ? (
              <img src={maker.User.avatar} alt="" className="size-14 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="size-14 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {maker.User?.name?.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold">{maker.User?.name}</h3>
                <MakerBadge badge={maker.badge} badgeEmoji={maker.badgeEmoji} size="md" />
                {maker.isBanned && (
                  <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Bị khóa</span>
                )}
              </div>
              <p className="text-gray-400 text-sm">{maker.User?.email}</p>
              <div className="flex items-center gap-3 mt-1">
                <StarRating rating={maker.rating} />
                <span className="text-xs text-gray-400">{maker.rating > 0 ? maker.rating.toFixed(1) : 'Chưa có'}</span>
                <span className="text-gray-600">·</span>
                <span className="text-xs text-gray-400">{maker.totalDone} đơn hoàn thành</span>
                <span className="text-gray-600">·</span>
                <span className="text-xs text-pink-400 font-bold">Hoa hồng: {maker.commissionRate}%</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => onUpdateRate(maker.id, maker.User?.name, maker.commissionRate)}
              className="px-5 py-2 rounded-full border border-pink-400 text-pink-400 text-[10px] font-black uppercase hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all"
            >
              Chỉnh hoa hồng
            </button>
            <button
              onClick={() => maker.isBanned ? onUnban(maker.id, maker.User?.name) : onBan(maker.id, maker.User?.name)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${maker.isBanned
                  ? 'border border-green-400 text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500'
                  : 'border border-red-400 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'
                }`}
            >
              {maker.isBanned ? '🔓 Mở khóa' : '🔒 Khóa tài khoản'}
            </button>

            {/* Actions for Pending or Update-Required profile */}
            {(maker.status === 'cho_duyet' || maker.status === 'can_bo_sung') && (
              <>
                <button
                  onClick={() => onApprove(maker.id)}
                  className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Duyệt ✓
                </button>
                <button
                  onClick={() => onRequestUpdate(maker.id)}
                  className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Yêu cầu bổ sung ⚠️
                </button>
                <button
                  onClick={() => onReject(maker.id)}
                  className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Từ từ chối ✕
                </button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">

          {/* Bị khóa info */}
          {maker.isBanned && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-bold text-red-700 text-sm">Đang bị khóa</p>
                <p className="text-xs text-red-500">Lý do: {maker.banReason || 'Vi phạm quy định'}</p>
              </div>
            </div>
          )}

          {/* Lý do từ chối hoặc yêu cầu bổ sung trước đó */}
          {maker.rejectReason && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-xl">✕</span>
              <div>
                <p className="font-bold text-red-700 text-sm">Hồ sơ từng bị từ chối</p>
                <p className="text-xs text-red-500">Lý do: {maker.rejectReason}</p>
              </div>
            </div>
          )}

          {maker.adminNote && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-bold text-blue-700 text-sm">Yêu cầu bổ sung / Ghi chú từ admin</p>
                <p className="text-xs text-blue-500">Nội dung: {maker.adminNote}</p>
              </div>
            </div>
          )}

          {/* Stats nhanh */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Đang làm', value: loadingDetail ? '...' : activeOrders.length, color: 'text-amber-600' },
              { label: 'Hoàn thành', value: loadingDetail ? '...' : doneOrders.length, color: 'text-green-600' },
              { label: 'Tổng đơn', value: loadingDetail ? '...' : orders.length, color: 'text-gray-900' },
              { label: 'Nợ shop', value: loadingDetail ? '...' : fmt(pendingDebt), color: pendingDebt > 0 ? 'text-red-500' : 'text-gray-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chi tiết thông tin hồ sơ mới */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-pink-500">Thông tin hồ sơ đăng ký</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">🏷️</span>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Danh mục nghề</p>
                  <p className="text-sm font-semibold text-gray-800">{CATEGORY_MAP[maker.category] || maker.category || 'Chưa chọn'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">🕒</span>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Kinh nghiệm</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {maker.yearsExp !== undefined && maker.yearsExp !== null ? `${maker.yearsExp} năm` : 'Chưa nhập'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Tỉnh / Thành phố hoạt động</p>
                  <p className="text-sm font-semibold text-gray-800">{maker.province || 'Chưa nhập'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Giá dịch vụ tham khảo</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {maker.priceFrom || maker.priceTo ? `${fmt(maker.priceFrom)} - ${fmt(maker.priceTo)}` : 'Chưa đặt'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="border-t border-gray-200 pt-4 flex items-start gap-3">
              <span className="text-xl">🏦</span>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">Thông tin ngân hàng nhận thanh toán</p>
                <p className="text-sm font-semibold text-gray-800 whitespace-pre-wrap">{maker.bankInfo || 'Chưa cung cấp'}</p>
              </div>
            </div>

            {/* Bio */}
            {maker.bio && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Giới thiệu bản thân</p>
                <p className="text-sm text-gray-600 italic bg-white p-4 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                  "{maker.bio}"
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          {maker.skills && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Kỹ năng chuyên môn</p>
              <div className="flex flex-wrap gap-2">
                {maker.skills.split(',').filter(Boolean).map(s => (
                  <span key={s} className="bg-pink-50 text-pink-500 text-xs font-bold px-3 py-1 rounded-full">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CCCD / Định danh */}
          <div className="space-y-3 border-t border-gray-100 pt-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Ảnh CCCD / Xác minh danh tính</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-gray-400 mb-1">Mặt trước CCCD</p>
                {maker.idCardFront ? (
                  <a href={maker.idCardFront} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-2xl overflow-hidden border border-gray-200 group">
                    <img src={maker.idCardFront} alt="Mặt trước CCCD" className="w-full h-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Xem ảnh lớn 🔍</span>
                    </div>
                  </a>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-xs text-gray-400 border border-gray-200 border-dashed">
                    Chưa upload mặt trước
                  </div>
                )}
              </div>
              <div>
                <p className="text-[9px] text-gray-400 mb-1">Mặt sau CCCD</p>
                {maker.idCardBack ? (
                  <a href={maker.idCardBack} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-2xl overflow-hidden border border-gray-200 group">
                    <img src={maker.idCardBack} alt="Mặt sau CCCD" className="w-full h-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Xem ảnh lớn 🔍</span>
                    </div>
                  </a>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-xs text-gray-400 border border-gray-200 border-dashed">
                    Chưa upload mặt sau
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Portfolio */}
          {maker.portfolio && maker.portfolio.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sản phẩm tiêu biểu / Portfolio ({maker.portfolio.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {maker.portfolio.map((item, i) => {
                  const isImage = item.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || item.includes('/uploads/') || item.startsWith('data:image/');
                  if (isImage) {
                    return (
                      <a
                        key={i}
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50"
                      >
                        <img src={item} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover transition group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">Phóng to 🔍</span>
                        </div>
                      </a>
                    );
                  } else {
                    return (
                      <a
                        key={i}
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center hover:bg-pink-50 hover:border-pink-300 transition-all group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🔗</span>
                        <span className="text-[10px] font-bold text-gray-600 mt-2 truncate w-full group-hover:text-pink-500">
                          {item.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                      </a>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Đơn đang thực hiện */}
          {!loadingDetail && activeOrders.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="size-2 bg-amber-400 rounded-full animate-pulse" />
                Đơn đang thực hiện ({activeOrders.length})
              </p>
              <div className="space-y-2">
                {activeOrders.map(o => (
                  <Link
                    key={o.id}
                    to={`/custom-order/${o.id}`}
                    target="_blank"
                    className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-500'}`}>
                      {o.status}
                    </span>
                    <p className="text-sm font-medium flex-1 truncate">{o.title}</p>
                    <p className="text-pink-500 font-bold text-sm flex-shrink-0">{fmt(o.agreedPrice)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lịch sử đơn */}
          {!loadingDetail && doneOrders.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Lịch sử hoàn thành ({doneOrders.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {doneOrders.map(o => (
                  <Link
                    key={o.id}
                    to={`/custom-order/${o.id}`}
                    target="_blank"
                    className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <span className="text-green-500 text-sm">✓</span>
                    <p className="text-sm flex-1 truncate text-gray-600">{o.title}</p>
                    <p className="text-green-600 font-bold text-sm flex-shrink-0">{fmt(o.agreedPrice)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Công nợ */}
          {!loadingDetail && debts.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">
                Công nợ hoa hồng ({debts.length} khoản)
              </p>
              <div className="space-y-2">
                {debts.map(debt => (
                  <div key={debt.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3">
                    <p className="text-sm flex-1 truncate text-gray-600">{debt.orderTitle}</p>
                    <p className="text-pink-500 font-bold text-sm">{fmt(debt.amount)}</p>
                    {debt.status === 'chua_thu' ? (
                      <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Chưa thu</span>
                    ) : (
                      <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Đã thu</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingDetail && orders.length === 0 && (
            <p className="text-center text-gray-400 italic font-serif py-6">Thợ này chưa có đơn nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

//  MAIN COMPONENT 
const AdminMakerManager = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [makers, setMakers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMaker, setSelectedMaker] = useState(null);
  const [acting, setActing] = useState(null);

  const headers = () => ({ headers: { token: `Bearer ${user?.accessToken}` } });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        axios.get('http://localhost:5000/api/makers/admin/all', headers()),
        axios.get('http://localhost:5000/api/makers/admin/pending', headers()),
      ]);
      setMakers(allRes.data || []);
      setPending(pendingRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    fetchAll();
  }, [user]);

  const approve = async (id) => {
    const note = window.prompt('Ghi chú duyệt hồ sơ (không bắt buộc):');
    if (note === null) return;
    setActing(id);
    try {
      await axios.put(`http://localhost:5000/api/makers/admin/${id}/approve`, { adminNote: note.trim() }, headers());
      await fetchAll();
      setSelectedMaker(null);
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
    finally { setActing(null); }
  };

  const reject = async (id) => {
    const reason = window.prompt('Nhập lý do từ chối hồ sơ (bắt buộc, tối thiểu 10 ký tự):');
    if (reason === null) return;
    if (reason.trim().length < 10) {
      alert('Lý do từ chối phải từ 10 ký tự trở lên.');
      return;
    }
    setActing(id);
    try {
      await axios.put(`http://localhost:5000/api/makers/admin/${id}/reject`, { rejectReason: reason.trim() }, headers());
      await fetchAll();
      setSelectedMaker(null);
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
    finally { setActing(null); }
  };

  const requestUpdate = async (id) => {
    const note = window.prompt('Nhập yêu cầu bổ sung thông tin hồ sơ (bắt buộc, tối thiểu 10 ký tự):');
    if (note === null) return;
    if (note.trim().length < 10) {
      alert('Yêu cầu bổ sung phải từ 10 ký tự trở lên.');
      return;
    }
    setActing(id);
    try {
      await axios.put(`http://localhost:5000/api/makers/admin/${id}/request-update`, { adminNote: note.trim() }, headers());
      await fetchAll();
      setSelectedMaker(null);
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
    finally { setActing(null); }
  };

  const ban = async (id, name) => {
    const reason = window.prompt(`Lý do khóa thợ "${name}"?`);
    if (reason === null) return;
    setActing(id);
    try {
      await axios.put(`http://localhost:5000/api/admin/makers/${id}/ban`, { isBanned: true, banReason: reason || 'Vi phạm quy định' }, headers());
      await fetchAll();
      setSelectedMaker(null);
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
    finally { setActing(null); }
  };

  const unban = async (id, name) => {
    if (!window.confirm(`Xác nhận mở khóa cho thợ "${name}"?`)) return;
    setActing(id);
    try {
      await axios.put(`http://localhost:5000/api/admin/makers/${id}/ban`, { isBanned: false }, headers());
      await fetchAll();
      setSelectedMaker(null);
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
    finally { setActing(null); }
  };

  const updateRate = async (id, name, currentRate) => {
    const newRate = window.prompt(`Tỷ lệ hoa hồng mới cho thợ "${name}" (5–20%):\nHiện tại: ${currentRate}%`);
    if (!newRate || isNaN(newRate)) return;
    setActing(id);
    try {
      await axios.put(`http://localhost:5000/api/admin/makers/${id}/commission`, { commissionRate: parseFloat(newRate) }, headers());
      await fetchAll();
      setSelectedMaker(null);
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
    finally { setActing(null); }
  };

  const filtered = makers.filter(m => {
    const matchSearch = (m.User?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.User?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.skills || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ? true :
      statusFilter === 'banned' ? m.isBanned :
        statusFilter === 'da_duyet' ? (m.status === 'da_duyet' && !m.isBanned) :
          m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: makers.length,
    approved: makers.filter(m => m.status === 'da_duyet').length,
    banned: makers.filter(m => m.isBanned).length,
    pending: pending.length,
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">
      Đang tải dữ liệu thợ...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Modal chi tiết */}
      {selectedMaker && (
        <MakerDetailModal
          maker={selectedMaker}
          onClose={() => setSelectedMaker(null)}
          onBan={ban}
          onUnban={unban}
          onUpdateRate={updateRate}
          onApprove={approve}
          onReject={reject}
          onRequestUpdate={requestUpdate}
          headers={headers}
        />
      )}

      {/* HEADER */}
      <div className="bg-gray-950 text-white px-6 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-white transition-colors text-sm">
                ← Admin
              </button>
              <span className="text-gray-700">/</span>
              <h1 className="text-xl font-bold text-pink-400">Quản lý thợ thủ công</h1>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-black">
              {stats.total} thợ · {stats.approved} đã duyệt · {stats.banned} bị khóa
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng thợ', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Đã duyệt', value: stats.approved, color: 'text-green-600', bg: 'bg-green-50 border border-green-100' },
            { label: 'Chờ duyệt', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50 border border-yellow-100' },
            { label: 'Đang bị khóa', value: stats.banned, color: 'text-red-500', bg: 'bg-red-50 border border-red-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Hồ sơ chờ duyệt */}
        {pending.length > 0 && (
          <div className="bg-white rounded-3xl border border-yellow-200 overflow-hidden">
            <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2">
              <span className="size-2 bg-yellow-400 rounded-full animate-pulse" />
              <p className="font-bold text-yellow-700 text-sm">
                Hồ sơ đang chờ duyệt ({pending.length})
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {pending.map(m => (
                <div key={m.id} className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50">
                  <div className="size-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {m.User?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-950">{m.User?.name}</p>
                      <span className="text-[10px] bg-pink-50 text-pink-600 font-bold px-2 py-0.5 rounded-full">
                        {CATEGORY_MAP[m.category] || m.category || 'Khác'}
                      </span>
                      {m.yearsExp !== undefined && m.yearsExp !== null && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-full">
                          {m.yearsExp} năm KN
                        </span>
                      )}
                      {m.province && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                          📍 {m.province}
                        </span>
                      )}
                      {m.status === 'can_bo_sung' && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 font-black uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">
                          Chờ bổ sung
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{m.User?.email}</p>
                    {m.bio && <p className="text-xs text-gray-500 italic mt-1.5 line-clamp-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">"{m.bio}"</p>}
                    {m.skills && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.skills.split(',').slice(0, 4).map(s => (
                          <span key={s} className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedMaker(m)}
                      className="border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => approve(m.id)}
                      disabled={acting === m.id}
                      className="bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {acting === m.id ? '...' : 'Duyệt ✓'}
                    </button>
                    <button
                      onClick={() => requestUpdate(m.id)}
                      disabled={acting === m.id}
                      className="bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Cần bổ sung
                    </button>
                    <button
                      onClick={() => reject(m.id)}
                      disabled={acting === m.id}
                      className="border border-red-200 text-red-500 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm thợ theo tên, email, kỹ năng..."
              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm outline-none focus:border-pink-300 pr-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">🔍</span>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'da_duyet', label: '✓ Đã duyệt' },
              { key: 'cho_duyet', label: '⏳ Chờ duyệt' },
              { key: 'banned', label: '🔒 Bị khóa' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${statusFilter === f.key ? 'bg-gray-950 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bảng thợ */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-sm">
              Tất cả thợ <span className="text-gray-400 font-normal">({filtered.length})</span>
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-400 italic font-serif">
              Không tìm thấy thợ nào.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(m => (
                <div
                  key={m.id}
                  className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${m.isBanned ? 'opacity-60' : ''}`}
                >
                  {/* Avatar */}
                  <div className="size-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {m.User?.name?.charAt(0)}
                  </div>

                  {/* Thông tin cơ bản */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm text-gray-950">{m.User?.name}</p>
                      <MakerBadge badge={m.badge} badgeEmoji={m.badgeEmoji} />
                      {m.isBanned && <span className="text-[8px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">Bị khóa</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{m.User?.email}</p>
                    {m.skills && (
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {m.skills.split(',').slice(0, 3).join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="hidden md:flex flex-col items-center flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <StarRating rating={m.rating} />
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                      {m.rating > 0 ? m.rating.toFixed(1) : 'Chưa có'}
                    </p>
                  </div>

                  {/* Đơn */}
                  <div className="hidden md:block text-center flex-shrink-0 w-16">
                    <p className="font-bold text-lg text-gray-950">{m.totalDone}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Đơn HT</p>
                  </div>

                  {/* Hoa hồng */}
                  <div className="hidden md:block text-center flex-shrink-0 w-20">
                    <button
                      onClick={() => updateRate(m.id, m.User?.name, m.commissionRate)}
                      className="text-pink-500 font-bold text-sm hover:underline"
                      title="Click để chỉnh sửa"
                    >
                      {m.commissionRate}%
                    </button>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Hoa hồng</p>
                  </div>

                  {/* Status */}
                  <div className="hidden sm:block flex-shrink-0">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                      m.status === 'da_duyet' ? 'bg-green-50 text-green-600' :
                      m.status === 'tu_choi' ? 'bg-red-50 text-red-500' :
                      m.status === 'can_bo_sung' ? 'bg-blue-50 text-blue-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      {m.status === 'da_duyet' ? 'Đã duyệt' :
                       m.status === 'tu_choi' ? 'Từ chối' :
                       m.status === 'can_bo_sung' ? 'Cần bổ sung' :
                       'Chờ duyệt'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedMaker(m)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => m.isBanned ? unban(m.id, m.User?.name) : ban(m.id, m.User?.name)}
                      disabled={acting === m.id}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors disabled:opacity-40 ${m.isBanned
                          ? 'border-green-200 text-green-600 hover:bg-green-50'
                          : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                    >
                      {acting === m.id ? '...' : m.isBanned ? 'Mở khóa' : 'Khóa'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminMakerManager;
