import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const STATUS_LABEL = {
  cho_duyet: { text: 'Đang chờ Admin duyệt', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  da_duyet: { text: 'Đã được duyệt ✓', color: 'bg-green-50  text-green-600  border-green-200' },
  tu_choi: { text: 'Hồ sơ bị từ chối', color: 'bg-red-50    text-red-600    border-red-200' },
};

const BecomeMaker = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [existingProfile, setExistingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillTags, setSkillTags] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [imgInput, setImgInput] = useState('');
  const [bankInfo, setBankInfo] = useState(''); // ← MỚI

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/makers/my-profile', {
          headers: { token: `Bearer ${user.accessToken}` },
        });
        const p = res.data;
        setExistingProfile(p);
        setBio(p.bio || '');
        const tags = (p.skills || '').split(',').map(s => s.trim()).filter(Boolean);
        setSkillTags(tags);
        setSkills(p.skills || '');
        setPortfolio(p.portfolio || []);
        setBankInfo(p.bankInfo || ''); // ← MỚI
      } catch {
        // 404 = chưa có hồ sơ
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const addSkillTag = () => {
    const tag = skillInput.trim();
    if (tag && !skillTags.includes(tag)) {
      const next = [...skillTags, tag];
      setSkillTags(next);
      setSkills(next.join(','));
    }
    setSkillInput('');
  };
  const removeSkillTag = (tag) =>
    setSkillTags(prev => {
      const next = prev.filter(t => t !== tag);
      setSkills(next.join(','));
      return next;
    });

  const addImg = () => {
    const url = imgInput.trim();
    if (url && !portfolio.includes(url)) setPortfolio(prev => [...prev, url]);
    setImgInput('');
  };
  const removeImg = (url) => setPortfolio(prev => prev.filter(u => u !== url));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { bio, skills, portfolio, bankInfo }; // ← thêm bankInfo
      const headers = { headers: { token: `Bearer ${user.accessToken}` } };

      if (existingProfile) {
        await axios.put('http://localhost:5000/api/makers/my-profile', payload, headers);
        setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
      } else {
        const res = await axios.post('http://localhost:5000/api/makers/register', payload, headers);
        setExistingProfile(res.data.profile);
        setMessage({ type: 'success', text: 'Đăng ký thành công! Vui lòng chờ Admin duyệt.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra!' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-serif italic text-pink-400 text-2xl animate-pulse">
      Đang tải...
    </div>
  );

  const statusInfo = existingProfile ? STATUS_LABEL[existingProfile.status] : null;

  return (
    <div className="min-h-screen bg-white font-sans py-20 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-16 text-center">
          <span className="inline-block bg-pink-50 text-pink-500 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border border-pink-100 mb-6">
            Dành cho thợ thủ công
          </span>
          <h1 className="text-5xl font-serif italic tracking-tighter text-gray-950 mb-4">
            Trở thành <span className="text-pink-400">Thợ</span> của PinkyCrafts
          </h1>
          <p className="text-gray-400 font-light max-w-xl mx-auto leading-relaxed">
            Chia sẻ kỹ năng, nhận đơn gia công và kết nối với cộng đồng yêu thủ công mỹ nghệ.
          </p>
        </div>

        {statusInfo && (
          <div className={`mb-10 p-6 rounded-3xl border-2 flex items-center gap-4 ${statusInfo.color}`}>
            <div className="text-2xl">
              {existingProfile.status === 'da_duyet' ? '✅' :
                existingProfile.status === 'tu_choi' ? '❌' : '⏳'}
            </div>
            <div>
              <p className="font-black uppercase text-[10px] tracking-widest mb-1">Trạng thái hồ sơ</p>
              <p className="font-bold">{statusInfo.text}</p>
            </div>
          </div>
        )}

        {/* Nhắc nhở thêm thông tin NH nếu đã duyệt nhưng chưa có bankInfo */}
        {existingProfile?.status === 'da_duyet' && !existingProfile?.bankInfo && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <p className="font-black text-amber-700 text-sm">Chưa có thông tin ngân hàng!</p>
              <p className="text-amber-600 text-xs mt-1">
                Bạn cần cập nhật tài khoản ngân hàng để nhận tiền từ các đơn gia công.
                Shop sẽ chuyển khoản cho bạn sau khi khách thanh toán.
              </p>
            </div>
          </div>
        )}

        {message && (
          <div className={`mb-8 p-4 rounded-2xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-50 rounded-[3rem] p-10 md:p-14">

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Giới thiệu bản thân
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              placeholder="Kể về kinh nghiệm, phong cách làm việc và những gì bạn đam mê nhất..."
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm outline-none focus:border-pink-300 resize-none"
              required
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Kỹ năng chuyên môn
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag(); } }}
                placeholder="Nhập kỹ năng rồi Enter (VD: đan, thêu, may...)"
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-300"
              />
              <button type="button" onClick={addSkillTag}
                className="bg-pink-400 text-white px-6 rounded-xl text-sm font-bold hover:bg-pink-500 transition-colors">
                Thêm
              </button>
            </div>
            {skillTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skillTags.map(tag => (
                  <span key={tag} className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                    {tag}
                    <button type="button" onClick={() => removeSkillTag(tag)} className="hover:text-pink-900">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Ảnh portfolio (URL)
            </label>
            <div className="flex gap-2 mb-4">
              <input type="url" value={imgInput} onChange={e => setImgInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImg(); } }}
                placeholder="https://... (link ảnh sản phẩm đã làm)"
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-300"
              />
              <button type="button" onClick={addImg}
                className="bg-gray-950 text-white px-6 rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors">
                Thêm
              </button>
            </div>
            {portfolio.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {portfolio.map(url => (
                  <div key={url} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImg(url)}
                      className="absolute top-2 right-2 bg-red-500 text-white size-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── THÔNG TIN NGÂN HÀNG (MỚI) ─────────────────────────── */}
          <div className="border-t border-gray-200 pt-8">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Tài khoản ngân hàng nhận tiền <span className="text-pink-400">*</span>
            </label>
            <p className="text-[10px] text-gray-400 mb-3">
              Dùng để nhận thanh toán từ shop sau khi đơn hoàn thành. Ghi đủ: Số TK · Tên NH · Tên chủ TK
            </p>
            <input
              type="text"
              value={bankInfo}
              onChange={e => setBankInfo(e.target.value)}
              placeholder="VD: 9988776655 · Vietcombank · Nguyen Van A"
              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-pink-300"
            />
            {existingProfile?.status === 'da_duyet' && !bankInfo && (
              <p className="text-xs text-red-400 mt-2 font-bold">
                ⚠️ Thiếu thông tin NH — bạn sẽ không nhận được tiền nếu để trống!
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-gray-700 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-gray-300 transition-colors">
              Quay lại
            </button>
            <button type="submit" disabled={saving}
              className="flex-2 flex-grow bg-gray-950 text-white py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-pink-500 transition-all shadow-xl disabled:opacity-50">
              {saving ? 'Đang lưu...' : existingProfile ? 'Cập nhật hồ sơ' : 'Đăng ký làm thợ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeMaker;
