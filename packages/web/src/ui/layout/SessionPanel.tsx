import { useState, useCallback } from 'react';
import CreateSessionModal, { SessionConfig } from '../components/CreateSessionModal';
import { useContextMenu } from '../components/ContextMenu';

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  created_at: number;
}

interface SessionPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  sessions: SessionInfo[];
  currentSession: SessionInfo | null;
  onSelectSession: (session: SessionInfo) => void;
  onCreateSession: (name: string, shell?: string) => void;
  onCloseSession: (sessionId: string) => void;
}

function SessionPanel({
  collapsed,
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  onCloseSession,
}: SessionPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showMenu } = useContextMenu();

  const handleCreateSession = (config: SessionConfig) => {
    onCreateSession(config.name, config.shell || config.protocol);
  };

  const handleSessionContextMenu = useCallback((e: React.MouseEvent, session: SessionInfo) => {
    e.preventDefault();
    e.stopPropagation();
    showMenu(e.clientX, e.clientY, [
      {
        label: '打开',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15,3 21,3 21,9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        ),
        onClick: () => onSelectSession(session),
      },
      {
        label: '在新窗口打开',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        ),
        disabled: true,
      },
      { divider: true, label: '' },
      {
        label: '复制名称',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        ),
        onClick: () => {
          navigator.clipboard.writeText(session.name);
        },
      },
      { divider: true, label: '' },
      {
        label: '关闭终端',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ),
        danger: true,
        onClick: () => onCloseSession(session.id),
      },
    ]);
  }, [showMenu, onSelectSession, onCloseSession]);

  const handlePanelContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showMenu(e.clientX, e.clientY, [
      {
        label: '新建终端',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        ),
        shortcut: 'Ctrl+Shift+`',
        onClick: () => setShowCreateModal(true),
      },
      { divider: true, label: '' },
      {
        label: '折叠侧边栏',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        ),
        disabled: true,
      },
    ]);
  }, [showMenu]);

  const getShellIcon = (shell: string) => {
    switch (shell) {
      case 'powershell':
      case 'pwsh':
        return '⚡';
      case 'bash':
      case 'wsl':
        return '🐧';
      case 'cmd':
        return '🖥️';
      case 'ssh':
        return '🔐';
      case 'telnet':
        return '🌐';
      case 'serial':
        return '🔌';
      default:
        return '⌨️';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (collapsed) {
    return null;
  }

  return (
    <div 
      className="flex w-[var(--sidebar-width)] min-w-[180px] max-w-[400px] flex-col bg-[var(--color-bg)]"
      data-context-menu
      onContextMenu={handlePanelContextMenu}
    >
      <div className="flex h-[var(--panel-header-height)] items-center justify-between border-b border-[var(--color-border-subtle)] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
          资源管理器
        </span>
        <div className="monaco-toolbar">
          <button
            onClick={() => setShowCreateModal(true)}
            title="新建终端"
            className="flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <div className="panel-section">
          <div className="panel-section-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
            终端会话
            <span className="ml-auto text-[var(--color-fg-subtle)]">{sessions.length}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-2 text-[var(--color-fg-subtle)]">
                <polyline points="4,17 10,11 4,5"/>
                <line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
              <span className="text-[11px] text-[var(--color-fg-subtle)]">
                点击上方 + 创建终端
              </span>
            </div>
          ) : (
            <div>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  onContextMenu={(e) => handleSessionContextMenu(e, session)}
                  className={`list-item group ${
                    currentSession?.id === session.id ? 'selected' : ''
                  }`}
                >
                  <span className="mr-2 text-sm">{getShellIcon(session.shell)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px]">{session.name}</div>
                    <div className="text-[11px] text-[var(--color-fg-subtle)]">
                      {session.shell} · {formatTime(session.created_at)}
                    </div>
                  </div>
                  <div className={`status-dot ${currentSession?.id === session.id ? 'running' : 'idle'}`} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseSession(session.id);
                    }}
                    className="btn-icon ml-1 opacity-0 group-hover:opacity-100"
                    title="关闭终端"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSession}
      />
    </div>
  );
}

export default SessionPanel;
