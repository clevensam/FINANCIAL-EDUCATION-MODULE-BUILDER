import { type StateCreator } from 'zustand';
import type { Module } from '@/types';

const MAX_HISTORY = 50;
const BATCH_THRESHOLD_MS = 500;

export interface HistorySlice {
  past: Module[];
  future: Module[];
  pushSnapshot: (module: Module) => void;
  undo: (currentModule: Module) => Module | null;
  redo: () => Module | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

let lastBatchBlockId: string | null = null;
let lastBatchTimestamp = 0;

export const createHistorySlice: StateCreator<HistorySlice> = (set, get) => ({
  past: [],
  future: [],

  pushSnapshot: (module) => {
    const state = get();
    const snapshot = structuredClone(module);

    if (lastBatchBlockId && module.blocks.length > 0) {
      const now = Date.now();
      const lastBlock = module.blocks[module.blocks.length - 1];
      if (lastBlock.id === lastBatchBlockId && now - lastBatchTimestamp < BATCH_THRESHOLD_MS) {
        const newPast = [...state.past];
        newPast[newPast.length - 1] = snapshot;
        set({ past: newPast, future: [] });
        lastBatchTimestamp = now;
        return;
      }
    }

    if (module.blocks.length > 0) {
      lastBatchBlockId = module.blocks[module.blocks.length - 1].id;
      lastBatchTimestamp = Date.now();
    }

    const newPast = [...state.past, snapshot];
    if (newPast.length > MAX_HISTORY) {
      newPast.shift();
    }

    set({ past: newPast, future: [] });
  },

  undo: (currentModule) => {
    const state = get();
    if (state.past.length === 0) return null;

    const newPast = [...state.past];
    const restored = newPast.pop()!;

    set({
      past: newPast,
      future: [structuredClone(currentModule), ...state.future].slice(0, MAX_HISTORY),
    });

    return restored;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;

    const newFuture = [...state.future];
    const next = newFuture.shift()!;

    set({
      past: [...state.past, structuredClone(next)],
      future: newFuture,
    });

    return next;
  },

  canUndo: () => get().past.length > 0,

  canRedo: () => get().future.length > 0,
});
