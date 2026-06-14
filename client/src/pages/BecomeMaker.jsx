import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const CATEGORIES = [
  { value: 'theu', label: 'Thêu tay' },
  { value: 'dan_len', label: 'Đan len / Móc' },
  { value: 'go', label: 'Mộc / Khắc gỗ' },
  { value: 'gom', label: 'Gốm / Đất sét' },
  { value: 'da', label: 'Đồ da' },
  { value: 'vai', label: 'May vải / Patchwork' },
  { value: 'trang_suc', label: 'Trang sức thủ công' },
  { value: 've_tranh', label: 'Vẽ / Tranh nghệ thuật' },
  { value: 'giay_dep', label: 'Giày dép thủ công' },
  { value: 'khac', label: 'Khác' },
];

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

const STEPS = ['Thông tin cơ bản', 'Kỹ năng & Kinh nghiệm', 'Portfolio & CCCD', 'Ngân hàng'];

const STATUS_CONFIG = {
  cho_duyet: {
    label: 'Đang xét duyệt',
    desc: 'Hồ sơ đã được gửi đi. Admin sẽ xét duyệt trong 1-3 ngày làm việc.',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    iconUrl: 'https://fonts.gstatic.com/s/i/materialiconsoutlined/pending/v15/24px.svg',
  },
  da_duyet: {
    label: 'Đã được duyệt',
    desc: 'Chúc mừng! Bạn đã trở thành thợ chính thức của PinkyCrafts.',
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    iconUrl: 'https://fonts.gstatic.com/s/i/materialiconsoutlined/verified/v14/24px.svg',
  },
  tu_choi: {
    label: 'Hồ sơ bị từ chối',
    desc: 'Hồ sơ của bạn chưa đáp ứng yêu cầu. Vui lòng xem lý do và nộp lại.',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    iconUrl: 'https://fonts.gstatic.com/s/i/materialiconsoutlined/cancel/v14/24px.svg',
  },
  can_bo_sung: {
    label: 'Cần bổ sung hồ sơ',
    desc: 'Admin yêu cầu bổ sung thông tin. Vui lòng xem ghi chú và cập nhật.',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    iconUrl: 'https://fonts.gstatic.com/s/i/materialiconsoutlined/info/v14/24px.svg',
  },
};

const ProgressBar = ({ step, total }) => (
  <div className="flex items-center gap-2 mb-10">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-1.5">
          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
            i < step ? 'bg-pink-500 border-pink-500 text-white' :
            i === step ? 'bg-white border-pink-400 text-pink-500 shadow-[0_0_0_4px_#fce7f3]' :
            'bg-gray-100 border-gray-200 text-gray-400'
          }`}>
            {i < step
              ? <img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/check/v14/24px.svg" className="size-4 invert" alt="" />
              : i + 1}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${i === step ? 'text-pink-500' : 'text-gray-400'}`}>
            {STEPS[i]}
          </span>
        </div>
        {i < total - 1 && (
          <div className={`flex-1 h-0.5 rounded-full mb-4 transition-all duration-500 ${i < step ? 'bg-pink-400' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const UploadBox = ({ label, value, onChange, hint, token }) => {
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: `Bearer ${token}`,
        },
      });
      onChange(res.data.url);
    } catch {
      alert('Upload ảnh thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      {hint && <p className="text-[10px] text-gray-400 mb-3">{hint}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative w-full aspect-video rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden flex items-center justify-center group ${
          value ? 'border-pink-300 bg-pink-50' : 'border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">Đổi ảnh</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/add_photo_alternate/v14/24px.svg" className="size-10 opacity-30" alt="" />
            <span className="text-xs font-bold">Nhấn để chọn ảnh</span>
            <span className="text-[10px]">JPG, PNG, WEBP · Tối đa 5MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
};

const BecomeMaker = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);

  const [form, setForm] = useState({
    bio: '',
    category: '',
    province: '',
    yearsExp: '',
    priceFrom: '',
    priceTo: '',
    skillInput: '',
    skillTags: [],
    skills: '',
    portfolioInput: '',
    portfolio: [],
    idCardFront: '',
    idCardBack: '',
    bankInfo: '',
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get(`${API}/makers/my-profile`, { headers: { token: `Bearer ${user.accessToken}` } })
      .then((res) => {
        const p = res.data;
        setProfile(p);
        const tags = (p.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
        setForm({
          bio: p.bio || '',
          category: p.category || '',
          province: p.province || '',
          yearsExp: p.yearsExp ?? '',
          priceFrom: p.priceFrom ?? '',
          priceTo: p.priceTo ?? '',
          skillInput: '',
          skillTags: tags,
          skills: p.skills || '',
          portfolioInput: '',
          portfolio: p.portfolio || [],
          idCardFront: p.idCardFront || '',
          idCardBack: p.idCardBack || '',
          bankInfo: p.bankInfo || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addSkill = () => {
    const tag = form.skillInput.trim();
    if (!tag || form.skillTags.includes(tag)) { set('skillInput', ''); return; }
    const next = [...form.skillTags, tag];
    setForm((prev) => ({ ...prev, skillTags: next, skills: next.join(', '), skillInput: '' }));
  };

  const removeSkill = (tag) => {
    const next = form.skillTags.filter((t) => t !== tag);
    setForm((prev) => ({ ...prev, skillTags: next, skills: next.join(', ') }));
  };

  const addPortfolio = () => {
    const url = form.portfolioInput.trim();
    if (!url || form.portfolio.includes(url)) { set('portfolioInput', ''); return; }
    setForm((prev) => ({ ...prev, portfolio: [...prev.portfolio, url], portfolioInput: '' }));
  };

  const handlePortfolioUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: `Bearer ${user?.accessToken}`,
        },
      });
      setForm((prev) => ({ ...prev, portfolio: [...prev.portfolio, res.data.url] }));
    } catch {
      alert('Upload ảnh portfolio thất bại.');
    }
  };

  const payload = () => ({
    bio: form.bio,
    category: form.category,
    province: form.province,
    yearsExp: form.yearsExp !== '' ? Number(form.yearsExp) : undefined,
    priceFrom: form.priceFrom !== '' ? Number(form.priceFrom) : undefined,
    priceTo: form.priceTo !== '' ? Number(form.priceTo) : undefined,
    skills: form.skills,
    portfolio: form.portfolio,
    idCardFront: form.idCardFront,
    idCardBack: form.idCardBack,
    bankInfo: form.bankInfo,
  });

  const handleSubmit = async () => {
    setSaving(true);
    setErrors([]);
    try {
      const headers = { headers: { token: `Bearer ${user.accessToken}` } };
      let res;
      if (isResubmitting) {
        res = await axios.post(`${API}/makers/my-profile/resubmit`, payload(), headers);
      } else if (profile) {
        res = await axios.put(`${API}/makers/my-profile`, payload(), headers);
      } else {
        res = await axios.post(`${API}/makers/register`, payload(), headers);
      }
      setProfile(res.data.profile);
      setIsResubmitting(false);
      setSuccessMsg(res.data.message);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setErrors([data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.']);
    } finally {
      setSaving(false);
    }
  };

  const canEditForm = !profile || profile.status === 'tu_choi' || profile.status === 'can_bo_sung';
  const isEditing = !!profile && (profile.status === 'da_duyet');
  const needResubmit = profile && (profile.status === 'tu_choi' || profile.status === 'can_bo_sung');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="size-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const statusCfg = profile ? STATUS_CONFIG[profile.status] : null;

  if (successMsg) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="size-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/check_circle/v14/24px.svg" className="size-10" style={{ filter: 'invert(50%) sepia(80%) saturate(400%) hue-rotate(90deg)' }} alt="" />
        </div>
        <h2 className="text-3xl font-serif italic text-gray-950 mb-3">Thành công!</h2>
        <p className="text-gray-500 mb-8">{successMsg}</p>
        <button onClick={() => { setSuccessMsg(''); }} className="bg-gray-950 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all">
          Xem hồ sơ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">

        <div className="mb-14 text-center">
          <span className="inline-block bg-pink-50 text-pink-500 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border border-pink-100 mb-5">
            Dành cho thợ thủ công
          </span>
          <h1 className="text-5xl font-serif italic tracking-tighter text-gray-950 mb-3">
            {profile ? 'Hồ sơ' : 'Trở thành'} <span className="text-pink-400">Thợ</span> PinkyCrafts
          </h1>
          <p className="text-gray-400 font-light leading-relaxed">
            Chia sẻ kỹ năng, nhận đơn gia công và kết nối cộng đồng yêu thủ công mỹ nghệ.
          </p>
        </div>

        {statusCfg && (
          <div className={`mb-8 p-6 rounded-3xl border-2 ${statusCfg.bg}`}>
            <div className="flex items-start gap-4">
              <img src={statusCfg.iconUrl} className={`size-7 mt-0.5 flex-shrink-0 ${statusCfg.text}`} style={{ filter: profile.status === 'da_duyet' ? 'invert(37%) sepia(72%) saturate(500%) hue-rotate(90deg)' : profile.status === 'tu_choi' ? 'invert(25%) sepia(90%) saturate(600%) hue-rotate(330deg)' : profile.status === 'can_bo_sung' ? 'invert(30%) sepia(80%) saturate(400%) hue-rotate(200deg)' : 'invert(60%) sepia(60%) saturate(400%) hue-rotate(10deg)' }} alt="" />
              <div className="flex-1">
                <p className={`font-black text-sm uppercase tracking-widest mb-1 ${statusCfg.text}`}>{statusCfg.label}</p>
                <p className="text-sm text-gray-600">{statusCfg.desc}</p>
                {profile.rejectReason && (
                  <div className="mt-3 p-3 bg-white/70 rounded-xl border border-red-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-1">Lý do từ chối</p>
                    <p className="text-sm text-red-700">{profile.rejectReason}</p>
                  </div>
                )}
                {profile.adminNote && !profile.rejectReason && (
                  <div className="mt-3 p-3 bg-white/70 rounded-xl border border-blue-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1">Ghi chú từ Admin</p>
                    <p className="text-sm text-blue-700">{profile.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
            {needResubmit && !isResubmitting && (
              <button
                onClick={() => setIsResubmitting(true)}
                className="mt-4 w-full py-3 rounded-2xl bg-gray-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all"
              >
                Cập nhật và nộp lại hồ sơ
              </button>
            )}
          </div>
        )}

        {profile?.status === 'da_duyet' && !profile?.bankInfo && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3">
            <img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/warning/v14/24px.svg" className="size-6 flex-shrink-0 mt-0.5" style={{ filter: 'invert(55%) sepia(80%) saturate(400%) hue-rotate(10deg)' }} alt="" />
            <div>
              <p className="font-black text-amber-700 text-sm">Chưa có thông tin ngân hàng</p>
              <p className="text-amber-600 text-xs mt-1">Cập nhật tài khoản ngân hàng để nhận tiền từ các đơn gia công hoàn thành.</p>
            </div>
          </div>
        )}

        {(canEditForm || isEditing || isResubmitting) && (
          <div className="bg-gray-50 rounded-[3rem] p-8 md:p-12">

            {(canEditForm || isResubmitting) && !isEditing && (
              <ProgressBar step={step} total={STEPS.length} />
            )}

            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-start gap-2">
                    <img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/error/v14/24px.svg" className="size-4 flex-shrink-0 mt-0.5" style={{ filter: 'invert(25%) sepia(90%) saturate(600%) hue-rotate(330deg)' }} alt="" />
                    {e}
                  </p>
                ))}
              </div>
            )}

            {(step === 0 || isEditing) && (
              <div className="space-y-6">
                {!isEditing && <h2 className="text-lg font-serif italic text-gray-950 mb-6">Thông tin cơ bản</h2>}

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Giới thiệu bản thân <span className="text-pink-400">*</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => set('bio', e.target.value)}
                    rows={4}
                    placeholder="Kể về kinh nghiệm, phong cách làm việc và những gì bạn đam mê nhất... (ít nhất 30 ký tự)"
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:border-pink-300 resize-none transition-colors"
                  />
                  <p className={`text-[10px] mt-1 text-right ${form.bio.length < 30 ? 'text-red-400' : 'text-gray-400'}`}>
                    {form.bio.length} / 30 ký tự tối thiểu
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                      Danh mục nghề <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => set('category', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-pink-300 appearance-none cursor-pointer"
                    >
                      <option value="">Chọn danh mục...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                      Tỉnh / Thành phố <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={form.province}
                      onChange={(e) => set('province', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-pink-300 appearance-none cursor-pointer"
                    >
                      <option value="">Chọn tỉnh/thành...</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                      Năm kinh nghiệm <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={form.yearsExp}
                      onChange={(e) => set('yearsExp', e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-pink-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Giá từ (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.priceFrom}
                      onChange={(e) => set('priceFrom', e.target.value)}
                      placeholder="50000"
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-pink-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Giá đến (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.priceTo}
                      onChange={(e) => set('priceTo', e.target.value)}
                      placeholder="500000"
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-pink-300"
                    />
                  </div>
                </div>

                {isEditing && (
                  <>
                    <div className="border-t border-gray-200 pt-6">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Kỹ năng chuyên môn</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={form.skillInput}
                          onChange={(e) => set('skillInput', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                          placeholder="Nhập kỹ năng rồi Enter (VD: đan, thêu, may...)"
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-300"
                        />
                        <button type="button" onClick={addSkill} className="bg-pink-400 text-white px-5 rounded-xl text-sm font-bold hover:bg-pink-500 transition-colors">Thêm</button>
                      </div>
                      {form.skillTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.skillTags.map((tag) => (
                            <span key={tag} className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                              {tag}
                              <button type="button" onClick={() => removeSkill(tag)} className="hover:text-pink-900 leading-none">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                        Tài khoản ngân hàng nhận tiền <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.bankInfo}
                        onChange={(e) => set('bankInfo', e.target.value)}
                        placeholder="VD: 9988776655 · Vietcombank · Nguyen Van A"
                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-pink-300"
                      />
                    </div>
                  </>
                )}

                {!isEditing && (
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">
                      Quay lại
                    </button>
                    <button type="button" onClick={() => { setErrors([]); setStep(1); }} className="flex-[2] bg-gray-950 text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all">
                      Tiếp theo
                    </button>
                  </div>
                )}

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full bg-gray-950 text-white py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-serif italic text-gray-950 mb-6">Kỹ năng & Kinh nghiệm</h2>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Kỹ năng chuyên môn <span className="text-pink-400">*</span>
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={form.skillInput}
                      onChange={(e) => set('skillInput', e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="Nhập kỹ năng rồi Enter (VD: đan, thêu, móc...)"
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-300"
                    />
                    <button type="button" onClick={addSkill} className="bg-pink-400 text-white px-5 rounded-xl text-sm font-bold hover:bg-pink-500 transition-colors">Thêm</button>
                  </div>
                  {form.skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.skillTags.map((tag) => (
                        <span key={tag} className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                          {tag}
                          <button type="button" onClick={() => removeSkill(tag)} className="hover:text-pink-900 leading-none">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">
                    Quay lại
                  </button>
                  <button type="button" onClick={() => { setErrors([]); setStep(2); }} className="flex-[2] bg-gray-950 text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all">
                    Tiếp theo
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-lg font-serif italic text-gray-950 mb-2">Portfolio & Xác minh danh tính</h2>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Ảnh sản phẩm đã làm</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={form.portfolioInput}
                      onChange={(e) => set('portfolioInput', e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPortfolio(); } }}
                      placeholder="Dán link ảnh hoặc upload bên dưới..."
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-300"
                    />
                    <button type="button" onClick={addPortfolio} className="bg-gray-200 text-gray-700 px-5 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors">Thêm</button>
                    <label className="bg-pink-400 text-white px-5 rounded-xl text-sm font-bold hover:bg-pink-500 transition-colors cursor-pointer flex items-center gap-1">
                      <img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/upload/v14/24px.svg" className="size-4 invert" alt="" />
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePortfolioUpload(e.target.files[0])} />
                    </label>
                  </div>
                  {form.portfolio.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {form.portfolio.map((url, i) => (
                        <div key={i} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, portfolio: prev.portfolio.filter((_, j) => j !== i) }))}
                            className="absolute top-2 right-2 size-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-2xl p-8 text-center text-gray-400 text-xs">
                      Chưa có ảnh portfolio. Thêm ít nhất 1 ảnh sản phẩm để tăng khả năng được duyệt.
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <UploadBox
                    label="CCCD mặt trước *"
                    hint="Ảnh rõ nét, đủ 4 góc, không chói sáng"
                    value={form.idCardFront}
                    onChange={(url) => set('idCardFront', url)}
                    token={user?.accessToken}
                  />
                  <UploadBox
                    label="CCCD mặt sau *"
                    hint="Ảnh rõ nét, đủ 4 góc, không chói sáng"
                    value={form.idCardBack}
                    onChange={(url) => set('idCardBack', url)}
                    token={user?.accessToken}
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Thông tin CCCD được bảo mật tuyệt đối, chỉ dùng để xác minh danh tính thợ.
                </p>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">
                    Quay lại
                  </button>
                  <button type="button" onClick={() => { setErrors([]); setStep(3); }} className="flex-[2] bg-gray-950 text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all">
                    Tiếp theo
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-serif italic text-gray-950 mb-2">Tài khoản ngân hàng</h2>
                <p className="text-sm text-gray-500">Dùng để nhận thanh toán từ shop sau khi đơn hoàn thành. Shop sẽ chuyển khoản trực tiếp cho bạn.</p>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Thông tin ngân hàng <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.bankInfo}
                    onChange={(e) => set('bankInfo', e.target.value)}
                    placeholder="VD: 9988776655 · Vietcombank · Nguyen Van A"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm outline-none focus:border-pink-300"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">Ghi đủ: Số tài khoản · Tên ngân hàng · Tên chủ tài khoản</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 space-y-1">
                  <p className="font-black uppercase tracking-wider text-[10px] mb-2">Xác nhận thông tin</p>
                  <p><span className="font-bold">Danh mục:</span> {CATEGORIES.find((c) => c.value === form.category)?.label || '—'}</p>
                  <p><span className="font-bold">Khu vực:</span> {form.province || '—'}</p>
                  <p><span className="font-bold">Kinh nghiệm:</span> {form.yearsExp !== '' ? `${form.yearsExp} năm` : '—'}</p>
                  <p><span className="font-bold">Kỹ năng:</span> {form.skills || '—'}</p>
                  <p><span className="font-bold">Portfolio:</span> {form.portfolio.length} ảnh</p>
                  <p><span className="font-bold">CCCD:</span> {form.idCardFront && form.idCardBack ? 'Đã upload' : 'Chưa đủ'}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-[2] bg-gray-950 text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Đang gửi...' : isResubmitting ? 'Nộp lại hồ sơ' : 'Gửi đăng ký'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {profile?.status === 'cho_duyet' && (
          <div className="mt-10 bg-gray-50 rounded-3xl p-8 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Thông tin hồ sơ đã nộp</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Danh mục</p><p>{CATEGORIES.find((c) => c.value === profile.category)?.label || '—'}</p></div>
              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Khu vực</p><p>{profile.province || '—'}</p></div>
              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kinh nghiệm</p><p>{profile.yearsExp != null ? `${profile.yearsExp} năm` : '—'}</p></div>
              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Portfolio</p><p>{profile.portfolio?.length || 0} ảnh</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeMaker;
