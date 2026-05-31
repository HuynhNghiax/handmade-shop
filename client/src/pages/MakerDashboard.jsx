import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const STATUS_COLOR = {
  'Đã chọn thợ': 'bg-purple-100 text-purple-700',
  'Đang thực hiện': 'bg-blue-100   text-blue-700',
  'Chờ xác nhận': 'bg-amber-100  text-amber-700',
  'Hoàn thành': 'bg-green-100  text-green-700',
  'Đã hủy': 'bg-gray-100   text-gray-500',
};

const TABS = [
  { id: 'bids_sent', label: 'Báo giá đã gửi', icon: '🙋', statuses: [] },
  { id: 'active', label: 'Đang làm', icon: '🔨', statuses: ['Đã chọn thợ', 'Đang thực hiện', 'Chờ xác nhận'] },
  { id: 'done', label: 'Hoàn thành', icon: '✅', statuses: ['Hoàn thành'] },
  { id: 'payouts', label: 'Thu nhập', icon: '💵', statuses: [] },
  { id: 'debts', label: 'Công nợ', icon: '💳', statuses: [] },
  { id: 'history', label: 'Tất cả', icon: '📋', statuses: [] },
];

const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';

const StatCard = ({ label, value, sub, accent = false, dark = false }) => (
  <div className={`rounded-2xl p-5 ${dark ? 'bg-gray-950 text-white' : accent ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${dark || accent ? 'text-white/60' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-2xl font-bold ${dark || accent ? 'text-white' : 'text-gray-950'}`}>{value}</p>
    {sub && <p className={`text-[9px] mt-1 ${dark || accent ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>}
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
    <p className="text-4xl mb-4">{icon}</p>
    <p className="font-serif italic text-gray-400 text-lg">{message}</p>
  </div>
);

const MakerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState('active');
  const [bids, setBids] = useState([]);
  const [debts, setDebts] = useState(null);
  const [payouts, setPayouts] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [myOrders, setMyOrders] = useState([]);

  const headers = () => ({ headers: { token: `Bearer ${user?.accessToken}` } });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bidsRes, debtsRes, profileRes, payoutsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/my-profile', headers()),
        axios.get('http://localhost:5000/api/makers/my-debts', headers()),
        axios.get('http://localhost:5000/api/makers/my-profile', headers()),
        axios.get('http://localhost:5000/api/makers/my-payouts', headers()),
        axios.get('http://localhost:5000/api/makers/my-orders', headers()),
      ]);

      setBids(bidsRes.data.myBids || []);
      setDebts(debtsRes.data);
      setProfile(profileRes.data);
      setPayouts(payoutsRes.data);
      setMyOrders(ordersRes.data || []);
    } catch (err) {
      console.error('[MakerDashboard] fetchAll:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const doAction = async (orderId, endpoint) => {
    setActing(orderId);
    try {
      await axios.post(`http://localhost:5000/api/custom-orders/${orderId}/${endpoint}`, {}, headers());
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setActing(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">
      Đang nạp dữ liệu...
    </div>
  );

  const allOrders = myOrders;

  const activeOrders = allOrders.filter(o =>
    ['Đã chọn thợ', 'Đang thực hiện', 'Chờ xác nhận'].includes(o.status)
  );
  const doneOrders = allOrders.filter(o => o.status === 'Hoàn thành');
  const cancelOrders = allOrders.filter(o => o.status === 'Đã hủy');

  const pendingDebts = debts?.debts?.filter(d => d.status === 'chua_thu') || [];
  const paidDebts = debts?.debts?.filter(d => d.status === 'da_thu') || [];

  // Payout data
  const pendingPayouts = payouts?.payouts?.filter(p => p.status === 'cho_tra') || [];
  const paidPayouts = payouts?.payouts?.filter(p => p.status === 'da_tra') || [];
  const totalPendingPayout = pendingPayouts.reduce((s, p) => s + p.amount, 0);
  const totalPaidPayout = paidPayouts.reduce((s, p) => s + p.amount, 0);

  const badgeColor = {
    'Thợ Vàng': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Thợ Bạc': 'bg-gray-100   text-gray-600   border-gray-300',
    'Thợ Đồng': 'bg-orange-100 text-orange-700 border-orange-300',
    'Thợ Mới': 'bg-green-50   text-green-600  border-green-200',
  }[profile?.badge] || 'bg-gray-100 text-gray-500 border-gray-200';

  return (
    <div className="min-h-screen bg-white font-sans py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 pb-10 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-2 block">Bảng điều khiển thợ</span>
            <h1 className="text-4xl font-serif italic tracking-tighter text-gray-950">
              Xin chào, <span className="text-pink-400">{user?.name}</span> 👋
            </h1>
            {profile && (
              <div className="flex items-center gap-3 mt-3">
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full border ${badgeColor}`}>
                  {profile.badgeEmoji} {profile.badge}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  ⭐ {profile.rating > 0 ? profile.rating.toFixed(1) : 'Chưa có'} · {profile.totalDone} đơn hoàn thành
                </span>
              </div>
            )}
          </div>
          <Link to="/become-maker"
            className="text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 transition-all">
            ✏️ Sửa hồ sơ thợ
          </Link>
        </div>

        {/* Cảnh báo thiếu thông tin ngân hàng */}
        {profile && !profile.bankInfo && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-black text-amber-700 text-sm">Chưa có tài khoản ngân hàng!</p>
              <p className="text-amber-600 text-xs mt-1">
                Cập nhật ngay để nhận tiền từ đơn gia công. Shop sẽ chuyển khoản sau khi khách thanh toán.
              </p>
            </div>
            <Link to="/become-maker"
              className="flex-shrink-0 bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
              Cập nhật ngay
            </Link>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard label="Đang thực hiện" value={activeOrders.length} sub="đơn hiện tại" />
          <StatCard label="Hoàn thành" value={doneOrders.length} sub="tổng cộng" accent />
          <StatCard label="Chờ nhận tiền" value={fmt(totalPendingPayout)} sub={`${pendingPayouts.length} khoản`} dark />
          <StatCard label="Tổng đã nhận" value={fmt(payouts?.summary?.totalPaid || 0)} sub="tất cả thời gian" />
        </div>

        {/* TABS */}
        <div className="flex gap-2 flex-wrap mb-10">
          {TABS.map(t => {
            let count = null;
            if (t.id === 'active') count = activeOrders.length;
            if (t.id === 'done') count = doneOrders.length;
            if (t.id === 'payouts') count = pendingPayouts.length;
            if (t.id === 'debts') count = pendingDebts.length;
            if (t.id === 'history') count = allOrders.length;

            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-gray-950 text-white shadow-xl' : 'bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500'
                  }`}>
                {t.icon} {t.label}
                {count > 0 && (
                  <span className={`size-5 rounded-full flex items-center justify-center text-[8px] font-black ${tab === t.id ? 'bg-white text-gray-950' : 'bg-pink-500 text-white'
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === 'bids_sent' && (
          <div className="space-y-4">
            {bids.length === 0
              ? <EmptyState icon="🙋" message="Bạn chưa gửi báo giá nào." />
              : bids.map(bid => {
                const order = bid.CustomOrder;
                const isAccepted = Number(order?.acceptedBidId) === Number(bid.id);
                const isWaiting = order?.status === 'Đang tìm thợ';

                return (
                  <div key={bid.id} className={`relative rounded-[2rem] border-2 overflow-hidden transition-all
              ${isAccepted ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-white'}`}>
                    <p className="text-xs text-gray-400 italic">
                      {isAccepted
                        ? '✅ Báo giá của bạn được chọn — vào đơn để bắt đầu!'
                        : isWaiting
                          ? 'Đang chờ khách xem xét...'
                          : order?.status === 'Hoàn thành'
                            ? 'Đơn đã hoàn thành.'
                            : order?.makerId === order?.acceptedBidId
                              ? 'Khách đã chọn thợ khác.'
                              : 'Đơn không còn nhận báo giá.'}
                    </p>
                    <div className="p-6 flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-950">{order?.title}</h3>
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase
                      ${isAccepted ? 'bg-green-100 text-green-700' :
                              isWaiting ? 'bg-yellow-100 text-yellow-700' :
                                order?.status === 'Hoàn thành' ? 'bg-gray-100 text-gray-500' :
                                  'bg-blue-100 text-blue-700'}`}>
                            {order?.status}
                          </span>
                        </div>
                        <p className="text-xl font-serif font-bold text-pink-500 mb-1">
                          {bid.price?.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-xs text-gray-400 italic">
                          {isAccepted ? 'Đã được chọn — xem đơn để tiếp tục' :
                            isWaiting ? 'Đang chờ khách xem xét...' :
                              'Đơn đã có thợ khác hoặc đã hoàn thành.'}
                        </p>
                      </div>
                      <a href={`/custom-order/${order?.id}`}
                        className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl
                    ${isAccepted ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-950 text-white hover:bg-pink-500'}`}>
                        {isAccepted ? 'Vào đơn ngay →' : 'Xem đơn →'}
                      </a>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* TAB: ĐANG LÀM */}
        {tab === 'active' && (
          <div className="space-y-4">
            {activeOrders.length === 0
              ? <EmptyState icon="🎯" message="Chưa có đơn nào đang thực hiện." />
              : activeOrders.map(order => (
                <OrderCard key={order.id} order={order} acting={acting} onAction={doAction} showActions />
              ))
            }
          </div>
        )}

        {/* TAB: HOÀN THÀNH */}
        {tab === 'done' && (
          <div className="space-y-4">
            {doneOrders.length === 0
              ? <EmptyState icon="🏆" message="Chưa có đơn nào hoàn thành." />
              : doneOrders.map(order => (
                <OrderCard key={order.id} order={order} acting={acting} />
              ))
            }
          </div>
        )}

        {/* TAB: THU NHẬP (MỚI) */}
        {tab === 'payouts' && (
          <div className="space-y-6">
            {/* Tóm tắt */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-1">Chờ nhận</p>
                <p className="text-2xl font-bold text-amber-600">{fmt(totalPendingPayout)}</p>
                <p className="text-[9px] text-amber-500 mt-1">{pendingPayouts.length} khoản</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">Đã nhận</p>
                <p className="text-2xl font-bold text-green-600">{fmt(totalPaidPayout)}</p>
                <p className="text-[9px] text-green-500 mt-1">{paidPayouts.length} khoản</p>
              </div>
              <div className="bg-gray-950 rounded-2xl p-5">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tổng thu nhập</p>
                <p className="text-2xl font-bold text-white">{fmt(payouts?.summary?.totalEarning)}</p>
                <p className="text-[9px] text-gray-500 mt-1">Sau phí sàn</p>
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
              <span className="text-xl mt-0.5">💡</span>
              <div>
                <p className="text-xs font-bold text-blue-700 mb-1">Cách nhận tiền</p>
                <p className="text-xs text-blue-600 font-light leading-relaxed">
                  Sau khi khách hàng thanh toán qua ZaloPay, shop sẽ chuyển khoản <strong>makerEarning</strong> về tài khoản ngân hàng của bạn
                  trong vòng <strong>24-48 giờ làm việc</strong>. Đảm bảo thông tin NH trong hồ sơ là chính xác!
                </p>
                {profile?.bankInfo ? (
                  <p className="text-xs text-blue-700 font-bold mt-2">
                    🏦 TK của bạn: <span className="font-normal">{profile.bankInfo}</span>
                  </p>
                ) : (
                  <Link to="/become-maker" className="text-xs text-red-500 font-bold mt-2 block">
                    ⚠️ Chưa có TK NH — Cập nhật ngay →
                  </Link>
                )}
              </div>
            </div>

            {/* Khoản chờ nhận */}
            {pendingPayouts.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  Chờ nhận ({pendingPayouts.length})
                </p>
                <div className="bg-white rounded-3xl border border-amber-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-amber-50 border-b border-amber-100">
                      <tr>
                        {['Đơn gia công', 'Giá chốt', 'Bạn nhận', 'Phí sàn', 'Ngày HT', 'Trạng thái'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-amber-600 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50">
                      {pendingPayouts.map(payout => (
                        <tr key={payout.id} className="hover:bg-amber-50/40">
                          <td className="px-5 py-4">
                            <Link to={`/custom-order/${payout.Order?.id}`}
                              className="font-medium text-gray-950 hover:text-pink-500 transition-colors">
                              {payout.Order?.title}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{fmt(payout.agreedPrice)}</td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-green-600 text-base">{fmt(payout.amount)}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400">
                            {payout.commissionRate}% = {fmt(payout.agreedPrice - payout.amount)}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400">
                            {new Date(payout.Order?.updatedAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">
                              ⏳ Chờ chuyển khoản
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={2} className="px-5 py-3 text-xs font-black text-gray-500 uppercase">Tổng chờ nhận</td>
                        <td className="px-5 py-3 font-black text-green-600 text-base">{fmt(totalPendingPayout)}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Khoản đã nhận */}
            {paidPayouts.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  Đã nhận ({paidPayouts.length})
                </p>
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Đơn gia công', 'Số tiền nhận', 'Ngày chuyển', 'Ghi chú'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paidPayouts.map(payout => (
                        <tr key={payout.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4">
                            <Link to={`/custom-order/${payout.Order?.id}`}
                              className="font-medium text-gray-700 hover:text-pink-500 transition-colors">
                              {payout.Order?.title}
                            </Link>
                          </td>
                          <td className="px-5 py-4 font-bold text-green-600">{fmt(payout.amount)}</td>
                          <td className="px-5 py-4 text-xs text-gray-400">
                            {payout.paidAt ? new Date(payout.paidAt).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400 italic">{payout.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {pendingPayouts.length === 0 && paidPayouts.length === 0 && (
              <EmptyState icon="💚" message="Chưa có khoản thu nhập nào. Hãy nhận thêm đơn!" />
            )}
          </div>
        )}

        {/* TAB: CÔNG NỢ */}
        {tab === 'debts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Chưa trả sàn</p>
                <p className="text-2xl font-bold text-red-500">{fmt(debts?.summary?.totalPending)}</p>
                <p className="text-[9px] text-red-400 mt-1">{pendingDebts.length} khoản</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">Đã trả</p>
                <p className="text-2xl font-bold text-green-600">{fmt(debts?.summary?.totalPaid)}</p>
                <p className="text-[9px] text-green-500 mt-1">{paidDebts.length} khoản</p>
              </div>
              <div className="bg-gray-950 rounded-2xl p-5">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tổng thu nhập</p>
                <p className="text-2xl font-bold text-white">{fmt(debts?.summary?.totalEarning)}</p>
                <p className="text-[9px] text-gray-500 mt-1">Đã nhận vào tay</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
              <span className="text-xl mt-0.5">💡</span>
              <div>
                <p className="text-xs font-bold text-amber-700 mb-1">Phí kết nối sàn</p>
                <p className="text-xs text-amber-600 font-light leading-relaxed">
                  Đây là phí hoa hồng bạn nợ sàn (trong mô hình thanh toán COD).
                  Với ZaloPay, phí này được tự động tính nhưng quản lý bởi admin.
                </p>
              </div>
            </div>

            {pendingDebts.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Chưa trả ({pendingDebts.length})</p>
                <div className="bg-white rounded-3xl border border-red-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-red-50 border-b border-red-100">
                      <tr>
                        {['Đơn gia công', 'Giá chốt', 'Phí sàn', 'Ngày HT', 'Trạng thái'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-red-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                      {pendingDebts.map(debt => (
                        <tr key={debt.id} className="hover:bg-red-50/40">
                          <td className="px-5 py-4">
                            <Link to={`/custom-order/${debt.Order?.id}`}
                              className="font-medium text-gray-950 hover:text-pink-500 transition-colors">
                              {debt.Order?.title}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{fmt(debt.Order?.agreedPrice)}</td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-red-500">{fmt(debt.amount)}</span>
                            <span className="text-[10px] text-gray-400 ml-1">({debt.commissionRate}%)</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-400">
                            {new Date(debt.Order?.updatedAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-600">Chưa trả</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={2} className="px-5 py-3 text-xs font-black text-gray-500 uppercase">Tổng cần trả</td>
                        <td className="px-5 py-3 font-black text-red-500 text-base">{fmt(debts?.summary?.totalPending)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {pendingDebts.length === 0 && paidDebts.length === 0 && (
              <EmptyState icon="💚" message="Chưa có công nợ nào. Làm thêm đơn nhé!" />
            )}
          </div>
        )}

        {/* TAB: TẤT CẢ */}
        {tab === 'history' && (
          <div className="space-y-4">
            {allOrders.length === 0
              ? <EmptyState icon="📋" message="Chưa có đơn nào được chọn." />
              : allOrders.map(order => (
                <OrderCard key={order.id} order={order} acting={acting} />
              ))
            }
            {cancelOrders.length > 0 && (
              <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4">
                + {cancelOrders.length} đơn đã hủy không được hiển thị
              </p>
            )}
          </div>
        )}


      </div>
    </div>
  );
};

const OrderCard = ({ order, acting, onAction, showActions = false }) => {
  const isActing = acting === order.id;
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-lg hover:border-pink-100 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-500'}`}>
              {order.status}
            </span>
            <span className="text-[10px] text-gray-400 font-bold">#{order.id}</span>
          </div>
          <h3 className="font-bold text-gray-950 text-base mb-1">{order.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-1 italic mb-3">{order.description}</p>
          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase">
            <span>💰 Ngân sách khách: <span className="text-gray-700">{(order.budget || 0).toLocaleString('vi-VN')}đ</span></span>
            {order.myBidPrice && (
              <span>🤝 Giá chốt: <span className="text-pink-500">{order.myBidPrice.toLocaleString('vi-VN')}đ</span></span>
            )}
            {order.status === 'Đã hủy' ? (
              order.depositStatus === 'paid'
                ? <span>💰 Giữ cọc (sau HH): <span className="text-orange-500">
                  {Math.round(order.depositAmount * (1 - order.commissionRate / 100)).toLocaleString('vi-VN')}đ
                </span></span>
                : <span className="text-gray-400">Không nhận được tiền</span>
            ) : (
              order.makerEarning && (
                <span>💵 Tôi nhận: <span className="text-green-600">{order.makerEarning.toLocaleString('vi-VN')}đ</span></span>
              )
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to={`/custom-order/${order.id}`}
            className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            Xem đơn →
          </Link>
          {showActions && (
            <>
              {order.status === 'Đã chọn thợ' && (
                <button onClick={() => onAction(order.id, 'start')} disabled={isActing}
                  className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-all shadow-lg disabled:opacity-50">
                  {isActing ? '...' : '🔨 Bắt đầu'}
                </button>
              )}
              {order.status === 'Đang thực hiện' && (
                <button onClick={() => onAction(order.id, 'complete')} disabled={isActing}
                  className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg disabled:opacity-50">
                  {isActing ? '...' : '📦 Báo xong'}
                </button>
              )}
              {order.status === 'Chờ xác nhận' && (
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                  ⏳ Chờ khách thanh toán
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakerDashboard;
