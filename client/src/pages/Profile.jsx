import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  // 1. Khởi tạo state với mảng rỗng để tránh lỗi length ngay từ đầu
  const [data, setData] = useState({ 
    myOrders: [], 
    myRequests: [], 
    myBids: [] 
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const { user } = useContext(AuthContext);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/users/my-profile', {
        headers: { token: `Bearer ${user?.accessToken}` }
      });
      // Đảm bảo dữ liệu đổ vào luôn có cấu trúc đúng
      setData({
        myOrders: res.data.myOrders || [],
        myRequests: res.data.myRequests || [],
        myBids: res.data.myBids || []
      });
    } catch (err) {
      console.error("Lỗi lấy Profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user) fetchProfile(); 
  }, [user]);

  const confirmReceived = async (id) => {
    if (window.confirm("Sếp xác nhận đã nhận được hàng rồi chứ?")) {
      try {
        await axios.put(`http://localhost:5000/api/orders/${id}/confirm`, {}, {
          headers: { token: `Bearer ${user.accessToken}` }
        });
        alert("Xác nhận thành công!");
        fetchProfile();
      } catch (err) {
        alert("Lỗi xác nhận rồi sếp!");
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">Đang nạp hồ sơ...</div>;

  return (
    <div className="min-h-screen bg-white font-sans py-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col items-center mb-20">
          <div className="size-28 bg-pink-50 rounded-full flex items-center justify-center text-4xl text-pink-500 font-serif border-4 border-white shadow-2xl mb-6 uppercase">
            {user?.name?.charAt(0) || "U"}
          </div>
          <h1 className="text-4xl font-serif italic tracking-tighter text-gray-950">{user?.name}</h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mt-2 font-black">{user?.email}</p>
        </div>

        {/* NÚT CHUYỂN TAB - ĐÃ THÊM ?. ĐỂ CHỐNG LỖI LENGTH */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button 
            onClick={() => setTab('orders')}
            className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'orders' ? 'bg-gray-950 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}
          >
            🛒 Đơn mua ({data?.myOrders?.length || 0})
          </button>
          <button 
            onClick={() => setTab('requests')}
            className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'requests' ? 'bg-gray-950 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}
          >
            🧶 Gia công ({data?.myRequests?.length || 0})
          </button>
          <button 
            onClick={() => setTab('bids')}
            className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'bids' ? 'bg-gray-950 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}
          >
            🙋 Đã báo giá ({data?.myBids?.length || 0})
          </button>
        </div>

        <div className="space-y-8">
          {tab === 'orders' && (
            <div className="space-y-6">
              {data.myOrders.length > 0 ? data.myOrders.map(order => (
                <div key={order.id} className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-500'}`}>
                         {order.status}
                       </span>
                       <span className="text-gray-300 text-xs">#{order.id}</span>
                    </div>
                    <p className="text-gray-900 font-bold mb-1">Giao đến: {order.address}</p>
                    <p className="text-gray-400 text-xs italic">Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-serif font-bold text-gray-950 tracking-tighter mb-4">{order.totalAmount?.toLocaleString()}đ</p>
                    {order.status === "Đang giao" && (
                      <button onClick={() => confirmReceived(order.id)} className="bg-gray-950 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all">Đã nhận hàng</button>
                    )}
                  </div>
                </div>
              )) : <p className="text-center py-20 font-serif italic text-gray-400">Chưa có đơn hàng nào sếp ơi.</p>}
            </div>
          )}

          {tab === 'requests' && (
            <div className="space-y-10">
              {data.myRequests.map(req => (
                <div key={req.id} className="bg-white p-10 rounded-[3rem] border border-pink-50 shadow-sm">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-serif italic text-pink-500">{req.title}</h3>
                      <p className="text-gray-400 text-[10px] font-black uppercase mt-2">Ngân sách: {req.budget?.toLocaleString()}đ</p>
                    </div>
                    <span className="bg-gray-950 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase">{req.status}</span>
                  </div>
                  <div className="space-y-4">
                    {req.Bids?.map(bid => (
                      <div key={bid.id} className="bg-gray-50 p-6 rounded-3xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">{bid.User?.name}</p>
                          <p className="text-sm text-gray-500 italic mt-1">"{bid.message}"</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-serif font-bold text-pink-500">{bid.price?.toLocaleString()}đ</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase mt-1">📞 {bid.contactInfo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'bids' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.myBids.map(bid => (
                <div key={bid.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-pink-400 text-white text-[8px] font-black px-4 py-1.5 uppercase tracking-widest">Báo giá</div>
                  <h3 className="font-bold text-gray-950 mb-2">{bid.CustomOrder?.title}</h3>
                  <p className="text-xl font-serif font-bold text-pink-500 mb-4">{bid.price?.toLocaleString()}đ</p>
                  <p className="text-[9px] font-black uppercase text-gray-400">Trạng thái yêu cầu: {bid.CustomOrder?.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;