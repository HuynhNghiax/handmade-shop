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
            <div className="space-y-12">
              <h3 className="text-5xl font-serif italic tracking-tighter">Tổng quan <span className="text-pink-400">cửa hàng</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Doanh thu sạch</p>
                  <p className="text-5xl font-serif font-bold text-pink-500">{totalRevenue.toLocaleString()}đ</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Đơn chờ xử lý</p>
                  <p className="text-5xl font-serif font-bold text-gray-900">{pendingOrders}</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Thành viên</p>
                  <p className="text-5xl font-serif font-bold text-gray-900">{data.users.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ĐƠN HÀNG */}
          {tab === 'orders' && (
            <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-gray-100">
              <h3 className="text-3xl font-serif italic mb-10">Quản lý đơn hàng</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-gray-300 border-b">
                    <th className="pb-6">Khách hàng</th>
                    <th className="pb-6">Tổng tiền</th>
                    <th className="pb-6">Trạng thái</th>
                    <th className="pb-6 text-right">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-8">
                        <p className="font-bold text-gray-900">{o.address}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">📞 {o.phone}</p>
                      </td>
                      <td className="py-8 font-serif font-bold text-pink-500 text-xl">{o.totalAmount.toLocaleString()}đ</td>
                      <td className="py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${o.status === 'Hoàn thành' ? 'bg-green-50 text-green-500' : 'bg-pink-50 text-pink-500'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-8 text-right">
                        <select 
                          className="bg-gray-100 border-none rounded-xl text-[10px] font-black uppercase p-3 outline-none"
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
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
          )}

          {/* TAB 3: NGƯỜI DÙNG */}
          {tab === 'users' && (
            <div className="space-y-10">
              <h3 className="text-3xl font-serif italic">Thành viên shop</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.users.map(u => (
                  <div key={u.id} className="bg-white p-8 rounded-[2.5rem] flex items-center justify-between border border-gray-100 hover:border-pink-200 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="size-14 bg-pink-50 rounded-full flex items-center justify-center font-serif text-xl text-pink-500">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-950">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    {u.isAdmin && <span className="bg-gray-950 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Boss</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NHẬT KÝ */}
          {tab === 'logs' && (
            <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-gray-100">
              <h3 className="text-3xl font-serif italic mb-10 text-gray-950">Nhật ký thám tử 🕵️</h3>
              <div className="space-y-4">
                {data.logs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                    <div className="flex gap-6 items-center">
                      <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${log.status === 'Bị chặn' ? 'bg-red-400' : 'bg-green-400'}`}>
                        {log.status === 'Bị chặn' ? '!' : '✓'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{log.userName} <span className="text-gray-400 font-normal">đã</span> {log.action}</p>
                        <p className="text-[10px] text-gray-400 italic">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] font-black text-gray-400 uppercase">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;