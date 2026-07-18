import { useCallback, useRef } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { ImageContent } from '@/types';

interface ImageEditorProps {
  block: Block;
}

export function ImageEditor({ block }: ImageEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as ImageContent;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateContent = useCallback(
    (updates: Partial<ImageContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Supported formats: JPG, PNG, WebP, SVG');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        updateContent({
          src: event.target?.result as string,
          isUpload: true,
        });
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [updateContent],
  );

  const handleUrlSubmit = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      updateContent({ src: url, isUpload: false });
    }
  }, [updateContent]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-xs font-medium bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8]"
        >
          Upload Image
        </button>
        <button
          onClick={handleUrlSubmit}
          className="px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-md hover:bg-[#F1F5F9] text-[#64748B]"
        >
          From URL
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload image file"
        />
      </div>

      {content.src && (
        <div className="relative">
          <img
            src={content.src}
            alt={content.alt || 'Uploaded image'}
            className={`max-w-full rounded-md ${
              content.alignment === 'left'
                ? 'mr-auto'
                : content.alignment === 'right'
                  ? 'ml-auto'
                  : content.alignment === 'center'
                    ? 'mx-auto'
                    : 'w-full'
            }`}
            style={{ maxHeight: '300px', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23F1F5F9"/><text x="50%" y="50%" font-size="14" fill="%2364748B" text-anchor="middle" dy=".3em">Image not found</text></svg>';
            }}
          />
          <button
            onClick={() => updateContent({ src: '', alt: '', caption: '' })}
            className="absolute top-1 right-1 w-6 h-6 bg-[#DC2626] text-white rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Alt text</label>
          <input
            type="text"
            value={content.alt}
            onChange={(e) => updateContent({ alt: e.target.value })}
            placeholder="Describe the image"
            className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
            aria-label="Image alt text"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Alignment</label>
          <select
            value={content.alignment}
            onChange={(e) =>
              updateContent({ alignment: e.target.value as ImageContent['alignment'] })
            }
            className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md bg-white focus:border-[#2563EB] outline-none"
            aria-label="Image alignment"
          >
            <option value="full-width">Full Width</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Caption</label>
        <input
          type="text"
          value={content.caption}
          onChange={(e) => updateContent({ caption: e.target.value })}
          placeholder="Image caption"
          className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
          aria-label="Image caption"
        />
      </div>
    </div>
  );
}
