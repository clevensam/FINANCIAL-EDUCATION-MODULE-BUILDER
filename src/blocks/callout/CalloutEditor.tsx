import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { CalloutContent, CalloutVariant } from '@/types';

interface CalloutEditorProps {
  block: Block;
}

const VARIANTS: {
  value: CalloutVariant;
  label: string;
  bg: string;
  border: string;
  icon: string;
  textColor: string;
}[] = [
  {
    value: 'info',
    label: 'Info',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'ℹ️',
    textColor: '#1E40AF',
  },
  {
    value: 'warning',
    label: 'Warning',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: '⚠️',
    textColor: '#92400E',
  },
  {
    value: 'tip',
    label: 'Tip',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    icon: '💡',
    textColor: '#166534',
  },
  {
    value: 'important',
    label: 'Important',
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: '🔴',
    textColor: '#991B1B',
  },
  {
    value: 'danger',
    label: 'Danger',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    icon: '🚫',
    textColor: '#991B1B',
  },
];

export function CalloutEditor({ block }: CalloutEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as CalloutContent;

  const updateContent = useCallback(
    (updates: Partial<CalloutContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const variant = VARIANTS.find((v) => v.value === content.variant) ?? VARIANTS[0];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {VARIANTS.map((v) => (
          <button
            key={v.value}
            onClick={() => updateContent({ variant: v.value })}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              content.variant === v.value ? 'ring-2 ring-[#2563EB]' : ''
            }`}
            style={{
              backgroundColor: v.bg,
              borderColor: v.border,
              color: v.textColor,
            }}
            aria-label={`${v.label} variant`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      <div
        className="p-3 rounded-md border"
        style={{
          backgroundColor: variant.bg,
          borderColor: variant.border,
        }}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">{content.icon || variant.icon}</span>
          <textarea
            value={content.content}
            onChange={(e) => updateContent({ content: e.target.value })}
            rows={3}
            style={{ color: variant.textColor }}
            className="w-full bg-transparent text-sm border-none outline-none resize-none placeholder:text-[#94A3B8]"
            placeholder="Enter your callout text..."
            aria-label="Callout content"
          />
        </div>
      </div>
    </div>
  );
}
