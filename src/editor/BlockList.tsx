import { useState, useCallback } from 'react';
import { useStore } from '@/store';
import { BlockWrapper } from './BlockWrapper';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block } from '@/types';
import { motion } from 'framer-motion';

function SortableBlock({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockWrapper block={block} dragListeners={listeners} />
    </div>
  );
}

export function BlockList() {
  const blocks = useStore((s) => s.module.blocks);
  const reorderBlock = useStore((s) => s.reorderBlock);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id);
      const newIndex = sortedBlocks.findIndex((b) => b.id === over.id);

      if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;

      reorderBlock(active.id as string, newIndex);
    },
    [sortedBlocks, reorderBlock],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sortedBlocks.map((block) => (
            <SortableBlock key={block.id} block={block} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeBlock && (
          <motion.div initial={{ scale: 1.02 }} animate={{ scale: 1.02 }} className="opacity-90">
            <BlockWrapper block={activeBlock} />
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
