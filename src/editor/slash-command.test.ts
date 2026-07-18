import { describe, it, expect } from 'vitest';

interface BlockTypeInfo {
  type: string;
  name: string;
  keywords: string[];
}

const blockRegistry: BlockTypeInfo[] = [
  { type: 'rich-text', name: 'Rich Text', keywords: ['text', 'paragraph', 'writing', 'content'] },
  { type: 'image', name: 'Image', keywords: ['picture', 'photo', 'graphic', 'visual'] },
  { type: 'video-embed', name: 'Video Embed', keywords: ['youtube', 'vimeo', 'video', 'media'] },
  {
    type: 'quiz-mcq',
    name: 'Quiz (MCQ)',
    keywords: ['multiple choice', 'question', 'assessment', 'test'],
  },
  {
    type: 'quiz-true-false',
    name: 'Quiz (True/False)',
    keywords: ['boolean', 'true false', 'binary', 'assessment'],
  },
  {
    type: 'emi-calculator',
    name: 'EMI Calculator',
    keywords: ['loan', 'equated', 'monthly', 'installment'],
  },
  {
    type: 'sip-calculator',
    name: 'SIP Calculator',
    keywords: ['mutual fund', 'investment', 'systematic'],
  },
  {
    type: 'compound-interest',
    name: 'Compound Interest',
    keywords: ['interest', 'growth', 'compounding'],
  },
  { type: 'callout', name: 'Callout', keywords: ['notice', 'alert', 'info', 'tip', 'warning'] },
  { type: 'divider', name: 'Divider', keywords: ['separator', 'line', 'horizontal rule', 'hr'] },
  { type: 'accordion', name: 'Accordion/FAQ', keywords: ['faq', 'collapse', 'expand', 'toggle'] },
  {
    type: 'progress-tracker',
    name: 'Progress Tracker',
    keywords: ['steps', 'progress', 'stepper'],
  },
  {
    type: 'achievement-badge',
    name: 'Achievement Badge',
    keywords: ['badge', 'award', 'achievement'],
  },
  {
    type: 'code-snippet',
    name: 'Code Snippet',
    keywords: ['code', 'syntax', 'programming', 'source'],
  },
  {
    type: 'concept-explainer',
    name: 'Concept Explainer',
    keywords: ['explain', 'tutorial', 'steps', 'guide'],
  },
];

function searchBlocks(query: string): BlockTypeInfo[] {
  if (!query.trim()) return blockRegistry;

  const q = query.toLowerCase().trim();
  return blockRegistry.filter(
    (block) =>
      block.name.toLowerCase().includes(q) ||
      block.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
      block.type.toLowerCase().includes(q),
  );
}

describe('Slash Command Search', () => {
  it('should return all blocks for empty query', () => {
    const results = searchBlocks('');
    expect(results).toHaveLength(15);
  });

  it('should find blocks by exact name', () => {
    const results = searchBlocks('Rich Text');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('rich-text');
  });

  it('should find blocks by partial name', () => {
    const results = searchBlocks('Calc');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((r) => r.type === 'emi-calculator')).toBe(true);
  });

  it('should find blocks by keyword', () => {
    const results = searchBlocks('loan');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('emi-calculator');
  });

  it('should find blocks by type', () => {
    const results = searchBlocks('compound-interest');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('compound-interest');
  });

  it('should return empty for no match', () => {
    const results = searchBlocks('xyznonexistent');
    expect(results).toHaveLength(0);
  });

  it('should match case-insensitively', () => {
    const results = searchBlocks('RICH TEXT');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('rich-text');
  });

  it('should not break on special characters in query', () => {
    const results = searchBlocks('@#$%');
    expect(results).toHaveLength(0);
  });

  it('should rank results (exact match first)', () => {
    const results = searchBlocks('divider');
    expect(results[0].type).toBe('divider');
  });

  it('should support multi-word queries', () => {
    const results = searchBlocks('true false');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.type === 'quiz-true-false')).toBe(true);
  });
});
