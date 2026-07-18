import { useStore } from '@/store';
import { BlockPreviewRenderer } from './BlockPreviewRenderer';

export function PreviewPanel() {
  const deviceView = useStore((s) => s.deviceView);
  const module = useStore((s) => s.module);
  const theme = useStore((s) => s.theme);

  const widths: Record<string, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className={`p-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>
      <div
        className={`${widths[deviceView]} mx-auto transition-all duration-400 ease-in-out ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } min-h-[600px] rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden`}
      >
        <div className={`p-6 ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
          <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
          {module.description && (
            <p
              className={`text-base mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-[#64748B]'}`}
            >
              {module.description}
            </p>
          )}
          <div className="space-y-6">
            {module.blocks
              .filter((b) => b.settings.isVisible)
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div key={block.id}>
                  <BlockPreviewRenderer block={block} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
