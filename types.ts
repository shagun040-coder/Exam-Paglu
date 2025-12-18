
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  attemptedAt: number;
}

export interface StudyTask {
  id: string;
  day: number;
  label: string;
  description: string;
}

export interface RoadmapResponse {
  id: string;
  title: string;
  summary: string;
  tasks: StudyTask[];
  createdAt: number;
  coverImage?: string; // Base64 image data
}

export interface SubjectProgress {
  completedTaskIds: string[];
  quizResults: Record<string, QuizResult>; // taskId -> result
}

export enum AppRoute {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  QUIZ = 'quiz',
  PLANNER = 'planner',
  ROADMAP = 'roadmap'
}
