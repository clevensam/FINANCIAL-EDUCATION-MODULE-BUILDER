import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import { generateUUIDv4 } from '@/lib/uuid';
import type { ConceptExplainerContent, ConceptExplainerStep } from '@/types';

interface ConceptExplainerEditorProps {
  block: Block;
}

export function ConceptExplainerEditor({ block }: ConceptExplainerEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as ConceptExplainerContent;

  const updateContent = useCallback(
    (updates: Partial<ConceptExplainerContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const addStep = useCallback(() => {
    if (content.steps.length >= 10) return;
    const newStep: ConceptExplainerStep = {
      id: generateUUIDv4(),
      title: '',
      description: '',
      visualIndicator: String(content.steps.length + 1),
    };
    updateContent({ steps: [...content.steps, newStep] });
  }, [content, updateContent]);

  const removeStep = useCallback(
    (id: string) => {
      if (content.steps.length <= 3) return;
      const steps = content.steps
        .filter((s) => s.id !== id)
        .map((s, i) => ({
          ...s,
          visualIndicator: String(i + 1),
        }));
      updateContent({ steps });
    },
    [content, updateContent],
  );

  const updateStep = useCallback(
    (id: string, updates: Partial<ConceptExplainerStep>) => {
      const steps = content.steps.map((s) => (s.id === id ? { ...s, ...updates } : s));
      updateContent({ steps });
    },
    [content, updateContent],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-xs text-[#64748B]">
          <input
            type="checkbox"
            checked={content.autoPlay}
            onChange={(e) => updateContent({ autoPlay: e.target.checked })}
          />
          Auto-play
        </label>
        {content.autoPlay && (
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <label>Interval (ms):</label>
            <input
              type="number"
              value={content.autoPlayInterval}
              onChange={(e) =>
                updateContent({ autoPlayInterval: Math.max(1000, Number(e.target.value)) })
              }
              className="w-20 px-1 py-0.5 border border-[#E2E8F0] rounded text-xs"
              min={1000}
              step={1000}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {content.steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start gap-2 p-2 border border-[#E2E8F0] rounded-md"
          >
            <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs flex items-center justify-center shrink-0 mt-1">
              {index + 1}
            </div>
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={step.title}
                onChange={(e) => updateStep(step.id, { title: e.target.value })}
                placeholder={`Step ${index + 1} title`}
                className="w-full px-2 py-1 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none font-medium"
                aria-label={`Step ${index + 1} title`}
              />
              <textarea
                value={step.description}
                onChange={(e) => updateStep(step.id, { description: e.target.value })}
                rows={2}
                placeholder="Step description..."
                className="w-full px-2 py-1 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none resize-none"
                aria-label={`Step ${index + 1} description`}
              />
            </div>
            {content.steps.length > 3 && (
              <button
                onClick={() => removeStep(step.id)}
                className="text-[#DC2626] text-xs hover:text-[#B91C1C] mt-1"
                aria-label={`Remove step ${index + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {content.steps.length < 10 && (
        <button
          onClick={addStep}
          className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]"
          aria-label="Add step"
        >
          + Add step
        </button>
      )}
    </div>
  );
}
