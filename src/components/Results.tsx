import { Exam, UserInfo, Answers, AIResult } from '../types';
import { RefreshCw, CheckCircle, XCircle, BookOpen, BrainCircuit, Loader2 } from 'lucide-react';

interface ResultsProps {
  exam: Exam;
  user: UserInfo;
  answers: Answers;
  aiResult: AIResult | null;
  isLoading: boolean;
  onReset: () => void;
}

export default function Results({ exam, user, answers, aiResult, isLoading, onReset }: ResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
          <BrainCircuit size={80} className="text-[#2563EB] animate-bounce relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#1E293B] flex items-center justify-center gap-3">
            <Loader2 className="animate-spin" /> Trí tuệ nhân tạo đang chấm điểm...
          </h2>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            Gemini AI đang phân tích bài làm của bạn, đối chiếu kiến thức và chuẩn bị lời giải chi tiết cho từng câu hỏi.
          </p>
        </div>
      </div>
    );
  }

  const getExplanation = (part: number, qId: number) => {
    return aiResult?.explanations.find(e => e.part === part && e.qId === qId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DBEAFE] text-[#2563EB] rounded-full text-[10px] font-bold uppercase tracking-widest">
            KẾT QUẢ ÔN LUYỆN DO AI CHẤM
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">BÁO CÁO CÁ NHÂN</h1>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[#64748B] font-medium">Thí sinh: {user.name}</span>
            <span className="px-3 py-1.5 bg-[#ECFDF5] text-[#059669] rounded-lg border border-[#D1FAE5] font-medium flex items-center gap-1.5">
              <CheckCircle size={14} /> Đúng: {aiResult?.stats.correct}/{aiResult?.stats.total}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center px-8 border-r border-[#E2E8F0]">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1 text-center">ĐIỂM AI</p>
            <p className="text-4xl font-black text-[#2563EB] leading-none">{aiResult?.score || "0.00"}</p>
          </div>
          <button
            onClick={onReset}
            className="btn-clean px-6 py-4 flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <RefreshCw size={18} /> ÔN LUYỆN LẠI
          </button>
        </div>
      </header>

      {aiResult?.generalFeedback && (
        <div className="bg-white border border-[#DBEAFE] p-6 rounded-2xl shadow-sm border-l-8 border-l-[#2563EB]">
           <div className="flex items-start gap-4">
              <div className="p-2 bg-[#F1F5F9] rounded-lg">
                <BrainCircuit className="text-[#2563EB]" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#1E293B] mb-1">Nhận xét từ AI:</h4>
                <p className="text-sm text-[#64748B] leading-relaxed">{aiResult.generalFeedback}</p>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Solution Content (PDF & AI) */}
        <div className="lg:col-span-12 space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-3">
              <BookOpen className="text-[#2563EB]" /> CHI TIẾT CÂU HỎI VÀ LỜI GIẢI AI
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {aiResult?.explanations.map((item, idx) => (
                <div 
                  key={`${item.part}-${item.qId}`}
                  className={`bg-white rounded-2xl border ${item.isCorrect ? 'border-emerald-100' : 'border-rose-100'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className={`px-6 py-3 flex items-center justify-between ${item.isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#1E293B]">Phần {item.part} • Câu {item.qId}</span>
                      {item.isCorrect ? (
                        <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">Đúng</span>
                      ) : (
                        <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">Sai</span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-500 italic">
                      Đáp án đúng: <span className="text-emerald-700 font-bold">{item.correctAnswer}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Giải thích của AI:</p>
                    <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-12 text-center text-[#94A3B8] text-[10px] font-bold uppercase tracking-[0.4em] pb-12">
            Hệ thống ôn luyện thông minh Powered by Gemini 3.1 Pro
          </footer>
        </div>
      </div>
    </div>
  );
}
