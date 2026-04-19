import { Exam, UserInfo } from '../types';
import { BookOpen, RefreshCw } from 'lucide-react';

interface ExamListProps {
  exams: Exam[];
  onSelect: (exam: Exam) => void;
  user: UserInfo;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ExamList({ exams, onSelect, user, isLoading, onRefresh }: ExamListProps) {
  const folderId = (import.meta as any).env.VITE_DRIVE_FOLDER_ID;
  const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY;
  const isMissingConfig = !folderId || !apiKey;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between bg-white px-8 py-6 rounded-2xl border border-[#E2E8F0] shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">📘 KHO ĐỀ THI</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Chào mừng, {user.name} • Lớp {user.className} • {user.school}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8FAFC] rounded-full border border-[#E2E8F0] text-xs font-semibold text-[#64748B] transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''} text-[#2563EB]`} />
            <span className="uppercase tracking-wider">{isLoading ? 'Đang đồng bộ...' : 'Làm mới Drive'}</span>
          </button>
        </div>
      </header>

      {isMissingConfig && (
        <div className="bg-[#FFF1F2] border border-[#FECDD3] p-4 rounded-xl flex items-center gap-4 text-[#E11D48] text-sm animate-pulse">
          <div className="p-2 bg-white rounded-lg">⚠️</div>
          <p className="font-medium">
            <strong>LƯU Ý:</strong> Bạn chưa cấu hình Folder ID hoặc API Key trong mục <b>Settings {' > '} Secrets</b>. Website đang hiển thị dữ liệu mẫu.
          </p>
        </div>
      )}

      {exams.length === 0 && !isLoading ? (
        <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto">
            <BookOpen size={32} className="text-[#CBD5E1]" />
          </div>
          <h3 className="text-lg font-bold text-[#1E293B]">Chưa có đề thi nào</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Hãy upload các file PDF (MD01, MD02...) vào thư mục Drive của bạn. Website sẽ tự động cập nhật danh sách tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => onSelect(exam)}
              className="group relative bg-white border border-[#E2E8F0] rounded-xl p-6 text-left transition-all hover:border-[#2563EB] hover:shadow-md active:scale-[0.98]"
            >
              <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg flex items-center justify-center mb-4 transition-colors group-hover:bg-[#DBEAFE]">
                <BookOpen className="text-[#64748B] group-hover:text-[#2563EB]" size={20} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-1">Toán học</div>
              <h3 className="text-base font-semibold text-[#1E293B] group-hover:text-[#2563EB] transition-colors">{exam.name}</h3>
              <div className="mt-4 flex items-center gap-3 text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1">50 câu</span>
                <span className="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
                <span>90 phút</span>
              </div>
              
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <span className="text-xs font-bold text-[#2563EB]">CHỌN →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-bold text-[#1E293B] mb-1">Thư mục nguồn Google Drive</h3>
          <p className="text-sm text-[#64748B] max-w-lg mb-4">Mọi tệp PDF bạn tải lên thư mục này sẽ hiển thị tự động trên web.</p>
          <a 
            href={folderId ? `https://drive.google.com/drive/folders/${folderId}` : "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline px-4 py-2 bg-[#DBEAFE] rounded-lg transition-colors"
          >
            Mở thư mục Drive của bạn
          </a>
        </div>
        <div className="w-full md:w-48 h-24 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl flex items-center justify-center">
          <p className="text-[10px] text-[#94A3B8] font-bold uppercase text-center px-4 tracking-widest">Tự động đồng bộ hóa thời gian thực</p>
        </div>
      </div>
    </div>
  );
}
