import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ cartCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center">
        
        <Link to="/" className="text-3xl font-extrabold text-pink-500 tracking-tighter">
          Pinky<span className="text-gray-900">Crafts</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm font-bold text-gray-700 uppercase tracking-widest">
          <Link to="/" className="hover:text-pink-500 transition-colors">Trang chủ</Link>
          <Link to="/products" className="hover:text-pink-500 transition-colors">Sản phẩm</Link>
          <Link to="#" className="hover:text-pink-500 transition-colors text-gray-300 cursor-not-allowed">Quà tặng</Link>
        </nav>

        <div className="flex items-center gap-6">
          <button className="relative text-gray-700 hover:text-pink-500 transition p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.263-12c.078-.744.704-1.293 1.45-1.293h12.295c.746 0 1.372.549 1.45 1.293Z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold size-5 flex items-center justify-center rounded-full">
              0
            </span>
          </button>
          <button className="hidden sm:block text-xs font-black uppercase tracking-tighter bg-gray-950 text-white px-6 py-3 rounded-full hover:bg-pink-500 transition duration-300">
            Đăng nhập
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;