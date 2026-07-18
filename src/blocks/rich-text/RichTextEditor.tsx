import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { Block } from '@/types';
import { useStore } from '@/store';
import { useEffect } from 'react';

interface RichTextEditorProps {
  block: Block;
}

export function RichTextEditor({ block }: RichTextEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
    ],
    content: (block.content as { html: string }).html,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[60px] text-[#0F172A]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateBlockContent(block.id, { html });
    },
  });

  useEffect(() => {
    if (editor && block.content) {
      const currentContent = (block.content as { html: string }).html;
      if (editor.getHTML() !== currentContent) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [block.id]);

  return (
    <div className="rich-text-editor">
      <div className="flex items-center gap-1 mb-2 pb-2 border-b border-[#E2E8F0] flex-wrap">
        <ToolbarButton
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          label="Bold"
          shortcut="Ctrl+B"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          label="Italic"
          shortcut="Ctrl+I"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          label="Underline"
          shortcut="Ctrl+U"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('strike')}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          label="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarButton>
        <span className="w-px h-4 bg-[#E2E8F0] mx-1" />
        {[1, 2, 3, 4].map((level) => (
          <ToolbarButton
            key={level}
            active={editor?.isActive('heading', { level })}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 })
                .run()
            }
            label={`Heading ${level}`}
          >
            H{level}
          </ToolbarButton>
        ))}
        <span className="w-px h-4 bg-[#E2E8F0] mx-1" />
        <ToolbarButton
          active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        >
          •≡
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          label="Ordered list"
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('blockquote')}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          label="Blockquote"
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive('codeBlock')}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          label="Code block"
        >
          {'</>'}
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  shortcut,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
        active ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-[#F1F5F9]'
      }`}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
    >
      {children}
    </button>
  );
}
