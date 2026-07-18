import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import { generateUUIDv4 } from '@/lib/uuid';
import type { QuizMCQContent, QuizOption } from '@/types';

interface QuizMCQEditorProps {
  block: Block;
}

export function QuizMCQEditor({ block }: QuizMCQEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as QuizMCQContent;

  const updateContent = useCallback(
    (updates: Partial<QuizMCQContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const addOption = useCallback(() => {
    if (content.options.length >= 6) return;
    const newOption: QuizOption = {
      id: generateUUIDv4(),
      text: '',
      isCorrect: false,
      explanation: '',
    };
    updateContent({ options: [...content.options, newOption] });
  }, [content, updateContent]);

  const removeOption = useCallback(
    (index: number) => {
      if (content.options.length <= 2) return;
      const options = content.options.filter((_, i) => i !== index);
      updateContent({ options });
    },
    [content, updateContent],
  );

  const updateOption = useCallback(
    (index: number, updates: Partial<QuizOption>) => {
      const options = content.options.map((opt, i) => (i === index ? { ...opt, ...updates } : opt));
      updateContent({ options });
    },
    [content, updateContent],
  );

  const toggleCorrect = useCallback(
    (index: number) => {
      if (content.allowMultipleCorrect) {
        updateOption(index, { isCorrect: !content.options[index].isCorrect });
      } else {
        const options = content.options.map((opt, i) => ({
          ...opt,
          isCorrect: i === index,
        }));
        updateContent({ options });
      }
    },
    [content, updateContent, updateOption],
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#64748B]">Options</label>
          {content.options.length < 6 && (
            <button
              onClick={addOption}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
              aria-label="Add option"
            >
              + Add option
            </button>
          )}
        </div>
        {content.options.map((option, index) => (
          <div key={option.id} className="flex items-start gap-2">
            <button
              onClick={() => toggleCorrect(index)}
              className={`mt-1.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                option.isCorrect
                  ? 'border-[#16A34A] bg-[#16A34A] text-white'
                  : 'border-[#CBD5E1] hover:border-[#94A3B8]'
              }`}
              aria-label={`Toggle correct for option ${index + 1}`}
            >
              {option.isCorrect && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(index, { text: e.target.value })}
                placeholder={`Option ${index + 1}`}
                maxLength={200}
                className="w-full px-2 py-1 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
                aria-label={`Option ${index + 1} text`}
              />
              <input
                type="text"
                value={option.explanation}
                onChange={(e) => updateOption(index, { explanation: e.target.value })}
                placeholder="Explanation (optional)"
                maxLength={300}
                className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none text-[#64748B]"
                aria-label={`Option ${index + 1} explanation`}
              />
            </div>
            {content.options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="mt-1.5 text-[#DC2626] hover:text-[#B91C1C] text-xs"
                aria-label={`Remove option ${index + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 pt-2 border-t border-[#E2E8F0]">
        <label className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <input
            type="checkbox"
            checked={content.allowMultipleCorrect}
            onChange={(e) => updateContent({ allowMultipleCorrect: e.target.checked })}
          />
          Multiple correct answers
        </label>
        {content.allowMultipleCorrect && (
          <label className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <input
              type="checkbox"
              checked={content.partialCredit}
              onChange={(e) => updateContent({ partialCredit: e.target.checked })}
            />
            Partial credit
          </label>
        )}
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
              name={`feedback-${block.id}`}
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
