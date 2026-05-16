/**
 * 终端状态管理
 * 
 * 管理 Tab、分屏、终端实例等状态
 */

import { create } from 'zustand';

/** Tab 接口 */
interface Tab {
  id: string;
  sessionId: string;
  name: string;
  isClone: boolean;
  parentId: string | null;
}

/** 分屏方向 */
type SplitDirection = 'horizontal' | 'vertical';

/** 分屏节点 */
interface SplitPane {
  id: string;
  direction: SplitDirection;
  children: string[]; // Tab ID 或子 SplitPane ID
}

/** 终端状态接口 */
interface TerminalState {
  /** Tab 列表 */
  tabs: Tab[];
  /** 当前活动的 Tab ID */
  activeTabId: string | null;
  /** 分屏布局 */
  splitLayout: SplitPane | null;

  /** 创建 Tab */
  createTab: (sessionId: string, name: string) => void;
  /** 创建分身 Tab */
  cloneTab: (tabId: string) => void;
  /** 关闭 Tab */
  closeTab: (tabId: string) => void;
  /** 选择 Tab */
  selectTab: (tabId: string) => void;
  /** 更新 Tab 名称 */
  renameTab: (tabId: string, name: string) => void;

  /** 分屏 */
  splitPane: (tabId: string, direction: SplitDirection) => void;
  /** 关闭分屏 */
  closeSplit: (tabId: string) => void;
}

/** 终端状态 Store */
export const useTerminalStore = create<TerminalState>((set) => ({
  tabs: [],
  activeTabId: null,
  splitLayout: null,

  createTab: (sessionId, name) => {
    const tab: Tab = {
      id: crypto.randomUUID(),
      sessionId,
      name,
      isClone: false,
      parentId: null,
    };
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    }));
  },

  cloneTab: (tabId) => {
    set((state) => {
      const originalTab = state.tabs.find((t) => t.id === tabId);
      if (!originalTab) return state;

      const clonedTab: Tab = {
        id: crypto.randomUUID(),
        sessionId: originalTab.sessionId,
        name: `${originalTab.name} (分身)`,
        isClone: true,
        parentId: tabId,
      };

      return {
        tabs: [...state.tabs, clonedTab],
        activeTabId: clonedTab.id,
      };
    });
  },

  closeTab: (tabId) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      const newActiveTabId =
        state.activeTabId === tabId
          ? newTabs.length > 0
            ? newTabs[newTabs.length - 1].id
            : null
          : state.activeTabId;

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  selectTab: (tabId) => {
    set({ activeTabId: tabId });
  },

  renameTab: (tabId, name) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, name } : tab
      ),
    }));
  },

  splitPane: (tabId, direction) => {
    // TODO: 实现分屏逻辑
    console.log('Split pane:', tabId, direction);
  },

  closeSplit: (tabId) => {
    // TODO: 实现关闭分屏逻辑
    console.log('Close split:', tabId);
  },
}));