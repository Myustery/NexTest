/**
 * 全局命令编辑页面组件（桌面端）
 */

import { useState } from 'react';

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  created_at: number;
}

interface GlobalCommandProps {
  /** 当前会话 */
  currentSession: SessionInfo | null;
}

/**
 * 全局命令编辑页面组件
 */
function GlobalCommand({ currentSession: _currentSession }: GlobalCommandProps) {
  const [expanded, setExpanded] = useState(false);
  const [command, setCommand] = useState('');

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
        <span className="text-xs text-gray-400">{expanded ? '▼' : '▲'}</span>
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
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="输入全局命令（每行一条）..."
            className="flex-1 resize-none border-none bg-transparent text-sm text-white focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

export default GlobalCommand;