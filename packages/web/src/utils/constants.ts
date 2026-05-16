/**
 * 应用常量定义
 * 
 * 应用名称等常量集中管理，便于后续修改
 */

/** 应用名称 */
export const APP_NAME = 'NexTest';

/** 应用版本 */
export const APP_VERSION = '0.1.0';

/** 默认终端配置 */
export const DEFAULT_TERMINAL_CONFIG = {
  /** 默认 Shell 类型 */
  shellType: 'cmd' as const,
  /** 默认字体大小 */
  fontSize: 14,
  /** 默认字体族 */
  fontFamily: "Consolas, 'Courier New', monospace",
  /** 默认行高 */
  lineHeight: 1.2,
};

/** 布局尺寸配置 */
export const LAYOUT_SIZES = {
  /** 会话管理区默认宽度 */
  sessionPanelWidth: 200,
  /** 会话管理区最小宽度 */
  sessionPanelMinWidth: 150,
  /** 终端区最小宽度 */
  terminalMinWidth: 400,
  /** 工具侧边栏默认宽度 */
  toolSidebarWidth: 250,
  /** 工具侧边栏最小宽度 */
  toolSidebarMinWidth: 200,
  /** 命令编辑区默认高度 */
  commandEditorHeight: 200,
  /** 命令编辑区最小高度 */
  commandEditorMinHeight: 100,
};

/** 动画时长配置（毫秒） */
export const ANIMATION_DURATIONS = {
  /** 面板折叠/展开动画时长 */
  panelToggle: 200,
  /** Tab 切换动画时长 */
  tabSwitch: 150,
  /** 分屏调整动画时长 */
  splitResize: 100,
};