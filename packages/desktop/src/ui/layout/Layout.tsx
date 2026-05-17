import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import TitleBar from '../components/TitleBar';
import SessionPanel from './SessionPanel';
import TerminalArea from './TerminalArea';
import ToolSidebar from './ToolSidebar';
import CommandBar from './CommandBar';
import CreateSessionModal, { SessionConfig } from '../components/CreateSessionModal';
import { ContextMenuProvider } from '../components/ContextMenu';

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

  const handleCreateSession = useCallback(async (config: SessionConfig) => {
    try {
      console.log('创建会话配置:', config);
      
      const session = await invoke<SessionInfo>('create_session', { config });
      console.log('会话创建成功:', session);
      
      setSessions(prev => [...prev, session]);
      setCurrentSession(session);
      setShowCreateModal(false);
      
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
      
    } catch (error) {
      console.error('创建会话失败:', error);
      alert(`创建会话失败: ${error}`);
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

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-deep)]">
      <TitleBar 
        onNewSession={() => setShowCreateModal(true)}
        onToggleToolSidebar={() => setToolCollapsed(!toolCollapsed)}
        onToggleCommandBar={() => setCommandBarCollapsed(!commandBarCollapsed)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <SessionPanel
          collapsed={sessionCollapsed}
          onToggle={() => setSessionCollapsed(!sessionCollapsed)}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={setCurrentSession}
          onCreateSession={() => setShowCreateModal(true)}
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

      <CommandBar
        collapsed={commandBarCollapsed}
        onToggle={() => setCommandBarCollapsed(!commandBarCollapsed)}
        currentSession={currentSession}
      />

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
