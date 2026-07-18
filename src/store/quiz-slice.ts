import { type StateCreator } from 'zustand';
import type { QuizState } from '@/types/quiz';

export interface QuizSlice extends QuizState {
  initQuiz: (questionId: string) => void;
  selectOption: (questionId: string, optionIndex: number, allowMultiple: boolean) => void;
  submitQuiz: (questionId: string) => void;
  resetQuiz: (questionId: string) => void;
  resetAllQuizzes: () => void;
  setTimeSpent: (questionId: string, time: number) => void;
}

export const createQuizSlice: StateCreator<QuizSlice> = (set, _get) => ({
  quizzes: {},
  totalScore: 0,
  maxPossibleScore: 0,

  initQuiz: (questionId) =>
    set((state) => ({
      quizzes: {
        ...state.quizzes,
        [questionId]: {
          questionId,
          selectedOptions: [],
          isSubmitted: false,
          isCorrect: null,
          attempts: 0,
          score: 0,
          timeSpent: 0,
        },
      },
    })),

  selectOption: (questionId, optionIndex, allowMultiple) =>
    set((state) => {
      const quiz = state.quizzes[questionId];
      if (!quiz || quiz.isSubmitted) return state;

      let selectedOptions: number[];
      if (allowMultiple) {
        selectedOptions = quiz.selectedOptions.includes(optionIndex)
          ? quiz.selectedOptions.filter((i) => i !== optionIndex)
          : [...quiz.selectedOptions, optionIndex];
      } else {
        selectedOptions = [optionIndex];
      }

      return {
        quizzes: {
          ...state.quizzes,
          [questionId]: { ...quiz, selectedOptions },
        },
      };
    }),

  submitQuiz: (questionId) =>
    set((state) => {
      const quiz = state.quizzes[questionId];
      if (!quiz || quiz.isSubmitted) return state;

      return {
        quizzes: {
          ...state.quizzes,
          [questionId]: {
            ...quiz,
            isSubmitted: true,
            attempts: quiz.attempts + 1,
          },
        },
      };
    }),

  resetQuiz: (questionId) =>
    set((state) => {
      const quiz = state.quizzes[questionId];
      if (!quiz) return state;

      return {
        quizzes: {
          ...state.quizzes,
          [questionId]: { ...quiz, selectedOptions: [], isSubmitted: false, isCorrect: null },
        },
      };
    }),

  resetAllQuizzes: () => set({ quizzes: {}, totalScore: 0, maxPossibleScore: 0 }),

  setTimeSpent: (questionId, time) =>
    set((state) => {
      const quiz = state.quizzes[questionId];
      if (!quiz) return state;

      return {
        quizzes: {
          ...state.quizzes,
          [questionId]: { ...quiz, timeSpent: time },
        },
      };
    }),
});
