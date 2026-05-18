import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]       = useState(1); // 1 | 2 | 3
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // BƯỚC 1: GỬI OTP 
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/request-password-reset', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi mã OTP. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: XÁC NHẬN OTP + MẬT KHẨU MỚI
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-pink-100 p-10 md:p-14 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-2 bg-pink-400"></div>

        {/* BƯỚC 1: NHẬP EMAIL*/}
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <div className="size-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔑</div>
              <h2 className="text-4xl font-serif text-gray-950 mb-3 tracking-tighter italic">
                Quên <span className="text-pink-400">mật khẩu?</span>
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Nhập email để nhận mã xác thực đặt lại mật khẩu
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Gmail đã đăng ký
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200 transition-all"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-gray-950 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-pink-500 transition-all shadow-xl mt-4 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </form>
          </>
        )}

        {/*BƯỚC 2: NHẬP OTP + MẬT KHẨU MỚI*/}
        {step === 2 && (
          <>
            <div className="text-center mb-10">
              <div className="size-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📬</div>
              <h2 className="text-3xl font-serif text-gray-950 mb-3 tracking-tighter">
                Xác nhận <span className="text-pink-400 italic">OTP</span>
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Mã đã gửi đến <b className="text-gray-700">{email}</b>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* OTP Input */}
              <div className="flex justify-center mb-2">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  className="w-44 text-center text-3xl font-serif tracking-[0.5em] bg-pink-50 text-pink-500 rounded-2xl py-4 focus:ring-2 focus:ring-pink-200 outline-none border border-transparent"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200 transition-all"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none border border-transparent focus:border-pink-200 transition-all"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-pink-400 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-pink-500 transition-all shadow-xl mt-4 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setOtp(''); }}
                className="w-full text-[10px] font-bold uppercase text-gray-400 hover:text-pink-400 transition-colors mt-2"
              >
                ← Đổi email khác
              </button>
            </form>
          </>
        )}

        {/*BƯỚC 3: THÀNH CÔNG*/}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="size-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✅</div>
            <h2 className="text-3xl font-serif text-gray-950 mb-4 tracking-tighter italic">
              Đặt lại thành <span className="text-green-500">công!</span>
            </h2>
            <p className="text-gray-400 text-sm font-light mb-10">
              Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập lại nhé.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-950 text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:bg-pink-500 transition-all shadow-xl active:scale-95"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Footer link */}
        {step !== 3 && (
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-950 transition-colors"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
