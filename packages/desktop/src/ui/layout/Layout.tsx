/**
 * 主布局组件（桌面端）
 * 
 * 复用 Web 端布局，增加 Tauri 特有功能
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SessionPanel from './SessionPanel';
import TerminalArea from './TerminalArea';
import ToolSidebar from './ToolSidebar';
import GlobalCommand from './GlobalCommand';

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  created_at: number;
}

/**
 * 主布局组件
 */
function Layout() {
  // 会话管理区是否折叠
  const [sessionCollapsed, setSessionCollapsed] = useState(false);
  // 工具侧边栏是否折叠
  const [toolCollapsed, setToolCollapsed] = useState(true);
  // 会话列表
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  // 当前会话
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);

  // 加载会话列表
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const result = await invoke<SessionInfo[]>('get_sessions');
        setSessions(result);
      } catch (error) {
        console.error('加载会话失败:', error);
      }
    };
    
    loadSessions();
  }, []);

  // 创建新会话
  const handleCreateSession = async (name: string, shell?: string) => {
    try {
      const session = await invoke<SessionInfo>('create_session', {
        name,
        shell: shell || 'cmd',
      });
      setSessions([...sessions, session]);
      setCurrentSession(session);
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  // 关闭会话
  const handleCloseSession = async (sessionId: string) => {
    try {
      await invoke('close_session', { sessionId });
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('关闭会话失败:', error);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 会话管理区（左侧） */}
        <SessionPanel
          collapsed={sessionCollapsed}
          onToggle={() => setSessionCollapsed(!sessionCollapsed)}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={setCurrentSession}
          onCreateSession={handleCreateSession}
          onCloseSession={handleCloseSession}
        />

        {/* 终端区（中间） */}
        <TerminalArea
          sessionCollapsed={sessionCollapsed}
          toolCollapsed={toolCollapsed}
          currentSession={currentSession}
        />

        {/* 工具侧边栏（右侧） */}
        <ToolSidebar
          collapsed={toolCollapsed}
          onToggle={() => setToolCollapsed(!toolCollapsed)}
        />
      </div>

      {/* 全局命令编辑页面（底部） */}
      <GlobalCommand currentSession={currentSession} />
    </div>
  );
}

export default Layout;