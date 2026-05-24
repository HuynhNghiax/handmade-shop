import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [bidNotifCount, setBidNotifCount] = useState(0);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`${isActive(to) ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-colors relative`}
    >
      {label}
      {isActive(to) && (
        <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-pink-400 rounded-full" />
      )}
    </Link>
  );

  // Poll thông báo báo giá mới mỗi 30 giây
  useEffect(() => {
    if (!user || user.isAdmin) return;

    const fetchBidCount = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/custom-orders/my-bid-count', {
          headers: { token: `Bearer ${user.accessToken}` },
        });
        setBidNotifCount(res.data.count || 0);
      } catch {
        // Không làm gì nếu lỗi
      }
    };

    fetchBidCount();
    const interval = setInterval(fetchBidCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Reset count khi vào trang custom-order
  useEffect(() => {
    if (location.pathname === '/custom-order') {
      setBidNotifCount(0);
    }
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center text-gray-900">

        {/* LOGO */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-pink-500 tracking-tighter group flex items-center gap-1"
        >
          Pinky
          <span className="text-gray-950 group-hover:text-pink-400 transition-colors">Crafts</span>
          <span className="size-1.5 bg-pink-400 rounded-full mt-2 animate-pulse" />
        </Link>

        {/* NAV CHÍNH */}
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
          {navLink('/', 'Trang chủ')}
          {navLink('/products', 'Sản phẩm')}

          {/* Gia công có badge thông báo */}
          <Link
            to="/custom-order"
            className={`${isActive('/custom-order') ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'} transition-colors relative`}
          >
            Đặt gia công
            {isActive('/custom-order') && (
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-pink-400 rounded-full" />
            )}
            {bidNotifCount > 0 && (
              <span className="absolute -top-2.5 -right-3 bg-pink-500 text-white text-[8px] font-black size-4 flex items-center justify-center rounded-full animate-bounce">
                {bidNotifCount}
              </span>
            )}
          </Link>

          {navLink('/makers', 'Danh sách thợ')}

          {user?.isAdmin && (
            <Link
              to="/admin"
              className="bg-gray-100 text-gray-900 px-4 py-1.5 rounded-full hover:bg-gray-950 hover:text-white transition-all border border-gray-200"
            >
              Quản trị
            </Link>
          )}
        </nav>

        {/* TIỆN ÍCH */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Nút "Trở thành thợ" hoặc pill group thợ */}
          {user && !user.isAdmin && (
            user.isMaker ? (
              // Pill group cho thợ đã được duyệt
              <div className="hidden md:flex items-center border border-pink-200 rounded-full overflow-hidden bg-pink-50">
                <Link
                  to="/become-maker"
                  className="flex items-center gap-1.5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-pink-600 hover:bg-pink-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Hồ sơ thợ
                </Link>
                <span className="w-px h-5 bg-pink-200 flex-shrink-0" />
                <Link
                  to="/maker-dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-pink-600 hover:bg-pink-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  Quản lý đơn
                </Link>
              </div>
            ) : (
              // Nút đơn cho user chưa là thợ
              <Link
                to="/become-maker"
                className="hidden md:block text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500"
              >
                + Trở thành thợ
              </Link>
            )
          )}

          {/* GIỎ HÀNG */}
          <Link to="/cart" className="relative p-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6 group-hover:text-pink-500 transition-all group-hover:scale-110"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.263-12c.078-.744.704-1.293 1.45-1.293h12.295c.746 0 1.372.549 1.45 1.293Z" />
            </svg>
            <span className="absolute top-0 right-0 bg-pink-500 text-white text-[9px] font-bold size-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm group-hover:animate-bounce">
              {cartCount}
            </span>
          </Link>

          {/* USER / LOGIN */}
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] font-black uppercase tracking-tight text-gray-950 group-hover:text-pink-500 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">
                    Hồ sơ
                  </span>
                </div>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-pink-200 transition-all"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="size-9 bg-pink-100 rounded-full items-center justify-center text-xs font-bold text-pink-500 border-2 border-white shadow-sm group-hover:border-pink-200 transition-all"
                  style={{ display: user.avatar ? 'none' : 'flex' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={logout}
                className="size-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-all group"
                title="Đăng xuất"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 opacity-50 group-hover:opacity-100"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          ) : (
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
