import { useEffect } from 'react';
import { EditorPanel } from '@/editor/EditorPanel';
import { PreviewPanel } from '@/preview/PreviewPanel';
import { Toolbar } from '@/components/Toolbar';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useStore } from '@/store';
import { AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    __STORE__?: typeof useStore;
  }
}

export function App() {
  const theme = useStore((s) => s.theme);
  const isPreviewOpen = useStore((s) => s.isPreviewPanelOpen);

  useEffect(() => {
    window.__STORE__ = useStore;

    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const store = useStore.getState();
        const restored = store.undo(store.module);
        if (restored) store.setModule(restored);
      }

      if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        const store = useStore.getState();
        const next = store.redo();
        if (next) store.setModule(next);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`h-screen flex flex-col ${theme === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-white text-[#0F172A]'}`}
    >
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0]">
          <EditorPanel />
        </div>
        <AnimatePresence>
          {isPreviewOpen && (
            <div className="w-[45%] min-w-[400px] overflow-y-auto bg-[#F8FAFC]">
              <PreviewPanel />
            </div>
          )}
        </AnimatePresence>
        <HistoryPanel />
      </div>
    </div>
  );
}
