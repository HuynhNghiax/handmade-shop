import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MakerBadge from '../components/MakerBadge';

const TABS = [
  { id: 'analytics', icon: '📊', label: 'Báo cáo' },
  { id: 'orders', icon: '📦', label: 'Đơn hàng' },
  { id: 'commission', icon: '💰', label: 'Hoa hồng' },
  { id: 'debt', icon: '💳', label: 'Công nợ' },
  { id: 'makers', icon: '🧶', label: 'Thợ' },
  { id: 'users', icon: '👥', label: 'Người dùng' },
  { id: 'logs', icon: '🕵️', label: 'Nhật ký' },
];

const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState('analytics');
  const [data, setData] = useState({ orders: [], users: [], logs: [] });
  const [makers, setMakers] = useState({ pending: [], all: [] });
  const [stats, setStats] = useState(null);
  const [commission, setCommission] = useState([]);
  const [debts, setDebts] = useState([]);
  const [debtFilter, setDebtFilter] = useState('chua_thu');
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  const headers = () => ({ headers: { token: `Bearer ${user?.accessToken}` } });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [orderRes, userRes, logRes, statsRes, commRes, pendingRes, allMakerRes, debtRes] =
        await Promise.all([
          axios.get('http://localhost:5000/api/orders', headers()),
          axios.get('http://localhost:5000/api/users', headers()),
          axios.get('http://localhost:5000/api/logs', headers()),
          axios.get('http://localhost:5000/api/admin/stats', headers()),
          axios.get('http://localhost:5000/api/admin/commission', headers()),
          axios.get('http://localhost:5000/api/makers/admin/pending', headers()),
          axios.get('http://localhost:5000/api/makers/admin/all', headers()),
          axios.get('http://localhost:5000/api/admin/debts', headers()),
        ]);

      setData({ orders: orderRes.data || [], users: userRes.data || [], logs: logRes.data || [] });
      setStats(statsRes.data);
      setCommission(commRes.data || []);
      setMakers({ pending: pendingRes.data || [], all: allMakerRes.data || [] });
      setDebts(debtRes.data || []);
    } catch (err) {
      console.error('[AdminDashboard] fetchAll:', err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) fetchAll();
    else navigate('/login');
  }, [user]);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status: newStatus }, headers());
      fetchAll();
    } catch { alert('Lỗi cập nhật!'); }
  };

  const approveMaker = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/makers/admin/${id}/approve`, {}, headers());
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi duyệt!'); }
  };

  const rejectMaker = async (id) => {
    if (!window.confirm('Từ chối hồ sơ này?')) return;
    try {
      await axios.put(`http://localhost:5000/api/makers/admin/${id}/reject`, {}, headers());
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi từ chối!'); }
  };

  const banMaker = async (id, isBanned, name) => {
    const reason = isBanned ? window.prompt(`Lý do khóa thợ ${name}?`) : null;
    if (isBanned && reason === null) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/makers/${id}/ban`, { isBanned, banReason: reason }, headers());
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
  };

  const updateCommissionRate = async (id, name) => {
    const newRate = window.prompt(`Tỷ lệ hoa hồng mới cho thợ ${name} (5-20%)?`);
    if (!newRate || isNaN(newRate)) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/makers/${id}/commission`, { commissionRate: parseFloat(newRate) }, headers());
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi!'); }
  };

  const markDebtPaid = async (debtId, makerName, amount) => {
    const note = window.prompt(`Xác nhận đã thu ${amount.toLocaleString('vi-VN')}đ từ ${makerName}?\n\nGhi chú (số CK, nội dung...):`, '');
    if (note === null) return;
    setMarkingId(debtId);
    try {
      await axios.put(`http://localhost:5000/api/admin/debts/${debtId}/mark-paid`, { note }, headers());
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xác nhận!');
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">
      Đang nạp dữ liệu...
    </div>
  );

  // Tổng hợp số liệu công nợ
  const totalPending = debts.reduce((s, m) => s + m.totalPending, 0);
  const totalPaid = debts.reduce((s, m) => s + m.totalPaid, 0);
  const makersOwing = debts.filter(m => m.totalPending > 0).length;

  // Lọc debts theo tab
  const filteredDebts = debts.map(maker => ({
    ...maker,
    debts: maker.debts.filter(d => debtFilter === 'all' || d.status === debtFilter),
  })).filter(maker => maker.debts.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-950 text-white p-8 flex flex-col fixed h-full shadow-2xl z-50">
        <div className="mb-12 px-4">
          <h2 className="text-2xl font-serif italic text-pink-400 tracking-tighter">Pinky Admin</h2>
          <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black mt-2">Dashboard Center</p>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'
                }`}
            >
              {t.icon} {t.label}
              {t.id === 'makers' && makers.pending.length > 0 && (
                <span className="ml-auto bg-yellow-400 text-gray-950 size-5 rounded-full flex items-center justify-center text-[8px] font-black">
                  {makers.pending.length}
                </span>
              )}
              {t.id === 'debt' && makersOwing > 0 && (
                <span className="ml-auto bg-red-400 text-white size-5 rounded-full flex items-center justify-center text-[8px] font-black">
                  {makersOwing}
                </span>
              )}
            </button>
          ))}
          <div className="my-6 border-t border-white/5" />
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-pink-300 border border-pink-500/20"
          >
            🧶 Kho sản phẩm →
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="ml-72 flex-grow p-16">
        <div className="max-w-6xl mx-auto">

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Tổng quan cửa hàng</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Doanh thu shop</p>
                  <p className="text-2xl font-bold text-pink-500">{fmt(stats?.revenue?.regular)}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Từ bán sản phẩm</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Hoa hồng sàn</p>
                  <p className="text-2xl font-bold text-green-600">{fmt(stats?.revenue?.commission)}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Từ đơn gia công</p>
                </div>
                <div className="bg-gray-950 rounded-2xl p-6">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-white">{fmt(stats?.revenue?.total)}</p>
                  <p className="text-[9px] text-gray-500 mt-1">Tất cả nguồn</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                  <p className="text-xs text-red-400 font-medium uppercase tracking-wide mb-2">Chưa thu được</p>
                  <p className="text-2xl font-bold text-red-500">{fmt(stats?.debt?.pendingAmount)}</p>
                  <p className="text-[9px] text-red-300 mt-1">{stats?.debt?.pendingCount || 0} khoản đang chờ</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="font-semibold">Đơn hàng gần đây</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Khách hàng', 'Tổng tiền', 'Trạng thái'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><p className="font-medium">{o.address}</p><p className="text-xs text-gray-400">{o.phone}</p></td>
                        <td className="px-6 py-4 font-semibold text-pink-500">{fmt(o.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold
                            ${o.status === 'Hoàn thành' ? 'bg-green-50 text-green-600' :
                              o.status === 'Đang giao' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMMISSION */}
          {tab === 'commission' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Hoa hồng từ đơn gia công</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tổng đơn hoàn thành', value: commission.length },
                  { label: 'GMV qua sàn', value: fmt(commission.reduce((s, o) => s + (o.agreedPrice || 0), 0)) },
                  { label: 'Tổng shop thu', value: fmt(commission.reduce((s, o) => s + (o.shopEarning || 0), 0)), highlight: true },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl p-5 ${s.highlight ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}>
                    <p className={`text-xs font-medium mb-1 ${s.highlight ? 'text-pink-100' : 'text-gray-400'}`}>{s.label}</p>
                    <p className={`text-2xl font-bold ${s.highlight ? 'text-white' : ''}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Đơn', 'Khách', 'Thợ', 'Giá chốt', 'Phí (%)', 'Shop thu', 'Thợ nhận', 'Ngày HT'].map(h => (
                        <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {commission.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium max-w-32 truncate">{o.title}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{o.customerName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{o.makerName}</td>
                        <td className="px-4 py-3 font-semibold">{fmt(o.agreedPrice)}</td>
                        <td className="px-4 py-3 text-gray-400">{o.commissionRate}%</td>
                        <td className="px-4 py-3 font-bold text-pink-500">{fmt(o.shopEarning)}</td>
                        <td className="px-4 py-3 font-bold text-green-600">{fmt(o.makerEarning)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.completedAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                    {commission.length === 0 && (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">Chưa có đơn hoàn thành nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CÔNG NỢ */}
          {tab === 'debt' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Quản lý công nợ hoa hồng</h3>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-medium uppercase tracking-wide mb-1">Chưa thu được</p>
                  <p className="text-2xl font-bold text-red-500">{fmt(totalPending)}</p>
                  <p className="text-[9px] text-red-400 mt-1">{makersOwing} thợ đang nợ</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Đã thu được</p>
                  <p className="text-2xl font-bold text-green-600">{fmt(totalPaid)}</p>
                  <p className="text-[9px] text-green-400 mt-1">Tất cả thời gian</p>
                </div>
                <div className="bg-gray-950 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Tổng hoa hồng</p>
                  <p className="text-2xl font-bold text-white">{fmt(totalPending + totalPaid)}</p>
                  <p className="text-[9px] text-gray-500 mt-1">Đã phát sinh</p>
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {[
                  { key: 'chua_thu', label: '⏳ Chưa thu' },
                  { key: 'da_thu', label: '✅ Đã thu' },
                  { key: 'all', label: '📋 Tất cả' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setDebtFilter(f.key)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${debtFilter === f.key ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Danh sách theo thợ */}
              <div className="space-y-4">
                {filteredDebts.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                    <p className="text-gray-400 italic font-serif">Không có khoản nào.</p>
                  </div>
                )}

                {filteredDebts.map(maker => (
                  <div key={maker.makerId} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                    {/* Header thợ */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {maker.makerAvatar ? (
                          <img src={maker.makerAvatar} alt="" className="size-9 rounded-full object-cover" />
                        ) : (
                          <div className="size-9 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold text-sm">
                            {maker.makerName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-950 text-sm">{maker.makerName}</p>
                          <p className="text-[10px] text-gray-400">{maker.makerEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        {maker.totalPending > 0 && (
                          <div>
                            <p className="text-[9px] text-red-400 font-bold uppercase">Đang nợ</p>
                            <p className="font-black text-red-500">{fmt(maker.totalPending)}</p>
                          </div>
                        )}
                        {maker.totalPaid > 0 && (
                          <div>
                            <p className="text-[9px] text-green-500 font-bold uppercase">Đã trả</p>
                            <p className="font-black text-green-600">{fmt(maker.totalPaid)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chi tiết từng đơn */}
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-50">
                        <tr>
                          {['Đơn gia công', 'Giá chốt', 'Phí', 'Ngày HT', 'Trạng thái', ''].map(h => (
                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {maker.debts.map(debt => (
                          <tr key={debt.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3">
                              <a href={`/custom-order/${debt.orderId}`} className="font-medium text-gray-900 hover:text-pink-500 transition-colors">
                                {debt.orderTitle}
                              </a>
                            </td>
                            <td className="px-6 py-3 text-gray-500">{fmt(debt.agreedPrice)}</td>
                            <td className="px-6 py-3">
                              <span className="font-bold text-pink-500">{fmt(debt.amount)}</span>
                              <span className="text-[10px] text-gray-400 ml-1">({debt.commissionRate}%)</span>
                            </td>
                            <td className="px-6 py-3 text-xs text-gray-400">
                              {new Date(debt.completedAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-3">
                              {debt.status === 'chua_thu' ? (
                                <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-500">Chưa thu</span>
                              ) : (
                                <div>
                                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600">Đã thu</span>
                                  {debt.paidAt && <p className="text-[9px] text-gray-400 mt-0.5">{new Date(debt.paidAt).toLocaleDateString('vi-VN')}</p>}
                                  {debt.note && <p className="text-[9px] text-gray-400 italic">{debt.note}</p>}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3 text-right">
                              {debt.status === 'chua_thu' && (
                                <button
                                  onClick={() => markDebtPaid(debt.id, maker.makerName, debt.amount)}
                                  disabled={markingId === debt.id}
                                  className="bg-gray-950 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                  {markingId === debt.id ? '...' : 'Xác nhận đã thu ✓'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAKERS */}
          {tab === 'makers' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Quản lý thợ thủ công</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Chờ duyệt', value: makers.pending.length, color: 'text-yellow-500' },
                  { label: 'Đã duyệt', value: makers.all.filter(m => m.status === 'da_duyet').length, color: 'text-green-600' },
                  { label: 'Đang khóa', value: makers.all.filter(m => m.isBanned).length, color: 'text-red-500' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-100 rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {makers.pending.length > 0 && (
                <div className="bg-white rounded-3xl border border-yellow-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-yellow-100 bg-yellow-50 flex items-center gap-2">
                    <span className="size-2 bg-yellow-400 rounded-full animate-pulse" />
                    <p className="font-bold text-yellow-700 text-sm">Hồ sơ đang chờ duyệt ({makers.pending.length})</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {makers.pending.map(m => (
                      <div key={m.id} className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50">
                        <div className="size-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {m.User?.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{m.User?.name}</p>
                          <p className="text-xs text-gray-400">{m.User?.email}</p>
                          {m.skills && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {m.skills.split(',').map(s => (
                                <span key={s} className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full">{s.trim()}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => approveMaker(m.id)} className="bg-green-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-600">Duyệt ✓</button>
                          <button onClick={() => rejectMaker(m.id)} className="border border-red-200 text-red-500 px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-50">Từ chối</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="font-semibold">Tất cả thợ ({makers.all.length})</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Thợ', 'Huy hiệu', 'Đánh giá', 'Đơn HT', 'Hoa hồng', 'Trạng thái', ''].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {makers.all.map(m => (
                      <tr key={m.id} className={`hover:bg-gray-50 ${m.isBanned ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {m.User?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{m.User?.name}</p>
                              <p className="text-xs text-gray-400">{m.User?.email}</p>
                              {m.isBanned && <p className="text-[9px] text-red-500 font-bold">🔒 Đang bị khóa</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><MakerBadge badge={m.badge} badgeEmoji={m.badgeEmoji} /></td>
                        <td className="px-6 py-4 font-bold">{m.rating > 0 ? `⭐ ${m.rating.toFixed(1)}` : '—'}</td>
                        <td className="px-6 py-4 font-bold">{m.totalDone}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => updateCommissionRate(m.id, m.User?.name)} className="text-pink-500 font-bold hover:underline">
                            {m.commissionRate}%
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold
                            ${m.status === 'da_duyet' ? 'bg-green-50 text-green-600' :
                              m.status === 'tu_choi' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                            {m.status === 'da_duyet' ? 'Đã duyệt' : m.status === 'tu_choi' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => banMaker(m.id, !m.isBanned, m.User?.name)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors
                              ${m.isBanned ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                          >
                            {m.isBanned ? 'Mở khóa' : 'Khóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Quản lý đơn hàng</h3>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Khách hàng', 'Tổng tiền', 'Ngày đặt', 'Trạng thái', ''].map((h, i) => (
                        <th key={i} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><p className="font-medium">{o.address}</p><p className="text-xs text-gray-400">{o.phone}</p></td>
                        <td className="px-6 py-4 font-semibold text-pink-500">{fmt(o.totalAmount)}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold
                            ${o.status === 'Hoàn thành' ? 'bg-green-50 text-green-600' :
                              o.status === 'Đang giao' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            className="bg-gray-100 border-none rounded-xl text-xs font-medium p-2 outline-none cursor-pointer"
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            value={o.status}
                          >
                            <option>Chờ xác nhận</option>
                            <option>Đang giao</option>
                            <option>Hoàn thành</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Quản lý người dùng</h3>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Người dùng', 'Liên hệ', 'Ngày tham gia', 'Vai trò'].map((h, i) => (
                        <th key={i} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div><p className="font-semibold">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{u.phone || '—'}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4">
                          {u.isAdmin && <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">Admin</span>}
                          {u.isMaker && <span className="px-3 py-1 rounded-lg bg-pink-50 text-pink-600 text-xs font-semibold ml-1">Thợ</span>}
                          {!u.isAdmin && !u.isMaker && <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs">Người dùng</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LOGS */}
          {tab === 'logs' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Nhật ký hoạt động</h3>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['', 'Người dùng', 'Hành động', 'Kết quả', 'Thời gian'].map((h, i) => (
                        <th key={i} className={`text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className={`size-2 rounded-full mx-auto ${log.status === 'Bị chặn' ? 'bg-red-400' : 'bg-green-400'}`} /></td>
                        <td className="px-6 py-4 font-medium">{log.userName}</td>
                        <td className="px-6 py-4"><p className="font-medium">{log.action}</p><p className="text-xs text-gray-400 italic mt-0.5">{log.details}</p></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${log.status === 'Bị chặn' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 text-right">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
