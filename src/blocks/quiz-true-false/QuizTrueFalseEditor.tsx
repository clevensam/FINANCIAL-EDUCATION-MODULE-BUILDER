import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { QuizTrueFalseContent } from '@/types';

interface QuizTrueFalseEditorProps {
  block: Block;
}

export function QuizTrueFalseEditor({ block }: QuizTrueFalseEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as QuizTrueFalseContent;

  const updateContent = useCallback(
    (updates: Partial<QuizTrueFalseContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Question</label>
        <textarea
          value={content.question}
          onChange={(e) => updateContent({ question: e.target.value })}
          rows={2}
          maxLength={500}
          className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none resize-none"
          aria-label="Question text"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Correct Answer</label>
        <div className="flex gap-2">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              onClick={() => updateContent({ correctAnswer: value })}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                content.correctAnswer === value
                  ? value
                    ? 'bg-[#16A34A] text-white border-[#16A34A]'
                    : 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
              aria-label={`Set correct answer to ${value}`}
            >
              {value ? 'True' : 'False'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Explanation</label>
        <textarea
          value={content.explanation}
          onChange={(e) => updateContent({ explanation: e.target.value })}
          rows={2}
          maxLength={300}
          className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none resize-none text-[#64748B]"
          aria-label="Explanation for answer"
        />
      </div>

      <div className="flex flex-wrap gap-4 pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <label>Points:</label>
          <input
            type="number"
            value={content.points}
            onChange={(e) => updateContent({ points: Math.max(1, Number(e.target.value)) })}
            className="w-16 px-1 py-0.5 border border-[#E2E8F0] rounded text-xs"
            min={1}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <label>Attempts:</label>
          <select
            value={content.attemptLimit}
            onChange={(e) => updateContent({ attemptLimit: Number(e.target.value) })}
            className="px-1 py-0.5 border border-[#E2E8F0] rounded text-xs bg-white"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={999}>Unlimited</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <label>Timer:</label>
          <select
            value={content.timer ?? 0}
            onChange={(e) => updateContent({ timer: Number(e.target.value) || null })}
            className="px-1 py-0.5 border border-[#E2E8F0] rounded text-xs bg-white"
          >
            <option value={0}>None</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
            <option value={90}>90s</option>
            <option value={120}>120s</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#64748B]">
        <label>Feedback:</label>
        {(['immediate', 'deferred'] as const).map((mode) => (
          <label key={mode} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name={`feedback-tf-${block.id}`}
              checked={content.feedbackMode === mode}
              onChange={() => updateContent({ feedbackMode: mode })}
            />
            {mode === 'immediate' ? 'Immediate' : 'Deferred'}
          </label>
        ))}
      </div>
    </div>
  );
}
