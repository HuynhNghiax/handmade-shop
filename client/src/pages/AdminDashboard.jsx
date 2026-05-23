import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

//  TABS config 
const TABS = [
  { id: 'analytics', icon: '📊', label: 'Báo cáo' },
  { id: 'orders', icon: '📦', label: 'Đơn hàng' },
  { id: 'makers', icon: '🧶', label: 'Thợ' },
  { id: 'users', icon: '👥', label: 'Người dùng' },
  { id: 'logs', icon: '🕵️', label: 'Nhật ký' },
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState('analytics');
  const [data, setData] = useState({ orders: [], users: [], logs: [] });
  const [makers, setMakers] = useState({ pending: [], all: [] });
  const [loading, setLoading] = useState(true);

  const headers = () => ({ headers: { token: `Bearer ${user?.accessToken}` } });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [orderRes, userRes, logRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders', headers()),
        axios.get('http://localhost:5000/api/users', headers()),
        axios.get('http://localhost:5000/api/logs', headers()),
      ]);
      setData({
        orders: orderRes.data || [],
        users: userRes.data || [],
        logs: logRes.data || [],
      });
    } catch (err) {
      console.error('❌ Lỗi nạp dữ liệu Admin:', err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const fetchMakers = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        axios.get('http://localhost:5000/api/makers/admin/pending', headers()),
        axios.get('http://localhost:5000/api/makers/admin/all', headers()),
      ]);
      setMakers({ pending: pendingRes.data || [], all: allRes.data || [] });
    } catch (err) {
      console.error('Lỗi lấy maker:', err);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) { fetchDashboardData(); fetchMakers(); }
    else navigate('/login');
  }, [user]);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status: newStatus }, headers());
      fetchDashboardData();
    } catch { alert('Lỗi cập nhật!'); }
  };

  const approveMaker = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/makers/admin/${id}/approve`, {}, headers());
      fetchMakers();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi duyệt!'); }
  };

  const rejectMaker = async (id) => {
    if (!window.confirm('Từ chối hồ sơ này?')) return;
    try {
      await axios.put(`http://localhost:5000/api/makers/admin/${id}/reject`, {}, headers());
      fetchMakers();
    } catch (err) { alert(err.response?.data?.message || 'Lỗi từ chối!'); }
  };

  const totalRevenue = data.orders.reduce((s, o) => s + (o.status === 'Hoàn thành' ? o.totalAmount : 0), 0);
  const pendingOrders = data.orders.filter(o => o.status === 'Chờ xác nhận').length;

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">
      Đang nạp dữ liệu...
    </div>
  );

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

          {/*  TAB: ANALYTICS  */}
          {tab === 'analytics' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Tổng quan cửa hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Doanh thu hoàn thành', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, color: 'text-pink-500' },
                  { label: 'Đơn chờ xử lý', value: pendingOrders, color: 'text-gray-900' },
                  { label: 'Thành viên', value: data.users.length, color: 'text-gray-900' },
                  { label: 'Thợ chờ duyệt', value: makers.pending.length, color: 'text-yellow-500' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-100 rounded-2xl p-6">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Đơn gần đây */}
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
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><p className="font-medium">{o.address}</p><p className="text-xs text-gray-400">{o.phone}</p></td>
                        <td className="px-6 py-4 font-semibold text-pink-500">{o.totalAmount.toLocaleString('vi-VN')}đ</td>
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

          {/*  TAB: ORDERS  */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Quản lý đơn hàng</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tổng đơn', value: data.orders.length },
                  { label: 'Đang xử lý', value: data.orders.filter(o => o.status !== 'Hoàn thành').length },
                  { label: 'Hoàn thành', value: data.orders.filter(o => o.status === 'Hoàn thành').length },
                ].map(s => (
                  <div key={s.label} className="bg-gray-100 rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                    <p className="text-3xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
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
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><p className="font-medium">{o.address}</p><p className="text-xs text-gray-400">{o.phone}</p></td>
                        <td className="px-6 py-4 font-semibold text-pink-500">{o.totalAmount.toLocaleString('vi-VN')}đ</td>
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

          {/*  TAB: MAKERS  */}
          {tab === 'makers' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Quản lý thợ thủ công</h3>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Chờ duyệt', value: makers.pending.length, color: 'text-yellow-500' },
                  { label: 'Đã duyệt', value: makers.all.filter(m => m.status === 'da_duyet').length, color: 'text-green-600' },
                  { label: 'Bị từ chối', value: makers.all.filter(m => m.status === 'tu_choi').length, color: 'text-red-500' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-100 rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Pending */}
              {makers.pending.length > 0 && (
                <div className="bg-white rounded-3xl border border-yellow-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-yellow-100 bg-yellow-50 flex items-center gap-2">
                    <span className="size-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <p className="font-bold text-yellow-700 text-sm">Hồ sơ đang chờ duyệt ({makers.pending.length})</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {makers.pending.map(m => (
                      <div key={m.id} className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                        {m.User?.avatar ? (
                          <img src={m.User.avatar} alt="" className="size-12 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="size-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {m.User?.name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-gray-950">{m.User?.name}</p>
                          <p className="text-xs text-gray-400">{m.User?.email}</p>
                          {m.skills && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {m.skills.split(',').map(s => (
                                <span key={s} className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full">{s.trim()}</span>
                              ))}
                            </div>
                          )}
                          {m.bio && <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">"{m.bio}"</p>}
                          {m.portfolio?.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {m.portfolio.slice(0, 3).map((url, i) => (
                                <img key={i} src={url} alt="" className="size-12 rounded-xl object-cover border border-gray-100"
                                  onError={e => { e.target.style.display = 'none'; }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => approveMaker(m.id)}
                            className="bg-green-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                          >
                            Duyệt ✓
                          </button>
                          <button
                            onClick={() => rejectMaker(m.id)}
                            className="border border-red-200 text-red-500 px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All makers */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">Tất cả thợ ({makers.all.length})</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Thợ', 'Kỹ năng', 'Đánh giá', 'Đơn HT', 'Trạng thái'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {makers.all.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {m.User?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{m.User?.name}</p>
                              <p className="text-xs text-gray-400">{m.User?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{m.skills || '—'}</td>
                        <td className="px-6 py-4 font-bold">{m.rating > 0 ? `⭐ ${m.rating.toFixed(1)}` : '—'}</td>
                        <td className="px-6 py-4 font-bold">{m.totalDone}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold
                            ${m.status === 'da_duyet' ? 'bg-green-50 text-green-600' :
                              m.status === 'tu_choi' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                            {m.status === 'da_duyet' ? 'Đã duyệt' : m.status === 'tu_choi' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/*  TAB: USERS  */}
          {tab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Quản lý người dùng</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tổng thành viên', value: data.users.length },
                  { label: 'Quản trị viên', value: data.users.filter(u => u.isAdmin).length },
                  { label: 'Người dùng thường', value: data.users.filter(u => !u.isAdmin).length },
                ].map(s => (
                  <div key={s.label} className="bg-gray-100 rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                    <p className="text-3xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Người dùng', 'Liên hệ', 'Ngày tham gia', 'Vai trò', ''].map((h, i) => (
                        <th key={i} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
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
                          <div className="flex gap-1.5 flex-wrap">
                            {u.isAdmin && <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">Admin</span>}
                            {u.isMaker && <span className="px-3 py-1 rounded-lg bg-pink-50 text-pink-600 text-xs font-semibold">Thợ</span>}
                            {!u.isAdmin && !u.isMaker && <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs">Người dùng</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!u.isAdmin && (
                            <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all text-xs">Xóa</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/*  TAB: LOGS  */}
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
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className={`size-2 rounded-full mx-auto ${log.status === 'Bị chặn' ? 'bg-red-400' : 'bg-green-400'}`} />
                        </td>
                        <td className="px-6 py-4 font-medium">{log.userName}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-xs text-gray-400 italic mt-0.5">{log.details}</p>
                        </td>
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
