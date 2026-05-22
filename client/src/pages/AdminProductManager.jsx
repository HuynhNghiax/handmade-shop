import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', img: '', desc: '' });
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };
  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Xác nhận xóa sản phẩm này?')) {
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

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', category: '', img: '', desc: '' });
    setShowModal(true);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 text-white p-8 flex flex-col gap-6 fixed h-full">
        <h2 className="text-lg font-bold text-pink-400">Kho hàng</h2>
        <button
          onClick={() => navigate('/admin')}
          className="text-xs font-medium text-gray-500 hover:text-white transition-colors text-left"
        >
          ← Về Dashboard
        </button>
      </aside>

      <main className="ml-64 flex-grow p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <button
            onClick={openAdd}
            className="bg-pink-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-pink-600 transition-colors"
          >
            + Thêm sản phẩm
          </button>
        </div>

        {/* Stat + Search */}
        <div className="flex gap-4 mb-6 items-center">
          <div className="bg-gray-100 rounded-2xl px-6 py-4 flex-shrink-0">
            <p className="text-xs text-gray-400 font-medium mb-1">Tổng sản phẩm</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, danh mục..."
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-300 flex-grow"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Bảng */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-16">Ảnh</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tên sản phẩm</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-32">Danh mục</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Giá</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="size-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {p.img ? (
                        <img
                          src={p.img}
                          alt={p.name}
                          className="size-12 object-cover"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=fbcfe8&color=ec4899&size=128&bold=true`;
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400 font-medium text-center px-1 leading-tight">
                          {p.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.desc}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-semibold text-pink-500">
                    {Number(p.price).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal thêm / sửa */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên sản phẩm</label>
                    <input
                      type="text" required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-300"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Giá tiền (đ)</label>
                    <input
                      type="number" required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-300"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Danh mục</label>
                  <input
                    type="text" required placeholder="Nến thơm, Túi len..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-300"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Link hình ảnh</label>
                  <input
                    type="text" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-300"
                    value={formData.img}
                    onChange={e => setFormData({ ...formData, img: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả</label>
                  <textarea
                    rows="3"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-300 resize-none"
                    value={formData.desc}
                    onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-pink-500 transition-colors"
                  >
                    {editingProduct ? 'Lưu thay đổi' : 'Thêm ngay'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductManager;