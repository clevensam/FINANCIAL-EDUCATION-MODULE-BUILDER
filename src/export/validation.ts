import type { Module } from '@/types';
import { BlockType } from '@/types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  rule: string;
  field: string;
  message: string;
}

export interface ValidationWarning {
  rule: string;
  field: string;
  message: string;
}

function validateModuleId(module: Module, errors: ValidationError[]): void {
  if (!module.moduleId || typeof module.moduleId !== 'string') {
    errors.push({
      rule: 'R1',
      field: 'moduleId',
      message: 'Module ID is required and must be a string',
    });
  }
}

function validateTitle(module: Module, errors: ValidationError[]): void {
  if (!module.title || typeof module.title !== 'string') {
    errors.push({ rule: 'R2', field: 'title', message: 'Module title is required' });
  } else if (module.title.length > 200) {
    errors.push({
      rule: 'R2',
      field: 'title',
      message: 'Module title must not exceed 200 characters',
    });
  }
}

function validateDescription(module: Module, errors: ValidationError[]): void {
  if (module.description && module.description.length > 1000) {
    errors.push({
      rule: 'R3',
      field: 'description',
      message: 'Module description must not exceed 1000 characters',
    });
  }
}

function validateVersion(module: Module, errors: ValidationError[]): void {
  if (!module.version || typeof module.version !== 'string') {
    errors.push({ rule: 'R4', field: 'version', message: 'Module version is required' });
  } else if (!/^\d+\.\d+\.\d+$/.test(module.version)) {
    errors.push({
      rule: 'R4',
      field: 'version',
      message: 'Module version must be a valid semver string (e.g. 1.0.0)',
    });
  }
}

function validateBlocksNotEmpty(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) {
    errors.push({ rule: 'R5', field: 'blocks', message: 'Blocks must be an array' });
  }
}

function validateBlockIds(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  const ids = module.blocks.map((b) => b.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    errors.push({ rule: 'R6', field: 'blocks[].id', message: 'All block IDs must be unique' });
  }
  ids.forEach((id, i) => {
    if (!id || typeof id !== 'string') {
      errors.push({
        rule: 'R6',
        field: `blocks[${i}].id`,
        message: `Block at index ${i} has an invalid ID`,
      });
    }
  });
}

function validateBlockOrders(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (typeof block.order !== 'number' || block.order < 0) {
      errors.push({
        rule: 'R7',
        field: `blocks[${i}].order`,
        message: `Block at index ${i} has an invalid order`,
      });
    }
  });
}

function validateBlockTypes(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  const validTypes = Object.values(BlockType);
  module.blocks.forEach((block, i) => {
    if (!validTypes.includes(block.type as BlockType)) {
      errors.push({
        rule: 'R8',
        field: `blocks[${i}].type`,
        message: `Block at index ${i} has an unrecognized type: ${block.type}`,
      });
    }
  });
}

function validateBlockContent(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (!block.content || typeof block.content !== 'object') {
      errors.push({
        rule: 'R9',
        field: `blocks[${i}].content`,
        message: `Block at index ${i} must have content`,
      });
    }
  });
}

function validateQuizMCQ(
  module: Module,
  errors: ValidationError[],
  _warnings: ValidationWarning[],
): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (block.type === BlockType.QuizMCQ) {
      const content = block.content as { options?: unknown[]; question?: string };
      if (!content.options || content.options.length < 2 || content.options.length > 6) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.options`,
          message: 'MCQ quiz must have 2-6 options',
        });
      }
      if (
        !content.question ||
        (typeof content.question === 'string' && content.question.trim().length === 0)
      ) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.question`,
          message: 'MCQ quiz must have a question',
        });
      }
      if (content.options) {
        const hasCorrect = content.options.some(
          (o) => typeof o === 'object' && o !== null && 'isCorrect' in o && o.isCorrect === true,
        );
        if (!hasCorrect) {
          errors.push({
            rule: 'R10',
            field: `blocks[${i}].content.options`,
            message: 'MCQ quiz must have at least one correct answer',
          });
        }
      }
    }
  });
}

function validateQuizTrueFalse(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (block.type === BlockType.QuizTrueFalse) {
      const content = block.content as { question?: string };
      if (
        !content.question ||
        (typeof content.question === 'string' && content.question.trim().length === 0)
      ) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.question`,
          message: 'True/False quiz must have a question',
        });
      }
    }
  });
}

function validateEMICalculator(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (block.type === BlockType.EMICalculator) {
      const content = block.content as {
        principal?: number;
        annualRate?: number;
        tenureMonths?: number;
      };
      if (typeof content.principal !== 'number' || content.principal < 0) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.principal`,
          message: 'EMI calculator principal must be a non-negative number',
        });
      }
      if (typeof content.annualRate !== 'number' || content.annualRate < 0) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.annualRate`,
          message: 'EMI calculator annual rate must be a non-negative number',
        });
      }
      if (typeof content.tenureMonths !== 'number' || content.tenureMonths < 1) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.tenureMonths`,
          message: 'EMI calculator tenure must be at least 1 month',
        });
      }
    }
  });
}

function validateAccordion(
  module: Module,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (block.type === BlockType.Accordion) {
      const content = block.content as { items?: unknown[] };
      if (!content.items || content.items.length === 0) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.items`,
          message: 'Accordion must have at least 1 item',
        });
      }
      if (content.items && content.items.length > 20) {
        warnings.push({
          rule: 'W1',
          field: `blocks[${i}].content.items`,
          message: 'Accordion has more than 20 items, consider reducing',
        });
      }
    }
  });
}

function validateProgressTracker(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (block.type === BlockType.ProgressTracker) {
      const content = block.content as { steps?: unknown[] };
      if (!content.steps || content.steps.length < 2) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.steps`,
          message: 'Progress tracker must have at least 2 steps',
        });
      }
    }
  });
}

function validateConceptExplainer(module: Module, errors: ValidationError[]): void {
  if (!Array.isArray(module.blocks)) return;
  module.blocks.forEach((block, i) => {
    if (block.type === BlockType.ConceptExplainer) {
      const content = block.content as { steps?: unknown[] };
      if (!content.steps || content.steps.length < 3) {
        errors.push({
          rule: 'R10',
          field: `blocks[${i}].content.steps`,
          message: 'Concept explainer must have at least 3 steps',
        });
      }
    }
  });
}

function validateQuizConfig(
  module: Module,
  errors: ValidationError[],
  _warnings: ValidationWarning[],
): void {
  const config = module.quizConfig;
  if (config) {
    if (
      typeof config.passingScore !== 'number' ||
      config.passingScore < 0 ||
      config.passingScore > 100
    ) {
      errors.push({
        rule: 'R10',
        field: 'quizConfig.passingScore',
        message: 'Passing score must be between 0 and 100',
      });
    }
    if (config.feedbackMode && !['immediate', 'deferred'].includes(config.feedbackMode)) {
      errors.push({
        rule: 'R10',
        field: 'quizConfig.feedbackMode',
        message: 'Feedback mode must be "immediate" or "deferred"',
      });
    }
  }
}

export function validateModule(module: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!module || typeof module !== 'object') {
    errors.push({ rule: 'R0', field: 'module', message: 'Module must be a non-null object' });
    return { valid: false, errors, warnings };
  }

  const mod = module as Module;

  validateModuleId(mod, errors);
  validateTitle(mod, errors);
  validateDescription(mod, errors);
  validateVersion(mod, errors);
  validateBlocksNotEmpty(mod, errors);
  validateBlockIds(mod, errors);
  validateBlockOrders(mod, errors);
  validateBlockTypes(mod, errors);
  validateBlockContent(mod, errors);
  validateQuizMCQ(mod, errors, warnings);
  validateQuizTrueFalse(mod, errors);
  validateEMICalculator(mod, errors);
  validateAccordion(mod, errors, warnings);
  validateProgressTracker(mod, errors);
  validateConceptExplainer(mod, errors);
  validateQuizConfig(mod, errors, warnings);

  return { valid: errors.length === 0, errors, warnings };
}
