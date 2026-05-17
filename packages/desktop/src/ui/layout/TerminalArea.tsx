import { useRef, useEffect, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useContextMenu } from '../components/ContextMenu';

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

const terminals = new Map<string, { term: Terminal; fit: FitAddon }>();

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

  const createTerminal = useCallback((sessionId: string) => {
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

    terminals.set(sessionId, { term, fit });

    return { term, fit };
  }, []);

  const mountTerminal = useCallback((sessionId: string) => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    let terminalData = terminals.get(sessionId);
    if (!terminalData) {
      terminalData = createTerminal(sessionId);
    }

    const { term, fit } = terminalData;

    if (!term.element) {
      term.open(containerRef.current);
    }

    requestAnimationFrame(() => fit.fit());

    term.onData(async (data) => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('write_pty', { sessionId, data });
      } catch (error) {
        console.error('写入 PTY 失败:', error);
      }
    });

    term.onResize(async ({ cols, rows }) => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('resize_pty', { sessionId, rows, cols });
      } catch (error) {
        console.error('调整 PTY 大小失败:', error);
      }
    });
  }, [createTerminal]);

  const startReading = useCallback((sessionId: string) => {
    if (readIntervalRef.current) {
      clearInterval(readIntervalRef.current);
    }

    readIntervalRef.current = window.setInterval(async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const data = await invoke<string>('read_pty', { sessionId });
        if (data) {
          const terminalData = terminals.get(sessionId);
          if (terminalData) {
            terminalData.term.write(data);
          }
        }
      } catch (error) {
        console.error('读取 PTY 失败:', error);
      }
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (readIntervalRef.current) {
        clearInterval(readIntervalRef.current);
      }
      terminals.forEach(({ term }) => term.dispose());
      terminals.clear();
    };
  }, []);

  useEffect(() => {
    if (currentSession) {
      mountTerminal(currentSession.id);
      startReading(currentSession.id);
    } else {
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
    }
    if (e.key === 'Escape' && showSearch) {
      setShowSearch(false);
      setSearchTerm('');
    }
  }, [showSearch]);

  const handleTerminalContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const terminalData = currentSession ? terminals.get(currentSession.id) : null;

    showMenu(e.clientX, e.clientY, [
      {
        label: '复制',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        ),
        shortcut: 'Ctrl+Shift+C',
        onClick: () => {
          if (terminalData) {
            const selection = terminalData.term.getSelection();
            if (selection) {
              navigator.clipboard.writeText(selection);
            }
          }
        },
        disabled: !terminalData?.term.hasSelection(),
      },
      {
        label: '粘贴',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1"/>
          </svg>
        ),
        shortcut: 'Ctrl+Shift+V',
        onClick: async () => {
          const text = await navigator.clipboard.readText();
          if (text && currentSession) {
            try {
              const { invoke } = await import('@tauri-apps/api/core');
              await invoke('write_pty', { sessionId: currentSession.id, data: text });
            } catch (error) {
              console.error('粘贴失败:', error);
            }
          }
        },
      },
      {
        label: '全选',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        ),
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
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        ),
        onClick: () => {
          if (terminalData) {
            terminalData.term.clear();
          }
        },
      },
      {
        label: '搜索',
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        ),
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
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ),
        shortcut: 'Ctrl+W',
        onClick: () => onCloseSession(session.id),
      },
      {
        label: '关闭其他',
        onClick: () => {
          sessions.filter(s => s.id !== session.id).forEach(s => onCloseSession(s.id));
        },
      },
      {
        label: '关闭所有',
        onClick: () => {
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
              onClick={() => onSelectSession(session)}
              onContextMenu={(e) => handleTabContextMenu(e, session)}
              className={`tab-item ${currentSession?.id === session.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{getShellIcon(session.shell, session.protocol)}</span>
              <span className="tab-label">{session.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
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
          <div ref={containerRef} className="h-full w-full" />
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
    </div>
  );
}

export default TerminalArea;
