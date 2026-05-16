/**
 * 会话管理区组件（左侧）
 * 
 * 功能：
 * - 管理多个会话
 * - 支持多级文件夹
 * - 可折叠
 * - 右键新建文件夹/会话
 */

interface SessionPanelProps {
  /** 是否折叠 */
  collapsed: boolean;
  /** 折叠/展开回调 */
  onToggle: () => void;
}

/**
 * 会话管理区组件
 * 
 * 默认宽度 200px，最小宽度 150px，可调整
 */
function SessionPanel({ collapsed, onToggle }: SessionPanelProps) {
  return (
    <div
      className={`flex flex-col border-r border-[var(--color-border)] bg-[#252526] transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-[200px] min-w-[150px]'
      }`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
        {!collapsed && <span className="text-sm font-medium">会话</span>}
        <button
          onClick={onToggle}
          className="rounded p-1 text-[var(--color-fg)] hover:bg-[#3e3e3e]"
          title={collapsed ? '展开' : '折叠'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* 会话列表 */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          {/* TODO: 实现会话树形列表 */}
          <div className="text-sm text-gray-400">暂无会话</div>
        </div>
      )}
    </div>
  );
}

export default SessionPanel;