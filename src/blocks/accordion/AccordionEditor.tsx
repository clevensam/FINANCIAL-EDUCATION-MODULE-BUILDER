import { useCallback, useState } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import { generateUUIDv4 } from '@/lib/uuid';
import type { AccordionContent, AccordionItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionEditorProps {
  block: Block;
}

export function AccordionEditor({ block }: AccordionEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as AccordionContent;
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const updateContent = useCallback(
    (updates: Partial<AccordionContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const addItem = useCallback(() => {
    const newItem: AccordionItem = {
      id: generateUUIDv4(),
      title: '',
      content: '',
    };
    updateContent({ items: [...content.items, newItem] });
  }, [content, updateContent]);

  const removeItem = useCallback(
    (id: string) => {
      if (content.items.length <= 1) return;
      updateContent({ items: content.items.filter((item) => item.id !== id) });
    },
    [content, updateContent],
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<AccordionItem>) => {
      const items = content.items.map((item) => (item.id === id ? { ...item, ...updates } : item));
      updateContent({ items });
    },
    [content, updateContent],
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {content.items.map((item, index) => (
        <div key={item.id} className="border border-[#E2E8F0] rounded-md overflow-hidden">
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left hover:bg-[#F8FAFC] transition-colors"
            aria-expanded={openItems.has(item.id)}
            aria-label={`Accordion item ${index + 1}`}
          >
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
              placeholder={`Item ${index + 1}`}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
              aria-label="Accordion item title"
            />
            <div className="flex items-center gap-1">
              {content.items.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="text-[#DC2626] hover:text-[#B91C1C] text-xs"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              )}
              <motion.span
                animate={{ rotate: openItems.has(item.id) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[#64748B]"
              >
                ▼
              </motion.span>
            </div>
          </button>
          <AnimatePresence>
            {openItems.has(item.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <textarea
                  value={item.content}
                  onChange={(e) => updateItem(item.id, { content: e.target.value })}
                  rows={3}
                  placeholder="Content..."
                  className="w-full px-3 py-2 text-sm border-t border-[#E2E8F0] outline-none resize-none"
                  aria-label="Accordion item content"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full px-3 py-1.5 text-xs font-medium text-[#2563EB] border border-dashed border-[#E2E8F0] rounded-md hover:bg-[#F8FAFC] transition-colors"
        aria-label="Add accordion item"
      >
        + Add item
      </button>
    </div>
  );
}
