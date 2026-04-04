import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen bg-pink-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Trang trí nền tương tự */}
      <div className="absolute top-0 left-0 size-96 bg-pink-200/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4"></div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-pink-100 p-10 md:p-14 relative z-10 border border-white">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-gray-950 mb-3 tracking-tighter">Tham gia <span className="text-pink-400 italic">với Pinky</span></h2>
          <p className="text-gray-400 text-sm font-light">Cùng tạo nên những kỉ niệm đáng nhớ cùng đồ handmade</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Họ và tên</label>
            <input 
              type="text" 
              placeholder="Nguyễn Văn A"
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Email</label>
            <input 
              type="email" 
              placeholder="example@gmail.com"
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-4">Mật khẩu mới</label>
            <input 
              type="password" 
              placeholder="Tối thiểu 8 ký tự"
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3 px-2">
            <input type="checkbox" className="size-4 accent-pink-400 rounded" id="terms" />
            <label htmlFor="terms" className="text-[10px] text-gray-400 font-medium">Tôi đồng ý với các điều khoản dịch vụ</label>
          </div>

          <button className="w-full bg-pink-400 hover:bg-pink-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-pink-100 transition-all transform active:scale-95 uppercase tracking-widest text-xs mt-4">
            Tạo tài khoản
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Đã là thành viên?{' '}
            <Link to="/login" className="text-pink-500 font-bold hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;