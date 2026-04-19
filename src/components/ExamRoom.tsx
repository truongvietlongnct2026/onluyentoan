import { useState, useEffect, useMemo } from 'react';
import { Exam, UserInfo, Answers } from '../types';
import { Clock, Send, ChevronLeft, Lightbulb, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHintFromAI } from '../services/geminiService';

interface ExamRoomProps {
  exam: Exam;
  user: UserInfo;
  onBack: () => void;
  onSubmit: (answers: Answers) => void;
}

export default function ExamRoom({ exam, user, onBack, onSubmit }: ExamRoomProps) {
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [answers, setAnswers] = useState<Answers>({
    part1: {},
    part2: { 1: [], 2: [], 3: [], 4: [] },
    part3: {}
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [loadingHint, setLoadingHint] = useState<string | null>(null);
  const [activeHint, setActiveHint] = useState<{ part: number, qId: number } | null>(null);

  // Calculate progress
  const answeredCount = useMemo(() => {
    let count = Object.values(answers.part1).filter(v => !!v).length;
    Object.values(answers.part2).forEach((v: any) => { 
      if (Array.isArray(v) && v.filter(val => val !== undefined).length > 0) count++; 
    });
    count += Object.values(answers.part3).filter(v => !!v).length;
    return count;
  }, [answers]);

  const totalQuestions = 22;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFetchHint = async (part: number, qId: number) => {
    const key = `${part}-${qId}`;
    if (hints[key]) {
      setActiveHint({ part, qId });
      return;
    }

    setLoadingHint(key);
    try {
      const hint = await getHintFromAI(exam.name, part, qId);
      setHints(prev => ({ ...prev, [key]: hint }));
      setActiveHint({ part, qId });
    } finally {
      setLoadingHint(null);
    }
  };

  const handlePart1Change = (qId: number, val: string) => {
    setAnswers(prev => ({
      ...prev,
      part1: { ...prev.part1, [qId]: val }
    }));
  };

  const handlePart2Change = (qId: number, optionIdx: number, val: boolean) => {
    setAnswers(prev => {
      const current = prev.part2[qId] || [false, false, false, false];
      const next = [...current];
      next[optionIdx] = val;
      return {
        ...prev,
        part2: { ...prev.part2, [qId]: next }
      };
    });
  };

  const handlePart3Change = (qId: number, val: string) => {
    setAnswers(prev => ({
      ...prev,
      part3: { ...prev.part3, [qId]: val }
    }));
  };

  const handleSubmit = () => {
    // Chuyển trực tiếp sang kết quả để tránh lỗi chặn popup/confirm trong môi trường iframe
    onSubmit(answers);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] relative">
      {/* Sidebar Toggle Button (Floating) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-6 right-6 z-50 w-12 h-12 bg-[#2563EB] text-white rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 lg:flex hidden ${isSidebarOpen ? 'translate-x-[calc(-480px-24px)]' : ''}`}
      >
        <div className={`transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`}>
           <ChevronLeft size={24} />
        </div>
      </button>

      {/* Sidebar / Left Pane: Exam PDF */}
      <div className="flex-1 border-r border-[#E2E8F0] relative bg-white transition-all duration-500">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center hover:bg-[#F1F5F9] transition-colors shadow-sm"
          >
            <ChevronLeft size={20} className="text-[#64748B]" />
          </button>
          <div className="bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-[#1E293B] uppercase tracking-tight">
            NỘI DUNG ĐỀ THI • {exam.name}
          </div>
        </div>

        {/* Floating Progress Pill */}
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 right-6 z-20 bg-[#1E293B] text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-6"
          >
            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
              <Clock size={16} className="text-[#2563EB]" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="text-[10px] font-bold text-[#94A3B8] uppercase">Tiến độ</div>
               <div className="font-black text-[#2563EB]">{answeredCount}/{22}</div>
            </div>
          </motion.div>
        )}
        
        <iframe
          src={`https://drive.google.com/file/d/${exam.driveId}/preview`}
          className="w-full h-full pt-20"
          allow="autoplay"
          title="Exam PDF"
        />
      </div>

      {/* Right Pane: Answer Sheet */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? '480px' : '0px' }}
        className="relative flex flex-col h-full bg-white border-l border-[#E2E8F0] overflow-hidden"
      >
        <div className="w-[480px] h-full flex flex-col">
          <div className="flex-1 p-8 space-y-10 pb-32 overflow-y-auto overflow-x-hidden">
            {/* Header Info */}
            <div className="flex justify-between items-start border-b border-[#F1F5F9] pb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Thí sinh dự thi</p>
                <p className="font-bold text-lg text-[#1E293B]">{user.name}</p>
                <p className="text-xs text-[#64748B] font-medium">{user.className} • {user.school}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Mã đề</p>
                <p className="text-lg font-black text-[#2563EB]">{exam.name.split(' ').pop()}</p>
              </div>
            </div>

            {/* Clock & Progress Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E293B] rounded-2xl p-4 flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#2563EB] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-60 mb-1 z-10">Thời gian còn lại</p>
                <p className="text-xl font-mono font-bold z-10">{formatTime(timeLeft)}</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center justify-center text-[#1E293B] shadow-sm">
                <p className="text-[9px] uppercase font-bold tracking-widest text-[#94A3B8] mb-1">Đã hoàn thành</p>
                <p className="text-xl font-black text-[#2563EB]">{answeredCount}/{22}</p>
              </div>
            </div>

          {/* Part 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-[#2563EB] rounded-full"></div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#1E293B]">Phần I. Trắc nghiệm</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => {
                const qId = i + 1;
                const isLoading = loadingHint === `1-${qId}`;
                return (
                  <div key={qId} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex flex-col items-center gap-2 relative group">
                    <button 
                      onClick={() => handleFetchHint(1, qId)}
                      disabled={!!loadingHint}
                      className="absolute top-1 right-1 p-1 text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                      title="Gợi ý từ AI"
                    >
                      {isLoading ? <Loader2 size={10} className="animate-spin" /> : <Lightbulb size={12} />}
                    </button>
                    <span className="text-[10px] font-bold text-[#64748B]">{qId}</span>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handlePart1Change(qId, opt)}
                          className={`w-7 h-7 text-[10px] font-bold rounded-lg border transition-all ${
                            answers.part1[qId] === opt
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-100'
                              : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Part 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-[#2563EB] rounded-full"></div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#1E293B]">Phần II. Đúng Sai</h2>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => {
                const qId = i + 1;
                const isLoading = loadingHint === `2-${qId}`;
                return (
                  <div key={qId} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl relative">
                    <button 
                      onClick={() => handleFetchHint(2, qId)}
                      disabled={!!loadingHint}
                      className="absolute top-2 right-2 p-1 text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                      title="Gợi ý từ AI"
                    >
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={14} />}
                    </button>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-[#1E293B] uppercase">Câu hỏi số {qId}</span>
                      <div className="flex gap-10 text-[9px] font-bold text-gray-400 mr-8">
                        <span>ĐÚNG</span>
                        <span>SAI</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      {['a', 'b', 'c', 'd'].map((sub, idx) => (
                        <div key={sub} className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#64748B] italic">{sub})</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePart2Change(qId, idx, true)}
                              className={`w-12 h-7 rounded-lg border text-[10px] font-bold transition-all ${
                                answers.part2[qId]?.[idx] === true
                                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                  : 'bg-white border-[#E2E8F0] text-[#64748B]'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              onClick={() => handlePart2Change(qId, idx, false)}
                              className={`w-12 h-7 rounded-lg border text-[10px] font-bold transition-all ${
                                answers.part2[qId]?.[idx] === false
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'bg-white border-[#E2E8F0] text-[#64748B]'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Part 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-[#2563EB] rounded-full"></div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#1E293B]">Phần III. Trả lời ngắn</h2>
            </div>
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => {
                const qId = i + 1;
                const isLoading = loadingHint === `3-${qId}`;
                return (
                  <div key={qId} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl flex items-center gap-4 relative">
                    <button 
                      onClick={() => handleFetchHint(3, qId)}
                      disabled={!!loadingHint}
                      className="absolute top-2 right-2 p-1 text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                      title="Gợi ý từ AI"
                    >
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={14} />}
                    </button>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase w-12">Câu {qId}</span>
                    <input
                      type="text"
                      className="flex-1 text-sm bg-transparent border-b border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none py-1 font-medium text-[#1E293B] mr-6"
                      placeholder="Nhập đáp án của bạn..."
                      value={answers.part3[qId] || ''}
                      onChange={(e) => handlePart3Change(qId, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-white border-t border-[#E2E8F0] mt-auto">
          <button
            onClick={handleSubmit}
            className="w-full btn-clean py-4 text-base shadow-lg shadow-blue-100 flex items-center justify-center gap-3"
          >
            Nộp bài thi <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>

      {/* Hint Modal Overlay (Global) */}
      <AnimatePresence>
        {activeHint && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-[#F9FAFB]/95 backdrop-blur-sm p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center text-[#2563EB]">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E293B]">Gợi ý từ AI</h3>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Phần {activeHint.part} • Câu {activeHint.qId}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveHint(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                {hints[`${activeHint.part}-${activeHint.qId}`]}
              </p>
            </div>
            
            <div className="mt-6 text-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
              💡 Gợi ý này giúp bạn nắm phương pháp, hãy thử tự tư duy tiếp nhé!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
