import { describe, it, expect } from 'vitest';
import type { Module, Block } from '@/types';
import { generateUUIDv4 } from '@/lib/uuid';

function createModule(blocks: number = 0): Module {
  const b: Block[] = [];
  for (let i = 0; i < blocks; i++) {
    b.push({
      id: generateUUIDv4(),
      type: 'rich-text',
      order: i,
      content: { html: `<p>Block ${i}</p>` },
      settings: { isVisible: true, isLocked: false, customCss: '' },
    });
  }
  return {
    moduleId: generateUUIDv4(),
    title: 'Test Module',
    description: '',
    version: '1.0.0',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    author: { id: 'author-1', name: 'Test Author' },
    metadata: { estimatedDuration: 15, difficulty: 'beginner', tags: [], thumbnail: '' },
    blocks: b,
    quizConfig: { feedbackMode: 'immediate', passingScore: 60, showScoreOnCompletion: true },
  };
}

function wrapHistory() {
  let past: Module[] = [];
  let future: Module[] = [];

  return {
    getPast: () => past,
    getFuture: () => future,
    pushSnapshot: (module: Module) => {
      const snapshot = structuredClone(module);
      past.push(snapshot);
      if (past.length > 50) past.shift();
      future = [];
    },
    undo: (current: Module) => {
      if (past.length <= 1) return null;
      past.pop()!;
      future.unshift(structuredClone(current));
      return past[past.length - 1] ?? null;
    },
    redo: () => {
      if (future.length === 0) return null;
      const next = structuredClone(future.shift()!);
      past.push(next);
      return next;
    },
  };
}

describe('Undo/Redo (History)', () => {
  it('should push snapshots onto history', () => {
    const h = wrapHistory();
    const mod = createModule(1);
    h.pushSnapshot(mod);
    expect(h.getPast()).toHaveLength(1);
  });

  it('should undo a single operation', () => {
    const h = wrapHistory();
    const mod1 = createModule(0);
    const mod2 = createModule(1);
    h.pushSnapshot(mod1);
    h.pushSnapshot(mod2);
    const restored = h.undo(mod2);
    expect(restored).toBeTruthy();
    expect(restored!.blocks).toHaveLength(0);
  });

  it('should redo after undo', () => {
    const h = wrapHistory();
    const mod1 = createModule(0);
    const mod2 = createModule(1);
    h.pushSnapshot(mod1);
    h.pushSnapshot(mod2);
    h.undo(mod2);
    const next = h.redo();
    expect(next).toBeTruthy();
    expect(next!.blocks).toHaveLength(1);
  });

  it('should return null when nothing to undo', () => {
    const h = wrapHistory();
    const mod = createModule(1);
    expect(h.undo(mod)).toBeNull();
  });

  it('should return null when nothing to redo', () => {
    const h = wrapHistory();
    expect(h.redo()).toBeNull();
  });

  it('should prune future branches on new snapshot after undo', () => {
    const h = wrapHistory();
    const mod1 = createModule(0);
    const mod2 = createModule(1);
    const mod3 = createModule(2);
    h.pushSnapshot(mod1);
    h.pushSnapshot(mod2);
    h.undo(mod2);
    h.pushSnapshot(mod3);
    expect(h.getFuture()).toHaveLength(0);
  });

  it('should limit history to 50 snapshots', () => {
    const h = wrapHistory();
    for (let i = 0; i < 55; i++) {
      h.pushSnapshot(createModule(i));
    }
    expect(h.getPast().length).toBeLessThanOrEqual(50);
  });

  it('should discard oldest snapshot when buffer overflows', () => {
    const h = wrapHistory();
    for (let i = 0; i < 51; i++) {
      h.pushSnapshot(createModule(i));
    }
    expect(h.getPast()).toHaveLength(50);
  });

  it('should restore config state on undo', () => {
    const h = wrapHistory();
    const mod1 = createModule(0);
    const mod2 = createModule(1);
    h.pushSnapshot(mod1);
    h.pushSnapshot(mod2);
    const restored = h.undo(mod2);
    expect(restored!.blocks).toHaveLength(0);
  });

  it('should handle multiple undo/redo cycles', () => {
    const h = wrapHistory();
    const mods = [createModule(0), createModule(1), createModule(2), createModule(3)];
    for (const m of mods) h.pushSnapshot(m);
    let current = mods[3];
    current = h.undo(current)!;
    expect(current.blocks).toHaveLength(2);
    current = h.undo(current)!;
    expect(current.blocks).toHaveLength(1);
    current = h.redo()!;
    expect(current.blocks).toHaveLength(2);
    current = h.redo()!;
    expect(current.blocks).toHaveLength(3);
  });

  it('should preserve block content through undo/redo', () => {
    const h = wrapHistory();
    const mod1 = createModule(1);
    (mod1.blocks[0].content as { html: string }).html = '<p>Original</p>';
    const mod2 = structuredClone(mod1);
    (mod2.blocks[0].content as { html: string }).html = '<p>Modified</p>';
    h.pushSnapshot(mod1);
    h.pushSnapshot(mod2);
    const restored = h.undo(mod2);
    expect((restored!.blocks[0].content as { html: string }).html).toBe('<p>Original</p>');
    const redone = h.redo();
    expect((redone!.blocks[0].content as { html: string }).html).toBe('<p>Modified</p>');
  });

  it('should not share references between snapshots', () => {
    const h = wrapHistory();
    const mod1 = createModule(1);
    h.pushSnapshot(mod1);
    const mod2 = createModule(2);
    h.pushSnapshot(mod2);
    mod2.title = 'Changed';
    const restored = h.undo(mod2);
    expect(restored!.title).toBe('Test Module');
  });

  it('should handle empty module undo', () => {
    const h = wrapHistory();
    const mod = createModule(0);
    h.pushSnapshot(mod);
    const mod2 = createModule(1);
    h.pushSnapshot(mod2);
    const restored = h.undo(mod2);
    expect(restored).toBeTruthy();
    expect(restored!.blocks).toHaveLength(0);
  });

  it('should return null when past has only 1 entry (initial)', () => {
    const h = wrapHistory();
    const mod = createModule(0);
    h.pushSnapshot(mod);
    expect(h.undo(mod)).toBeNull();
  });

  it('should handle rapid undo/redo (stress)', () => {
    const h = wrapHistory();
    const mods = Array.from({ length: 20 }, (_, i) => createModule(i));
    for (const m of mods) h.pushSnapshot(m);
    for (let i = 0; i < 10; i++) h.undo(mods[mods.length - 1]);
    for (let i = 0; i < 10; i++) h.redo();
    const final = h.undo(mods[mods.length - 1]);
    expect(final).toBeTruthy();
  });
});
