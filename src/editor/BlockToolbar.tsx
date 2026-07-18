import type { Block } from '@/types';
import { useStore } from '@/store';

interface BlockToolbarProps {
  block: Block;
  dragListeners?: Record<string, unknown>;
}

export function BlockToolbar({ block, dragListeners }: BlockToolbarProps) {
  const removeBlock = useStore((s) => s.removeBlock);
  const duplicateBlock = useStore((s) => s.duplicateBlock);
  const moveBlock = useStore((s) => s.moveBlock);
  const toggleBlockLock = useStore((s) => s.toggleBlockLock);
  const toggleBlockVisibility = useStore((s) => s.toggleBlockVisibility);
  const addBlock = useStore((s) => s.addBlock);

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"
      role="toolbar"
      aria-label="Block actions"
    >
      <button
        {...dragListeners}
        className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B] cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
        aria-label="Drag block to reorder"
        tabIndex={0}
      >
        ⠿
      </button>
      <button
        onClick={() => addBlock('rich-text', block.id)}
        className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B]"
        title="Add block below (Ctrl+Enter)"
        aria-label="Add block below"
      >
        +
      </button>
      <span className="w-px h-4 bg-[#E2E8F0]" />
      <button
        onClick={() => moveBlock(block.id, 'up')}
        className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B]"
        title="Move up (Alt+Up)"
        aria-label="Move block up"
      >
        ↑
      </button>
      <button
        onClick={() => moveBlock(block.id, 'down')}
        className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B]"
        title="Move down (Alt+Down)"
        aria-label="Move block down"
      >
        ↓
      </button>
      <span className="w-px h-4 bg-[#E2E8F0]" />
      <button
        onClick={() => duplicateBlock(block.id)}
        className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B]"
        title="Duplicate (Ctrl+D)"
        aria-label="Duplicate block"
      >
        ⧉
      </button>
      <button
        onClick={() => removeBlock(block.id)}
        className="p-1 rounded hover:bg-[#E2E8F0] text-[#DC2626]"
        title="Delete (Ctrl+Backspace)"
        aria-label="Delete block"
      >
        🗑
      </button>
      <span className="w-px h-4 bg-[#E2E8F0]" />
      <button
        onClick={() => toggleBlockLock(block.id)}
        className={`p-1 rounded hover:bg-[#E2E8F0] ${block.settings.isLocked ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        title={block.settings.isLocked ? 'Unlock (Ctrl+L)' : 'Lock (Ctrl+L)'}
        aria-label={block.settings.isLocked ? 'Unlock block' : 'Lock block'}
      >
        {block.settings.isLocked ? '🔒' : '🔓'}
      </button>
      <button
        onClick={() => toggleBlockVisibility(block.id)}
        className={`p-1 rounded hover:bg-[#E2E8F0] ${block.settings.isVisible ? 'text-[#64748B]' : 'text-[#F59E0B]'}`}
        title={block.settings.isVisible ? 'Hide (Ctrl+Shift+H)' : 'Show (Ctrl+Shift+H)'}
        aria-label={block.settings.isVisible ? 'Hide block' : 'Show block'}
      >
        {block.settings.isVisible ? '👁' : '👁‍🗨'}
      </button>
    </div>
  );
}
