import type { Block, BlockType } from '@/types';
import { useStore } from '@/store';
import { BlockToolbar } from './BlockToolbar';
import { RichTextEditor } from '@/blocks/rich-text/RichTextEditor';
import { ImageEditor } from '@/blocks/image/ImageEditor';
import { VideoEmbedEditor } from '@/blocks/video-embed/VideoEmbedEditor';
import { QuizMCQEditor } from '@/blocks/quiz-mcq/QuizMCQEditor';
import { QuizTrueFalseEditor } from '@/blocks/quiz-true-false/QuizTrueFalseEditor';
import { EMICalculatorEditor } from '@/blocks/emi-calculator/EMICalculatorEditor';
import { SIPCalculatorEditor } from '@/blocks/sip-calculator/SIPCalculatorEditor';
import { CompoundInterestEditor } from '@/blocks/compound-interest/CompoundInterestEditor';
import { CalloutEditor } from '@/blocks/callout/CalloutEditor';
import { DividerEditor } from '@/blocks/divider/DividerEditor';
import { AccordionEditor } from '@/blocks/accordion/AccordionEditor';
import { ProgressTrackerEditor } from '@/blocks/progress-tracker/ProgressTrackerEditor';
import { AchievementBadgeEditor } from '@/blocks/achievement-badge/AchievementBadgeEditor';
import { CodeSnippetEditor } from '@/blocks/code-snippet/CodeSnippetEditor';
import { ConceptExplainerEditor } from '@/blocks/concept-explainer/ConceptExplainerEditor';
import { motion } from 'framer-motion';

interface BlockWrapperProps {
  block: Block;
  dragListeners?: Record<string, unknown>;
}

const blockLabels: Record<BlockType, string> = {
  'rich-text': 'Rich Text',
  image: 'Image',
  'video-embed': 'Video Embed',
  'quiz-mcq': 'Quiz (MCQ)',
  'quiz-true-false': 'Quiz (True/False)',
  'emi-calculator': 'EMI Calculator',
  'sip-calculator': 'SIP Calculator',
  'compound-interest': 'Compound Interest',
  callout: 'Callout',
  divider: 'Divider',
  accordion: 'Accordion',
  'progress-tracker': 'Progress Tracker',
  'achievement-badge': 'Achievement Badge',
  'code-snippet': 'Code Snippet',
  'concept-explainer': 'Concept Explainer',
};

function renderEditor(block: Block) {
  switch (block.type) {
    case 'rich-text':
      return <RichTextEditor block={block} />;
    case 'image':
      return <ImageEditor block={block} />;
    case 'video-embed':
      return <VideoEmbedEditor block={block} />;
    case 'quiz-mcq':
      return <QuizMCQEditor block={block} />;
    case 'quiz-true-false':
      return <QuizTrueFalseEditor block={block} />;
    case 'emi-calculator':
      return <EMICalculatorEditor block={block} />;
    case 'sip-calculator':
      return <SIPCalculatorEditor block={block} />;
    case 'compound-interest':
      return <CompoundInterestEditor block={block} />;
    case 'callout':
      return <CalloutEditor block={block} />;
    case 'divider':
      return <DividerEditor block={block} />;
    case 'accordion':
      return <AccordionEditor block={block} />;
    case 'progress-tracker':
      return <ProgressTrackerEditor block={block} />;
    case 'achievement-badge':
      return <AchievementBadgeEditor block={block} />;
    case 'code-snippet':
      return <CodeSnippetEditor block={block} />;
    case 'concept-explainer':
      return <ConceptExplainerEditor block={block} />;
  }
}

export function BlockWrapper({ block, dragListeners }: BlockWrapperProps) {
  const selectedBlockId = useStore((s) => s.selectedBlockId);
  const selectBlock = useStore((s) => s.selectBlock);
  const isSelected = selectedBlockId === block.id;

  const totalBlocks = useStore((s) => s.module.blocks.length);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative group rounded-lg border transition-all duration-200 ${
        isSelected
          ? 'border-[#2563EB] ring-1 ring-[#2563EB]'
          : 'border-[#E2E8F0] hover:border-[#94A3B8]'
      } ${block.settings.isLocked ? 'opacity-60' : ''} ${block.settings.isVisible ? '' : 'opacity-40'}`}
      role="group"
      aria-label={`${blockLabels[block.type]} block, pos ${block.order + 1} of ${totalBlocks}`}
      onClick={() => selectBlock(block.id)}
      onFocus={() => selectBlock(block.id)}
      tabIndex={0}
    >
      <BlockToolbar block={block} dragListeners={dragListeners} />
      <div className="px-4 py-3">{renderEditor(block)}</div>
    </motion.div>
  );
}
