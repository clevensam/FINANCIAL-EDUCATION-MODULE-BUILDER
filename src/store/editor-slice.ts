import { type StateCreator } from 'zustand';
import { type Block, type BlockContent, BlockType, type Module, type QuizConfig } from '@/types';
import { createBlock } from '@/lib/block-factory';
import { generateUUIDv4 } from '@/lib/uuid';
import type { HistorySlice } from './history-slice';

type EditorHistorySlice = EditorSlice & HistorySlice;

export interface EditorSlice {
  module: Module;
  selectedBlockId: string | null;
  isDirty: boolean;

  setModuleTitle: (title: string) => void;
  setModuleDescription: (description: string) => void;
  selectBlock: (id: string | null) => void;
  addBlock: (type: BlockType, afterId?: string) => void;
  addBlockAtPosition: (type: BlockType, position: number) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  reorderBlock: (id: string, newOrder: number) => void;
  updateBlockContent: (id: string, content: BlockContent) => void;
  updateBlockSettings: (id: string, settings: Partial<Block['settings']>) => void;
  toggleBlockLock: (id: string) => void;
  toggleBlockVisibility: (id: string) => void;
  updateQuizConfig: (config: Partial<QuizConfig>) => void;
  setModule: (module: Module) => void;
}

export const createEditorSlice: StateCreator<EditorHistorySlice, [], [], EditorSlice> = (
  set,
  get,
) => ({
  module: {
    moduleId: generateUUIDv4(),
    title: 'Untitled Module',
    description: '',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: '', name: '' },
    metadata: {
      estimatedDuration: 15,
      difficulty: 'beginner',
      tags: [],
      thumbnail: '',
    },
    blocks: [],
    quizConfig: {
      feedbackMode: 'immediate',
      passingScore: 60,
      showScoreOnCompletion: true,
    },
  },
  selectedBlockId: null,
  isDirty: false,

  setModuleTitle: (title) => {
    get().pushSnapshot(get().module);
    set((state) => ({
      module: { ...state.module, title, updatedAt: new Date().toISOString() },
      isDirty: true,
    }));
  },

  setModuleDescription: (description) => {
    get().pushSnapshot(get().module);
    set((state) => ({
      module: { ...state.module, description, updatedAt: new Date().toISOString() },
      isDirty: true,
    }));
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  addBlock: (type, afterId) => {
    get().pushSnapshot(get().module);
    set((state) => {
      const blocks = [...state.module.blocks];
      let newOrder: number;

      if (afterId) {
        const afterIndex = blocks.findIndex((b) => b.id === afterId);
        newOrder = afterIndex >= 0 ? blocks[afterIndex].order + 1 : blocks.length;
      } else {
        newOrder = blocks.length;
      }

      const newBlock = createBlock(type, newOrder);

      blocks.splice(newOrder, 0, newBlock);

      const reordered = blocks.map((b, i) => ({ ...b, order: i }));

      return {
        module: { ...state.module, blocks: reordered, updatedAt: new Date().toISOString() },
        selectedBlockId: newBlock.id,
        isDirty: true,
      };
    });
  },

  addBlockAtPosition: (type, position) => {
    get().pushSnapshot(get().module);
    set((state) => {
      const blocks = [...state.module.blocks];
      const newBlock = createBlock(type, position);
      blocks.splice(position, 0, newBlock);
      const reordered = blocks.map((b, i) => ({ ...b, order: i }));

      return {
        module: { ...state.module, blocks: reordered, updatedAt: new Date().toISOString() },
        selectedBlockId: newBlock.id,
        isDirty: true,
      };
    });
  },

  removeBlock: (id) => {
    get().pushSnapshot(get().module);
    set((state) => {
      const blocks = state.module.blocks
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, order: i }));

      return {
        module: { ...state.module, blocks, updatedAt: new Date().toISOString() },
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
        isDirty: true,
      };
    });
  },

  duplicateBlock: (id) => {
    get().pushSnapshot(get().module);

    const source = get().module.blocks.find((b) => b.id === id);
    if (!source) return;

    const newBlock: Block = {
      ...source,
      id: generateUUIDv4(),
      order: source.order + 1,
      content: structuredClone(source.content),
    };

    set((state) => {
      const blocks = [...state.module.blocks];
      blocks.splice(newBlock.order, 0, newBlock);
      const reordered = blocks.map((b, i) => ({ ...b, order: i }));

      return {
        module: { ...state.module, blocks: reordered, updatedAt: new Date().toISOString() },
        selectedBlockId: newBlock.id,
        isDirty: true,
      };
    });
  },

  moveBlock: (id, direction) => {
    get().pushSnapshot(get().module);
    set((state) => {
      const blocks = [...state.module.blocks];
      const index = blocks.findIndex((b) => b.id === id);
      if (index < 0) return state;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return state;

      [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
      const reordered = blocks.map((b, i) => ({ ...b, order: i }));

      return {
        module: { ...state.module, blocks: reordered, updatedAt: new Date().toISOString() },
        isDirty: true,
      };
    });
  },

  reorderBlock: (id, newOrder) => {
    get().pushSnapshot(get().module);
    set((state) => {
      const blocks = [...state.module.blocks];
      const index = blocks.findIndex((b) => b.id === id);
      if (index < 0) return state;

      const [block] = blocks.splice(index, 1);
      blocks.splice(newOrder, 0, block);
      const reordered = blocks.map((b, i) => ({ ...b, order: i }));

      return {
        module: { ...state.module, blocks: reordered, updatedAt: new Date().toISOString() },
        isDirty: true,
      };
    });
  },

  updateBlockContent: (id, content) => {
    get().pushSnapshot(get().module);
    set((state) => ({
      module: {
        ...state.module,
        blocks: state.module.blocks.map((b) => (b.id === id ? { ...b, content } : b)),
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },

  updateBlockSettings: (id, settings) => {
    get().pushSnapshot(get().module);
    set((state) => ({
      module: {
        ...state.module,
        blocks: state.module.blocks.map((b) =>
          b.id === id ? { ...b, settings: { ...b.settings, ...settings } } : b,
        ),
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },

  toggleBlockLock: (id) => {
    get().pushSnapshot(get().module);
    set((state) => ({
      module: {
        ...state.module,
        blocks: state.module.blocks.map((b) =>
          b.id === id ? { ...b, settings: { ...b.settings, isLocked: !b.settings.isLocked } } : b,
        ),
      },
      isDirty: true,
    }));
  },

  toggleBlockVisibility: (id) => {
    get().pushSnapshot(get().module);
    set((state) => ({
      module: {
        ...state.module,
        blocks: state.module.blocks.map((b) =>
          b.id === id ? { ...b, settings: { ...b.settings, isVisible: !b.settings.isVisible } } : b,
        ),
      },
      isDirty: true,
    }));
  },

  updateQuizConfig: (config) => {
    get().pushSnapshot(get().module);
    set((state) => ({
      module: {
        ...state.module,
        quizConfig: { ...state.module.quizConfig, ...config },
      },
      isDirty: true,
    }));
  },

  setModule: (module) => set({ module, isDirty: false }),
});
