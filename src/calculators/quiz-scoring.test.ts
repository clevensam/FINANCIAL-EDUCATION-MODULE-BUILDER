import { describe, it, expect } from 'vitest';
import {
  scoreQuizAnswer,
  quizReducer,
  createInitialQuizEntry,
  type QuizQuestion,
  type QuizAnswer,
} from './quiz-scoring';

function makeMCQ(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    questionId: 'q1',
    options: [
      { id: 'a', text: 'Option A', isCorrect: true, explanation: 'A is correct' },
      { id: 'b', text: 'Option B', isCorrect: false, explanation: 'B is wrong' },
      { id: 'c', text: 'Option C', isCorrect: false, explanation: '' },
    ],
    points: 10,
    attemptLimit: 1,
    feedbackMode: 'immediate',
    timer: null,
    allowMultipleCorrect: false,
    partialCredit: false,
    ...overrides,
  };
}

describe('scoreQuizAnswer', () => {
  it('should score single correct answer correctly', () => {
    const question = makeMCQ();
    const answer: QuizAnswer = { selectedOptions: [0], timeSpent: 10 };
    const result = scoreQuizAnswer(question, answer);
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(10);
    expect(result.correctAnswers).toEqual([0]);
  });

  it('should score wrong answer as 0', () => {
    const question = makeMCQ();
    const answer: QuizAnswer = { selectedOptions: [1], timeSpent: 5 };
    const result = scoreQuizAnswer(question, answer);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it('should handle multi-correct with full credit', () => {
    const question = makeMCQ({
      allowMultipleCorrect: true,
      options: [
        { id: 'a', text: 'A', isCorrect: true, explanation: '' },
        { id: 'b', text: 'B', isCorrect: true, explanation: '' },
        { id: 'c', text: 'C', isCorrect: false, explanation: '' },
      ],
    });
    const answer: QuizAnswer = { selectedOptions: [0, 1], timeSpent: 10 };
    const result = scoreQuizAnswer(question, answer);
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(10);
  });

  it('should handle multi-correct with partial credit', () => {
    const question = makeMCQ({
      allowMultipleCorrect: true,
      partialCredit: true,
      options: [
        { id: 'a', text: 'A', isCorrect: true, explanation: '' },
        { id: 'b', text: 'B', isCorrect: true, explanation: '' },
        { id: 'c', text: 'C', isCorrect: false, explanation: '' },
      ],
    });
    const answer: QuizAnswer = { selectedOptions: [0], timeSpent: 10 };
    const result = scoreQuizAnswer(question, answer);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(5);
  });

  it('should give 0 for wrong answer in multi-correct', () => {
    const question = makeMCQ({
      allowMultipleCorrect: true,
      options: [
        { id: 'a', text: 'A', isCorrect: true, explanation: '' },
        { id: 'b', text: 'B', isCorrect: true, explanation: '' },
        { id: 'c', text: 'C', isCorrect: false, explanation: '' },
      ],
    });
    const answer: QuizAnswer = { selectedOptions: [2], timeSpent: 5 };
    const result = scoreQuizAnswer(question, answer);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it('should handle true/false question (single correct)', () => {
    const question = makeMCQ({
      options: [
        { id: 'true', text: 'True', isCorrect: true, explanation: 'Correct' },
        { id: 'false', text: 'False', isCorrect: false, explanation: '' },
      ],
    });
    const correct: QuizAnswer = { selectedOptions: [0], timeSpent: 5 };
    expect(scoreQuizAnswer(question, correct).isCorrect).toBe(true);

    const incorrect: QuizAnswer = { selectedOptions: [1], timeSpent: 5 };
    expect(scoreQuizAnswer(question, incorrect).isCorrect).toBe(false);
  });

  it('should return feedback for each option', () => {
    const question = makeMCQ();
    const answer: QuizAnswer = { selectedOptions: [1], timeSpent: 5 };
    const result = scoreQuizAnswer(question, answer);
    expect(result.feedback).toHaveLength(3);
    expect(result.feedback[0].isCorrect).toBe(true);
    expect(result.feedback[1].explanation).toBe('B is wrong');
  });

  it('should handle 0 points question', () => {
    const question = makeMCQ({ points: 0 });
    const answer: QuizAnswer = { selectedOptions: [0], timeSpent: 5 };
    const result = scoreQuizAnswer(question, answer);
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(0);
  });
});

describe('createInitialQuizEntry', () => {
  it('should create empty entry with max score', () => {
    const entry = createInitialQuizEntry(10);
    expect(entry.maxScore).toBe(10);
    expect(entry.selectedOptions).toEqual([]);
    expect(entry.isSubmitted).toBe(false);
    expect(entry.attempts).toBe(0);
  });
});

describe('quizReducer', () => {
  it('should handle SELECT_OPTION for single select', () => {
    const state = createInitialQuizEntry(10);
    const next = quizReducer(state, { type: 'SELECT_OPTION', questionId: 'q1', optionIndex: 0 });
    expect(next.selectedOptions).toEqual([0]);
  });

  it('should deselect already selected option', () => {
    const state = { ...createInitialQuizEntry(10), selectedOptions: [0] };
    const next = quizReducer(state, { type: 'SELECT_OPTION', questionId: 'q1', optionIndex: 0 });
    expect(next.selectedOptions).toEqual([]);
  });

  it('should handle SUBMIT', () => {
    const state = createInitialQuizEntry(10);
    const next = quizReducer(state, { type: 'SUBMIT', questionId: 'q1' });
    expect(next.isSubmitted).toBe(true);
    expect(next.attempts).toBe(1);
  });

  it('should not increment attempts on re-submit', () => {
    const state = { ...createInitialQuizEntry(10), isSubmitted: true, attempts: 1 };
    const next = quizReducer(state, { type: 'SUBMIT', questionId: 'q1' });
    expect(next.attempts).toBe(1);
  });

  it('should handle RESET', () => {
    const state = {
      ...createInitialQuizEntry(10),
      selectedOptions: [0],
      isSubmitted: true,
      attempts: 1,
      result: {
        isCorrect: true,
        score: 10,
        maxScore: 10,
        correctAnswers: [0],
        explanation: '',
        feedback: [],
      },
    };
    const next = quizReducer(state, { type: 'RESET', questionId: 'q1' });
    expect(next.selectedOptions).toEqual([]);
    expect(next.isSubmitted).toBe(false);
    expect(next.isCorrect).toBeNull();
    expect(next.result).toBeNull();
  });

  it('should handle TICK incrementing time', () => {
    const state = { ...createInitialQuizEntry(10), timeSpent: 5 };
    const next = quizReducer(state, { type: 'TICK', questionId: 'q1' });
    expect(next.timeSpent).toBe(6);
  });

  it('should not change submitted state on SELECT_OPTION', () => {
    const state = { ...createInitialQuizEntry(10), isSubmitted: true };
    const next = quizReducer(state, { type: 'SELECT_OPTION', questionId: 'q1', optionIndex: 0 });
    expect(next.selectedOptions).toEqual([]);
  });

  it('should handle unknown action by returning state', () => {
    const state = createInitialQuizEntry(10);
    const next = quizReducer(state, { type: 'TICK', questionId: 'q1' });
    expect(next.timeSpent).toBe(1);
  });
});
