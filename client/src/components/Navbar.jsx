import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ cartCount = 0, isLoggedIn = true }) => {
  const location = useLocation();

  // Hàm kiểm tra trang hiện tại để hiển thị màu sắc active
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center">
        
        {/* 1. LOGO - Nhấn vào là về Home */}
        <Link to="/" className="text-3xl font-extrabold text-pink-500 tracking-tighter group flex items-center gap-1">
          Pinky<span className="text-gray-900 group-hover:text-pink-400 transition-colors duration-300">Crafts</span>
          <span className="size-1.5 bg-pink-400 rounded-full mt-2 animate-pulse"></span>
        </Link>

        {/* 2. MENU ĐIỀU HƯỚNG CHÍNH */}
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <Link 
            to="/" 
            className={`${isActive('/') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-all`}
          >
            Trang chủ
          </Link>
          <Link 
            to="/products" 
            className={`${isActive('/products') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-all`}
          >
            Sản phẩm
          </Link>
          <Link 
            to="/custom-order" 
            className={`${isActive('/custom-order') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-all`}
          >
            Đặt gia công
          </Link>
          <Link to="#" className="text-gray-300 cursor-not-allowed">
            Bộ sưu tập
          </Link>
        </nav>

        {/* 3. NHÓM HÀNH ĐỘNG (Giỏ hàng & Tài khoản) */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* Biểu tượng Giỏ hàng */}
          <Link to="/cart" className="relative text-gray-800 hover:text-pink-500 transition-all p-2 rounded-full hover:bg-pink-50 group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.263-12c.078-.744.704-1.293 1.45-1.293h12.295c.746 0 1.372.549 1.45 1.293Z" />
            </svg>
            
            {/* Badge số lượng sản phẩm */}
            {cartCount >= 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[9px] font-black size-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Kiểm tra Đăng nhập để hiện Profile hoặc Login */}
          {isLoggedIn ? (
            <Link 
              to="/profile" 
              className={`flex items-center gap-3 p-1.5 pr-5 rounded-full border transition-all group ${
                isActive('/profile') ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-100 hover:border-pink-200 hover:bg-pink-50'
              }`}
            >
              <div className="size-8 rounded-full bg-pink-400 flex items-center justify-center text-white font-bold border border-white shadow-sm group-hover:rotate-12 transition-transform">
                L
              </div>
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-pink-500">
                Hồ sơ
              </span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] bg-gray-950 text-white px-8 py-3.5 rounded-full hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 transform active:scale-95"
            >
              Đăng nhập
            </Link>
          )}

          {/* Nút Hamburger cho Mobile */}
          <button className="md:hidden text-gray-900 hover:text-pink-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;