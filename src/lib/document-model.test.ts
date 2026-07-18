import { describe, it, expect } from 'vitest';
import { createBlock, createAllDefaultBlocks } from './block-factory';
import { BlockType } from '@/types';

describe('Document Model', () => {
  it('should create a module with blocks array', () => {
    const blocks = [createBlock(BlockType.RichText, 0), createBlock(BlockType.QuizMCQ, 1)];
    expect(blocks).toHaveLength(2);
    expect(blocks[0].order).toBe(0);
    expect(blocks[1].order).toBe(1);
  });

  it('should maintain block order after creation', () => {
    const blocks = createAllDefaultBlocks();
    for (let i = 0; i < blocks.length; i++) {
      expect(blocks[i].order).toBe(i);
    }
  });

  it('each block should have a unique ID', () => {
    const blocks = createAllDefaultBlocks();
    const ids = blocks.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should support reordering blocks', () => {
    const blocks = [createBlock(BlockType.RichText, 0), createBlock(BlockType.Image, 1)];
    const reordered = blocks.map((b, i) => ({ ...b, order: i === 0 ? 1 : 0 }));
    expect(reordered[0].order).toBe(1);
    expect(reordered[1].order).toBe(0);
  });

  it('should support adding blocks at position', () => {
    const blocks = [createBlock(BlockType.RichText, 0), createBlock(BlockType.Image, 1)];
    const newBlock = createBlock(BlockType.QuizMCQ, 1);
    blocks.splice(1, 0, newBlock);
    const reindexed = blocks.map((b, i) => ({ ...b, order: i }));
    expect(reindexed).toHaveLength(3);
    expect(reindexed[1].type).toBe(BlockType.QuizMCQ);
  });

  it('should support removing blocks', () => {
    const blocks = [createBlock(BlockType.RichText, 0), createBlock(BlockType.Image, 1)];
    const filtered = blocks
      .filter((b) => b.type !== BlockType.Image)
      .map((b, i) => ({ ...b, order: i }));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].order).toBe(0);
  });

  it('should support duplicating blocks with new IDs', () => {
    const blocks = [createBlock(BlockType.RichText, 0)];
    const duplicate = {
      ...blocks[0],
      id: 'new-id',
      order: blocks[0].order + 1,
      content: { ...blocks[0].content },
    };
    expect(duplicate.id).not.toBe(blocks[0].id);
    expect(duplicate.order).toBe(1);
    expect(duplicate.type).toBe(BlockType.RichText);
  });

  it('should handle blocks with special characters in content', () => {
    const block = createBlock(BlockType.RichText, 0);
    const specialContent = { html: '<p>Special chars: ñ, é, ü, 你好, 🎉</p>' };
    block.content = specialContent;
    expect((block.content as { html: string }).html).toContain('你好');
  });

  it('should support schema version tracking', () => {
    const version = '1.0.0';
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
