import { describe, it, expect } from 'vitest';
import { importModule } from './import-module';
import type { Module } from '@/types';
import { generateUUIDv4 } from '@/lib/uuid';

function createValidModuleJSON(): string {
  const mod: Module = {
    moduleId: generateUUIDv4(),
    title: 'Imported Module',
    description: 'Test import',
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
    blocks: [
      {
        id: 'block-1',
        type: 'rich-text',
        order: 0,
        content: { html: '<p>Hello</p>' },
        settings: { isVisible: true, isLocked: false, customCss: '' },
      },
    ],
    quizConfig: {
      feedbackMode: 'immediate',
      passingScore: 60,
      showScoreOnCompletion: true,
    },
  };
  return JSON.stringify(mod);
}

describe('Module Import', () => {
  it('should import a valid module JSON', () => {
    const json = createValidModuleJSON();
    const result = importModule(json);
    expect(result.success).toBe(true);
    expect(result.module).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  it('should regenerate module ID on import', () => {
    const json = createValidModuleJSON();
    const original = JSON.parse(json);
    const result = importModule(json);
    expect(result.module!.moduleId).not.toBe(original.moduleId);
  });

  it('should regenerate all block IDs on import', () => {
    const json = createValidModuleJSON();
    const original = JSON.parse(json);
    const result = importModule(json);
    expect(result.module!.blocks[0].id).not.toBe(original.blocks[0].id);
  });

  it('should preserve block content after ID regeneration', () => {
    const json = createValidModuleJSON();
    const original = JSON.parse(json);
    const result = importModule(json);
    expect(result.module!.blocks[0].content).toEqual(original.blocks[0].content);
  });

  it('should reject invalid JSON', () => {
    const result = importModule('not valid json');
    expect(result.success).toBe(false);
    expect(result.module).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject non-object JSON', () => {
    const result = importModule('"string"');
    expect(result.success).toBe(false);
    expect(result.module).toBeNull();
  });

  it('should reject module with missing title', () => {
    const mod = JSON.parse(createValidModuleJSON());
    delete mod.title;
    const result = importModule(JSON.stringify(mod));
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject module with invalid version', () => {
    const mod = JSON.parse(createValidModuleJSON());
    mod.version = 'bad';
    const result = importModule(JSON.stringify(mod));
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should warn on unknown schema version', () => {
    const mod = JSON.parse(createValidModuleJSON());
    mod.schemaVersion = '0.5';
    const result = importModule(JSON.stringify(mod));
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.toLowerCase().includes('schema'))).toBe(true);
  });

  it('should handle modules with multiple blocks', () => {
    const mod = JSON.parse(createValidModuleJSON());
    mod.blocks.push({
      id: 'block-2',
      type: 'emi-calculator',
      order: 1,
      content: { principal: 500000, annualRate: 10, tenureMonths: 60 },
      settings: { isVisible: true, isLocked: false, customCss: '' },
    });
    const result = importModule(JSON.stringify(mod));
    expect(result.success).toBe(true);
    expect(result.module!.blocks).toHaveLength(2);
  });

  it('should handle empty blocks array', () => {
    const mod = JSON.parse(createValidModuleJSON());
    mod.blocks = [];
    const result = importModule(JSON.stringify(mod));
    expect(result.success).toBe(true);
    expect(result.module!.blocks).toHaveLength(0);
  });

  it('should reject module with invalid quiz config', () => {
    const mod = JSON.parse(createValidModuleJSON());
    mod.quizConfig.passingScore = 150;
    const result = importModule(JSON.stringify(mod));
    expect(result.success).toBe(false);
  });

  it('should add importedAt timestamp', () => {
    const json = createValidModuleJSON();
    const result = importModule(json);
    expect((result.module as unknown as Record<string, unknown>).importedAt).toBeTruthy();
  });

  it('should validate each block type individually', () => {
    const mod = JSON.parse(createValidModuleJSON());
    mod.blocks.push({
      id: 'block-3',
      type: 'unknown-type',
      order: 1,
      content: {},
      settings: { isVisible: true, isLocked: false, customCss: '' },
    });
    const result = importModule(JSON.stringify(mod));
    expect(result.success).toBe(false);
  });
});
