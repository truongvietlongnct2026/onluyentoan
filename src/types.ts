export type ViewState = 'login' | 'select' | 'exam' | 'results';

export interface UserInfo {
  name: string;
  className: string;
  school: string;
}

export type QuestionType = 'TRAC_NGHIEM' | 'DUNG_SAI' | 'TRA_LOI_NGAN';

export interface Question {
  id: number;
  type: QuestionType;
  label: string;
}

export interface Exam {
  id: string;
  name: string;
  driveId: string;
}

export interface Answers {
  part1: Record<number, string>; // { 1: 'A', 2: 'B' ... }
  part2: Record<number, boolean[]>; // { 1: [true, false, true, false] ... }
  part3: Record<number, string>; // { 1: '12.5', 2: '36' ... }
}

export interface AIExplanation {
  qId: number;
  part: number;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface AIResult {
  score: string;
  stats: {
    total: number;
    correct: number;
  };
  explanations: AIExplanation[];
  generalFeedback: string;
}
