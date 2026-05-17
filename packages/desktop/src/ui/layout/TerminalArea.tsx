import { useRef, useEffect, useState, useCallback } from 'react';
import { Terminal, IDisposable } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useContextMenu } from '../components/ContextMenu';

const COMPONENT = 'TerminalArea';

const log = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[${new Date().toISOString()}] [${COMPONENT}] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug(`[${new Date().toISOString()}] [${COMPONENT}] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[${new Date().toISOString()}] [${COMPONENT}] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[${new Date().toISOString()}] [${COMPONENT}] ${message}`, ...args);
  },
};

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  protocol: string;
  created_at: number;
  status: string;
}

interface TerminalAreaProps {
  currentSession: SessionInfo | null;
  sessions: SessionInfo[];
  onSelectSession: (session: SessionInfo) => void;
  onCloseSession: (sessionId: string) => void;
}

const TERMINAL_THEME = {
  foreground: '#cccccc',
  background: '#1e1e1e',
  cursor: '#ffffff',
  cursorAccent: '#1e1e1e',
  selectionBackground: '#264f78',
  selectionForeground: '#ffffff',
  black: '#000000',
  red: '#cd3131',
  green: '#0dbc79',
  yellow: '#e5e510',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
  white: '#e5e5e5',
  brightBlack: '#666666',
  brightRed: '#f14c4c',
  brightGreen: '#23d18b',
  brightYellow: '#f5f543',
  brightBlue: '#3b8eea',
  brightMagenta: '#d670d6',
  brightCyan: '#29b8db',
  brightWhite: '#e5e5e5',
};

const terminals = new Map<string, { term: Terminal; fit: FitAddon; dataListener?: IDisposable; resizeListener?: IDisposable }>();

function TerminalArea({
  currentSession,
  sessions,
  onSelectSession,
  onCloseSession,
}: TerminalAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const readIntervalRef = useRef<number | null>(null);
  const { showMenu } = useContextMenu();
  
  const [commandEditExpanded, setCommandEditExpanded] = useState(true);
  const [commandEditHeight, setCommandEditHeight] = useState(120);
  const [commandText, setCommandText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const resizeStartY = useRef<number | null>(null);
  const resizeStartHeight = useRef<number>(0);

  const createTerminal = useCallback((sessionId: string) => {
    const existing = terminals.get(sessionId);
    if (existing) {
      log.debug(`终端已存在，返回缓存 | sessionId=${sessionId}`);
      return { term: existing.term, fit: existing.fit };
    }
    
    log.info(`创建终端实例 | sessionId=${sessionId}`);
    
    const term = new Terminal({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
      fontWeight: '400',
      lineHeight: 1.2,
      letterSpacing: 0,
      theme: TERMINAL_THEME,
      cursorBlink: true,
      cursorStyle: 'bar',
      cursorWidth: 2,
      scrollback: 10000,
      allowProposedApi: true,
      smoothScrollDuration: 100,
    });

    const fit = new FitAddon();
    const links = new WebLinksAddon();

    term.loadAddon(fit);
    term.loadAddon(links);

    const dataListener = term.onData(async (data) => {
      log.debug(`终端输入 | sessionId=${sessionId} | len=${data.length} | data=${JSON.stringify(data)}`);
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('write_pty', { sessionId, data });
        log.debug(`写入 PTY 成功 | sessionId=${sessionId}`);
      } catch (error) {
        log.error(`写入 PTY 失败 | sessionId=${sessionId}`, error);
      }
    });

    const resizeListener = term.onResize(async ({ cols, rows }) => {
      log.debug(`终端尺寸变化 | sessionId=${sessionId} | ${cols}x${rows}`);
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('resize_pty', { sessionId, rows, cols });
      } catch (error) {
        log.error(`调整 PTY 大小失败 | sessionId=${sessionId}`, error);
      }
    });

    terminals.set(sessionId, { term, fit, dataListener, resizeListener });
    log.debug(`终端实例已缓存 | sessionId=${sessionId} | 缓存数量=${terminals.size}`);

    return { term, fit };
  }, []);

  const mountTerminal = useCallback((sessionId: string) => {
    log.debug(`挂载终端 | sessionId=${sessionId}`);
    
    if (!containerRef.current) {
      log.warn('容器引用为空，无法挂载终端');
      return;
    }

    let terminalData = terminals.get(sessionId);
    
    if (!terminalData) {
      log.debug(`终端不存在，创建新终端 | sessionId=${sessionId}`);
      terminalData = createTerminal(sessionId);
    }

    const { term, fit } = terminalData;

    if (!term.element) {
      containerRef.current.innerHTML = '';
      log.debug(`打开终端 | sessionId=${sessionId}`);
      term.open(containerRef.current);
    }

    requestAnimationFrame(() => {
      fit.fit();
      log.debug(`终端尺寸调整完成 | sessionId=${sessionId}`);
      term.focus();
      log.debug(`终端已聚焦 | sessionId=${sessionId}`);
    });
  }, [createTerminal]);

  const startReading = useCallback((sessionId: string) => {
    log.info(`开始读取终端输出 | sessionId=${sessionId}`);
    
    if (readIntervalRef.current) {
      clearInterval(readIntervalRef.current);
    }

    let readCount = 0;
    readIntervalRef.current = window.setInterval(async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const data = await invoke<string>('read_pty', { sessionId });
        if (data) {
          readCount++;
          const terminalData = terminals.get(sessionId);
          if (terminalData) {
            terminalData.term.write(data);
            if (readCount % 100 === 0) {
              log.debug(`终端输出累计 | sessionId=${sessionId} | reads=${readCount}`);
            }
          }
        }
      } catch (error) {
        log.error(`读取 PTY 失败 | sessionId=${sessionId}`, error);
      }
    }, 50);
    
    log.debug(`读取定时器已启动 | interval=50ms`);
  }, []);

  useEffect(() => {
    log.info('组件初始化');
    
    return () => {
      log.info('组件卸载，清理资源');
      if (readIntervalRef.current) {
        clearInterval(readIntervalRef.current);
      }
      terminals.forEach(({ term, dataListener, resizeListener }, id) => {
        log.debug(`销毁终端 | sessionId=${id}`);
        dataListener?.dispose();
        resizeListener?.dispose();
        term.dispose();
      });
      terminals.clear();
    };
  }, []);

  useEffect(() => {
    if (currentSession) {
      log.info(`切换会话 | sessionId=${currentSession.id} | name=${currentSession.name}`);
      mountTerminal(currentSession.id);
      startReading(currentSession.id);
    } else {
      log.info('无当前会话，停止读取');
      if (readIntervalRef.current) {
        clearInterval(readIntervalRef.current);
      }
    }
  }, [currentSession, mountTerminal, startReading]);

  useEffect(() => {
    const handleResize = () => {
      if (currentSession) {
        const terminalData = terminals.get(currentSession.id);
        if (terminalData) {
          requestAnimationFrame(() => terminalData.fit.fit());
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [currentSession]);

  const handleCommandRun = useCallback(async () => {
    if (!currentSession || !commandText.trim()) return;
    log.info(`执行命令 | sessionId=${currentSession.id} | command=${commandText.trim()}`);
    setIsRunning(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('execute_command', { sessionId: currentSession.id, command: commandText.trim() });
    } catch (error) {
      log.error('执行命令失败', error);
    } finally {
      setIsRunning(false);
    }
  }, [currentSession, commandText]);

  const handleCommandStop = useCallback(() => {
    log.info('停止命令执行');
    setIsRunning(false);
  }, []);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = commandEditHeight;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizeStartY.current !== null) {
        const delta = resizeStartY.current - moveEvent.clientY;
        const newHeight = Math.max(60, Math.min(400, resizeStartHeight.current + delta));
        setCommandEditHeight(newHeight);
      }
    };
    const handleMouseUp = () => {
      resizeStartY.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('dragging');
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('dragging');
  }, [commandEditHeight]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
      log.debug('打开搜索');
    }
    if (e.key === 'Escape' && showSearch) {
      setShowSearch(false);
      setSearchTerm('');
      log.debug('关闭搜索');
    }
  }, [showSearch]);

  const handleTerminalContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const terminalData = currentSession ? terminals.get(currentSession.id) : null;

    showMenu(e.clientX, e.clientY, [
      {
        label: '复制',
        shortcut: 'Ctrl+Shift+C',
        onClick: () => {
          if (terminalData) {
            const selection = terminalData.term.getSelection();
            if (selection) {
              navigator.clipboard.writeText(selection);
              log.debug('复制选中内容', { len: selection.length });
            }
          }
        },
        disabled: !terminalData?.term.hasSelection(),
      },
      {
        label: '粘贴',
        shortcut: 'Ctrl+Shift+V',
        onClick: async () => {
          const text = await navigator.clipboard.readText();
          if (text && currentSession) {
            log.debug('粘贴内容', { len: text.length });
            try {
              const { invoke } = await import('@tauri-apps/api/core');
              await invoke('write_pty', { sessionId: currentSession.id, data: text });
            } catch (error) {
              log.error('粘贴失败', error);
            }
          }
        },
      },
      {
        label: '全选',
        shortcut: 'Ctrl+Shift+A',
        onClick: () => {
          if (terminalData) {
            terminalData.term.selectAll();
          }
        },
      },
      { divider: true, label: '' },
      {
        label: '清屏',
        onClick: () => {
          if (terminalData) {
            terminalData.term.clear();
            log.debug('清屏');
          }
        },
      },
      {
        label: '搜索',
        shortcut: 'Ctrl+F',
        onClick: () => setShowSearch(true),
      },
    ]);
  }, [currentSession, showMenu]);

  const handleTabContextMenu = useCallback((e: React.MouseEvent, session: SessionInfo) => {
    e.preventDefault();
    e.stopPropagation();

    showMenu(e.clientX, e.clientY, [
      {
        label: '关闭',
        shortcut: 'Ctrl+W',
        onClick: () => {
          log.info(`右键菜单关闭会话 | sessionId=${session.id}`);
          onCloseSession(session.id);
        },
      },
      {
        label: '关闭其他',
        onClick: () => {
          log.info(`右键菜单关闭其他会话 | keepSessionId=${session.id}`);
          sessions.filter(s => s.id !== session.id).forEach(s => onCloseSession(s.id));
        },
      },
      {
        label: '关闭所有',
        onClick: () => {
          log.info('右键菜单关闭所有会话');
          sessions.forEach(s => onCloseSession(s.id));
        },
      },
    ]);
  }, [sessions, onCloseSession, showMenu]);

  const getShellIcon = (shell: string, protocol: string) => {
    if (protocol === 'ssh') return '🔐';
    if (protocol === 'telnet') return '🌐';
    if (protocol === 'serial') return '🔌';
    
    switch (shell) {
      case 'powershell':
      case 'pwsh':
        return '⚡';
      case 'bash':
      case 'wsl':
        return '🐧';
      case 'cmd':
        return '🖥️';
      default:
        return '⌨️';
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden" onKeyDown={handleKeyDown}>
      <div className="flex h-[var(--tab-height)] items-center bg-[var(--color-bg-elevated)]">
        <div className="flex flex-1 items-center overflow-x-auto scrollbar-none">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('.tab-close')) {
                  onSelectSession(session);
                }
              }}
              onContextMenu={(e) => handleTabContextMenu(e, session)}
              className={`tab-item ${currentSession?.id === session.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{getShellIcon(session.shell, session.protocol)}</span>
              <span className="tab-label">{session.name}</span>
               <button
                 onMouseDown={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                 }}
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   log.info(`Tab 关闭按钮点击 | sessionId=${session.id}`);
                   onCloseSession(session.id);
                 }}
                 className="tab-close"
               >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="monaco-toolbar px-2">
          {showSearch && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索..."
              className="input-field mr-2 w-[150px]"
              autoFocus
            />
          )}
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="搜索 (Ctrl+F)"
            className="flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            title="清屏"
            onClick={() => {
              if (currentSession) {
                const terminalData = terminals.get(currentSession.id);
                if (terminalData) {
                  terminalData.term.clear();
                  log.debug('清屏按钮点击');
                }
              }
            }}
            className="flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {currentSession && (
        <div className="breadcrumb">
          <div className="breadcrumb-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span>{currentSession.protocol.toUpperCase()}</span>
          </div>
          <span className="breadcrumb-separator">›</span>
          <div className="breadcrumb-item">
            <span className="text-[var(--color-fg)]">{currentSession.name}</span>
          </div>
        </div>
      )}

      <div 
        className="relative flex-1 overflow-hidden bg-[var(--color-bg-deep)]"
        onContextMenu={handleTerminalContextMenu}
        data-context-menu
      >
        {currentSession ? (
          <div className="flex flex-col h-full">
            <div ref={containerRef} className="flex-1 w-full overflow-hidden" />
            
            {/* 命令编辑区 */}
            {commandEditExpanded && (
              <>
                <div 
                  className="resize-handle resize-handle-horizontal h-[3px] cursor-row-resize bg-[var(--color-border-subtle)] hover:bg-[var(--color-primary)]"
                  onMouseDown={handleResizeMouseDown}
                />
                <div 
                  className="bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-subtle)]"
                  style={{ height: `${commandEditHeight}px` }}
                >
                  {/* Tab 栏 */}
                  <div className="flex items-center h-[28px] px-2 border-b border-[var(--color-border-subtle)]">
                    <span className="text-xs text-[var(--color-fg-muted)]">命令编辑</span>
                    <div className="flex-1" />
                    <button
                      className="btn-icon"
                      onClick={handleCommandRun}
                      disabled={isRunning || !commandText.trim()}
                      title="运行 (Enter)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-success)]">
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                    </button>
                    <button
                      className="btn-icon"
                      onClick={handleCommandStop}
                      disabled={!isRunning}
                      title="停止"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-error)]">
                        <rect x="6" y="6" width="12" height="12"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* 编辑区 */}
                  <textarea
                    value={commandText}
                    onChange={(e) => setCommandText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommandRun();
                      }
                    }}
                    placeholder="输入命令，按 Enter 执行..."
                    className="w-full h-[calc(100%-28px)] p-2 bg-transparent border-none outline-none resize-none text-[var(--color-fg)] text-sm font-mono"
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center animate-fadeIn">
              <div className="mb-6">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-[var(--color-fg-subtle)]">
                  <polyline points="4,17 10,11 4,5"/>
                  <line x1="12" y1="19" x2="20" y2="19"/>
                </svg>
              </div>
              <div className="mb-2 text-lg text-[var(--color-fg-muted)]">
                开始使用 NexTest
              </div>
              <div className="text-sm text-[var(--color-fg-subtle)]">
                点击左侧 + 创建新终端会话
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 命令编辑区折叠按钮 */}
      {currentSession && (
        <div className="flex items-center h-[24px] px-2 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-subtle)]">
          <button
            className="flex items-center gap-1 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            onClick={() => setCommandEditExpanded(!commandEditExpanded)}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ transform: commandEditExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
            >
              <polyline points="9,18 15,12 9,6"/>
            </svg>
            <span>{commandEditExpanded ? '隐藏' : '显示'}命令编辑区</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default TerminalArea;
