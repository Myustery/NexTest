import { useEffect, useState, useRef } from 'react';

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
  const windowRef = useRef<{
    minimize: () => Promise<void>;
    toggleMaximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  } | null>(null);

  useEffect(() => {
    // 初始化窗口 API
    const initWindow = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        
        windowRef.current = {
          minimize: () => win.minimize(),
          toggleMaximize: () => win.toggleMaximize(),
          close: () => win.close(),
          isMaximized: () => win.isMaximized(),
        };
        
        // 获取初始状态
        const maximized = await win.isMaximized();
        setIsMaximized(maximized);
        
        console.log('[TitleBar] 窗口 API 初始化成功');
      } catch (err) {
        console.error('[TitleBar] 窗口 API 初始化失败:', err);
      }
    };
    
    initWindow();
  }, []);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TitleBar] 点击最小化');
    
    if (windowRef.current) {
      try {
        await windowRef.current.minimize();
        console.log('[TitleBar] 最小化成功');
      } catch (err) {
        console.error('[TitleBar] 最小化失败:', err);
      }
    }
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TitleBar] 点击最大化/还原');
    
    if (windowRef.current) {
      try {
        await windowRef.current.toggleMaximize();
        const maximized = await windowRef.current.isMaximized();
        setIsMaximized(maximized);
        console.log('[TitleBar] 最大化状态:', maximized);
      } catch (err) {
        console.error('[TitleBar] 最大化失败:', err);
      }
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TitleBar] 点击关闭');
    
    if (windowRef.current) {
      try {
        await windowRef.current.close();
        console.log('[TitleBar] 关闭成功');
      } catch (err) {
        console.error('[TitleBar] 关闭失败:', err);
      }
    }
  };

  const handleNewSession = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TitleBar] 点击新建终端');
    onNewSession?.();
  };

  const handleToggleTool = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TitleBar] 点击切换工具栏');
    onToggleToolSidebar?.();
  };

  const handleToggleCommand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[TitleBar] 点击切换命令栏');
    onToggleCommandBar?.();
  };

  return (
    <div 
      className="flex h-[32px] items-center justify-between bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] select-none"
      data-tauri-drag-region
    >
      {/* 左侧：Logo 和标题 */}
      <div 
        className="flex items-center h-full px-3"
        data-tauri-drag-region
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary)]">
          <polyline points="4,17 10,11 4,5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        <span className="ml-2 text-sm font-medium text-[var(--color-fg)]">{title}</span>
      </div>

      {/* 右侧：工具按钮和窗口控制 */}
      <div className="flex items-center h-full" data-tauri-drag-region="false">
        {/* 工具按钮 */}
        <div className="flex items-center gap-1 px-2">
          <button 
            className="toolbar-btn"
            title="新建终端"
            onClick={handleNewSession}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button 
            className="toolbar-btn"
            title="工具栏"
            onClick={handleToggleTool}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </button>
          <button 
            className="toolbar-btn"
            title="命令栏"
            onClick={handleToggleCommand}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </button>
        </div>

        {/* 窗口控制按钮 */}
        <div className="flex items-center h-full windows-controls">
          <button
            className="window-btn minimize"
            onClick={handleMinimize}
            onMouseDown={(e) => e.stopPropagation()}
            title="最小化"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </button>
          <button
            className="window-btn maximize"
            onClick={handleMaximize}
            onMouseDown={(e) => e.stopPropagation()}
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
            onMouseDown={(e) => e.stopPropagation()}
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
