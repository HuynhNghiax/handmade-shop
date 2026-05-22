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
  const [tab, setTab] = useState('profile_info');
  const { user, login, logout } = useContext(AuthContext);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState('');

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

  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateInfoSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage('');
    try {
      const payload = {
        name: updateForm.name,
        avatar: updateForm.avatar,
        phone: updateForm.phone,
        address: updateForm.address
      };
      const res = await axios.put('http://localhost:5000/api/users/my-profile', payload, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      login({ ...user, ...res.data.user });
      setUpdateMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setIsEditingInfo(false);
    } catch (err) {
      setUpdateMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra!' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPassMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      setPassLoading(false);
      return;
    }

    try {
      const payload = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      };
      const res = await axios.put('http://localhost:5000/api/users/my-profile', payload, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      setPassMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại...' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => {
        logout();
      }, 5000);
    } catch (err) {
      setPassMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra!' });
      setPassLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">Đang nạp hồ sơ...</div>;

  return (
    <div className="min-h-screen bg-white font-sans py-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex flex-col items-center mb-20">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="size-28 rounded-full object-cover border-4 border-white shadow-2xl mb-6"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=fbcfe8&color=ec4899&size=128`;
              }}
            />
          ) : (
            <div className="size-28 bg-pink-50 rounded-full flex items-center justify-center text-4xl text-pink-500 font-serif border-4 border-white shadow-2xl mb-6 uppercase">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
          <h1 className="text-4xl font-serif italic tracking-tighter text-gray-950">{user?.name}</h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mt-2 font-black">{user?.email}</p>
        </div>

        {/* NÚT CHUYỂN TAB - ĐÃ THÊM ?. ĐỂ CHỐNG LỖI LENGTH */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button
            onClick={() => setTab('profile_info')}
            className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'profile_info' ? 'bg-gray-950 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}
          >
            👤 Hồ sơ
          </button>
          <button
            onClick={() => setTab('security')}
            className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'security' ? 'bg-gray-950 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}
          >
            🔒 Bảo mật
          </button>
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
                    <p className="text-2xl font-bold text-gray-950 mb-4">{order.totalAmount?.toLocaleString()}đ</p>
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

          {tab === 'profile_info' && (
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gray-950 text-white text-[8px] font-black px-6 py-2 uppercase tracking-widest rounded-bl-3xl">Hồ sơ</div>
              <h2 className="text-2xl font-serif italic text-gray-950 mb-8">Thông tin cá nhân</h2>

              {updateMessage && (
                <div className={`p-4 mb-6 text-sm font-bold text-center rounded-2xl ${updateMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {updateMessage.text}
                </div>
              )}

              {!isEditingInfo ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="size-20 rounded-full object-cover shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=fbcfe8&color=ec4899&size=128`;
                        }}
                      />
                    ) : (
                      <div className="size-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-2xl font-serif uppercase">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Họ và tên</p>
                      <p className="text-lg font-bold text-gray-950">{user?.name}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                      <p className="font-bold text-gray-950 text-sm">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                      <p className="font-bold text-gray-950 text-sm">{user?.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Địa chỉ</p>
                      <p className="font-bold text-gray-950 text-sm">{user?.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="w-full bg-gray-950 hover:bg-pink-500 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-full transition-all shadow-xl"
                  >
                    Chỉnh sửa thông tin
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateInfoSubmit} className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ảnh đại diện (URL)</label>
                    <input type="text" name="avatar" value={updateForm.avatar} onChange={handleUpdateChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Họ và tên</label>
                    <input type="text" name="name" value={updateForm.name} onChange={handleUpdateChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                      <input type="text" name="phone" value={updateForm.phone} onChange={handleUpdateChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="0912..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Địa chỉ</label>
                      <input type="text" name="address" value={updateForm.address} onChange={handleUpdateChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Số nhà, Tên đường..." />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setIsEditingInfo(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black uppercase tracking-widest text-[10px] py-4 rounded-full transition-all">
                      Hủy
                    </button>
                    <button type="submit" disabled={updateLoading} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-full transition-all shadow-xl shadow-pink-500/20 disabled:opacity-50">
                      {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === 'security' && (
            <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl h-fit relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-pink-500 text-white text-[8px] font-black px-6 py-2 uppercase tracking-widest rounded-bl-3xl">Bảo mật</div>
              <h2 className="text-2xl font-serif italic text-gray-950 mb-8">Đổi mật khẩu</h2>

              {passMessage && (
                <div className={`p-4 mb-6 text-sm font-bold text-center rounded-2xl ${passMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {passMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mật khẩu hiện tại</label>
                  <input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mật khẩu mới</label>
                  <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Xác nhận mật khẩu mới</label>
                  <input type="password" name="confirmNewPassword" value={passwordForm.confirmNewPassword} onChange={handlePasswordChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required placeholder="••••••••" />
                </div>
                <button type="submit" disabled={passLoading} className="w-full bg-gray-950 hover:bg-gray-800 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-full transition-all shadow-xl mt-4 disabled:opacity-50">
                  {passLoading ? 'Đang xử lý...' : 'Xác nhận đổi'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;