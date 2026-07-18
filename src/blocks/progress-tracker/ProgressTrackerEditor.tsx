import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { ProgressTrackerContent } from '@/types';

interface ProgressTrackerEditorProps {
  block: Block;
}

export function ProgressTrackerEditor({ block }: ProgressTrackerEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as ProgressTrackerContent;

  const updateContent = useCallback(
    (updates: Partial<ProgressTrackerContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const updateStep = useCallback(
    (index: number, value: string) => {
      const steps = content.steps.map((s, i) => (i === index ? value : s));
      updateContent({ steps, totalSteps: steps.length });
    },
    [content, updateContent],
  );

  const addStep = useCallback(() => {
    const steps = [...content.steps, `Step ${content.steps.length + 1}`];
    updateContent({ steps, totalSteps: steps.length });
  }, [content, updateContent]);

  const removeStep = useCallback(
    (index: number) => {
      if (content.steps.length <= 2) return;
      const steps = content.steps.filter((_, i) => i !== index);
      updateContent({
        steps,
        totalSteps: steps.length,
        currentStep: Math.min(content.currentStep, steps.length),
      });
    },
    [content, updateContent],
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#64748B] mb-1">Mode</label>
          <div className="flex gap-1">
            {(['linear', 'branching'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateContent({ mode })}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  content.mode === mode
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
                }`}
                aria-label={`${mode} mode`}
              >
                {mode === 'linear' ? 'Linear' : 'Branching'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Current Step</label>
          <input
            type="number"
            value={content.currentStep}
            onChange={(e) =>
              updateContent({
                currentStep: Math.min(Math.max(1, Number(e.target.value)), content.totalSteps),
              })
            }
            min={1}
            max={content.totalSteps}
            className="w-16 px-2 py-1 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Current step number"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {content.steps.map((step, index) => (
          <div key={index} className="flex items-center gap-1 flex-1">
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  index + 1 <= content.currentStep ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                }`}
              />
              <input
                type="text"
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                className="w-full text-xs text-center mt-1 bg-transparent border-none outline-none text-[#64748B]"
                aria-label={`Step ${index + 1} label`}
              />
            </div>
            {content.steps.length > 2 && (
              <button
                onClick={() => removeStep(index)}
                className="text-[#DC2626] text-xs hover:text-[#B91C1C] shrink-0"
                aria-label={`Remove step ${index + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addStep}
        className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]"
        aria-label="Add step"
      >
        + Add step
      </button>
    </div>
  );
}
