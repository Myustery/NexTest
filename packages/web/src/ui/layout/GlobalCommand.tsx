/**
 * 全局命令编辑页面组件（底部）
 * 
 * 功能：
 * - 全局命令编辑
 * - 始终可见
 * - 作用域为全局
 */

import { useState } from 'react';

/**
 * 全局命令编辑页面组件
 * 
 * 固定在窗口底部，始终可见
 */
function GlobalCommand() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-t border-[var(--color-border)] bg-[#252526] transition-all duration-200 ${
        expanded ? 'h-[150px]' : 'h-8'
      }`}
    >
      {/* 头部 */}
      <div
        className="flex cursor-pointer items-center justify-between px-3 py-1"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs text-gray-400">全局命令</span>
        <div className="flex items-center gap-2">
          {expanded && (
            <>
              <button className="text-xs text-green-400 hover:text-green-300" title="执行">
                ▶
              </button>
              <button className="text-xs text-red-400 hover:text-red-300" title="终止">
                ⏹
              </button>
            </>
          )}
          <span className="text-xs text-gray-400">{expanded ? '▼' : '▲'}</span>
        </div>
      </div>

      {/* 内容 */}
      {expanded && (
        <div className="flex flex-1 flex-col px-3">
          {/* Tab 栏 */}
          <div className="flex items-center gap-1 border-b border-[var(--color-border)] py-1">
            <span className="px-2 text-xs text-gray-400">全局 1</span>
            <button className="text-xs text-gray-400 hover:text-white" title="新建页签">
              +
            </button>
          </div>

          {/* 编辑区 */}
          <div className="flex-1">
            {/* TODO: 实现命令编辑器 */}
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalCommand;