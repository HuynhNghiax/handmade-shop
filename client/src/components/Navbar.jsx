import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);

  // Hàm kiểm tra xem trang nào đang active để tô màu hồng
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center text-gray-900">
        
        {/* --- LOGO --- */}
        <Link to="/" className="text-3xl font-extrabold text-pink-500 tracking-tighter group flex items-center gap-1">
          Pinky<span className="text-gray-950 group-hover:text-pink-400 transition-colors">Crafts</span>
          <span className="size-1.5 bg-pink-400 rounded-full mt-2 animate-pulse"></span>
        </Link>

        {/* --- MENU ĐIỀU HƯỚNG CHÍNH --- */}
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
          <Link 
            to="/" 
            className={`${isActive('/') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-colors relative group`}
          >
            Trang chủ
            {isActive('/') && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-pink-400 rounded-full"></span>}
          </Link>
          
          <Link 
            to="/products" 
            className={`${isActive('/products') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-colors relative group`}
          >
            Sản phẩm
            {isActive('/products') && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-pink-400 rounded-full"></span>}
          </Link>
          
          <Link 
            to="/custom-order" 
            className={`${isActive('/custom-order') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-colors relative group`}
          >
            Đặt gia công
            {isActive('/custom-order') && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-pink-400 rounded-full"></span>}
          </Link>
          
          {/* Nút Admin - Chỉ hiện khi user là sếp */}
          {user?.isAdmin && (
            <Link 
              to="/admin" 
              className="bg-gray-100 text-gray-900 px-4 py-1.5 rounded-full hover:bg-gray-950 hover:text-white transition-all border border-gray-200"
            >
              Quản trị
            </Link>
          )}
        </nav>

        {/* --- CỤM TIỆN ÍCH (Giỏ hàng & User) --- */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* ICON GIỎ HÀNG */}
          <Link to="/cart" className="relative p-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 group-hover:text-pink-500 transition-all group-hover:scale-110">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.263-12c.078-.744.704-1.293 1.45-1.293h12.295c.746 0 1.372.549 1.45 1.293Z" />
            </svg>
            <span className="absolute top-0 right-0 bg-pink-500 text-white text-[9px] font-bold size-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm group-hover:animate-bounce">
              {cartCount}
            </span>
          </Link>

          {/* PHẦN NGƯỜI DÙNG */}
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
              {/* Link vào trang Profile */}
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] font-black uppercase tracking-tight text-gray-950 group-hover:text-pink-500 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Hồ sơ</span>
                </div>
                {/* Avatar tròn với chữ cái đầu */}
                <div className="size-9 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-500 border-2 border-white shadow-sm group-hover:border-pink-200 transition-all">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>

              {/* Nút Đăng xuất */}
              <button 
                onClick={logout} 
                className="size-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-all group"
                title="Đăng xuất"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 opacity-50 group-hover:opacity-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          ) : (
            /* Nút Đăng nhập khi chưa có user */
            <Link 
              to="/login" 
              className="bg-gray-950 text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-pink-100 active:scale-95"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;