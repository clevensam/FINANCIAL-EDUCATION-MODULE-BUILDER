import { useState, useRef, useEffect } from 'react';
import { BlockType } from '@/types';

interface BlockPaletteProps {
  onSelect: (type: string) => void;
  trigger?: 'button' | 'slash';
  query?: string;
  onClose?: () => void;
}

const blockTypes = [
  {
    type: BlockType.RichText,
    name: 'Rich Text',
    description: 'Formatted text with headings, lists, and more',
    icon: '📝',
  },
  { type: BlockType.Image, name: 'Image', description: 'Upload or embed an image', icon: '🖼' },
  {
    type: BlockType.VideoEmbed,
    name: 'Video',
    description: 'Embed YouTube or Vimeo video',
    icon: '🎬',
  },
  {
    type: BlockType.QuizMCQ,
    name: 'Quiz (MCQ)',
    description: 'Multiple choice question',
    icon: '❓',
  },
  {
    type: BlockType.QuizTrueFalse,
    name: 'True/False',
    description: 'True or false question',
    icon: '✅',
  },
  {
    type: BlockType.EMICalculator,
    name: 'EMI Calculator',
    description: 'Equated monthly installment calculator',
    icon: '🏦',
  },
  {
    type: BlockType.SIPCalculator,
    name: 'SIP Calculator',
    description: 'Systematic investment plan calculator',
    icon: '📈',
  },
  {
    type: BlockType.CompoundInterest,
    name: 'Compound Interest',
    description: 'Compound interest calculator',
    icon: '📊',
  },
  {
    type: BlockType.Callout,
    name: 'Callout',
    description: 'Highlighted information box',
    icon: '💡',
  },
  {
    type: BlockType.Divider,
    name: 'Divider',
    description: 'Horizontal separator line',
    icon: '➖',
  },
  {
    type: BlockType.Accordion,
    name: 'Accordion',
    description: 'Expandable content sections',
    icon: '📑',
  },
  {
    type: BlockType.ProgressTracker,
    name: 'Progress Tracker',
    description: 'Track learner progress',
    icon: '📋',
  },
  {
    type: BlockType.AchievementBadge,
    name: 'Badge',
    description: 'Achievement badge for learners',
    icon: '🏆',
  },
  {
    type: BlockType.CodeSnippet,
    name: 'Code',
    description: 'Syntax highlighted code block',
    icon: '💻',
  },
  {
    type: BlockType.ConceptExplainer,
    name: 'Explainer',
    description: 'Step-by-step animated explainer',
    icon: '📖',
  },
];

export function BlockPalette({
  onSelect,
  trigger = 'button',
  query = '',
  onClose,
}: BlockPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 'slash' && isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, trigger]);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const filtered = blockTypes.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (type: string) => {
    onSelect(type);
    setIsOpen(false);
    setSearchQuery('');
    onClose?.();
  };

  if (trigger === 'button') {
    return (
      <div ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors"
          aria-label="Add block"
        >
          + Add Block
        </button>

        {isOpen && (
          <div
            className="absolute mt-2 w-72 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            role="listbox"
            aria-expanded="true"
          >
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blocks..."
                className="w-full px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-md outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="px-1 pb-1">
              {filtered.map((b) => (
                <button
                  key={b.type}
                  onClick={() => handleSelect(b.type)}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-[#F1F5F9] text-left transition-colors"
                  role="option"
                  aria-selected={false}
                >
                  <span className="text-lg mt-0.5">{b.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-[#0F172A]">{b.name}</div>
                    <div className="text-xs text-[#64748B]">{b.description}</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-sm text-[#64748B] text-center">
                  No blocks match your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="w-72 bg-white border border-[#E2E8F0] rounded-lg shadow-lg max-h-80 overflow-y-auto"
      role="listbox"
      aria-expanded="true"
      aria-activedescendant={filtered[0]?.type}
    >
      <div className="p-2">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blocks..."
          className="w-full px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-md outline-none focus:border-[#2563EB]"
        />
      </div>
      <div className="px-1 pb-1">
        {filtered.map((b) => (
          <button
            key={b.type}
            onClick={() => handleSelect(b.type)}
            className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-[#F1F5F9] text-left transition-colors"
            role="option"
            aria-selected={false}
          >
            <span className="text-lg mt-0.5">{b.icon}</span>
            <div>
              <div className="text-sm font-medium text-[#0F172A]">{b.name}</div>
              <div className="text-xs text-[#64748B]">{b.description}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-sm text-[#64748B] text-center">
            No blocks match your search
          </div>
        )}
      </div>
    </div>
  );
}
