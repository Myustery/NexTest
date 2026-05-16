/**
 * 终端区组件（中间）
 * 
 * 功能：
 * - 顶部 Tab 页签栏
 * - 中部终端界面（支持分屏）
 * - 底部命令编辑页面（可折叠）
 */

import { useState } from 'react';

interface TerminalAreaProps {
  /** 会话管理区是否折叠 */
  sessionCollapsed: boolean;
  /** 工具侧边栏是否折叠 */
  toolCollapsed: boolean;
}

/**
 * 终端区组件
 * 
 * 自适应宽度，最小宽度 400px
 */
function TerminalArea({ sessionCollapsed: _sessionCollapsed, toolCollapsed: _toolCollapsed }: TerminalAreaProps) {
  // 命令编辑区是否折叠
  const [commandEditorCollapsed, setCommandEditorCollapsed] = useState(true);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Tab 页签栏 */}
      <div className="flex items-center border-b border-[var(--color-border)] bg-[#252526]">
        {/* Tab 列表 */}
        <div className="flex flex-1 overflow-x-auto">
          {/* TODO: 实现 Tab 列表 */}
          <div className="flex items-center px-4 py-2 text-sm text-gray-400">
            暂无打开的终端
          </div>
        </div>

        {/* 新建 Tab 按钮 */}
        <button
          className="px-3 py-2 text-gray-400 hover:text-white"
          title="新建终端"
        >
          +
        </button>
      </div>

      {/* 终端界面 */}
      <div className="flex-1 overflow-hidden bg-[var(--color-bg)]">
        {/* TODO: 实现 xterm.js 终端 */}
        <div className="flex h-full items-center justify-center text-gray-500">
          创建或选择一个会话开始使用
        </div>
      </div>

      {/* 命令编辑区（可折叠） */}
      <div
        className={`border-t border-[var(--color-border)] bg-[#252526] transition-all duration-200 ${
          commandEditorCollapsed ? 'h-8' : 'h-[200px] min-h-[100px]'
        }`}
      >
        {/* 命令编辑区头部 */}
        <div
          className="flex cursor-pointer items-center justify-between px-3 py-1"
          onClick={() => setCommandEditorCollapsed(!commandEditorCollapsed)}
        >
          <span className="text-xs text-gray-400">命令编辑</span>
          <span className="text-xs text-gray-400">
            {commandEditorCollapsed ? '▲' : '▼'}
          </span>
        </div>

        {/* 命令编辑区内容 */}
        {!commandEditorCollapsed && (
          <div className="flex-1 px-3">
            {/* TODO: 实现命令编辑器 */}
          </div>
        )}
      </div>
    </div>
  );
}

export default TerminalArea;