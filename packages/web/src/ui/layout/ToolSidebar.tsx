/**
 * 工具侧边栏组件（右侧）
 * 
 * 功能：
 * - 命令工具等一系列工具
 * - 默认折叠，显示图标
 * - 点击图标展开
 * - 展开时推开终端区
 */

import { useState } from 'react';

interface ToolSidebarProps {
  /** 是否折叠 */
  collapsed: boolean;
  /** 折叠/展开回调 */
  onToggle: () => void;
}

/**
 * 工具侧边栏组件
 * 
 * 默认宽度 250px，最小宽度 200px，可调整
 */
function ToolSidebar({ collapsed, onToggle }: ToolSidebarProps) {
  return (
    <div
      className={`flex border-l border-[var(--color-border)] bg-[#252526] transition-all duration-200 ${
        collapsed ? 'w-10' : 'w-[250px] min-w-[200px]'
      }`}
    >
      {/* 图标栏（始终显示） */}
      <div className="flex w-10 flex-col items-center gap-2 border-r border-[var(--color-border)] py-2">
        <button
          onClick={() => collapsed && onToggle()}
          className={`rounded p-2 ${
            collapsed ? 'text-gray-400 hover:text-white hover:bg-[#3e3e3e]' : 'text-[var(--color-primary)] bg-[#3e3e3e]'
          }`}
          title="命令工具"
        >
          ⌘
        </button>

        {/* 折叠按钮 */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="mt-auto rounded p-2 text-gray-400 hover:text-white hover:bg-[#3e3e3e]"
            title="折叠"
          >
            ▶
          </button>
        )}
      </div>

      {/* 展开内容 */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-sm text-gray-400">命令工具</div>
          {/* TODO: 实现命令工具列表 */}
        </div>
      )}
    </div>
  );
}

export default ToolSidebar;