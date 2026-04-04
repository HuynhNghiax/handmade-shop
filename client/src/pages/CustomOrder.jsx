import React, { useState } from 'react';

const CustomOrder = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    productType: 'Nến thơm',
    description: '',
    budget: '',
    deadline: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn! Yêu cầu đã được gửi đi. PinkyCrafts sẽ liên hệ với bạn trong vòng 24h.");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* 1. HERO SECTION - Giới thiệu dịch vụ */}
      <section className="bg-pink-50/50 py-24 border-b border-pink-100/50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="text-pink-400 font-black tracking-[0.3em] text-[10px] uppercase mb-4 block">
            Dịch vụ cá nhân hóa
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-gray-950 tracking-tighter mb-8">
            Biến Ý Tưởng Thành <span className="italic text-pink-400">Hiện Thực</span>
          </h1>
          <p className="text-gray-500 text-lg font-light leading-relaxed">
            Bạn muốn một món quà độc nhất? Một chiếc túi len thêu tên riêng hay nến thơm mang mùi hương kỷ niệm? 
            Hãy kể cho chúng mình nghe ý tưởng của bạn.
          </p>
        </div>
      </section>

      {/* 2. QUY TRÌNH LÀM VIỆC - 3 Bước đơn giản */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="space-y-4">
            <div className="size-16 bg-pink-100 text-pink-500 rounded-3xl flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">1</div>
            <h3 className="text-xl font-bold">Gửi Ý Tưởng</h3>
            <p className="text-sm text-gray-400 font-light">Mô tả chi tiết món đồ bạn mong muốn qua form bên dưới.</p>
          </div>
          <div className="space-y-4">
            <div className="size-16 bg-pink-100 text-pink-500 rounded-3xl flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">2</div>
            <h3 className="text-xl font-bold">Tư Vấn & Báo Giá</h3>
            <p className="text-sm text-gray-400 font-light">Chúng mình sẽ liên hệ để chốt mẫu mã, chất liệu và chi phí.</p>
          </div>
          <div className="space-y-4">
            <div className="size-16 bg-pink-100 text-pink-500 rounded-3xl flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">3</div>
            <h3 className="text-xl font-bold">Gia Công & Giao Hàng</h3>
            <p className="text-sm text-gray-400 font-light">Sản phẩm được làm tỉ mỉ và gửi tận tay bạn từ 5-7 ngày.</p>
          </div>
        </div>
      </section>

      {/* 3. CUSTOM ORDER FORM */}
      <main className="max-w-5xl mx-auto px-6 pb-32">
        <div className="bg-white rounded-[4rem] shadow-2xl shadow-pink-100/50 border border-pink-50 p-10 md:p-20 relative">
          <div className="mb-12">
            <h2 className="text-3xl font-serif text-gray-950 mb-2">Chi tiết yêu cầu của bạn</h2>
            <p className="text-gray-400 text-sm italic font-light">Càng chi tiết, PinkyCrafts càng dễ hiện thực hóa chính xác!</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
            {/* Họ tên */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Họ và tên của bạn</label>
              <input 
                type="text" 
                required
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>

            {/* Loại sản phẩm */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Loại sản phẩm cần làm</label>
              <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none cursor-pointer">
                <option>Nến thơm theo yêu cầu</option>
                <option>Túi len/Thời trang</option>
                <option>Phụ kiện/Vòng tay</option>
                <option>Trang trí nhà cửa</option>
                <option>Khác...</option>
              </select>
            </div>

            {/* Mô tả ý tưởng */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Mô tả chi tiết ý tưởng (Màu sắc, kích thước, thông điệp...)</label>
              <textarea 
                rows="5"
                className="w-full bg-gray-50 border-none rounded-[2rem] px-6 py-5 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                placeholder="Ví dụ: Mình muốn đặt 1 nến thơm màu tím pastel, mùi Lavender, có in tên 'Linh' lên hũ gốm..."
              ></textarea>
            </div>

            {/* Ngân sách dự kiến */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Ngân sách dự kiến (VNĐ)</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                placeholder="Ví dụ: 300,000đ - 500,000đ"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Ngày bạn cần nhận hàng</label>
              <input 
                type="date" 
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-pink-200 transition-all outline-none"
              />
            </div>

            <div className="md:col-span-2 pt-10 text-center">
              <button 
                type="submit"
                className="bg-gray-950 text-white px-16 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-pink-500 transition-all shadow-xl hover:shadow-pink-100 active:scale-95"
              >
                Gửi yêu cầu đặt hàng
              </button>
              <p className="mt-6 text-gray-400 text-[10px] uppercase tracking-widest italic">
                Miễn phí tư vấn thiết kế 100%
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* 4. CONTACT BANNER */}
      <section className="bg-pink-500 py-16 text-white text-center">
        <h4 className="text-2xl font-serif mb-4">Bạn cần trao đổi trực tiếp ngay?</h4>
        <p className="font-bold tracking-widest">HOTLINE: 090 123 4567</p>
        <p className="text-sm font-light mt-2 opacity-80">Zalo/Instagram: @pinkycrafts.studio</p>
      </section>
    </div>
  );
};

export default CustomOrder;