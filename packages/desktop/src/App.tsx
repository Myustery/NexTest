/**
 * 桌面端应用根组件
 */

import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './ui/layout/Layout';
import TerminalPage from './ui/pages/TerminalPage';
import SettingsPage from './ui/pages/SettingsPage';

/**
 * 应用根组件
 * 
 * 桌面端与 Web 端共享相同的 UI 组件
 */
function App() {
  useEffect(() => {
    // 初始化 Tauri 插件
    const initTauri = async () => {
      try {
        await import('@tauri-apps/api/core');
        console.log('Tauri API 已加载');
      } catch (error) {
        console.warn('Tauri API 不可用，可能在 Web 模式下运行');
      }
    };
    
    initTauri();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />} />
    </Routes>
  );
}

export default App;