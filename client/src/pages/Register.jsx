import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Nhập OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Gửi OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post('http://localhost:5000/api/auth/request-otp', { email: formData.email });
      setStep(2);
      alert("Mã OTP đã gửi đến Gmail của bạn!");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  // Hoàn tất đăng ký
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "OTP không chính xác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/50 flex items-center justify-center p-6 relative font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-pink-100 p-10 md:p-14 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-gray-950 mb-3 tracking-tighter">
            {step === 1 ? "Đăng ký" : "Xác thực OTP"}
          </h2>
          <p className="text-gray-400 text-sm font-light">
            {step === 1 ? "Nhập thông tin để nhận mã xác thực" : `Mã đã gửi đến ${formData.email}`}
          </p>
        </div>

        {error && <p className="text-red-500 text-center text-xs mb-4 font-bold uppercase">{error}</p>}

        {step === 1 ? (
          <form className="space-y-5" onSubmit={handleRequestOtp}>
            <input type="text" placeholder="Họ và tên" className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Gmail của bạn" className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="password" placeholder="Mật khẩu" className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <button disabled={loading} type="submit" className="w-full bg-pink-400 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-pink-500 transition-all">
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleVerifyAndRegister}>
            <div className="flex justify-center mb-6">
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000" 
                className="w-40 text-center text-3xl font-serif tracking-[0.5em] bg-pink-50 text-pink-500 border-none rounded-2xl py-4 focus:ring-2 focus:ring-pink-200 outline-none" 
                required 
                onChange={(e) => setFormData({...formData, otp: e.target.value})} 
              />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-gray-950 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-pink-500 transition-all">
              {loading ? "Đang xác thực..." : "Xác nhận & Đăng ký"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-bold uppercase text-gray-400 hover:text-pink-400">Quay lại sửa email</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;