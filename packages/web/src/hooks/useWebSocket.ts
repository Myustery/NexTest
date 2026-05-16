/**
 * WebSocket 连接 Hook
 * 
 * 封装 WebSocket 连接、断线重连等逻辑
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  /** WebSocket URL */
  url: string;
  /** 重连间隔（毫秒） */
  reconnectInterval?: number;
  /** 最大重连次数 */
  maxReconnectAttempts?: number;
  /** 连接成功回调 */
  onOpen?: () => void;
  /** 接收消息回调 */
  onMessage?: (data: string) => void;
  /** 连接关闭回调 */
  onClose?: () => void;
  /** 错误回调 */
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  /** 连接状态 */
  connected: boolean;
  /** 发送消息 */
  send: (data: string) => void;
  /** 断开连接 */
  disconnect: () => void;
  /** 重新连接 */
  reconnect: () => void;
}

/**
 * WebSocket Hook
 * 
 * 自动处理连接和重连逻辑
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onOpen,
    onMessage,
    onClose,
    onError,
  } = options;

  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // 连接 WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectAttemptsRef.current = 0;
      onOpen?.();
    };

    ws.onmessage = (event) => {
      onMessage?.(event.data);
    };

    ws.onclose = () => {
      setConnected(false);
      onClose?.();

      // 尝试重连
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (error) => {
      onError?.(error);
    };
  }, [url, reconnectInterval, maxReconnectAttempts, onOpen, onMessage, onClose, onError]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  // 重新连接
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // 发送消息
  const send = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  // 初始化连接
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    send,
    disconnect,
    reconnect,
  };
}