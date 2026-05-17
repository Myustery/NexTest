import { useEffect, useState } from 'react';

interface TitleBarProps {
  title?: string;
}

function TitleBar({ title = 'NexTest' }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        setIsMaximized(await win.isMaximized());
      } catch (error) {
        console.error('检查窗口状态失败:', error);
      }
    };

    checkMaximized();

    const handleResize = () => checkMaximized();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch (error) {
      console.error('最小化失败:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.toggleMaximize();
      setIsMaximized(await win.isMaximized());
    } catch (error) {
      console.error('最大化失败:', error);
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (error) {
      console.error('关闭失败:', error);
    }
  };

  return (
    <div 
      className="flex h-[30px] items-center justify-between bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] select-none"
      data-tauri-drag-region
    >
      <div className="flex items-center h-full px-3" data-tauri-drag-region>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary)]">
            <polyline points="4,17 10,11 4,5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
          <span className="text-xs font-medium text-[var(--color-fg)]">{title}</span>
        </div>
      </div>

      <div className="flex items-center h-full" data-tauri-drag-region>
        <div className="flex items-center gap-1 px-2 mr-1">
          <button className="toolbar-btn" title="新建终端 (Ctrl+Shift+`)" data-tauri-drag-region={false}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button className="toolbar-btn" title="搜索 (Ctrl+P)" data-tauri-drag-region={false}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button className="toolbar-btn" title="设置" data-tauri-drag-region={false}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center h-full windows-controls">
          <button
            className="window-btn minimize"
            onClick={handleMinimize}
            title="最小化"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </button>
          <button
            className="window-btn maximize"
            onClick={handleMaximize}
            title={isMaximized ? '还原' : '最大化'}
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
