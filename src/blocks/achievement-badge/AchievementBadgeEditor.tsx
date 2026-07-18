import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { AchievementBadgeContent } from '@/types';

interface AchievementBadgeEditorProps {
  block: Block;
}

const ICONS = [
  'star',
  'trophy',
  'medal',
  'shield',
  'crown',
  'diamond',
  'fire',
  'bolt',
  'check',
  'heart',
  'book',
  'money',
  'chart',
  'target',
  'rocket',
  'lightbulb',
  'thumbsup',
  'clock',
  'gear',
  'flag',
];

export function AchievementBadgeEditor({ block }: AchievementBadgeEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as AchievementBadgeContent;

  const updateContent = useCallback(
    (updates: Partial<AchievementBadgeContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => updateContent({ icon })}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded-md border transition-colors ${
                content.icon === icon
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
              aria-label={`Icon: ${icon}`}
              title={icon}
            >
              {icon === 'star' && '⭐'}
              {icon === 'trophy' && '🏆'}
              {icon === 'medal' && '🥇'}
              {icon === 'shield' && '🛡️'}
              {icon === 'crown' && '👑'}
              {icon === 'diamond' && '💎'}
              {icon === 'fire' && '🔥'}
              {icon === 'bolt' && '⚡'}
              {icon === 'check' && '✅'}
              {icon === 'heart' && '❤️'}
              {icon === 'book' && '📚'}
              {icon === 'money' && '💰'}
              {icon === 'chart' && '📊'}
              {icon === 'target' && '🎯'}
              {icon === 'rocket' && '🚀'}
              {icon === 'lightbulb' && '💡'}
              {icon === 'thumbsup' && '👍'}
              {icon === 'clock' && '⏰'}
              {icon === 'gear' && '⚙️'}
              {icon === 'flag' && '🏁'}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              content.isLocked ? 'bg-[#E2E8F0] text-[#94A3B8]' : 'bg-[#FEF3C7] text-[#F59E0B]'
            }`}
          >
            {content.isLocked ? '🔒' : '⭐'}
          </div>
          <label className="flex items-center gap-1 text-xs text-[#64748B]">
            <input
              type="checkbox"
              checked={!content.isLocked}
              onChange={(e) => updateContent({ isLocked: !e.target.checked })}
            />
            Unlocked
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Title</label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => updateContent({ title: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Badge title"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Unlock Condition</label>
          <input
            type="text"
            value={content.unlockCondition}
            onChange={(e) => updateContent({ unlockCondition: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Unlock condition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Description</label>
        <textarea
          value={content.description}
          onChange={(e) => updateContent({ description: e.target.value })}
          rows={2}
          className="w-full px-2 py-1 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none resize-none"
          aria-label="Badge description"
        />
      </div>
    </div>
  );
}
