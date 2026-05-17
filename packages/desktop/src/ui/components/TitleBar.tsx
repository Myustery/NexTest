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
  const [windowApi, setWindowApi] = useState<{
    minimize: () => Promise<void>;
    toggleMaximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  } | null>(null);

  useEffect(() => {
    const initWindow = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        
        const api = {
          minimize: async () => {
            console.log('[TitleBar] 调用 minimize');
            await win.minimize();
            console.log('[TitleBar] minimize 完成');
          },
          toggleMaximize: async () => {
            console.log('[TitleBar] 调用 toggleMaximize');
            await win.toggleMaximize();
            console.log('[TitleBar] toggleMaximize 完成');
          },
          close: async () => {
            console.log('[TitleBar] 调用 close');
            await win.close();
            console.log('[TitleBar] close 完成');
          },
          isMaximized: async () => {
            const result = await win.isMaximized();
            console.log('[TitleBar] isMaximized =', result);
            return result;
          },
        };
        
        setWindowApi(api);
        
        const maximized = await api.isMaximized();
        setIsMaximized(maximized);
        
        console.log('[TitleBar] 窗口 API 初始化成功');
      } catch (err) {
        console.error('[TitleBar] 窗口 API 初始化失败:', err);
      }
    };
    
    initWindow();
  }, []);

  const handleMinimize = async () => {
    console.log('[TitleBar] handleMinimize 开始');
    if (!windowApi) {
      console.error('[TitleBar] windowApi 为空');
      return;
    }
    try {
      await windowApi.minimize();
    } catch (err) {
      console.error('[TitleBar] minimize 异常:', err);
    }
  };

  const handleMaximize = async () => {
    console.log('[TitleBar] handleMaximize 开始');
    if (!windowApi) {
      console.error('[TitleBar] windowApi 为空');
      return;
    }
    try {
      await windowApi.toggleMaximize();
      const maximized = await windowApi.isMaximized();
      setIsMaximized(maximized);
    } catch (err) {
      console.error('[TitleBar] toggleMaximize 异常:', err);
    }
  };

  const handleClose = async () => {
    console.log('[TitleBar] handleClose 开始');
    if (!windowApi) {
      console.error('[TitleBar] windowApi 为空');
      return;
    }
    try {
      await windowApi.close();
    } catch (err) {
      console.error('[TitleBar] close 异常:', err);
    }
  };

  return (
    <div 
      className="flex h-[32px] items-center justify-between bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] select-none"
      data-tauri-drag-region
    >
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

      <div className="flex items-center h-full app-no-drag" data-tauri-drag-region="false">
        <div className="flex items-center gap-1 px-2">
          <button 
            className="toolbar-btn"
            title="新建终端"
            onClick={() => {
              console.log('[TitleBar] 点击新建终端');
              onNewSession?.();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button 
            className="toolbar-btn"
            title="工具栏"
            onClick={() => {
              console.log('[TitleBar] 点击切换工具栏');
              onToggleToolSidebar?.();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </button>
          <button 
            className="toolbar-btn"
            title="命令栏"
            onClick={() => {
              console.log('[TitleBar] 点击切换命令栏');
              onToggleCommandBar?.();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center h-full">
          <button
            className="window-btn minimize"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('[TitleBar] 最小化按钮点击');
              handleMinimize();
            }}
            title="最小化"
            type="button"
            style={{ pointerEvents: 'auto' }}
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </button>
          <button
            className="window-btn maximize"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('[TitleBar] 最大化按钮点击');
              handleMaximize();
            }}
            title={isMaximized ? '还原' : '最大化'}
            type="button"
            style={{ pointerEvents: 'auto' }}
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
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('[TitleBar] 关闭按钮点击');
              handleClose();
            }}
            title="关闭"
            type="button"
            style={{ pointerEvents: 'auto' }}
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
