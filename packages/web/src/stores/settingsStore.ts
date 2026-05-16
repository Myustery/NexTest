/**
 * 设置状态管理
 * 
 * 管理主题、快捷键、用户偏好等设置
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 主题配置 */
interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 前景色 */
  foreground: string;
  /** 背景色 */
  background: string;
  /** 光标颜色 */
  cursor: string;
  /** 选中颜色 */
  selection: string;
}

/** 字体配置 */
interface FontConfig {
  /** 字体族 */
  family: string;
  /** 字体大小 */
  size: number;
  /** 行高 */
  lineHeight: number;
}

/** 快捷键配置 */
interface ShortcutConfig {
  id: string;
  key: string;
  action: string;
  enabled: boolean;
}

/** 设置状态接口 */
interface SettingsState {
  /** 当前主题 */
  theme: ThemeConfig;
  /** 字体配置 */
  font: FontConfig;
  /** 快捷键配置 */
  shortcuts: ShortcutConfig[];
  /** 背景图片路径 */
  backgroundImage: string | null;
  /** 背景透明度 */
  backgroundOpacity: number;

  /** 更新主题 */
  setTheme: (theme: Partial<ThemeConfig>) => void;
  /** 更新字体 */
  setFont: (font: Partial<FontConfig>) => void;
  /** 更新快捷键 */
  setShortcut: (id: string, key: string) => void;
  /** 启用/禁用快捷键 */
  toggleShortcut: (id: string, enabled: boolean) => void;
  /** 设置背景图片 */
  setBackgroundImage: (path: string | null) => void;
  /** 设置背景透明度 */
  setBackgroundOpacity: (opacity: number) => void;
}

/** 默认主题 */
const defaultTheme: ThemeConfig = {
  name: '默认',
  foreground: '#cccccc',
  background: '#1e1e1e',
  cursor: '#ffffff',
  selection: '#264f78',
};

/** 默认字体 */
const defaultFont: FontConfig = {
  family: "Consolas, 'Courier New', monospace",
  size: 14,
  lineHeight: 1.2,
};

/** 默认快捷键 */
const defaultShortcuts: ShortcutConfig[] = [
  { id: 'new-session', key: 'Ctrl+Shift+T', action: '新建会话', enabled: true },
  { id: 'close-session', key: 'Ctrl+W', action: '关闭会话', enabled: true },
  { id: 'next-session', key: 'Ctrl+Tab', action: '下一个会话', enabled: true },
  { id: 'prev-session', key: 'Ctrl+Shift+Tab', action: '上一个会话', enabled: true },
  { id: 'split-horizontal', key: 'Ctrl+\\', action: '水平分屏', enabled: true },
  { id: 'split-vertical', key: 'Ctrl+Shift+\\', action: '垂直分屏', enabled: true },
  { id: 'toggle-fullscreen', key: 'F11', action: '全屏', enabled: true },
  { id: 'open-settings', key: 'Ctrl+,', action: '打开设置', enabled: true },
  { id: 'search-terminal', key: 'Ctrl+F', action: '搜索终端', enabled: true },
  { id: 'clear-terminal', key: 'Ctrl+L', action: '清空终端', enabled: true },
];

/** 设置状态 Store */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      font: defaultFont,
      shortcuts: defaultShortcuts,
      backgroundImage: null,
      backgroundOpacity: 1,

      setTheme: (theme) => {
        set((state) => ({
          theme: { ...state.theme, ...theme },
        }));
      },

      setFont: (font) => {
        set((state) => ({
          font: { ...state.font, ...font },
        }));
      },

      setShortcut: (id, key) => {
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, key } : s
          ),
        }));
      },

      toggleShortcut: (id, enabled) => {
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, enabled } : s
          ),
        }));
      },

      setBackgroundImage: (path) => {
        set({ backgroundImage: path });
      },

      setBackgroundOpacity: (opacity) => {
        set({ backgroundOpacity: opacity });
      },
    }),
    {
      name: 'nextest-settings',
    }
  )
);