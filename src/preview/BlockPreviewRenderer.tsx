import type { Block } from '@/types';
import { EMIPreview } from './EMIPreview';
import { SIPPreview } from './SIPPreview';
import { CompoundInterestPreview } from './CompoundInterestPreview';

interface BlockPreviewRendererProps {
  block: Block;
}

export function BlockPreviewRenderer({ block }: BlockPreviewRendererProps) {
  switch (block.type) {
    case 'rich-text': {
      const content = block.content as { html: string };
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      );
    }
    case 'image': {
      const content = block.content as {
        src: string;
        alt: string;
        caption: string;
        alignment: string;
      };
      const alignClass =
        content.alignment === 'center' ? 'mx-auto' : content.alignment === 'right' ? 'ml-auto' : '';
      return (
        <div>
          <img
            src={content.src}
            alt={content.alt}
            className={`max-w-full h-auto rounded ${alignClass}`}
          />
          {content.caption && (
            <p className="text-sm text-[#64748B] mt-1 text-center">{content.caption}</p>
          )}
        </div>
      );
    }
    case 'video-embed': {
      const content = block.content as { url: string; platform: string | null; videoId: string };
      if (!content.videoId) {
        return <p className="text-sm text-[#DC2626]">No video URL provided</p>;
      }
      const src =
        content.platform === 'youtube'
          ? `https://www.youtube.com/embed/${content.videoId}`
          : content.platform === 'vimeo'
            ? `https://player.vimeo.com/video/${content.videoId}`
            : null;
      if (!src) return <p className="text-sm text-[#DC2626]">Unsupported video platform</p>;
      return (
        <div className="aspect-video">
          <iframe src={src} title="Video embed" className="w-full h-full rounded" allowFullScreen />
        </div>
      );
    }
    case 'quiz-mcq':
    case 'quiz-true-false':
      return <p className="text-sm text-[#64748B]">Quiz preview (interactive quiz coming soon)</p>;
    case 'emi-calculator':
      return <EMIPreview block={block} />;
    case 'sip-calculator':
      return <SIPPreview block={block} />;
    case 'compound-interest':
      return <CompoundInterestPreview block={block} />;
    case 'callout': {
      const content = block.content as { variant: string; icon: string; content: string };
      const variantStyles: Record<string, string> = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        tip: 'bg-green-50 border-green-200 text-green-800',
        important: 'bg-purple-50 border-purple-200 text-purple-800',
        danger: 'bg-red-50 border-red-200 text-red-800',
      };
      return (
        <div
          className={`p-4 rounded-lg border ${variantStyles[content.variant] || variantStyles.info}`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">{content.icon}</span>
            <p className="text-sm">{content.content}</p>
          </div>
        </div>
      );
    }
    case 'divider': {
      const content = block.content as { style: string; spacing: string };
      const spacingClass =
        content.spacing === 'compact' ? 'my-2' : content.spacing === 'spacious' ? 'my-8' : 'my-4';
      if (content.style === 'gradient') {
        return (
          <hr
            className={`${spacingClass} border-0 h-px bg-gradient-to-r from-transparent via-[#2563EB] to-transparent`}
          />
        );
      }
      const dashClass =
        content.style === 'dashed'
          ? 'border-dashed'
          : content.style === 'dotted'
            ? 'border-dotted'
            : '';
      return <hr className={`${spacingClass} border-t border-[#E2E8F0] ${dashClass}`} />;
    }
    case 'accordion': {
      const content = block.content as {
        items: Array<{ id: string; title: string; content: string }>;
      };
      if (content.items.length === 0)
        return <p className="text-sm text-[#64748B]">No accordion items</p>;
      return (
        <div className="space-y-1">
          {content.items.map((item) => (
            <details key={item.id} className="group border border-[#E2E8F0] rounded-md">
              <summary className="px-4 py-2 text-sm font-medium text-[#0F172A] cursor-pointer hover:bg-[#F8FAFC] rounded-md">
                {item.title}
              </summary>
              <div className="px-4 py-2 text-sm text-[#475569] border-t border-[#E2E8F0]">
                {item.content}
              </div>
            </details>
          ))}
        </div>
      );
    }
    case 'progress-tracker': {
      const content = block.content as {
        totalSteps: number;
        currentStep: number;
        steps: string[];
        mode: string;
      };
      if (content.steps.length === 0)
        return <p className="text-sm text-[#64748B]">No steps configured</p>;
      return (
        <div className="space-y-2">
          {content.mode === 'branching' ? (
            <div className="space-y-3">
              {content.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      i <= content.currentStep
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-sm ${i <= content.currentStep ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {content.steps.map((step, i) => (
                <div key={i} className="flex-1">
                  <div
                    className={`h-2 rounded-full ${
                      i <= content.currentStep ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                    }`}
                    title={step}
                  />
                  <p className="text-xs text-center text-[#64748B] mt-1 truncate">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'achievement-badge': {
      const content = block.content as {
        icon: string;
        title: string;
        description: string;
        isLocked: boolean;
        unlockCondition: string;
      };
      return (
        <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-b from-[#FEF9C3] to-[#FEF3C7] rounded-lg border border-[#FDE68A]">
          <div className={`text-4xl ${content.isLocked ? 'grayscale opacity-50' : ''}`}>
            {content.icon || '🏆'}
          </div>
          <p className="text-sm font-semibold text-[#0F172A]">{content.title}</p>
          <p className="text-xs text-[#64748B] text-center">{content.description}</p>
          {content.isLocked && (
            <p className="text-xs text-[#F59E0B] font-medium">Locked: {content.unlockCondition}</p>
          )}
        </div>
      );
    }
    case 'code-snippet': {
      const content = block.content as { code: string; language: string; showLineNumbers: boolean };
      const lines = content.code.split('\n');
      return (
        <div className="bg-[#1E293B] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#334155]">
            <span className="text-xs text-[#94A3B8] uppercase">{content.language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(content.code)}
              className="text-xs text-[#94A3B8] hover:text-white transition-colors"
              aria-label="Copy code"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm font-mono text-[#E2E8F0]">
            <code>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  {content.showLineNumbers && (
                    <span className="text-[#64748B] mr-4 select-none text-right w-8 shrink-0">
                      {i + 1}
                    </span>
                  )}
                  <span>{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      );
    }
    case 'concept-explainer': {
      const content = block.content as {
        steps: Array<{ id: string; title: string; description: string; visualIndicator: string }>;
        autoPlay: boolean;
        autoPlayInterval: number;
      };
      if (content.steps.length === 0)
        return <p className="text-sm text-[#64748B]">No steps configured</p>;
      return (
        <div className="space-y-4">
          <div className="flex gap-2">
            {content.steps.map((step, i) => (
              <button
                key={step.id}
                className="w-3 h-3 rounded-full bg-[#2563EB]/30 hover:bg-[#2563EB]/60 transition-colors"
                aria-label={`Step ${i + 1}: ${step.title}`}
              />
            ))}
          </div>
          <div className="p-4 border border-[#E2E8F0] rounded-lg">
            <p className="text-lg mb-1">{content.steps[0].visualIndicator}</p>
            <p className="text-sm font-semibold text-[#0F172A]">{content.steps[0].title}</p>
            <p className="text-sm text-[#475569] mt-1">{content.steps[0].description}</p>
          </div>
        </div>
      );
    }
    default:
      return <p className="text-sm text-[#64748B]">Unknown block type</p>;
  }
}
