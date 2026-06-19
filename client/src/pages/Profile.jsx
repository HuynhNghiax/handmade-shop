import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  // 1. Khởi tạo state với mảng rỗng để tránh lỗi length ngay từ đầu
  const [data, setData] = useState({
    myOrders: [],
    myRequests: [],
    myBids: []
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile_info');
  const [orderFilter, setOrderFilter] = useState('Tất cả');
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('zpstatus') === '1' && params.get('type') === 'shop') {
      alert("🎉 Thanh toán đơn hàng qua ZaloPay thành công!");
      navigate('/profile', { replace: true });
    }
  }, []);

  const handlePaymentRetry = async (orderId) => {
    try {
      const res = await axios.post('http://localhost:5000/api/zalopay/create-shop-order-payment', {
        orderId
      }, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      if (res.data && res.data.order_url) {
        window.location.href = res.data.order_url;
      } else {
        alert("Không tạo được liên kết thanh toán, vui lòng thử lại!");
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

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

  const cancelOrder = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      try {
        await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {}, {
          headers: { token: `Bearer ${user.accessToken}` }
        });
        alert("Hủy đơn thành công!");
        fetchProfile();
      } catch (err) {
        alert(err.response?.data || "Lỗi khi hủy đơn!");
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
        </div>

        <div className="space-y-8">
          {tab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy'].map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${orderFilter === f ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-pink-50'}`}>{f}</button>
                ))}
              </div>

              {data.myOrders.filter(o => orderFilter === 'Tất cả' || o.status === orderFilter).length > 0 ? data.myOrders.filter(o => orderFilter === 'Tất cả' || o.status === orderFilter).map(order => (
                <div key={order.id} className="bg-gray-50 p-8 md:p-10 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
                  <div className="flex-grow w-full md:w-auto">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-600' :
                        order.status === 'Đã hủy' ? 'bg-gray-200 text-gray-500' :
                          order.status === 'Đang giao' ? 'bg-blue-100 text-blue-500' :
                            'bg-pink-100 text-pink-500'
                        }`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.paymentMethod === 'ZaloPay' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                        {order.paymentMethod || 'COD'}
                      </span>
                      {order.paymentMethod === 'ZaloPay' && (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </span>
                      )}
                      <span className="text-gray-300 text-xs">#{order.id}</span>
                      <span className="text-gray-400 text-xs italic ml-auto md:ml-0">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    {/* Tóm tắt sản phẩm */}
                    {order.products && order.products.length > 0 && (
                      <div className="mb-4 flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                        <img src={order.products[0].image || 'https://via.placeholder.com/80'} alt="thumbnail" className="size-16 object-cover rounded-2xl shadow-sm" />
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-gray-900">{order.products[0].name}</p>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">x{order.products[0].quantity}</p>
                        </div>
                        {order.products.length > 1 && (
                          <div className="text-right">
                            <p className="text-[10px] text-pink-500 font-bold bg-pink-50 px-3 py-1 rounded-full">+ {order.products.length - 1} món khác</p>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-gray-900 font-bold mb-1 text-sm">Giao đến: {order.address}</p>
                  </div>
                  <div className="text-right w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-gray-200 pt-6 md:pt-0">
                    <p className="text-2xl font-bold text-gray-950 mb-0 md:mb-4">{order.totalAmount?.toLocaleString('vi-VN')}đ</p>
                    <div className="flex gap-2">
                      {order.status === "Chờ xác nhận" && (
                        <>
                          {order.paymentMethod === 'ZaloPay' && order.paymentStatus !== 'paid' && (
                            <button onClick={() => handlePaymentRetry(order.id)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20">Thanh toán</button>
                          )}
                          <button onClick={() => cancelOrder(order.id)} className="border-2 border-red-100 text-red-500 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">Hủy đơn</button>
                        </>
                      )}
                      {order.status === "Đang giao" && (
                        <button onClick={() => confirmReceived(order.id)} className="bg-gray-950 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all shadow-xl">Đã nhận hàng</button>
                      )}
                      {order.status === "Hoàn thành" && (
                        <>
                          <button onClick={() => order.products?.length > 0 && navigate(`/product/${order.products[0].id}`)} className="border-2 border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Đánh giá</button>
                          <button onClick={() => order.products?.length > 0 && navigate(`/product/${order.products[0].id}`)} className="bg-pink-500 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/30">Mua lại</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )) : <p className="text-center py-20 font-serif italic text-gray-400">Không tìm thấy đơn hàng nào ở trạng thái này.</p>}
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