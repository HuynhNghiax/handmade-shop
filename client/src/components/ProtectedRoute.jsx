import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const reportIntrusion = async () => {
      if (user && !user.isAdmin) {
        // Ghi log kẻ gian cố tình vào Admin
        await axios.post('http://localhost:5000/api/logs/add', {
          userId: user.id,
          userName: user.name,
          action: "Cố gắng truy cập trái phép",
          details: "Người dùng này đã cố mò vào trang Dashboard",
          status: "Bị chặn"
        });
      }
    };
    reportIntrusion();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  
  if (!user.isAdmin) {
    alert("Sếp ơi, khu vực này nguy hiểm, đừng vào nhé!");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;