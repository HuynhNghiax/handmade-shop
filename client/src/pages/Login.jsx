import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // 1. Lưu thông tin vào AuthContext (để Navbar cập nhật)
      login(res.data);

      // 2. LOGIC ĐIỀU HƯỚNG QUAN TRỌNG:
      // Nếu là Admin thì bay thẳng vào trang Quản trị, ngược lại thì về Trang chủ
      if (res.data.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng sếp ơi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-pink-100 p-10 md:p-14 relative overflow-hidden">
        
        {/* Decor trang trí nhẹ nhàng */}
        <div className="absolute top-0 left-0 w-full h-2 bg-pink-400"></div>
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-gray-950 mb-3 tracking-tighter italic">Mừng sếp <span className="text-pink-400">trở lại</span></h2>
          <p className="text-gray-400 text-sm font-light uppercase tracking-widest">Đăng nhập để tiếp tục</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Gmail của sếp</label>
            <input 
              type="email" 
              placeholder="admin@pinky.com" 
              className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200 transition-all shadow-inner"
              required 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200 transition-all shadow-inner"
              required 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-gray-950 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-pink-100 mt-4 active:scale-95"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-xs text-gray-400">
            Chưa có tài khoản? <Link to="/register" className="text-pink-500 font-bold hover:underline">Đăng ký tại đây</Link>
          </p>
          <Link to="/" className="block text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-950 transition-colors">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;