/**
 * 终端相关 Hook
 * 
 * 封装 xterm.js 的初始化和操作逻辑
 */

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';

interface UseTerminalOptions {
  /** 字体大小 */
  fontSize?: number;
  /** 字体族 */
  fontFamily?: string;
  /** 主题 */
  theme?: {
    foreground?: string;
    background?: string;
    cursor?: string;
    selection?: string;
  };
}

interface UseTerminalReturn {
  /** 终端实例引用 */
  terminalRef: React.RefObject<HTMLDivElement>;
  /** 终端实例 */
  terminal: Terminal | null;
  /** 调整终端大小 */
  fit: () => void;
  /** 清空终端 */
  clear: () => void;
  /** 写入文本 */
  write: (data: string) => void;
  /** 写入文本并换行 */
  writeln: (data: string) => void;
}

/**
 * 终端 Hook
 * 
 * 封装 xterm.js 的常用操作
 */
export function useTerminal(options: UseTerminalOptions = {}): UseTerminalReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // 初始化终端
  useEffect(() => {
    if (!containerRef.current) return;

    // 创建终端实例
    const terminal = new Terminal({
      fontSize: options.fontSize ?? 14,
      fontFamily: options.fontFamily ?? "Consolas, 'Courier New', monospace",
      theme: {
        foreground: options.theme?.foreground ?? '#cccccc',
        background: options.theme?.background ?? '#1e1e1e',
        cursor: options.theme?.cursor ?? '#ffffff',
        selectionBackground: options.theme?.selection ?? '#264f78',
      },
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 10000,
    });

    // 添加插件
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.loadAddon(webLinksAddon);

    // 挂载到容器
    terminal.open(containerRef.current);
    fitAddon.fit();

    // 保存引用
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // 窗口大小变化时调整终端大小
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [options.fontSize, options.fontFamily, options.theme]);

  // 调整大小
  const fit = useCallback(() => {
    fitAddonRef.current?.fit();
  }, []);

  // 清空终端
  const clear = useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  // 写入文本
  const write = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  // 写入文本并换行
  const writeln = useCallback((data: string) => {
    terminalRef.current?.writeln(data);
  }, []);

  return {
    terminalRef: containerRef,
    terminal: terminalRef.current,
    fit,
    clear,
    write,
    writeln,
  };
}