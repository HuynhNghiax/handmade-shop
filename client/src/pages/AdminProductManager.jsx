import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', img: '', desc: '' });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Sếp có chắc muốn xóa món này không?")) {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { token: `Bearer ${user.accessToken}` }
      });
      fetchProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { headers: { token: `Bearer ${user.accessToken}` } };
    if (editingProduct) {
      await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, formData, headers);
    } else {
      await axios.post('http://localhost:5000/api/products', formData, headers);
    }
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', category: '', img: '', desc: '' });
    fetchProducts();
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setFormData(p);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar mini để quay về dashboard */}
      <aside className="w-64 bg-gray-950 text-white p-10 flex flex-col gap-6">
        <h2 className="text-xl font-serif italic text-pink-400">Kho hàng</h2>
        <button onClick={() => navigate('/admin')} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all">← Về Dashboard</button>
      </aside>

      <main className="flex-grow p-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif italic tracking-tighter">Quản lý <span className="text-pink-400">Sản phẩm</span></h1>
          <button onClick={() => { setEditingProduct(null); setFormData({name:'', price:'', category:'', img:'', desc:''}); setShowModal(true); }} className="bg-pink-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-200">
            + Thêm sản phẩm mới
          </button>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-gray-300 border-b">
                <th className="pb-6">Hình ảnh</th>
                <th className="pb-6">Tên sản phẩm</th>
                <th className="pb-6">Giá</th>
                <th className="pb-6">Danh mục</th>
                <th className="pb-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-6">
                    <img src={p.img} className="size-16 rounded-2xl object-cover border" alt="" />
                  </td>
                  <td className="py-6 font-bold">{p.name}</td>
                  <td className="py-6 text-pink-500 font-serif">{p.price.toLocaleString()}đ</td>
                  <td className="py-6"><span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full uppercase font-bold">{p.category}</span></td>
                  <td className="py-6 text-right space-x-2">
                    <button onClick={() => openEdit(p)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg">Sửa</button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL THÊM / SỬA */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-[4rem] p-14 space-y-4 shadow-2xl">
              <h3 className="text-3xl font-serif italic mb-6">{editingProduct ? "Cập nhật" : "Thêm"} Sản phẩm</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Tên sản phẩm" className="bg-gray-50 p-4 rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input type="number" placeholder="Giá tiền" className="bg-gray-50 p-4 rounded-2xl outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
              <input type="text" placeholder="Link hình ảnh" className="w-full bg-gray-50 p-4 rounded-2xl outline-none" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} required />
              <input type="text" placeholder="Danh mục (VD: Nến thơm, Túi len)" className="w-full bg-gray-50 p-4 rounded-2xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              <textarea placeholder="Mô tả sản phẩm" className="w-full bg-gray-50 p-4 rounded-3xl outline-none" rows="4" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}></textarea>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-gray-950 text-white py-5 rounded-full font-bold uppercase text-[10px]">{editingProduct ? "Lưu thay đổi" : "Tạo ngay"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-5 rounded-full font-bold uppercase text-[10px]">Đóng</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductManager;