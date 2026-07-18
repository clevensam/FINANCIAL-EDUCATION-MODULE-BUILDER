import { useCallback } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { CodeSnippetContent } from '@/types';

interface CodeSnippetEditorProps {
  block: Block;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
] as const;

export function CodeSnippetEditor({ block }: CodeSnippetEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as CodeSnippetContent;

  const updateContent = useCallback(
    (updates: Partial<CodeSnippetContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content.code);
  }, [content.code]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <select
          value={content.language}
          onChange={(e) =>
            updateContent({ language: e.target.value as CodeSnippetContent['language'] })
          }
          className="px-2 py-0.5 text-xs border border-[#E2E8F0] rounded bg-white focus:border-[#2563EB] outline-none"
          aria-label="Code language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-xs text-[#64748B]">
          <input
            type="checkbox"
            checked={content.showLineNumbers}
            onChange={(e) => updateContent({ showLineNumbers: e.target.checked })}
          />
          Line numbers
        </label>
      </div>

      <div className="relative">
        <pre className="bg-[#1E293B] text-[#E2E8F0] p-3 rounded-md overflow-x-auto text-sm font-mono">
          <code>
            {content.showLineNumbers
              ? content.code.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    <span className="text-[#64748B] select-none mr-3 inline-block w-6 text-right">
                      {i + 1}
                    </span>
                    {line}
                  </span>
                ))
              : content.code}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-[#334155] text-[#94A3B8] rounded hover:bg-[#475569] transition-colors"
          aria-label="Copy code"
        >
          Copy
        </button>
      </div>

      <textarea
        value={content.code}
        onChange={(e) => updateContent({ code: e.target.value })}
        rows={4}
        className="w-full px-2 py-1 text-sm font-mono border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none resize-none"
        placeholder="Paste your code here..."
        aria-label="Code content"
      />
    </div>
  );
}
