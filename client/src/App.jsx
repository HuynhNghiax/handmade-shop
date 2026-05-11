import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomOrder from './pages/CustomOrder';
import Profile from './pages/Profile';

// Các trang Quản trị
import AdminDashboard from './pages/AdminDashboard';
import AdminProductManager from './pages/AdminProductManager';
import ProtectedRoute from './components/ProtectedRoute'; // Import bouncer ở đây

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* --- ROUTES CÔNG KHAI (AI CŨNG VÀO ĐƯỢC) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/custom-order" element={<CustomOrder />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- ROUTES BẢO MẬT (CHỈ ADMIN MỚI VÀO ĐƯỢC) --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <ProtectedRoute>
              <AdminProductManager />
            </ProtectedRoute>
          } 
        />

        {/* 404 */}
        <Route path="*" element={<div className="p-20 text-center font-serif">Lạc đường rồi sếp ơi...</div>} />
      </Routes>
    </Router>
  );
}

export default App;