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

  // 加载已保存的会话
  useEffect(() => {
    log.info('组件初始化');
    loadSavedSessions();
  }, []);

  const loadSavedSessions = async () => {
    try {
      const result = await invoke<SessionInfo[]>('get_sessions');
      log.info('加载已保存会话', result.length);
      // 只加载会话配置，不自动创建连接
    } catch (err) {
      log.error('加载会话失败', err);
    }
  };

  // 创建会话
  const handleCreateSession = useCallback(async (config: SessionConfig) => {
    log.info('创建会话', config);
    
    try {
      const session = await invoke<SessionInfo>('create_session', { config });
      log.info('会话创建成功', session);
      
      setSessions(prev => [...prev, session]);
      setCurrentSession(session);
      setShowCreateModal(false);
      
      // 保存会话配置
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

  // 关闭会话
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

  // 选择会话
  const handleSelectSession = useCallback((session: SessionInfo) => {
    log.info('选择会话', session.id);
    setCurrentSession(session);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-deep)]">
      {/* 标题栏 */}
      <TitleBar 
        onNewSession={() => setShowCreateModal(true)}
        onToggleToolSidebar={() => setToolCollapsed(!toolCollapsed)}
        onToggleCommandBar={() => {}}
      />
      
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 会话面板 */}
        <SessionPanel
          collapsed={sessionCollapsed}
          onToggle={() => setSessionCollapsed(!sessionCollapsed)}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={handleSelectSession}
          onCreateSession={() => setShowCreateModal(true)}
          onCloseSession={handleCloseSession}
        />

        {/* 终端区（包含命令编辑区） */}
        <TerminalArea
          currentSession={currentSession}
          sessions={sessions}
          onSelectSession={handleSelectSession}
          onCloseSession={handleCloseSession}
        />

        {/* 工具侧边栏 */}
        <ToolSidebar
          collapsed={toolCollapsed}
          onToggle={() => setToolCollapsed(!toolCollapsed)}
        />
      </div>

      {/* 状态栏 */}
      <div className="flex items-center h-[22px] px-2 bg-[var(--color-primary)] text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="status-dot running" style={{ width: '6px', height: '6px' }} />
          <span>{currentSession ? '已连接' : '就绪'}</span>
        </div>
        <span className="mx-2">·</span>
        <span>{currentSession?.shell ?? '无会话'}</span>
        <span className="mx-2">·</span>
        <span>{currentSession?.name ?? '-'}</span>
        <div className="flex-1" />
        <span>NexTest v0.1.4</span>
        <span className="mx-2">·</span>
        <span>UTF-8</span>
      </div>

      {/* 创建会话弹窗 */}
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
