import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { DividerContent, DividerStyle, DividerSpacing } from '@/types';

interface DividerEditorProps {
  block: Block;
}

const STYLES: { value: DividerStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'gradient', label: 'Gradient' },
];

const SPACINGS: { value: DividerSpacing; label: string; py: string }[] = [
  { value: 'compact', label: 'Compact', py: 'py-2' },
  { value: 'normal', label: 'Normal', py: 'py-4' },
  { value: 'spacious', label: 'Spacious', py: 'py-8' },
];

export function DividerEditor({ block }: DividerEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as DividerContent;

  const updateContent = useCallback(
    (updates: Partial<DividerContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const spacing = SPACINGS.find((s) => s.value === content.spacing) ?? SPACINGS[1];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Style</label>
          <div className="flex gap-1">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => updateContent({ style: s.value })}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  content.style === s.value
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
                }`}
                aria-label={`${s.label} style`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Spacing</label>
          <div className="flex gap-1">
            {SPACINGS.map((s) => (
              <button
                key={s.value}
                onClick={() => updateContent({ spacing: s.value })}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  content.spacing === s.value
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
                }`}
                aria-label={`${s.label} spacing`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${spacing.py}`}>
        {content.style === 'gradient' ? (
          <div className="h-px bg-gradient-to-r from-transparent via-[#94A3B8] to-transparent" />
        ) : (
          <hr
            className={`border-[#E2E8F0] ${
              content.style === 'dashed'
                ? 'border-dashed'
                : content.style === 'dotted'
                  ? 'border-dotted'
                  : 'border-solid'
            }`}
          />
        )}
      </div>
    </div>
  );
}
