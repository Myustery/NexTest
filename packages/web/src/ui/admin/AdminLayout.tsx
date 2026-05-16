/**
 * 管理员后台布局组件
 */

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

type NavItem = {
  path: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { path: '/admin', label: '概览', icon: '📊' },
  { path: '/admin/users', label: '用户管理', icon: '👥' },
  { path: '/admin/versions', label: '版本管理', icon: '📦' },
  { path: '/admin/stats', label: '数据统计', icon: '📈' },
  { path: '/admin/config', label: '系统配置', icon: '⚙️' },
  { path: '/admin/announcements', label: '公告管理', icon: '📢' },
];

/**
 * 管理员后台布局
 */
function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#1e1e1e]">
      {/* 侧边栏 */}
      <aside
        className={`flex flex-col border-r border-[var(--color-border)] bg-[#252526] transition-all duration-200 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-center border-b border-[var(--color-border)]">
          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-[var(--color-primary)]">
              NexTest Admin
            </span>
          )}
          {sidebarCollapsed && <span className="text-xl">🔧</span>}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `mb-1 flex items-center rounded px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-gray-400 hover:bg-[#3e3e3e] hover:text-white'
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-10 items-center justify-center border-t border-[var(--color-border)] text-gray-400 hover:text-white"
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {/* 头部 */}
        <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[#252526] px-6">
          <h1 className="text-lg font-medium text-white">管理员后台</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">管理员</span>
            <button className="rounded bg-[#3e3e3e] px-3 py-1 text-sm text-gray-300 hover:bg-[#4e4e4e]">
              退出登录
            </button>
          </div>
        </header>

        {/* 内容区 */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;