import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(n => (
      <svg key={n} className={`size-3.5 ${n <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
    <span className="text-xs text-gray-500 ml-1">{rating > 0 ? rating.toFixed(1) : 'Chưa có'}</span>
  </div>
);

const SKILL_OPTIONS = ['Tất cả', 'đan', 'thêu', 'may', 'làm nến', 'làm đồ da', 'vẽ tranh'];

const MakerList = () => {
  const [makers,  setMakers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('Tất cả');
  const [sort,    setSort]    = useState('rating');

  const fetchMakers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (filter !== 'Tất cả') params.set('skills', filter);
      const res = await axios.get(`http://localhost:5000/api/makers?${params}`);
      setMakers(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách thợ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMakers(); }, [filter, sort]);

  return (
    <div className="min-h-screen bg-white font-sans py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b pb-12 border-pink-50 gap-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif italic tracking-tighter mb-2">
              Những <span className="text-pink-400">Bàn Tay</span> Khéo Léo
            </h1>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">
              {makers.length} thợ tài năng đã được xác nhận
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
            >
              <option value="rating">Đánh giá cao nhất</option>
              <option value="totalDone">Nhiều đơn nhất</option>
            </select>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-12">
          {SKILL_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                filter === s ? 'bg-gray-950 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-[3rem] p-8 animate-pulse">
                <div className="size-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : makers.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <p className="font-serif italic text-gray-400 text-xl">Chưa có thợ nào phù hợp...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {makers.map(maker => (
              <Link
                key={maker.id}
                to={`/maker/${maker.id}`}
                className="group bg-gray-50 hover:bg-white rounded-[3rem] p-10 border border-gray-100 hover:border-pink-100 hover:shadow-2xl hover:shadow-pink-50 transition-all"
              >
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  {maker.User?.avatar ? (
                    <img
                      src={maker.User.avatar}
                      alt={maker.User.name}
                      className="size-20 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-pink-100 transition-colors"
                    />
                  ) : (
                    <div className="size-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                      {maker.User?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-gray-950 text-lg mb-1 group-hover:text-pink-500 transition-colors">
                    {maker.User?.name}
                  </h3>

                  <div className="flex justify-center mb-4">
                    <StarRating rating={maker.rating} />
                  </div>

                  {/* Skills */}
                  {maker.skills && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      {maker.skills.split(',').slice(0, 3).map(s => (
                        <span key={s} className="bg-pink-50 text-pink-400 text-[9px] font-black uppercase tracking-wide px-3 py-1 rounded-full">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-center gap-6 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="font-black text-gray-950 text-lg">{maker.totalDone}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Đơn hoàn thành</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-gray-950 text-lg">{maker.rating > 0 ? maker.rating.toFixed(1) : '—'}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Sao TB</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MakerList;
