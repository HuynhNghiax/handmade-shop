import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { login }       = useContext(AuthContext);
  const hasProcessed    = useRef(false); 

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const errorParam = searchParams.get('error');
    const userParam  = searchParams.get('user');

    if (errorParam) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    if (!userParam) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userParam));
      login(userData);
      navigate(userData.isAdmin ? '/admin' : '/', { replace: true });
    } catch {
      // JSON parse lỗi → về login
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-pink-50/30 font-sans">
      <div className="size-16 bg-white rounded-full shadow-xl flex items-center justify-center">
        <div className="size-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-400 font-serif italic text-xl animate-pulse">
        Đang xác thực với Google...
      </p>
    </div>
  );
};

export default AuthCallback;
