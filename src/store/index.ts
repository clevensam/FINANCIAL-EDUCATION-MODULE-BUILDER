import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createEditorSlice, type EditorSlice } from './editor-slice';
import { createUISlice, type UISlice } from './ui-slice';
import { createQuizSlice, type QuizSlice } from './quiz-slice';
import { createHistorySlice, type HistorySlice } from './history-slice';

export type AppStore = EditorSlice & UISlice & QuizSlice & HistorySlice;

export const useStore = create<AppStore>()(
  immer((...a) => ({
    ...createEditorSlice(...a),
    ...createUISlice(...a),
    ...createQuizSlice(...a),
    ...createHistorySlice(...a),
  })),
);

export { createEditorSlice } from './editor-slice';
export { createUISlice } from './ui-slice';
export { createQuizSlice } from './quiz-slice';
export { createHistorySlice } from './history-slice';

export type { EditorSlice } from './editor-slice';
export type { UISlice, DeviceView, ThemeMode } from './ui-slice';
export type { QuizSlice } from './quiz-slice';
export type { HistorySlice } from './history-slice';
