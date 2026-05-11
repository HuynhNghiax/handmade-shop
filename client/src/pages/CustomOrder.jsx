import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CustomOrder = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', budget: '', image: '' });
  const [bidData, setBidData] = useState({ price: '', message: '', contactInfo: '' });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/custom-orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!user) return alert("Đăng nhập để đăng yêu cầu sếp ơi!");
    try {
      await axios.post('http://localhost:5000/api/custom-orders', newRequest, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      alert("Đã đăng yêu cầu thành công!");
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      alert("Lỗi khi đăng yêu cầu!");
    }
  };

  const handleSendBid = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/custom-orders/${selectedOrderId}/bid`, bidData, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      alert("Đã gửi báo giá! Chờ khách hàng liên hệ nhé.");
      setSelectedOrderId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi báo giá!");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-20 border-b pb-10 border-pink-50">
          <div>
            <h1 className="text-5xl font-serif italic tracking-tighter">Đặt gia công <span className="text-pink-400">theo ý thích</span></h1>
            <p className="text-gray-400 mt-2 font-light">Nơi kết nối những ý tưởng độc đáo và những bàn tay khéo léo</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-gray-950 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-400 transition-all shadow-xl shadow-gray-200"
          >
            + Đăng yêu cầu mới
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {orders.map(order => (
            <div key={order.id} className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden">
              <span className="text-[9px] font-black uppercase text-pink-400 tracking-[0.2em] mb-4 block">
                {order.status}
              </span>
              <h3 className="text-2xl font-serif italic mb-4 text-gray-900">{order.title}</h3>
              <p className="text-gray-500 font-light mb-8 line-clamp-3 leading-relaxed">{order.description}</p>
              
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Ngân sách</span>
                   <span className="font-serif text-xl text-pink-500 font-bold">{order.budget?.toLocaleString()}đ</span>
                </div>

                {/* LOGIC CHẶN NÚT BÁO GIÁ Ở ĐÂY */}
                {user && order.userId === user.id ? (
                  <span className="bg-pink-100 text-pink-500 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-inner">
                    Yêu cầu của bạn
                  </span>
                ) : (
                  <button 
                    onClick={() => setSelectedOrderId(order.id)}
                    className="bg-white px-8 py-3 rounded-full border border-gray-200 text-[10px] font-black uppercase hover:bg-gray-950 hover:text-white transition-all shadow-sm"
                  >
                    Gửi báo giá
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MODAL ĐĂNG YÊU CẦU */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <form onSubmit={handlePostRequest} className="bg-white w-full max-w-xl rounded-[4rem] p-14 space-y-4 shadow-2xl">
              <h3 className="text-3xl font-serif italic mb-6">Bạn muốn làm món đồ gì?</h3>
              <input type="text" placeholder="Tên sản phẩm (VD: Túi len hình mèo)" className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200" onChange={e => setNewRequest({...newRequest, title: e.target.value})} required />
              <textarea placeholder="Mô tả chi tiết yêu cầu của bạn..." className="w-full bg-gray-50 p-5 rounded-3xl outline-none border border-transparent focus:border-pink-200" rows="4" onChange={e => setNewRequest({...newRequest, description: e.target.value})} required></textarea>
              <input type="number" placeholder="Ngân sách dự kiến (VNĐ)" className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200" onChange={e => setNewRequest({...newRequest, budget: e.target.value})} required />
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-pink-400 text-white py-5 rounded-full font-bold shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all">Đăng yêu cầu</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 py-5 rounded-full font-bold hover:bg-gray-200 transition-all">Hủy</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL GỬI BÁO GIÁ */}
        {selectedOrderId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <form onSubmit={handleSendBid} className="bg-white w-full max-w-lg rounded-[3rem] p-12 space-y-4 shadow-2xl">
              <h3 className="text-2xl font-serif italic mb-6 text-pink-400">Báo giá của bạn</h3>
              <input type="number" placeholder="Giá bạn đưa ra (VNĐ)" className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200" onChange={e => setBidData({...bidData, price: e.target.value})} required />
              <textarea placeholder="Lời nhắn gửi đến khách hàng (Thời gian làm, chất liệu...)" className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200" rows="3" onChange={e => setBidData({...bidData, message: e.target.value})} required></textarea>
              <input type="text" placeholder="Số điện thoại hoặc Zalo liên hệ" className="w-full bg-gray-50 p-5 rounded-2xl outline-none border border-transparent focus:border-pink-200" onChange={e => setBidData({...bidData, contactInfo: e.target.value})} required />
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-gray-950 text-white py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-pink-100">Gửi báo giá</button>
                <button type="button" onClick={() => setSelectedOrderId(null)} className="flex-1 bg-gray-100 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest">Đóng</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrder;