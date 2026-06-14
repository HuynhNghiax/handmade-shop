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
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import CustomOrder from './pages/CustomOrder';
import CustomOrderDetail from './pages/CustomOrderDetail';
import Profile from './pages/Profile';
import BecomeMaker from './pages/BecomeMaker';
import MakerList from './pages/MakerList';
import MakerProfile from './pages/MakerProfile';

import AdminDashboard from './pages/AdminDashboard';
import AdminProductManager from './pages/AdminProductManager';
import AdminMakerManager from './pages/AdminMakerManager';
import ProtectedRoute from './components/ProtectedRoute';

import MakerDashboard from './pages/MakerDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/*  ROUTES CÔNG KHAI  */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/custom-order" element={<CustomOrder />} />
        <Route path="/custom-order/:id" element={<CustomOrderDetail />} />
        <Route path="/profile" element={<Profile />} />

        {/*  GIA CÔNG / THỢ  */}
        <Route path="/become-maker" element={<BecomeMaker />} />
        <Route path="/makers" element={<MakerList />} />
        <Route path="/maker/:id" element={<MakerProfile />} />
        <Route path="/maker-dashboard" element={<MakerDashboard />} />

        {/*  AUTH  */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/*  ADMIN (BẢO MẬT)  */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute><AdminProductManager /></ProtectedRoute>
        } />
        <Route path="/admin/makers" element={
          <ProtectedRoute><AdminMakerManager /></ProtectedRoute>
        } />

        {/*  404  */}
        <Route path="*" element={
          <div className="p-20 text-center font-serif">Lạc đường rồi sếp ơi...</div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
