/**
 * 登录页面
 * 
 * 用户认证入口
 */

import { useState } from 'react';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="w-[400px] rounded-lg bg-[#252526] p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          NexTest
        </h1>

        {/* 登录/注册切换 */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            className={`px-4 py-2 text-sm ${
              isLogin ? 'text-white border-b-2 border-[var(--color-primary)]' : 'text-gray-400'
            }`}
            onClick={() => setIsLogin(true)}
          >
            登录
          </button>
          <button
            className={`px-4 py-2 text-sm ${
              !isLogin ? 'text-white border-b-2 border-[var(--color-primary)]' : 'text-gray-400'
            }`}
            onClick={() => setIsLogin(false)}
          >
            注册
          </button>
        </div>

        {/* 表单 */}
        <form className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm text-gray-400">工号</label>
              <input
                type="text"
                className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="请输入工号"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-gray-400">邮箱</label>
            <input
              type="email"
              className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
              placeholder="请输入邮箱"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">密码</label>
            <input
              type="password"
              className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-[var(--color-primary)] py-2 text-white hover:opacity-90"
          >
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        {/* 离线使用 */}
        <div className="mt-4 text-center">
          <button className="text-sm text-gray-400 hover:text-gray-300">
            离线使用
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;