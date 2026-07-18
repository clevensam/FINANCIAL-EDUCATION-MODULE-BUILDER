import { describe, it, expect } from 'vitest';
import { createBlock, createAllDefaultBlocks, getDefaultContent } from './block-factory';
import { BlockType } from '@/types';

describe('BlockFactory', () => {
  it('should create a block of each type', () => {
    const types = Object.values(BlockType);
    for (const type of types) {
      const block = createBlock(type, 0);
      expect(block.type).toBe(type);
      expect(block.id).toBeTruthy();
    }
  });

  it('should assign correct order', () => {
    const block = createBlock(BlockType.RichText, 5);
    expect(block.order).toBe(5);
  });

  it('should generate unique IDs for each block', () => {
    const block1 = createBlock(BlockType.RichText, 0);
    const block2 = createBlock(BlockType.RichText, 1);
    expect(block1.id).not.toBe(block2.id);
  });

  it('should set visible and unlocked by default', () => {
    const block = createBlock(BlockType.RichText, 0);
    expect(block.settings.isVisible).toBe(true);
    expect(block.settings.isLocked).toBe(false);
  });

  it('should create RichText block with HTML content', () => {
    const block = createBlock(BlockType.RichText, 0);
    expect(block.type).toBe(BlockType.RichText);
    expect((block.content as { html: string }).html).toBeTruthy();
  });

  it('should create EMI Calculator block with default values', () => {
    const block = createBlock(BlockType.EMICalculator, 0);
    const content = block.content as {
      principal: number;
      annualRate: number;
      tenureMonths: number;
    };
    expect(content.principal).toBe(500000);
    expect(content.annualRate).toBe(8.5);
    expect(content.tenureMonths).toBe(240);
  });

  it('should create Quiz MCQ block with 2 default options', () => {
    const block = createBlock(BlockType.QuizMCQ, 0);
    const content = block.content as { options: unknown[] };
    expect(content.options).toHaveLength(2);
  });

  it('should create SIP Calculator block with default values', () => {
    const block = createBlock(BlockType.SIPCalculator, 0);
    const content = block.content as {
      monthlyInvestment: number;
      annualReturn: number;
      durationYears: number;
    };
    expect(content.monthlyInvestment).toBe(5000);
    expect(content.annualReturn).toBe(12);
  });

  it('should create Compound Interest block with annual frequency', () => {
    const block = createBlock(BlockType.CompoundInterest, 0);
    const content = block.content as { compoundingFrequency: string };
    expect(content.compoundingFrequency).toBe('annually');
  });

  it('should create Accordion block with at least 1 item', () => {
    const block = createBlock(BlockType.Accordion, 0);
    const content = block.content as { items: unknown[] };
    expect(content.items.length).toBeGreaterThanOrEqual(1);
  });

  it('should create Concept Explainer with 3 steps', () => {
    const block = createBlock(BlockType.ConceptExplainer, 0);
    const content = block.content as { steps: unknown[] };
    expect(content.steps).toHaveLength(3);
  });

  it('should create Progress Tracker with 5 steps', () => {
    const block = createBlock(BlockType.ProgressTracker, 0);
    const content = block.content as { totalSteps: number; steps: string[] };
    expect(content.totalSteps).toBe(5);
    expect(content.steps).toHaveLength(5);
  });

  it('should create Divider with solid style', () => {
    const block = createBlock(BlockType.Divider, 0);
    const content = block.content as { style: string };
    expect(content.style).toBe('solid');
  });

  it('should create Callout with info variant', () => {
    const block = createBlock(BlockType.Callout, 0);
    const content = block.content as { variant: string };
    expect(content.variant).toBe('info');
  });

  it('should create CodeSnippet with javascript language', () => {
    const block = createBlock(BlockType.CodeSnippet, 0);
    const content = block.content as { language: string };
    expect(content.language).toBe('javascript');
  });
});

describe('createAllDefaultBlocks', () => {
  it('should create all 15 block types', () => {
    const blocks = createAllDefaultBlocks();
    expect(blocks).toHaveLength(15);
  });

  it('should assign sequential order', () => {
    const blocks = createAllDefaultBlocks();
    blocks.forEach((block, i) => {
      expect(block.order).toBe(i);
    });
  });
});

describe('getDefaultContent', () => {
  it('should return deep-cloned content', () => {
    const content1 = getDefaultContent(BlockType.RichText);
    const content2 = getDefaultContent(BlockType.RichText);
    expect(content1).toEqual(content2);
  });
});
