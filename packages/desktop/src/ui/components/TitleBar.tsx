import { useEffect, useState } from 'react';

interface TitleBarProps {
  title?: string;
  onNewSession?: () => void;
  onToggleToolSidebar?: () => void;
  onToggleCommandBar?: () => void;
}

function TitleBar({ 
  title = 'NexTest',
  onNewSession,
  onToggleToolSidebar,
  onToggleCommandBar,
}: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const initWindow = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        const maximized = await win.isMaximized();
        setIsMaximized(maximized);
        console.log('[TitleBar] 初始化完成, isMaximized=', maximized);
      } catch (err) {
        console.error('[TitleBar] 初始化失败:', err);
      }
    };
    initWindow();
  }, []);

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch (err) {
      console.error('[TitleBar] minimize 错误:', err);
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.toggleMaximize();
      setIsMaximized(await win.isMaximized());
    } catch (err) {
      console.error('[TitleBar] toggleMaximize 错误:', err);
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (err) {
      console.error('[TitleBar] close 错误:', err);
    }
  };

  return (
    <div 
      className="flex h-[32px] items-center justify-between bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] select-none"
    >
      <div className="flex items-center h-full px-3" style={{ WebkitAppRegion: 'drag', appRegion: 'drag' } as React.CSSProperties}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary)]">
          <polyline points="4,17 10,11 4,5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        <span className="ml-2 text-sm font-medium text-[var(--color-fg)]">{title}</span>
      </div>

      <div className="flex items-center h-full titlebar-nodrag">
        <div className="flex items-center gap-1 px-2">
          <button 
            className="toolbar-btn"
            title="新建终端"
            onClick={onNewSession}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button 
            className="toolbar-btn"
            title="工具栏"
            onClick={onToggleToolSidebar}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </button>
          <button 
            className="toolbar-btn"
            title="命令栏"
            onClick={onToggleCommandBar}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center h-full windows-controls">
          <button
            className="window-btn minimize"
            onClick={handleMinimize}
            title="最小化"
            type="button"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </button>
          <button
            className="window-btn maximize"
            onClick={handleMaximize}
            title={isMaximized ? '还原' : '最大化'}
            type="button"
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="1.5" y="2.5" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1"/>
                <polyline points="2.5,2.5 2.5,1 9,1 9,7.5" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            )}
          </button>
          <button
            className="window-btn close"
            onClick={handleClose}
            title="关闭"
            type="button"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TitleBar;
