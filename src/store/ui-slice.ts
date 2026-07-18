import { type StateCreator } from 'zustand';

export type DeviceView = 'desktop' | 'tablet' | 'mobile';
export type ThemeMode = 'light' | 'dark';

export interface UISlice {
  deviceView: DeviceView;
  theme: ThemeMode;
  isPreviewPanelOpen: boolean;
  isHistoryPanelOpen: boolean;
  showScrollSync: boolean;
  showSlashMenu: boolean;
  slashMenuQuery: string;

  setDeviceView: (view: DeviceView) => void;
  toggleTheme: () => void;
  togglePreviewPanel: () => void;
  toggleHistoryPanel: () => void;
  setScrollSync: (sync: boolean) => void;
  setSlashMenu: (open: boolean) => void;
  setSlashMenuQuery: (query: string) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  deviceView: 'desktop',
  theme: 'light',
  isPreviewPanelOpen: true,
  isHistoryPanelOpen: false,
  showScrollSync: false,
  showSlashMenu: false,
  slashMenuQuery: '',

  setDeviceView: (view) => set({ deviceView: view }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  togglePreviewPanel: () => set((state) => ({ isPreviewPanelOpen: !state.isPreviewPanelOpen })),
  toggleHistoryPanel: () => set((state) => ({ isHistoryPanelOpen: !state.isHistoryPanelOpen })),
  setScrollSync: (sync) => set({ showScrollSync: sync }),
  setSlashMenu: (open) => set({ showSlashMenu: open, slashMenuQuery: open ? '' : '' }),
  setSlashMenuQuery: (query) => set({ slashMenuQuery: query }),
});
