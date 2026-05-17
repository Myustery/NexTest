import { useState, useCallback } from 'react';
import { useContextMenu } from '../components/ContextMenu';

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  protocol: string;
  created_at: number;
  status: string;
}

interface SessionPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  sessions: SessionInfo[];
  currentSession: SessionInfo | null;
  onSelectSession: (session: SessionInfo) => void;
  onCreateSession: () => void;
  onCloseSession: (sessionId: string) => void;
}

interface Folder {
  id: string;
  name: string;
  expanded: boolean;
}

function SessionPanel({
  collapsed,
  onToggle,
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  onCloseSession,
}: SessionPanelProps) {
  const { showMenu } = useContextMenu();
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'default', name: '终端会话', expanded: true },
  ]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => 
      f.id === folderId ? { ...f, expanded: !f.expanded } : f
    ));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolders(prev => [...prev, {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        expanded: true,
      }]);
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const handleSessionContextMenu = useCallback((e: React.MouseEvent, session: SessionInfo) => {
    e.preventDefault();
    e.stopPropagation();
    showMenu(e.clientX, e.clientY, [
      {
        label: '打开',
        onClick: () => onSelectSession(session),
      },
      {
        label: '复制名称',
        onClick: () => {
          navigator.clipboard.writeText(session.name);
        },
      },
      { divider: true, label: '' },
      {
        label: '关闭终端',
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
        shortcut: 'Ctrl+Shift+`',
        onClick: onCreateSession,
      },
      {
        label: '新建文件夹',
        onClick: () => setShowCreateFolder(true),
      },
      { divider: true, label: '' },
      {
        label: '折叠侧边栏',
        onClick: onToggle,
      },
    ]);
  }, [showMenu, onCreateSession, onToggle]);

  const handleFolderContextMenu = useCallback((e: React.MouseEvent, folder: Folder) => {
    e.preventDefault();
    e.stopPropagation();
    showMenu(e.clientX, e.clientY, [
      {
        label: '新建终端',
        onClick: onCreateSession,
      },
      {
        label: '重命名',
        disabled: folder.id === 'default',
      },
      { divider: true, label: '' },
      {
        label: '删除文件夹',
        danger: true,
        disabled: folder.id === 'default',
      },
    ]);
  }, [showMenu, onCreateSession]);

  const getShellIcon = (shell: string, protocol: string) => {
    if (protocol === 'ssh') return '🔐';
    if (protocol === 'telnet') return '🌐';
    if (protocol === 'serial') return '🔌';
    
    switch (shell) {
      case 'powershell':
      case 'pwsh':
        return '⚡';
      case 'bash':
      case 'wsl':
        return '🐧';
      case 'cmd':
        return '🖥️';
      default:
        return '⌨️';
    }
  };

  if (collapsed) {
    return (
      <div className="flex w-[40px] flex-col items-center border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] py-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)]"
          title="展开会话面板"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,6 9,12 15,18"/>
          </svg>
        </button>
        <button
          onClick={onCreateSession}
          className="mt-2 flex items-center justify-center w-8 h-8 rounded text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)]"
          title="新建终端"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="flex w-[var(--sidebar-width)] min-w-[180px] max-w-[400px] flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg)]"
      onContextMenu={handlePanelContextMenu}
    >
      <div className="flex h-[var(--panel-header-height)] items-center justify-between border-b border-[var(--color-border-subtle)] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
          会话
        </span>
        <div className="monaco-toolbar">
          <button
            onClick={onCreateSession}
            title="新建终端"
            className="flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button
            onClick={onToggle}
            title="折叠侧边栏"
            className="flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,6 9,12 15,18"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {folders.map(folder => (
          <div key={folder.id} className="panel-section">
            <div 
              className="panel-section-header"
              onClick={() => toggleFolder(folder.id)}
              onContextMenu={(e) => handleFolderContextMenu(e, folder)}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`mr-1 transition-transform ${folder.expanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9"/>
              </svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              <span className="flex-1">{folder.name}</span>
              <span className="text-[var(--color-fg-subtle)]">{sessions.length}</span>
            </div>

            {folder.expanded && (
              <>
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-2 text-[var(--color-fg-subtle)]">
                      <polyline points="4,17 10,11 4,5"/>
                      <line x1="12" y1="19" x2="20" y2="19"/>
                    </svg>
                    <span className="text-[11px] text-[var(--color-fg-subtle)]">
                      点击 + 创建终端
                    </span>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      onContextMenu={(e) => handleSessionContextMenu(e, session)}
                      className={`list-item group ${
                        currentSession?.id === session.id ? 'selected' : ''
                      }`}
                    >
                      <span className="mr-2 text-sm">{getShellIcon(session.shell, session.protocol)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px]">{session.name}</div>
                        <div className="text-[11px] text-[var(--color-fg-subtle)]">
                          {session.protocol.toUpperCase()}
                        </div>
                      </div>
                      <div className={`status-dot ${currentSession?.id === session.id ? 'running' : 'idle'}`} />
                      <button
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('SessionPanel 关闭按钮点击:', session.id);
                          onCloseSession(session.id);
                        }}
                        className="btn-icon ml-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="关闭终端"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        ))}

        {showCreateFolder && (
          <div className="px-2 py-1">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowCreateFolder(false);
              }}
              placeholder="文件夹名称"
              className="input-field text-xs"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionPanel;
