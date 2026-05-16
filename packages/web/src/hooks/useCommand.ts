/**
 * 命令执行相关 Hook
 * 
 * 封装命令执行、暂停、终止等逻辑
 */

import { useState, useCallback } from 'react';

/** 命令执行状态 */
type ExecutionStatus = 'idle' | 'running' | 'paused';

interface UseCommandOptions {
  /** 执行失败时是否继续 */
  continueOnFailure?: boolean;
}

interface UseCommandReturn {
  /** 执行状态 */
  status: ExecutionStatus;
  /** 当前执行的命令索引 */
  currentIndex: number;
  /** 总命令数 */
  totalCommands: number;
  /** 执行命令 */
  execute: (commands: string[]) => Promise<void>;
  /** 暂停执行 */
  pause: () => void;
  /** 继续执行 */
  resume: () => void;
  /** 终止执行 */
  stop: () => void;
}

/**
 * 命令执行 Hook
 * 
 * 管理命令的执行流程
 */
export function useCommand(options: UseCommandOptions = {}): UseCommandReturn {
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCommands, setTotalCommands] = useState(0);
  const [pausedIndex, setPausedIndex] = useState<number | null>(null);

  // 执行命令
  const execute = useCallback(async (commands: string[]) => {
    setTotalCommands(commands.length);
    setCurrentIndex(0);
    setStatus('running');

    for (let i = pausedIndex ?? 0; i < commands.length; i++) {
      if (status === 'paused') {
        setPausedIndex(i);
        return;
      }

      setCurrentIndex(i);
      
      // TODO: 发送命令到终端
      console.log('执行命令:', commands[i]);

      // 模拟执行延迟
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setStatus('idle');
    setCurrentIndex(0);
    setPausedIndex(null);
  }, [status, pausedIndex]);

  // 暂停执行
  const pause = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
    }
  }, [status]);

  // 继续执行
  const resume = useCallback(() => {
    if (status === 'paused') {
      setStatus('running');
    }
  }, [status]);

  // 终止执行
  const stop = useCallback(() => {
    setStatus('idle');
    setCurrentIndex(0);
    setPausedIndex(null);
  }, []);

  return {
    status,
    currentIndex,
    totalCommands,
    execute,
    pause,
    resume,
    stop,
  };
}