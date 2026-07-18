import type { Module } from '@/types';
import { validateModule } from './validation';
import { generateUUIDv4 } from '@/lib/uuid';

export interface ImportResult {
  success: boolean;
  module: Module | null;
  errors: string[];
  warnings: string[];
}

function regenerateBlockIds(module: Module): Module {
  const idMap = new Map<string, string>();

  const newBlocks = module.blocks.map((block) => {
    const newId = generateUUIDv4();
    idMap.set(block.id, newId);
    return { ...block, id: newId };
  });

  return {
    ...module,
    moduleId: generateUUIDv4(),
    blocks: newBlocks,
    importedAt: new Date().toISOString(),
  };
}

export function importModule(jsonString: string): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return {
      success: false,
      module: null,
      errors: ['Invalid JSON: File could not be parsed'],
      warnings: [],
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      success: false,
      module: null,
      errors: ['Invalid module: Root value must be a JSON object'],
      warnings: [],
    };
  }

  const validation = validateModule(parsed);
  errors.push(...validation.errors.map((e) => `[${e.rule}] ${e.field}: ${e.message}`));
  warnings.push(...validation.warnings.map((w) => `[${w.rule}] ${w.field}: ${w.message}`));

  if (!validation.valid) {
    return {
      success: false,
      module: null,
      errors,
      warnings,
    };
  }

  const raw = parsed as Record<string, unknown>;

  if (raw.schemaVersion && typeof raw.schemaVersion === 'string') {
    const version = raw.schemaVersion;
    if (version !== '1.0') {
      warnings.push(`Schema version "${version}" may require migration. Current version: 1.0`);
    }
  }

  let module = parsed as Module;

  module = regenerateBlockIds(module);

  return {
    success: true,
    module,
    errors,
    warnings,
  };
}
