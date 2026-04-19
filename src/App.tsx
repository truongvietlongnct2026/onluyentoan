/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInfo, ViewState, Exam, Answers, AIResult } from './types';
import Login from './components/Login';
import ExamList from './components/ExamList';
import ExamRoom from './components/ExamRoom';
import Results from './components/Results';
import { gradeExamWithAI } from './services/geminiService';
import { fetchExamsFromDrive } from './services/driveService';

export default function App() {
  const [view, setView] = useState<ViewState>('login');
  const [user, setUser] = useState<UserInfo>({ name: '', className: '', school: '' });
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [answers, setAnswers] = useState<Answers>({ part1: {}, part2: {}, part3: {} });
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  // Dynamic fetch from Drive
  const loadExams = async () => {
    setIsLoadingExams(true);
    const data = await fetchExamsFromDrive();
    setExams(data);
    setIsLoadingExams(false);
  };

  // Auto-refresh when view changes to 'select'
  useEffect(() => {
    if (view === 'select') {
      loadExams();
    }
  }, [view]);

  // Periodic refresh every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (view === 'select') {
        loadExams();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [view]);

  const handleRefresh = () => {
    loadExams();
  };

  const handleLogin = (info: UserInfo) => {
    setUser(info);
    setView('select');
  };

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setAnswers({ part1: {}, part2: {}, part3: {} });
    setAiResult(null);
    setView('exam');
  };

  const handleSubmit = async (finalAnswers: Answers) => {
    if (!selectedExam) return;
    
    setAnswers(finalAnswers);
    setIsLoadingAI(true);
    setView('results');

    try {
      const result = await gradeExamWithAI(selectedExam, finalAnswers);
      setAiResult(result);
    } catch (error) {
      console.error(error);
      // Fallback or error handled in Results.tsx via null state
    } finally {
      setIsLoadingAI(false);
    }
  };

  const resetToSelect = () => {
    setView('select');
    setSelectedExam(null);
    setAiResult(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1E293B] font-sans">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        )}

        {view === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto py-12 px-4"
          >
            <ExamList 
              exams={exams} 
              onSelect={handleSelectExam} 
              user={user} 
              isLoading={isLoadingExams} 
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}

        {view === 'exam' && selectedExam && (
          <motion.div
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col"
          >
            <ExamRoom
              exam={selectedExam}
              user={user}
              onBack={() => setView('select')}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}

        {view === 'results' && selectedExam && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto py-12 px-4"
          >
            <Results
              exam={selectedExam}
              user={user}
              answers={answers}
              aiResult={aiResult}
              isLoading={isLoadingAI}
              onReset={resetToSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

