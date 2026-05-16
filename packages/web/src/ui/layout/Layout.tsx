/**
 * 主布局组件
 * 
 * 包含会话管理区、终端区、工具侧边栏和全局命令编辑区
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SessionPanel from './SessionPanel';
import TerminalArea from './TerminalArea';
import ToolSidebar from './ToolSidebar';
import GlobalCommand from './GlobalCommand';

/**
 * 主布局组件
 * 
 * 结构：
 * ┌──────────┬─────────────────────────────────────┬─────────┐
 * │ 会话管理区 │              终端区                  │ 工具栏   │
 * │ (可折叠)  │  [Tab1] [Tab2] [分身] [+]           │ (可折叠) │
 * │          │  ┌────────────┬────────────┐       │  🔧     │
 * │ 📁 文件夹1 │  │  终端界面1   │  终端界面2  │       │  📦     │
 * │   ├ 会话A  │  │             │             │       │  ...    │
 * │   └ 会话B  │  ├────────────┴────────────┤       │         │
 * │ 📁 文件夹2 │  │ 命令编辑区（可折叠，可拖拽）│       │         │
 * │   └ 会话C  │  │ [Tab1][Tab2][+]   ▶ ⏹      │       │         │
 * ├──────────┴─────────────────────────────────────┴─────────┤
 * │                   全局命令编辑页面（底部）                    │
 * │                   [Tab1][Tab2][+]        ▶ ⏹              │
 * └───────────────────────────────────────────────────────────┘
 */
function Layout() {
  // 会话管理区是否折叠
  const [sessionCollapsed, setSessionCollapsed] = useState(false);
  // 工具侧边栏是否折叠
  const [toolCollapsed, setToolCollapsed] = useState(true);

  return (
    <div className="flex h-screen flex-col">
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 会话管理区（左侧） */}
        <SessionPanel
          collapsed={sessionCollapsed}
          onToggle={() => setSessionCollapsed(!sessionCollapsed)}
        />

        {/* 终端区（中间） */}
        <TerminalArea
          sessionCollapsed={sessionCollapsed}
          toolCollapsed={toolCollapsed}
        />

        {/* 工具侧边栏（右侧） */}
        <ToolSidebar
          collapsed={toolCollapsed}
          onToggle={() => setToolCollapsed(!toolCollapsed)}
        />
      </div>

      {/* 全局命令编辑页面（底部） */}
      <GlobalCommand />

      {/* 子路由出口 */}
      <Outlet />
    </div>
  );
}

export default Layout;