import type { Module } from '@/types';
import { validateModule } from './validation';

export interface ExportResult {
  success: boolean;
  json: string | null;
  filename: string;
  errors: string[];
  warnings: string[];
}

function sanitizeFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100) || 'untitled-module'
  );
}

export function exportModule(module: Module): ExportResult {
  const validation = validateModule(module);
  const errors = validation.errors.map((e) => `[${e.rule}] ${e.field}: ${e.message}`);
  const warnings = validation.warnings.map((w) => `[${w.rule}] ${w.field}: ${w.message}`);

  if (!validation.valid) {
    return {
      success: false,
      json: null,
      filename: '',
      errors,
      warnings,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const filename = `${sanitizeFilename(module.title)}-${today}.json`;

  const exportData = {
    ...module,
    exportedAt: new Date().toISOString(),
    schemaVersion: '1.0',
  };

  const json = JSON.stringify(exportData, null, 2);

  return {
    success: true,
    json,
    filename,
    errors: [],
    warnings,
  };
}

export function downloadExport(result: ExportResult): void {
  if (!result.json) return;

  const blob = new Blob([result.json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
