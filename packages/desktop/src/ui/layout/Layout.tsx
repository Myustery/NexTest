import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import TitleBar from '../components/TitleBar';
import SessionPanel from './SessionPanel';
import TerminalArea from './TerminalArea';
import ToolSidebar from './ToolSidebar';
import CreateSessionModal, { SessionConfig } from '../components/CreateSessionModal';
import { ContextMenuProvider } from '../components/ContextMenu';

const log = {
  info: (msg: string, ...args: unknown[]) => console.log(`[${new Date().toISOString()}] [Layout] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(`[${new Date().toISOString()}] [Layout] ${msg}`, ...args),
};

export interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  protocol: string;
  created_at: number;
  status: string;
}

function LayoutContent() {
  const [sessionCollapsed, setSessionCollapsed] = useState(false);
  const [toolCollapsed, setToolCollapsed] = useState(true);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [globalCommandExpanded, setGlobalCommandExpanded] = useState(true);
  const [globalCommandHeight, setGlobalCommandHeight] = useState(100);
  const [globalCommandText, setGlobalCommandText] = useState('');
  const [globalIsRunning, setGlobalIsRunning] = useState(false);

  useEffect(() => {
    log.info('组件初始化');
    loadSavedSessions();
  }, []);

  const loadSavedSessions = async () => {
    try {
      const result = await invoke<SessionInfo[]>('get_sessions');
      log.info('加载已保存会话', result.length);
    } catch (err) {
      log.error('加载会话失败', err);
    }
  };

  const handleCreateSession = useCallback(async (config: SessionConfig) => {
    log.info('创建会话', config);
    
    try {
      const session = await invoke<SessionInfo>('create_session', { config });
      log.info('会话创建成功', session);
      
      setSessions(prev => [...prev, session]);
      setCurrentSession(session);
      setShowCreateModal(false);
      
      try {
        await invoke('save_session', {
          session: {
            id: session.id,
            name: session.name,
            protocol: session.protocol,
            shell: session.shell,
            host: config.host || null,
            port: config.port || null,
            username: config.username || null,
            serial_port: config.serialPort || null,
            baud_rate: config.baudRate || null,
            created_at: session.created_at,
            last_used_at: session.created_at,
          }
        });
        log.info('会话配置已保存');
      } catch (err) {
        log.error('保存会话配置失败', err);
      }
    } catch (err) {
      log.error('创建会话失败', err);
      alert(`创建会话失败: ${err}`);
    }
  }, []);

  const handleCloseSession = useCallback(async (sessionId: string) => {
    log.info('关闭会话', sessionId);
    
    try {
      await invoke('close_session', { sessionId });
      log.info('会话已关闭', sessionId);
      
      setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== sessionId);
        
        if (currentSession?.id === sessionId) {
          const nextSession = newSessions.length > 0 ? newSessions[0] : null;
          log.info('切换到会话', nextSession?.id ?? 'null');
          setCurrentSession(nextSession);
        }
        
        return newSessions;
      });
    } catch (err) {
      log.error('关闭会话失败', err);
    }
  }, [currentSession]);

  const handleSelectSession = useCallback((session: SessionInfo) => {
    log.info('选择会话', session.id);
    setCurrentSession(session);
  }, []);

  const handleGlobalCommandRun = useCallback(async () => {
    if (!currentSession || !globalCommandText.trim()) return;
    log.info(`全局命令执行 | sessionId=${currentSession.id} | command=${globalCommandText.trim()}`);
    setGlobalIsRunning(true);
    try {
      await invoke('execute_command', { sessionId: currentSession.id, command: globalCommandText.trim() });
    } catch (error) {
      log.error('全局命令执行失败', error);
    } finally {
      setGlobalIsRunning(false);
    }
  }, [currentSession, globalCommandText]);

  const handleGlobalCommandStop = useCallback(() => {
    log.info('停止全局命令执行');
    setGlobalIsRunning(false);
  }, []);

  const handleGlobalResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = globalCommandHeight;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.max(60, Math.min(300, startHeight + delta));
      setGlobalCommandHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('dragging');
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('dragging');
  }, [globalCommandHeight]);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-deep)]">
      <TitleBar 
        onNewSession={() => setShowCreateModal(true)}
        onToggleToolSidebar={() => setToolCollapsed(!toolCollapsed)}
        onToggleCommandBar={() => setGlobalCommandExpanded(!globalCommandExpanded)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <SessionPanel
          collapsed={sessionCollapsed}
          onToggle={() => setSessionCollapsed(!sessionCollapsed)}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={handleSelectSession}
          onCreateSession={() => setShowCreateModal(true)}
          onCloseSession={handleCloseSession}
        />

        <TerminalArea
          currentSession={currentSession}
          sessions={sessions}
          onSelectSession={handleSelectSession}
          onCloseSession={handleCloseSession}
        />

        <ToolSidebar
          collapsed={toolCollapsed}
          onToggle={() => setToolCollapsed(!toolCollapsed)}
        />
      </div>

      {globalCommandExpanded && (
        <>
          <div 
            className="h-[3px] cursor-row-resize bg-[var(--color-border-subtle)] hover:bg-[var(--color-primary)]"
            onMouseDown={handleGlobalResizeMouseDown}
          />
          <div 
            className="bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-subtle)]"
            style={{ height: `${globalCommandHeight}px` }}
          >
            <div className="flex items-center h-[28px] px-2 border-b border-[var(--color-border-subtle)]">
              <button
                className="btn-icon mr-1"
                onClick={handleGlobalCommandRun}
                disabled={globalIsRunning || !globalCommandText.trim() || !currentSession}
                title="运行 (Enter)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-success)]">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
              <button
                className="btn-icon mr-2"
                onClick={handleGlobalCommandStop}
                disabled={!globalIsRunning}
                title="停止"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-error)]">
                  <rect x="6" y="6" width="12" height="12"/>
                </svg>
              </button>
              <span className="text-xs text-[var(--color-fg-muted)]">全局命令</span>
            </div>
            
            <div className="flex-1 flex">
              <div 
                className="flex-shrink-0 w-[40px] bg-[var(--color-bg)] border-r border-[var(--color-border-subtle)] overflow-hidden select-none"
                style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.5' }}
              >
                {globalCommandText.split('\n').map((_, i) => (
                  <div key={i} className="text-right pr-2 text-[var(--color-fg-subtle)]">
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                value={globalCommandText}
                onChange={(e) => setGlobalCommandText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGlobalCommandRun();
                  }
                }}
                placeholder="输入命令，按 Enter 执行..."
                className="flex-1 p-2 bg-transparent border-none outline-none resize-none text-[var(--color-fg)] text-sm font-mono"
                style={{ lineHeight: '1.5' }}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex items-center h-[24px] px-2 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-subtle)]">
        <button
          className="flex items-center gap-1 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          onClick={() => setGlobalCommandExpanded(!globalCommandExpanded)}
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ transform: globalCommandExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
          >
            <polyline points="9,18 15,12 9,6"/>
          </svg>
          <span>{globalCommandExpanded ? '隐藏' : '显示'}全局命令区</span>
        </button>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSession}
      />
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
