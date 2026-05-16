/**
 * 会话管理区组件（桌面端）
 */

import { useState } from 'react';

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  created_at: number;
}

interface SessionPanelProps {
  /** 是否折叠 */
  collapsed: boolean;
  /** 折叠/展开回调 */
  onToggle: () => void;
  /** 会话列表 */
  sessions: SessionInfo[];
  /** 当前会话 */
  currentSession: SessionInfo | null;
  /** 选择会话回调 */
  onSelectSession: (session: SessionInfo) => void;
  /** 创建会话回调 */
  onCreateSession: (name: string, shell?: string) => void;
  /** 关闭会话回调 */
  onCloseSession: (sessionId: string) => void;
}

/**
 * 会话管理区组件
 */
function SessionPanel({
  collapsed,
  onToggle,
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  onCloseSession,
}: SessionPanelProps) {
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionShell, setNewSessionShell] = useState('cmd');

  const handleCreate = () => {
    if (newSessionName.trim()) {
      onCreateSession(newSessionName, newSessionShell);
      setNewSessionName('');
      setShowNewSession(false);
    }
  };

  return (
    <div
      className={`flex flex-col border-r border-[var(--color-border)] bg-[#252526] transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-[200px] min-w-[150px]'
      }`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
        {!collapsed && <span className="text-sm font-medium">会话</span>}
        <button
          onClick={onToggle}
          className="rounded p-1 text-[var(--color-fg)] hover:bg-[#3e3e3e]"
          title={collapsed ? '展开' : '折叠'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* 会话列表 */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          {/* 新建会话按钮 */}
          <button
            onClick={() => setShowNewSession(!showNewSession)}
            className="mb-2 w-full rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            + 新建会话
          </button>

          {/* 新建会话表单 */}
          {showNewSession && (
            <div className="mb-2 rounded border border-[var(--color-border)] p-2">
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="会话名称"
                className="mb-2 w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-2 py-1 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none"
              />
              <select
                value={newSessionShell}
                onChange={(e) => setNewSessionShell(e.target.value)}
                className="mb-2 w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-2 py-1 text-sm text-white"
              >
                <option value="cmd">CMD</option>
                <option value="powershell">PowerShell</option>
                <option value="pwsh">PowerShell 7</option>
              </select>
              <button
                onClick={handleCreate}
                className="w-full rounded bg-green-600 px-2 py-1 text-sm text-white hover:bg-green-700"
              >
                创建
              </button>
            </div>
          )}

          {/* 会话列表 */}
          {sessions.length === 0 ? (
            <div className="text-sm text-gray-400">暂无会话</div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex cursor-pointer items-center justify-between rounded p-2 ${
                    currentSession?.id === session.id
                      ? 'bg-[#3e3e3e]'
                      : 'hover:bg-[#2e2e2e]'
                  }`}
                  onClick={() => onSelectSession(session)}
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-sm">{session.name}</div>
                    <div className="text-xs text-gray-500">{session.shell}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseSession(session.id);
                    }}
                    className="ml-2 hidden rounded px-1 text-gray-400 hover:bg-red-600 hover:text-white group-hover:block"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SessionPanel;