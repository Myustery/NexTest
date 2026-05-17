import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import TitleBar from '../components/TitleBar';
import SessionPanel from './SessionPanel';
import TerminalArea from './TerminalArea';
import ToolSidebar from './ToolSidebar';
import { ContextMenuProvider, useContextMenu } from '../components/ContextMenu';

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  created_at: number;
}

const ACTIVITY_ITEMS = [
  { id: 'explorer', icon: 'files', tooltip: '资源管理器' },
  { id: 'search', icon: 'search', tooltip: '搜索' },
  { id: 'git', icon: 'git', tooltip: '源代码管理' },
  { id: 'debug', icon: 'debug', tooltip: '运行和调试' },
  { id: 'extensions', icon: 'extensions', tooltip: '扩展' },
];

function LayoutContent() {
  const [sessionCollapsed, setSessionCollapsed] = useState(false);
  const [toolCollapsed, setToolCollapsed] = useState(true);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [activeActivity, setActiveActivity] = useState<string>('explorer');
  const { showMenu } = useContextMenu();

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const result = await invoke<SessionInfo[]>('get_sessions');
        setSessions(result);
        if (result.length > 0 && !currentSession) {
          setCurrentSession(result[0]);
        }
      } catch (error) {
        console.error('加载会话失败:', error);
      }
    };
    
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSession = useCallback(async (name: string, shell?: string) => {
    try {
      const session = await invoke<SessionInfo>('create_session', {
        name,
        shell: shell || 'powershell',
      });
      setSessions(prev => [...prev, session]);
      setCurrentSession(session);
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  }, []);

  const handleCloseSession = useCallback(async (sessionId: string) => {
    try {
      await invoke('close_session', { sessionId });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(sessions.find(s => s.id !== sessionId) || null);
      }
    } catch (error) {
      console.error('关闭会话失败:', error);
    }
  }, [currentSession, sessions]);

  const handleActivityContextMenu = useCallback((e: React.MouseEvent, item: typeof ACTIVITY_ITEMS[0]) => {
    e.preventDefault();
    e.stopPropagation();
    showMenu(e.clientX, e.clientY, [
      {
        label: item.tooltip,
        disabled: true,
      },
      { divider: true, label: '' },
      {
        label: '隐藏侧边栏',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        ),
        onClick: () => setSessionCollapsed(true),
      },
    ]);
  }, [showMenu]);

  const handleStatusBarContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showMenu(e.clientX, e.clientY, [
      {
        label: '复制状态',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        ),
        onClick: () => {},
      },
      { divider: true, label: '' },
      {
        label: '设置',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33"/>
          </svg>
        ),
        onClick: () => {},
      },
    ]);
  }, [showMenu]);

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'files':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
            <polyline points="13,2 13,9 20,9"/>
          </svg>
        );
      case 'search':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        );
      case 'git':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="18" cy="18" r="3"/>
            <circle cx="6" cy="6" r="3"/>
            <circle cx="6" cy="18" r="3"/>
            <path d="M6 9v6M6 15a3 3 0 003 3h3"/>
          </svg>
        );
      case 'debug':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L12 6M12 18L12 22M6 12H2M22 12H18"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
        );
      case 'extensions':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        );
      case 'settings':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-deep)]">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-12 flex-col items-center bg-[var(--color-bg-elevated)] py-1">
          {ACTIVITY_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveActivity(item.id);
                if (item.id === 'explorer' && sessionCollapsed) {
                  setSessionCollapsed(false);
                }
              }}
              onContextMenu={(e) => handleActivityContextMenu(e, item)}
              className={`activity-bar-icon ${activeActivity === item.id ? 'active' : ''}`}
              title={item.tooltip}
            >
              {renderIcon(item.icon)}
            </button>
          ))}
          
          <div className="mt-auto">
            <button
              className="activity-bar-icon"
              title="设置"
            >
              {renderIcon('settings')}
            </button>
          </div>
        </div>

        <SessionPanel
          collapsed={sessionCollapsed}
          onToggle={() => setSessionCollapsed(!sessionCollapsed)}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={setCurrentSession}
          onCreateSession={handleCreateSession}
          onCloseSession={handleCloseSession}
        />

        <TerminalArea
          currentSession={currentSession}
          sessions={sessions}
          onSelectSession={setCurrentSession}
          onCloseSession={handleCloseSession}
        />

        <ToolSidebar
          collapsed={toolCollapsed}
          onToggle={() => setToolCollapsed(!toolCollapsed)}
        />
      </div>

      <div 
        className="flex h-[22px] items-center justify-between border-t border-[var(--color-border-subtle)] bg-[var(--color-primary)] px-2 text-[11px] text-white/90"
        onContextMenu={handleStatusBarContextMenu}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <span>就绪</span>
          </div>
          {currentSession && (
            <span className="text-white/70">
              {currentSession.name} · {currentSession.shell}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <span>NexTest v0.1.0</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <ContextMenuProvider>
      <LayoutContent />
    </ContextMenuProvider>
  );
}

export default Layout;
