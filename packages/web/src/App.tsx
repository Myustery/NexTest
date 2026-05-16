/**
 * 应用根组件
 */

import { Routes, Route } from 'react-router-dom';
import Layout from './ui/layout/Layout';
import TerminalPage from './ui/pages/TerminalPage';
import SettingsPage from './ui/pages/SettingsPage';
import LoginPage from './ui/pages/LoginPage';

/**
 * 应用根组件
 * 
 * 配置路由和全局布局
 */
function App() {
  return (
    <Routes>
      {/* 登录页面 */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 主应用布局 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<TerminalPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;