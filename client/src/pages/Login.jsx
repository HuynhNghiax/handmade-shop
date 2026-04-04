import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen bg-pink-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Trang trí nền */}
      <div className="absolute top-0 right-0 size-96 bg-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 size-96 bg-pink-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-pink-100 p-10 md:p-14 relative z-10 border border-white">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-gray-950 mb-3 tracking-tighter">Chào mừng <span className="text-pink-400 italic">trở lại</span></h2>
          <p className="text-gray-400 text-sm font-light">Đăng nhập để tiếp tục khám phá những món đồ ngọt ngào</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Email của bạn</label>
            <input 
              type="email" 
              placeholder="example@gmail.com"
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
            />
          </div>

          <div className="text-right">
            <Link to="#" className="text-xs font-bold text-pink-400 hover:text-pink-500 transition">Quên mật khẩu?</Link>
          </div>

          <button className="w-full bg-pink-400 hover:bg-pink-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-pink-100 transition-all transform active:scale-95 uppercase tracking-widest text-xs mt-4">
            Đăng nhập ngay
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-pink-500 font-bold hover:underline">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;