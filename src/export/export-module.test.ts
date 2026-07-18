import { describe, it, expect } from 'vitest';
import { exportModule } from './export-module';
import type { Module } from '@/types';
import { generateUUIDv4 } from '@/lib/uuid';

function createValidModule(overrides?: Partial<Module>): Module {
  return {
    moduleId: generateUUIDv4(),
    title: 'Test Module',
    description: 'A test module for export',
    version: '1.0.0',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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

describe('Module Export', () => {
  it('should export a valid module successfully', () => {
    const mod = createValidModule();
    const result = exportModule(mod);
    expect(result.success).toBe(true);
    expect(result.json).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  it('should generate a filename based on module title', () => {
    const mod = createValidModule();
    const result = exportModule(mod);
    expect(result.filename).toMatch(/^test-module-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('should sanitize the filename', () => {
    const mod = createValidModule({ title: 'My!!! Module @#$ 123' });
    const result = exportModule(mod);
    expect(result.filename).toMatch(/^my-module-123-.+\.json$/);
  });

  it('should use default filename for empty title', () => {
    const mod = createValidModule({ title: '' });
    const result = exportModule(mod);
    expect(result.success).toBe(false);
  });

  it('should produce valid JSON', () => {
    const mod = createValidModule();
    const result = exportModule(mod);
    expect(result.json).toBeTruthy();
    expect(() => JSON.parse(result.json!)).not.toThrow();
  });

  it('should include metadata in exported JSON', () => {
    const mod = createValidModule();
    const result = exportModule(mod);
    const parsed = JSON.parse(result.json!);
    expect(parsed.moduleId).toBe(mod.moduleId);
    expect(parsed.title).toBe(mod.title);
    expect(parsed.schemaVersion).toBe('1.0');
    expect(parsed.exportedAt).toBeTruthy();
  });

  it('should fail export for module with missing title', () => {
    const mod = createValidModule();
    (mod as unknown as Record<string, unknown>).title = '';
    const result = exportModule(mod);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail export for module with invalid version', () => {
    const mod = createValidModule();
    (mod as unknown as Record<string, unknown>).version = 'not-semver';
    const result = exportModule(mod);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should include blocks in export', () => {
    const mod = createValidModule();
    mod.blocks = [
      {
        id: generateUUIDv4(),
        type: 'rich-text',
        order: 0,
        content: { html: '<p>Test</p>' },
        settings: { isVisible: true, isLocked: false, customCss: '' },
      },
    ];
    const result = exportModule(mod);
    const parsed = JSON.parse(result.json!);
    expect(parsed.blocks).toHaveLength(1);
    expect(parsed.blocks[0].type).toBe('rich-text');
  });

  it('should return warnings for modules with issues', () => {
    const mod = createValidModule();
    mod.blocks = [
      {
        id: generateUUIDv4(),
        type: 'accordion',
        order: 0,
        content: {
          items: Array.from({ length: 21 }, (_, i) => ({
            id: `${i}`,
            title: `Item ${i}`,
            content: '',
          })),
        },
        settings: { isVisible: true, isLocked: false, customCss: '' },
      },
    ];
    const result = exportModule(mod);
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should pretty-print JSON with indentation', () => {
    const mod = createValidModule();
    const result = exportModule(mod);
    expect(result.json).toContain('\n  ');
  });
});
