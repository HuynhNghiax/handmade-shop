import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const StarRating = ({ rating, size = 'sm' }) => {
  const cls = size === 'lg' ? 'size-5' : 'size-3.5';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className={`${cls} ${n <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const MakerProfile = () => {
  const { id } = useParams();
  const [maker, setMaker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/makers/${id}`);
        setMaker(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">
      Đang tải hồ sơ...
    </div>
  );
  if (!maker) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-serif italic text-gray-400 text-xl">Không tìm thấy thợ này.</p>
      <Link to="/makers" className="text-pink-500 font-bold underline text-sm">← Quay lại danh sách</Link>
    </div>
  );

  const skills = (maker.skills || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-white font-sans pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-b from-pink-50/60 to-white pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {maker.User?.avatar ? (
            <img
              src={maker.User.avatar}
              alt={maker.User.name}
              className="size-28 rounded-full object-cover border-4 border-white shadow-2xl mx-auto mb-6"
            />
          ) : (
            <div className="size-28 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-2xl mx-auto mb-6 uppercase">
              {maker.User?.name?.charAt(0)}
            </div>
          )}

          <h1 className="text-4xl font-serif italic tracking-tighter text-gray-950 mb-2">
            {maker.User?.name}
          </h1>

          <div className="flex justify-center items-center gap-3 mb-6">
            <StarRating rating={maker.rating} size="lg" />
            <span className="text-gray-500 font-bold">{maker.rating > 0 ? maker.rating.toFixed(1) : 'Chưa có đánh giá'}</span>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-10 mb-8">
            <div>
              <p className="text-3xl font-bold text-gray-950">{maker.totalDone}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Đơn hoàn thành</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div>
              <p className="text-3xl font-bold text-gray-950">{maker.Reviews?.length || 0}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Đánh giá</p>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map(s => (
                <span key={s} className="bg-white text-pink-500 border border-pink-100 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-16">

        {/* Bio */}
        {maker.bio && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Về tôi</h2>
            <p className="text-gray-600 leading-relaxed font-light text-lg border-l-4 border-pink-100 pl-6 italic">
              {maker.bio}
            </p>
          </section>
        )}

        {/* Portfolio */}
        {maker.portfolio?.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {maker.portfolio.map((url, i) => (
                <div key={i} className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
                  <img
                    src={url}
                    alt={`portfolio-${i}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
            Đánh giá từ khách hàng
          </h2>
          {maker.Reviews?.length > 0 ? (
            <div className="space-y-4">
              {maker.Reviews.map(r => (
                <div key={r.id} className="bg-gray-50 rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    {r.Reviewer?.avatar ? (
                      <img src={r.Reviewer.avatar} alt="" className="size-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="size-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {r.Reviewer?.name?.charAt(0) || 'K'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-gray-950 text-sm">{r.Reviewer?.name || 'Khách hàng'}</p>
                        <StarRating rating={r.rating} />
                        <span className="text-[9px] text-gray-400 ml-auto">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {r.comment && <p className="text-gray-500 text-sm italic">"{r.comment}"</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic font-serif text-center py-10">Chưa có đánh giá nào.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default MakerProfile;
