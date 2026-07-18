export interface QuizAttempt {
  questionId: string;
  selectedOptions: number[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
  attempts: number;
  score: number;
  timeSpent: number;
}

export interface QuizState {
  quizzes: Record<string, QuizAttempt>;
  totalScore: number;
  maxPossibleScore: number;
}
