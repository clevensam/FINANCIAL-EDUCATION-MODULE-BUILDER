import { useStore, type BlockType } from '@/store';
import { BlockList } from './BlockList';
import { BlockPalette } from './BlockPalette';

export function EditorPanel() {
  const blocks = useStore((s) => s.module.blocks);
  const addBlock = useStore((s) => s.addBlock);
  const isDirty = useStore((s) => s.isDirty);

  return (
    <div className="p-6 max-w-3xl mx-auto" role="application" aria-label="Module Editor">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#64748B]">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          {isDirty && <span className="ml-2 text-xs text-[#F59E0B]">(unsaved)</span>}
        </h2>
        {blocks.length > 0 && (
          <BlockPalette onSelect={(type) => addBlock(type as unknown as BlockType)} />
        )}
      </div>

      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[#64748B] text-sm mb-4">
            Your module is empty. Add your first block to get started.
          </p>
          <BlockPalette onSelect={(type) => addBlock(type as unknown as BlockType)} />
        </div>
      ) : (
        <BlockList />
      )}
    </div>
  );
}
