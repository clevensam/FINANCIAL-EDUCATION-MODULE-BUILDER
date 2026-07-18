export interface QuizQuestion {
  questionId: string;
  options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
  points: number;
  attemptLimit: number;
  feedbackMode: 'immediate' | 'deferred';
  timer: number | null;
  allowMultipleCorrect: boolean;
  partialCredit: boolean;
}

export interface QuizAnswer {
  selectedOptions: number[];
  timeSpent: number;
}

export interface QuizResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  correctAnswers: number[];
  explanation: string;
  feedback: { optionIndex: number; isCorrect: boolean; explanation: string }[];
}

export type QuizAction =
  | { type: 'SELECT_OPTION'; questionId: string; optionIndex: number }
  | { type: 'SUBMIT'; questionId: string; answer: QuizAnswer }
  | { type: 'RESET'; questionId: string }
  | { type: 'TICK'; questionId: string };

export interface QuizStateEntry {
  selectedOptions: number[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
  attempts: number;
  score: number;
  maxScore: number;
  timeSpent: number;
  result: QuizResult | null;
}

export function createInitialQuizEntry(maxScore: number): QuizStateEntry {
  return {
    selectedOptions: [],
    isSubmitted: false,
    isCorrect: null,
    attempts: 0,
    score: 0,
    maxScore,
    timeSpent: 0,
    result: null,
  };
}

export function scoreQuizAnswer(question: QuizQuestion, answer: QuizAnswer): QuizResult {
  const correctIndices = question.options
    .map((opt, idx) => (opt.isCorrect ? idx : -1))
    .filter((idx) => idx >= 0);

  const feedback = question.options.map((opt, idx) => ({
    optionIndex: idx,
    isCorrect: opt.isCorrect,
    explanation: opt.explanation,
  }));

  if (question.allowMultipleCorrect) {
    const selectedSet = new Set(answer.selectedOptions);
    const correctSet = new Set(correctIndices);

    let correctCount = 0;
    let wrongCount = 0;

    for (const idx of answer.selectedOptions) {
      if (correctSet.has(idx)) correctCount++;
      else wrongCount++;
    }

    const allCorrectSelected = [...correctSet].every((idx) => selectedSet.has(idx));
    const noExtraSelected = wrongCount === 0;
    const fullyCorrect = allCorrectSelected && noExtraSelected;

    let score: number;
    let isCorrect: boolean;

    if (question.partialCredit) {
      const totalCorrect = correctSet.size;
      const correctlyChosen = Math.max(0, correctCount - wrongCount);
      score = totalCorrect > 0 ? Math.round((correctlyChosen / totalCorrect) * question.points) : 0;
      isCorrect = fullyCorrect;
    } else {
      score = fullyCorrect ? question.points : 0;
      isCorrect = fullyCorrect;
    }

    return {
      isCorrect,
      score,
      maxScore: question.points,
      correctAnswers: correctIndices,
      explanation: '',
      feedback,
    };
  }

  const selected = answer.selectedOptions[0];
  const isCorrect = correctIndices.includes(selected);
  const explanation = isCorrect ? '' : (question.options[selected]?.explanation ?? '');

  return {
    isCorrect,
    score: isCorrect ? question.points : 0,
    maxScore: question.points,
    correctAnswers: correctIndices,
    explanation,
    feedback,
  };
}

export function quizReducer(state: QuizStateEntry, action: QuizAction): QuizStateEntry {
  switch (action.type) {
    case 'SELECT_OPTION':
      if (state.isSubmitted) return state;
      return {
        ...state,
        selectedOptions: state.selectedOptions.includes(action.optionIndex)
          ? state.selectedOptions.filter((i) => i !== action.optionIndex)
          : [...state.selectedOptions, action.optionIndex],
      };

    case 'SUBMIT':
      if (state.isSubmitted) return state;
      return {
        ...state,
        isSubmitted: true,
        attempts: state.attempts + 1,
      };

    case 'RESET':
      return {
        ...state,
        selectedOptions: [],
        isSubmitted: false,
        isCorrect: null,
        result: null,
      };

    case 'TICK':
      return {
        ...state,
        timeSpent: state.timeSpent + 1,
      };

    default:
      return state;
  }
}
