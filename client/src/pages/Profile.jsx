import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  // Dữ liệu giả lập người dùng
  const [user, setUser] = useState({
    name: "Nguyễn Hồng Linh",
    email: "honglinh.pinky@gmail.com",
    phone: "0901 234 567",
    address: "123 Đường Hoa Hồng, Quận 1, TP. HCM",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
  });

  const [activeTab, setActiveTab] = useState("Hồ sơ");

  return (
    <div className="min-h-screen bg-pink-50/30 py-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Tiêu đề trang */}
        <div className="mb-16">
          <h1 className="text-5xl font-serif text-gray-950 tracking-tighter">
            Góc của <span className="text-pink-400 italic">Linh</span>
          </h1>
          <p className="text-gray-500 mt-2 font-light">Quản lý thông tin cá nhân và đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* BÊN TRÁI: SIDEBAR MENU */}
          <aside className="col-span-1 space-y-2">
            {[
              { name: "Hồ sơ", icon: "👤" },
              { name: "Đơn hàng", icon: "📦" },
              { name: "Địa chỉ", icon: "📍" },
              { name: "Đổi mật khẩu", icon: "🔒" },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.name 
                  ? 'bg-white text-pink-500 shadow-sm shadow-pink-100' 
                  : 'text-gray-500 hover:bg-white/50 hover:text-pink-400'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
            
            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-50 transition-all mt-10">
              <span>🚪</span> Đăng xuất
            </button>
          </aside>

          {/* BÊN PHẢI: NỘI DUNG CHI TIẾT */}
          <main className="col-span-1 lg:col-span-3">
            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-pink-100/50 border border-white">
              
              {activeTab === "Hồ sơ" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Avatar Section */}
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-pink-50">
                    <div className="relative group">
                      <div className="size-32 rounded-full overflow-hidden border-4 border-pink-100 shadow-inner">
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <button className="absolute bottom-0 right-0 size-10 bg-pink-400 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-pink-500 transition">
                        📷
                      </button>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                      <p className="text-gray-400 text-sm italic">Thành viên từ tháng 4, 2026</p>
                    </div>
                  </div>

                  {/* Form hồ sơ */}
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Họ và tên</label>
                      <input 
                        type="text" 
                        defaultValue={user.name}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email</label>
                      <input 
                        type="email" 
                        defaultValue={user.email}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Số điện thoại</label>
                      <input 
                        type="text" 
                        defaultValue={user.phone}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Địa chỉ mặc định</label>
                      <input 
                        type="text" 
                        defaultValue={user.address}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 pt-6">
                      <button className="bg-gray-950 text-white font-black px-12 py-4 rounded-full text-xs uppercase tracking-widest hover:bg-pink-500 transition-all shadow-lg active:scale-95">
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "Đơn hàng" && (
                <div className="text-center py-20 animate-in fade-in duration-500">
                  <div className="text-5xl mb-6">🛍️</div>
                  <h3 className="text-xl font-bold mb-2">Bạn chưa có đơn hàng nào</h3>
                  <p className="text-gray-400 text-sm mb-8">Hãy dạo quanh cửa hàng và chọn những món đồ xinh nhé!</p>
                  <Link to="/products" className="text-pink-500 font-bold underline">Tiếp tục mua sắm</Link>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;