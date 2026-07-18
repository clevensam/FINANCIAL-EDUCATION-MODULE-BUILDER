import { useCallback, useRef } from 'react';
import { useStore, type DeviceView } from '@/store';
import { exportModule, downloadExport } from '@/export/export-module';
import { importModule } from '@/export/import-module';

export function Toolbar() {
  const moduleTitle = useStore((s) => s.module.title);
  const setModuleTitle = useStore((s) => s.setModuleTitle);
  const deviceView = useStore((s) => s.deviceView);
  const setDeviceView = useStore((s) => s.setDeviceView);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const isPreviewOpen = useStore((s) => s.isPreviewPanelOpen);
  const togglePreviewPanel = useStore((s) => s.togglePreviewPanel);
  const toggleHistoryPanel = useStore((s) => s.toggleHistoryPanel);
  const setModule = useStore((s) => s.setModule);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const module = useStore.getState().module;
    const result = exportModule(module);
    if (result.success) {
      downloadExport(result);
    } else {
      alert(`Export failed:\n${result.errors.join('\n')}`);
    }
  }, []);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const result = importModule(text);
        if (result.success && result.module) {
          setModule(result.module);
          if (result.warnings.length > 0) {
            console.warn('Import warnings:', result.warnings);
          }
        } else {
          alert(`Import failed:\n${result.errors.join('\n')}`);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [setModule],
  );

  const devices: { key: DeviceView; label: string; icon: string }[] = [
    { key: 'desktop', label: 'Desktop', icon: '🖥' },
    { key: 'tablet', label: 'Tablet', icon: '📱' },
    { key: 'mobile', label: 'Mobile', icon: '📲' },
  ];

  return (
    <header
      className="h-12 px-4 flex items-center justify-between border-b border-[#E2E8F0] bg-white shrink-0"
      role="toolbar"
      aria-label="Main toolbar"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-[#2563EB]">ModuleForge</span>
        <input
          type="text"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 text-[#0F172A] w-48"
          aria-label="Module title"
        />
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center border border-[#E2E8F0] rounded-md overflow-hidden"
          role="radiogroup"
          aria-label="Preview device"
        >
          {devices.map((d) => (
            <button
              key={d.key}
              onClick={() => setDeviceView(d.key)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                deviceView === d.key
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
              role="radio"
              aria-checked={deviceView === d.key}
              aria-label={`${d.label} view`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={togglePreviewPanel}
          className={`px-3 py-1 text-xs font-medium rounded-md border border-[#E2E8F0] transition-colors ${
            isPreviewOpen ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-[#F1F5F9]'
          }`}
          aria-label="Toggle preview panel"
        >
          Preview
        </button>

        <button
          onClick={toggleTheme}
          className="px-3 py-1 text-xs font-medium text-[#64748B] rounded-md border border-[#E2E8F0] hover:bg-[#F1F5F9]"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button
          onClick={toggleHistoryPanel}
          className="px-3 py-1 text-xs font-medium text-[#64748B] rounded-md border border-[#E2E8F0] hover:bg-[#F1F5F9]"
          aria-label="Toggle history panel"
        >
          History
        </button>

        <span className="w-px h-4 bg-[#E2E8F0]" />

        <button
          onClick={handleExport}
          className="px-3 py-1 text-xs font-medium text-[#16A34A] rounded-md border border-[#E2E8F0] hover:bg-[#F1F5F9]"
          aria-label="Export module as JSON"
        >
          Export
        </button>
        <button
          onClick={handleImport}
          className="px-3 py-1 text-xs font-medium text-[#2563EB] rounded-md border border-[#E2E8F0] hover:bg-[#F1F5F9]"
          aria-label="Import module from JSON"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
