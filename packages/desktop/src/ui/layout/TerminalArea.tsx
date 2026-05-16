/**
 * 终端区组件（桌面端）
 */

import { useRef, useEffect, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface SessionInfo {
  id: string;
  name: string;
  shell: string;
  created_at: number;
}

interface TerminalAreaProps {
  /** 会话管理区是否折叠 */
  sessionCollapsed: boolean;
  /** 工具侧边栏是否折叠 */
  toolCollapsed: boolean;
  /** 当前会话 */
  currentSession: SessionInfo | null;
}

/**
 * 终端区组件
 */
function TerminalArea({ currentSession }: TerminalAreaProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [commandEditorCollapsed, setCommandEditorCollapsed] = useState(true);
  const [command, setCommand] = useState('');

  // 初始化终端
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      fontSize: 14,
      fontFamily: "Consolas, 'Courier New', monospace",
      theme: {
        foreground: '#cccccc',
        background: '#1e1e1e',
        cursor: '#ffffff',
        selectionBackground: '#264f78',
      },
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // 显示欢迎信息
    term.writeln('\x1b[1;36m╔════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║        NexTest 终端 v0.1.0             ║\x1b[0m');
    term.writeln('\x1b[1;36m╚════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('欢迎使用 NexTest 终端工具');
    term.writeln('');

    // 监听窗口大小变化
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    setTerminal(term);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // 执行命令
  const handleExecuteCommand = async () => {
    if (!command.trim() || !currentSession) return;

    terminal?.writeln(`\x1b[1;32m>\x1b[0m ${command}`);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke<string>('execute_command', {
        sessionId: currentSession.id,
        command,
      });
      terminal?.writeln(result);
    } catch (error) {
      terminal?.writeln(`\x1b[1;31m错误: ${error}\x1b[0m`);
    }

    setCommand('');
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Tab 页签栏 */}
      <div className="flex items-center border-b border-[var(--color-border)] bg-[#252526]">
        {currentSession ? (
          <div className="flex items-center px-4 py-2 text-sm text-white">
            <span>{currentSession.name}</span>
            <span className="ml-2 text-xs text-gray-400">({currentSession.shell})</span>
          </div>
        ) : (
          <div className="flex items-center px-4 py-2 text-sm text-gray-400">
            请创建或选择一个会话
          </div>
        )}
      </div>

      {/* 终端界面 */}
      <div className="flex-1 overflow-hidden bg-[var(--color-bg)]">
        {currentSession ? (
          <div ref={terminalRef} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mb-2 text-4xl">🖥️</div>
              <div>创建或选择一个会话开始使用</div>
            </div>
          </div>
        )}
      </div>

      {/* 命令编辑区（可折叠） */}
      {currentSession && (
        <div
          className={`border-t border-[var(--color-border)] bg-[#252526] transition-all duration-200 ${
            commandEditorCollapsed ? 'h-8' : 'h-[150px] min-h-[100px]'
          }`}
        >
          {/* 命令编辑区头部 */}
          <div
            className="flex cursor-pointer items-center justify-between px-3 py-1"
            onClick={() => setCommandEditorCollapsed(!commandEditorCollapsed)}
          >
            <span className="text-xs text-gray-400">命令输入</span>
            <span className="text-xs text-gray-400">
              {commandEditorCollapsed ? '▲' : '▼'}
            </span>
          </div>

          {/* 命令输入 */}
          {!commandEditorCollapsed && (
            <div className="flex items-center gap-2 px-3">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
                placeholder="输入命令..."
                className="flex-1 rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-1 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none"
              />
              <button
                onClick={handleExecuteCommand}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                执行
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TerminalArea;