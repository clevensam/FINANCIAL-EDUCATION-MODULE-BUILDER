import { useCallback, useMemo } from 'react';
import type { Block } from '@/types';
import { useStore } from '@/store';
import type { VideoEmbedContent } from '@/types';

interface VideoEmbedEditorProps {
  block: Block;
}

function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseVimeoUrl(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : null;
}

export function VideoEmbedEditor({ block }: VideoEmbedEditorProps) {
  const updateBlockContent = useStore((s) => s.updateBlockContent);
  const content = block.content as VideoEmbedContent;

  const updateContent = useCallback(
    (updates: Partial<VideoEmbedContent>) => {
      updateBlockContent(block.id, { ...content, ...updates });
    },
    [block.id, content, updateBlockContent],
  );

  const handleUrlChange = useCallback(
    (url: string) => {
      const youtubeId = parseYouTubeUrl(url);
      if (youtubeId) {
        updateContent({ url, platform: 'youtube', videoId: youtubeId });
        return;
      }
      const vimeoId = parseVimeoUrl(url);
      if (vimeoId) {
        updateContent({ url, platform: 'vimeo', videoId: vimeoId });
        return;
      }
      updateContent({ url, platform: null, videoId: '' });
    },
    [updateContent],
  );

  const thumbnailUrl = useMemo(() => {
    if (content.platform === 'youtube' && content.videoId) {
      return `https://img.youtube.com/vi/${content.videoId}/hqdefault.jpg`;
    }
    return null;
  }, [content.platform, content.videoId]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">
          YouTube or Vimeo URL
        </label>
        <input
          type="url"
          value={content.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className="w-full px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-md focus:border-[#2563EB] outline-none"
          aria-label="Video URL"
        />
      </div>

      {content.url && !content.platform && (
        <div className="p-2 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#DC2626]">
          Only YouTube and Vimeo URLs are supported
        </div>
      )}

      {thumbnailUrl && (
        <div className="relative aspect-video bg-[#0F172A] rounded-md overflow-hidden">
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-[#2563EB] ml-1" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-0.5 rounded">
            {content.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
          </div>
        </div>
      )}
    </div>
  );
}
