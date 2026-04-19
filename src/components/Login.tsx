import React, { useState } from 'react';
import { UserInfo } from '../types';

interface LoginProps {
  onLogin: (info: UserInfo) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [formData, setFormData] = useState<UserInfo>({
    name: '',
    className: '',
    school: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.className && formData.school) {
      onLogin(formData);
    }
  };

  return (
    <div className="w-full max-w-md card-clean p-10 bg-white">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
          📘 ÔN LUYỆN TOÁN THPT
        </h1>
        <p className="text-sm text-[#64748B] mt-2">Đăng nhập để bắt đầu ôn luyện</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B]">
            Họ tên học sinh
          </label>
          <input
            type="text"
            required
            className="w-full border border-[#E2E8F0] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B]">
            Lớp
          </label>
          <input
            type="text"
            required
            className="w-full border border-[#E2E8F0] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            placeholder="Ví dụ: 12A1"
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-[#64748B]">
            Trường
          </label>
          <input
            type="text"
            required
            className="w-full border border-[#E2E8F0] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            placeholder="Tên trường của bạn..."
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full btn-clean py-3.5 text-base shadow-sm active:scale-[0.98]"
        >
          Vào thi ngay
        </button>
      </form>

      <p className="text-center mt-10 text-[10px] text-[#94A3B8] font-medium uppercase tracking-[0.2em]">
        Hệ thống ôn tập thông minh
      </p>
    </div>
  );
}
