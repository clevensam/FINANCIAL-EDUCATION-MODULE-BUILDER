import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';

export function HistoryPanel() {
  const isOpen = useStore((s) => s.isHistoryPanelOpen);
  const past = useStore((s) => s.past);
  const future = useStore((s) => s.future);
  const moduleTitle = useStore((s) => s.module.title);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const setModule = useStore((s) => s.setModule);

  const handleUndo = () => {
    const currentModule = useStore.getState().module;
    const restored = undo(currentModule);
    if (restored) {
      setModule(restored);
    }
  };

  const handleRedo = () => {
    const next = redo();
    if (next) {
      setModule(next);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-80 border-l border-[#E2E8F0] bg-white shrink-0 overflow-y-auto"
          role="log"
          aria-label="Undo/redo history"
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0F172A]">History</h2>
              <div className="flex gap-1">
                <button
                  onClick={handleUndo}
                  disabled={past.length === 0}
                  className="px-2 py-1 text-xs font-medium rounded border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Undo"
                  title="Undo (Ctrl+Z)"
                >
                  Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={future.length === 0}
                  className="px-2 py-1 text-xs font-medium rounded border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Redo"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  Redo
                </button>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8]">
              {past.length} snapshot{past.length !== 1 ? 's' : ''} · {future.length} future
            </p>

            <div className="space-y-1">
              {future.length > 0 && (
                <div className="border-t border-dashed border-[#E2E8F0] pt-1">
                  {future
                    .slice()
                    .reverse()
                    .map((_, i) => (
                      <div
                        key={`future-${i}`}
                        className="text-xs text-[#94A3B8] py-1 px-2 rounded hover:bg-[#F8FAFC]"
                      >
                        Future #{future.length - i}
                      </div>
                    ))}
                </div>
              )}

              <div className="border border-[#2563EB] rounded bg-blue-50 px-2 py-1 text-xs font-medium text-[#2563EB]">
                Current: {moduleTitle}
              </div>

              {past.length > 0 && (
                <div className="border-t border-[#E2E8F0] pt-1">
                  {[...past].reverse().map((snapshot, i) => (
                    <div
                      key={`past-${i}`}
                      className="text-xs text-[#64748B] py-1 px-2 rounded hover:bg-[#F8FAFC] cursor-pointer"
                      onClick={() => {
                        setModule(snapshot);
                      }}
                    >
                      Snapshot #{past.length - i} · {snapshot.blocks.length} blocks
                    </div>
                  ))}
                </div>
              )}

              {past.length === 0 && future.length === 0 && (
                <p className="text-xs text-[#94A3B8] text-center py-4">
                  No history yet. Start editing to create snapshots.
                </p>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
