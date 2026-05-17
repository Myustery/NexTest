import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import TitleBar from '../components/TitleBar';
import SessionPanel from './SessionPanel';
import TerminalArea from './TerminalArea';
import ToolSidebar from './ToolSidebar';
import CommandBar from './CommandBar';
import CreateSessionModal, { SessionConfig } from '../components/CreateSessionModal';
import { ContextMenuProvider } from '../components/ContextMenu';

// 日志工具函数
const log = {
  info: (component: string, message: string, ...args: unknown[]) => {
    console.log(`[${new Date().toISOString()}] [${component}] ${message}`, ...args);
  },
  debug: (component: string, message: string, ...args: unknown[]) => {
    console.debug(`[${new Date().toISOString()}] [${component}] ${message}`, ...args);
  },
  warn: (component: string, message: string, ...args: unknown[]) => {
    console.warn(`[${new Date().toISOString()}] [${component}] ${message}`, ...args);
  },
  error: (component: string, message: string, ...args: unknown[]) => {
    console.error(`[${new Date().toISOString()}] [${component}] ${message}`, ...args);
  },
};

interface SessionInfo {
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
  const [commandBarCollapsed, setCommandBarCollapsed] = useState(true);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const COMPONENT = 'Layout';

  useEffect(() => {
    log.info(COMPONENT, '组件初始化');
    
    const loadSessions = async () => {
      try {
        log.debug(COMPONENT, '加载会话列表...');
        const result = await invoke<SessionInfo[]>('get_sessions');
        log.info(COMPONENT, '会话列表加载成功', { count: result.length, sessions: result });
        setSessions(result);
        if (result.length > 0 && !currentSession) {
          log.debug(COMPONENT, '自动选择第一个会话', { sessionId: result[0].id });
          setCurrentSession(result[0]);
        }
      } catch (error) {
        log.error(COMPONENT, '加载会话失败', error);
      }
    };
    
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    
    return () => {
      log.debug(COMPONENT, '组件卸载，清理定时器');
      clearInterval(interval);
    };
  }, []);

  const handleCreateSession = useCallback(async (config: SessionConfig) => {
    const requestId = Math.random().toString(36).substring(7);
    log.info(COMPONENT, `[${requestId}] 开始创建会话`, config);
    
    try {
      log.debug(COMPONENT, `[${requestId}] 调用 create_session 命令...`);
      const session = await invoke<SessionInfo>('create_session', { config });
      log.info(COMPONENT, `[${requestId}] 会话创建成功`, session);
      
      log.debug(COMPONENT, `[${requestId}] 更新会话列表...`);
      setSessions(prev => {
        const newSessions = [...prev, session];
        log.debug(COMPONENT, `[${requestId}] 新会话列表`, { count: newSessions.length });
        return newSessions;
      });
      
      log.debug(COMPONENT, `[${requestId}] 切换到新会话`, { sessionId: session.id });
      setCurrentSession(session);
      
      log.debug(COMPONENT, `[${requestId}] 关闭创建弹窗`);
      setShowCreateModal(false);
      
      log.debug(COMPONENT, `[${requestId}] 保存会话到数据库...`);
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
      log.info(COMPONENT, `[${requestId}] 会话已保存到数据库`);
      
    } catch (error) {
      log.error(COMPONENT, `[${requestId}] 创建会话失败`, error);
      alert(`创建会话失败: ${error}`);
    }
  }, []);

  const handleCloseSession = useCallback(async (sessionId: string) => {
    const requestId = Math.random().toString(36).substring(7);
    log.info(COMPONENT, `[${requestId}] 开始关闭会话`, { sessionId });
    
    try {
      log.debug(COMPONENT, `[${requestId}] 调用 close_session 命令...`);
      await invoke('close_session', { sessionId });
      log.info(COMPONENT, `[${requestId}] 会话已关闭`, { sessionId });
      
      log.debug(COMPONENT, `[${requestId}] 更新会话列表...`);
      setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== sessionId);
        log.debug(COMPONENT, `[${requestId}] 新会话列表`, { 
          count: newSessions.length, 
          removed: sessionId 
        });
        
        if (currentSession?.id === sessionId) {
          const nextSession = newSessions.length > 0 ? newSessions[0] : null;
          log.debug(COMPONENT, `[${requestId}] 当前会话已关闭，切换到`, { 
            nextSessionId: nextSession?.id ?? 'null' 
          });
          setCurrentSession(nextSession);
        }
        return newSessions;
      });
    } catch (error) {
      log.error(COMPONENT, `[${requestId}] 关闭会话失败`, error);
    }
  }, [currentSession]);

  const handleSelectSession = useCallback((session: SessionInfo) => {
    log.info(COMPONENT, '选择会话', { sessionId: session.id, name: session.name });
    setCurrentSession(session);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-deep)]">
      <TitleBar 
        onNewSession={() => {
          log.debug(COMPONENT, '点击新建终端按钮');
          setShowCreateModal(true);
        }}
        onToggleToolSidebar={() => {
          log.debug(COMPONENT, '切换工具栏', { collapsed: !toolCollapsed });
          setToolCollapsed(!toolCollapsed);
        }}
        onToggleCommandBar={() => {
          log.debug(COMPONENT, '切换命令栏', { collapsed: !commandBarCollapsed });
          setCommandBarCollapsed(!commandBarCollapsed);
        }}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <SessionPanel
          collapsed={sessionCollapsed}
          onToggle={() => {
            log.debug(COMPONENT, '切换会话面板', { collapsed: !sessionCollapsed });
            setSessionCollapsed(!sessionCollapsed);
          }}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={handleSelectSession}
          onCreateSession={() => {
            log.debug(COMPONENT, '从会话面板创建新会话');
            setShowCreateModal(true);
          }}
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

      <CommandBar
        collapsed={commandBarCollapsed}
        onToggle={() => setCommandBarCollapsed(!commandBarCollapsed)}
        currentSession={currentSession}
      />

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => {
          log.debug(COMPONENT, '关闭创建会话弹窗');
          setShowCreateModal(false);
        }}
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
