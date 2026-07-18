import { describe, it, expect } from 'vitest';
import { validateModule } from './validation';
import type { Module, Block } from '@/types';
import { BlockType } from '@/types';
import { generateUUIDv4 } from '@/lib/uuid';

function createValidModule(overrides?: Partial<Module>): Module {
  return {
    moduleId: generateUUIDv4(),
    title: 'Test Module',
    description: 'A test module',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: { id: 'author-1', name: 'Test Author' },
    metadata: {
      estimatedDuration: 15,
      difficulty: 'beginner',
      tags: ['finance'],
      thumbnail: '',
    },
    blocks: [],
    quizConfig: {
      feedbackMode: 'immediate',
      passingScore: 60,
      showScoreOnCompletion: true,
    },
    ...overrides,
  };
}

function createBlock(type: BlockType, order: number, overrides?: Partial<Block>): Block {
  const id = generateUUIDv4();
  const base = { id, order, settings: { isVisible: true, isLocked: false, customCss: '' } };

  switch (type) {
    case BlockType.RichText:
      return { ...base, type, content: { html: '<p>Hello</p>' }, ...overrides };
    case BlockType.QuizMCQ:
      return {
        ...base,
        type,
        content: {
          question: 'Test question?',
          options: [
            { id: 'a', text: 'A', isCorrect: true, explanation: '' },
            { id: 'b', text: 'B', isCorrect: false, explanation: '' },
          ],
          points: 1,
          attemptLimit: 1,
          feedbackMode: 'immediate',
          timer: null,
          allowMultipleCorrect: false,
          partialCredit: false,
        },
        ...overrides,
      };
    case BlockType.QuizTrueFalse:
      return {
        ...base,
        type,
        content: {
          question: 'True or false?',
          correctAnswer: true,
          explanation: '',
          points: 1,
          attemptLimit: 1,
          feedbackMode: 'immediate',
          timer: null,
        },
        ...overrides,
      };
    case BlockType.EMICalculator:
      return {
        ...base,
        type,
        content: { principal: 500000, annualRate: 10, tenureMonths: 60 },
        ...overrides,
      };
    case BlockType.Accordion:
      return {
        ...base,
        type,
        content: { items: [{ id: '1', title: 'Item 1', content: 'Content 1' }] },
        ...overrides,
      };
    case BlockType.ProgressTracker:
      return {
        ...base,
        type,
        content: {
          totalSteps: 3,
          currentStep: 0,
          steps: ['Step 1', 'Step 2', 'Step 3'],
          mode: 'linear',
        },
        ...overrides,
      };
    case BlockType.ConceptExplainer:
      return {
        ...base,
        type,
        content: {
          steps: [
            { id: '1', title: 'Step 1', description: 'Desc 1', visualIndicator: '📘' },
            { id: '2', title: 'Step 2', description: 'Desc 2', visualIndicator: '📗' },
            { id: '3', title: 'Step 3', description: 'Desc 3', visualIndicator: '📙' },
          ],
          autoPlay: false,
          autoPlayInterval: 3000,
        },
        ...overrides,
      };
    default:
      return { ...base, type, content: {}, ...overrides };
  }
}

describe('Validation Engine', () => {
  it('R0: should reject null/undefined module', () => {
    const result = validateModule(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('R0');
  });

  it('R0: should reject non-object module', () => {
    const result = validateModule('not an object');
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('R0');
  });

  it('R1: should validate module ID is present', () => {
    const mod = createValidModule({ moduleId: '' });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R1')).toBe(true);
  });

  it('R2: should validate title is present', () => {
    const mod = createValidModule({ title: '' });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R2')).toBe(true);
  });

  it('R2: should validate title length does not exceed 200', () => {
    const mod = createValidModule({ title: 'x'.repeat(201) });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R2')).toBe(true);
  });

  it('R3: should validate description length does not exceed 1000', () => {
    const mod = createValidModule({ description: 'x'.repeat(1001) });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R3')).toBe(true);
  });

  it('R4: should validate version is semver', () => {
    const mod = createValidModule({ version: 'invalid' });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R4')).toBe(true);
  });

  it('R4: should accept valid semver versions', () => {
    const mod = createValidModule({ version: '2.1.3' });
    const result = validateModule(mod);
    expect(result.valid).toBe(true);
  });

  it('R5: should validate blocks is an array', () => {
    const mod = createValidModule();
    (mod as unknown as Record<string, unknown>).blocks = undefined;
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R5')).toBe(true);
  });

  it('R6: should detect duplicate block IDs', () => {
    const sharedId = 'duplicate-id';
    const blocks = [
      createBlock(BlockType.RichText, 0, { id: sharedId }),
      createBlock(BlockType.Image, 1, { id: sharedId }),
    ];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R6')).toBe(true);
  });

  it('R7: should detect invalid block orders', () => {
    const blocks = [createBlock(BlockType.RichText, -1)];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R7')).toBe(true);
  });

  it('R8: should detect unrecognized block types', () => {
    const blocks = [createBlock(BlockType.RichText, 0)];
    (blocks[0] as unknown as Record<string, unknown>).type = 'unknown-type';
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R8')).toBe(true);
  });

  it('R9: should detect missing block content', () => {
    const blocks = [createBlock(BlockType.RichText, 0)];
    (blocks[0] as unknown as Record<string, unknown>).content = null;
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R9')).toBe(true);
  });

  it('R10: MCQ must have 2-6 options', () => {
    const blocks = [createBlock(BlockType.QuizMCQ, 0)];
    (blocks[0].content as Record<string, unknown>).options = [];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('R10: MCQ must have at least one correct answer', () => {
    const blocks = [createBlock(BlockType.QuizMCQ, 0)];
    (blocks[0].content as Record<string, unknown>).options = [
      { id: 'a', text: 'A', isCorrect: false, explanation: '' },
      { id: 'b', text: 'B', isCorrect: false, explanation: '' },
    ];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('R10: MCQ must have a question', () => {
    const blocks = [createBlock(BlockType.QuizMCQ, 0)];
    (blocks[0].content as Record<string, unknown>).question = '';
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('R10: True/False must have a question', () => {
    const blocks = [createBlock(BlockType.QuizTrueFalse, 0)];
    (blocks[0].content as Record<string, unknown>).question = '';
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('R10: EMI calculator must have valid values', () => {
    const blocks = [createBlock(BlockType.EMICalculator, 0)];
    (blocks[0].content as Record<string, unknown>).tenureMonths = 0;
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('R10: Accordion must have at least 1 item', () => {
    const blocks = [createBlock(BlockType.Accordion, 0)];
    (blocks[0].content as Record<string, unknown>).items = [];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('W1: Accordion with 20+ items should warn', () => {
    const items = Array.from({ length: 21 }, (_, i) => ({
      id: `${i}`,
      title: `Item ${i}`,
      content: '',
    }));
    const blocks = [createBlock(BlockType.Accordion, 0)];
    (blocks[0].content as Record<string, unknown>).items = items;
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.rule === 'W1')).toBe(true);
  });

  it('R10: Progress tracker must have at least 2 steps', () => {
    const blocks = [createBlock(BlockType.ProgressTracker, 0)];
    (blocks[0].content as Record<string, unknown>).steps = ['Step 1'];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('R10: Concept explainer must have at least 3 steps', () => {
    const blocks = [createBlock(BlockType.ConceptExplainer, 0)];
    (blocks[0].content as Record<string, unknown>).steps = [
      { id: '1', title: 'Step 1', description: 'Desc 1', visualIndicator: '📘' },
    ];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('R10: Quiz config passing score must be 0-100', () => {
    const mod = createValidModule({
      quizConfig: { feedbackMode: 'immediate', passingScore: 150, showScoreOnCompletion: true },
    });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === 'R10')).toBe(true);
  });

  it('should pass a clean module with all block types', () => {
    const blocks = [
      createBlock(BlockType.RichText, 0),
      createBlock(BlockType.Image, 1),
      createBlock(BlockType.VideoEmbed, 2),
      createBlock(BlockType.QuizMCQ, 3),
      createBlock(BlockType.QuizTrueFalse, 4),
      createBlock(BlockType.EMICalculator, 5),
      createBlock(BlockType.SIPCalculator, 6),
      createBlock(BlockType.CompoundInterest, 7),
      createBlock(BlockType.Callout, 8),
      createBlock(BlockType.Divider, 9),
      createBlock(BlockType.Accordion, 10),
      createBlock(BlockType.ProgressTracker, 11),
      createBlock(BlockType.AchievementBadge, 12),
      createBlock(BlockType.CodeSnippet, 13),
      createBlock(BlockType.ConceptExplainer, 14),
    ];
    const mod = createValidModule({ blocks });
    const result = validateModule(mod);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should combine multiple violations', () => {
    const mod = createValidModule({ title: '', version: 'bad', description: 'x'.repeat(1001) });
    const result = validateModule(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
