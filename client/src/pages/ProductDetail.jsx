import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext'; // Import kho dữ liệu giỏ hàng

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Lấy hàm addToCart từ Context để cập nhật Navbar ngay lập tức
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi vào xem
  }, [id]);

  // Xử lý tăng giảm số lượng
  const handleQuantity = (type) => {
    if (type === 'dec') {
      quantity > 1 && setQuantity(quantity - 1);
    } else {
      setQuantity(quantity + 1);
    }
  };

  // Hàm xử lý khi bấm "Thêm vào giỏ" hoặc "Mua ngay"
  const handleAction = (isRedirect) => {
    if (!product) return;

    // Gọi hàm từ Context - Navbar sẽ tự nhảy số
    addToCart(product, quantity);

    if (isRedirect) {
      navigate('/cart'); // Nếu là Mua ngay thì chuyển trang
    } else {
      alert(`Đã thêm ${quantity} món "${product.name}" vào giỏ hàng!`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-2xl text-pink-400 animate-pulse">
      Đang chuẩn bị hàng...
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans">
      <h2 className="text-2xl font-serif mb-4 text-gray-400 italic">Sản phẩm không tồn tại</h2>
      <button onClick={() => navigate('/products')} className="text-pink-500 font-bold underline uppercase text-[10px] tracking-widest">
        Quay lại cửa hàng
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-20">

        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-pink-500 transition-all mb-12"
        >
          ← Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* BÊN TRÁI: ẢNH SẢN PHẨM */}
          <div className="lg:col-span-7">
            <div className="rounded-[3rem] lg:rounded-[5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-2xl shadow-pink-100/30 aspect-[4/5]">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=fbcfe8&color=ec4899&size=800&bold=true`;
                }}
              />
            </div>
          </div>

          {/* BÊN PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="space-y-8">
              <div>
                <span className="bg-pink-50 text-pink-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                  {product.category}
                </span>
                <h1 className="text-5xl lg:text-7xl font-serif tracking-tighter text-gray-950 leading-[1.1] mb-6">
                  {product.name}
                </h1>
                <p className="text-3xl font-bold text-pink-500">
                  {product.price.toLocaleString('vi-VN')}đ
                </p>
              </div>

              <div className="h-[1px] bg-gray-100 w-full"></div>

              <div className="relative pt-4">
                <p className="text-gray-500 font-light leading-relaxed tracking-tight italic text-lg lg:text-xl border-l-4 border-pink-100 pl-6">
                  {product.desc || "Sản phẩm được chế tác hoàn toàn thủ công từ những vật liệu tự nhiên, mang đến nét đẹp riêng biệt và đầy cảm hứng cho không gian sống của bạn."}
                </p>
              </div>

              {/* CHỌN SỐ LƯỢNG */}
              <div className="pt-8 space-y-6">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-100 rounded-2xl p-1 bg-gray-50">
                    <button
                      onClick={() => handleQuantity('dec')}
                      className="size-12 flex items-center justify-center hover:bg-white rounded-xl transition font-bold text-xl"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                    <button
                      onClick={() => handleQuantity('inc')}
                      className="size-12 flex items-center justify-center hover:bg-white rounded-xl transition font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* NHÓM NÚT BẤM */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => handleAction(false)}
                    className="flex-1 border-2 border-gray-950 text-gray-950 font-black py-6 rounded-full hover:bg-gray-950 hover:text-white transition-all uppercase text-xs tracking-widest active:scale-95"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => handleAction(true)}
                    className="flex-1 bg-pink-400 text-white font-black py-6 rounded-full shadow-2xl shadow-pink-200 hover:bg-pink-500 transition-all uppercase text-xs tracking-widest active:scale-95"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 opacity-30 pt-10">
                <span className="text-[9px] font-bold uppercase tracking-widest italic">Giao hàng toàn quốc</span>
                <span className="size-1 bg-gray-300 rounded-full"></span>
                <span className="text-[9px] font-bold uppercase tracking-widest italic">Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;