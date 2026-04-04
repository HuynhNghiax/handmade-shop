import React from 'react';
import { Link } from 'react-router-dom';
import { allProducts } from '../data';

const AdminDashboard = () => {
  // Giả lập số liệu
  const stats = [
    { label: "Tổng doanh thu", value: "25.800.000đ", icon: "💰", color: "bg-green-50 text-green-600" },
    { label: "Đơn hàng mới", value: "12", icon: "🛍️", color: "bg-blue-50 text-blue-600" },
    { label: "Sản phẩm", value: allProducts.length, icon: "📦", color: "bg-pink-50 text-pink-600" },
    { label: "Yêu cầu gia công", value: "5", icon: "✨", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-gray-50">
          <Link to="/" className="text-2xl font-extrabold text-pink-500 tracking-tighter">
            Pinky<span className="text-gray-900">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-grow p-6 space-y-2">
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-pink-50 text-pink-600 font-bold text-sm transition-all">
            📊 Tổng quan
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            📦 Sản phẩm
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            📝 Đơn hàng
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            🎨 Yêu cầu gia công
          </button>
        </nav>

        <div className="p-6 border-t border-gray-50">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:text-pink-500 flex items-center gap-2 transition-colors">
            ← Quay lại cửa hàng
          </Link>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-grow p-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif text-gray-950 tracking-tighter">Bảng điều khiển</h1>
            <p className="text-gray-400 mt-2 font-light tracking-tight text-sm uppercase">Chào mừng trở lại, Quản trị viên</p>
          </div>
          <button className="bg-pink-400 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-tight shadow-lg shadow-pink-100">
            + Thêm sản phẩm mới
          </button>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`size-12 rounded-2xl ${stat.color} flex items-center justify-center text-xl mb-6 shadow-inner`}>
                {stat.icon}
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-tight mb-1">{stat.label}</p>
              <h4 className="text-2xl font-serif font-bold text-gray-950">{stat.value}</h4>
            </div>
          ))}
        </div>

        {/* BẢNG SẢN PHẨM GẦN ĐÂY */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight">Sản phẩm hiện có</h3>
            <button className="text-pink-400 font-bold text-xs underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-tight text-gray-400">Hình ảnh</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-tight text-gray-400">Tên sản phẩm</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-tight text-gray-400">Danh mục</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-tight text-gray-400">Giá bán</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-tight text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allProducts.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="px-8 py-4">
                      <img src={p.img} alt={p.name} className="size-12 rounded-xl object-cover border border-gray-100" />
                    </td>
                    <td className="px-8 py-4 font-bold text-sm tracking-tight text-gray-800">{p.name}</td>
                    <td className="px-8 py-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-serif italic text-pink-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="size-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center">✎</button>
                        <button className="size-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;