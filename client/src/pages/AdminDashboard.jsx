import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState('analytics');
  const [data, setData] = useState({ orders: [], users: [], logs: [] });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    const headers = { headers: { token: `Bearer ${user?.accessToken}` } };
    try {
      const [orderRes, userRes, logRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders', headers),
        axios.get('http://localhost:5000/api/users', headers),
        axios.get('http://localhost:5000/api/logs', headers)
      ]);

      setData({
        orders: orderRes.data || [],
        users: userRes.data || [],
        logs: logRes.data || []
      });
    } catch (err) {
      console.error("❌ Lỗi nạp dữ liệu Admin:", err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) fetchDashboardData();
    else navigate('/login');
  }, [user]);

  // TÍNH TOÁN CÁC BIẾN THỐNG KÊ (Đảm bảo không bị ReferenceError)
  const totalRevenue = data.orders.reduce((sum, o) => sum + (o.status === "Hoàn thành" ? o.totalAmount : 0), 0);
  const pendingOrders = data.orders.filter(o => o.status === "Chờ xác nhận").length;

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status: newStatus }, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      fetchDashboardData();
    } catch (err) {
      alert("Lỗi cập nhật!");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">Đang nạp dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-950 text-white p-8 flex flex-col fixed h-full shadow-2xl z-50">
        <div className="mb-12 px-4">
          <h2 className="text-2xl font-serif italic text-pink-400 tracking-tighter">Pinky Admin</h2>
          <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black mt-2">Dashboard Center</p>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {['analytics', 'orders', 'users', 'logs'].map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
            >
              {t === 'analytics' && '📊 Báo cáo'}
              {t === 'orders' && '📦 Đơn hàng'}
              {t === 'users' && '👥 Người dùng'}
              {t === 'logs' && '🕵️ Nhật ký'}
            </button>
          ))}
          <div className="my-6 border-t border-white/5"></div>
          <button onClick={() => navigate('/admin/products')} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-pink-300 border border-pink-500/20">
            🧶 Kho sản phẩm →
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-72 flex-grow p-16">
        <div className="max-w-6xl mx-auto">

          {/* TAB 1: THỐNG KÊ */}
          {tab === 'analytics' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">Tổng quan cửa hàng</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Doanh thu hoàn thành', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, color: 'text-pink-500' },
                  { label: 'Đơn chờ xử lý', value: pendingOrders, color: 'text-gray-900' },
                  { label: 'Thành viên', value: data.users.length, color: 'text-gray-900' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-100 rounded-2xl p-6">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Đơn hàng gần đây */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">Đơn hàng gần đây</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Khách hàng</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tổng tiền</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{o.address}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{o.phone}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-pink-500">
                          {o.totalAmount.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold
                  ${o.status === 'Hoàn thành' ? 'bg-green-50 text-green-600' :
                              o.status === 'Đang giao' ? 'bg-blue-50 text-blue-600' :
                                'bg-yellow-50 text-yellow-600'}`}>
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

          {/* TAB 2: ĐƠN HÀNG */}
          {tab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h3>
                <div className="flex gap-3">
                  <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
                    <option>Tất cả trạng thái</option>
                    <option>Chờ xác nhận</option>
                    <option>Đang giao</option>
                    <option>Hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tổng đơn', value: data.orders.length },
                  { label: 'Đang xử lý', value: data.orders.filter(o => o.status !== 'Hoàn thành').length },
                  { label: 'Hoàn thành', value: data.orders.filter(o => o.status === 'Hoàn thành').length },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-100 rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[35%]">Khách hàng</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[20%]">Tổng tiền</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[18%]">Ngày đặt</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[15%]">Trạng thái</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[12%]">Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{o.address}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{o.phone}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-pink-500">
                          {o.totalAmount.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold
                  ${o.status === 'Hoàn thành' ? 'bg-green-50 text-green-600' :
                              o.status === 'Đang giao' ? 'bg-blue-50 text-blue-600' :
                                'bg-yellow-50 text-yellow-600'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            className="bg-gray-100 border-none rounded-xl text-xs font-medium p-2 outline-none cursor-pointer"
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            value={o.status}
                          >
                            <option value="Chờ xác nhận">Chờ xác nhận</option>
                            <option value="Đang giao">Đang giao</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NGƯỜI DÙNG */}
          {tab === 'users' && (
            <div className="space-y-6">
              {/* Header + tìm kiếm */}
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email..."
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-pink-300 w-52"
                  />
                  <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
                    <option>Tất cả</option>
                    <option>Admin</option>
                    <option>Người dùng</option>
                  </select>
                </div>
              </div>

              {/* Thống kê nhanh */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tổng thành viên', value: data.users.length },
                  { label: 'Quản trị viên', value: data.users.filter(u => u.isAdmin).length },
                  { label: 'Người dùng thường', value: data.users.filter(u => !u.isAdmin).length },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-100 rounded-2xl p-5">
                    <p className="text-xs text-gray-400 font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Bảng người dùng */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[30%]">Người dùng</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[25%]">Liên hệ</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[18%]">Ngày tham gia</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[14%]">Vai trò</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[13%]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        {/* Người dùng */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="size-9 rounded-full object-cover flex-shrink-0 border border-gray-100"
                                  onError={e => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="size-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                              <p className="text-xs text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Liên hệ */}
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {u.phone || '—'}
                        </td>

                        {/* Ngày tham gia */}
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </td>

                        {/* Vai trò */}
                        <td className="px-6 py-4">
                          {u.isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium">
                              Người dùng
                            </span>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            {!u.isAdmin && (
                              <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all text-xs">
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: NHẬT KÝ */}
          {tab === 'logs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Nhật ký hoạt động</h3>
                <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
                  <option>Tất cả</option>
                  <option>Thành công</option>
                  <option>Bị chặn</option>
                </select>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[5%]"></th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[25%]">Người dùng</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[30%]">Hành động</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[20%]">Kết quả</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-[20%]">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className={`size-2 rounded-full mx-auto
                  ${log.status === 'Bị chặn' ? 'bg-red-400' : 'bg-green-400'}`}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{log.userName}</td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium">{log.action}</p>
                          <p className="text-xs text-gray-400 mt-0.5 italic">{log.details}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold
                  ${log.status === 'Bị chặn' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 text-right">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
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