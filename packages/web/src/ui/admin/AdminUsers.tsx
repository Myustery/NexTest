/**
 * 用户管理页面
 */

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  employee_id: string;
  name: string;
  created_at: number;
  status: 'active' | 'disabled';
}

/**
 * 用户管理页面
 */
function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // TODO: 从 API 获取用户列表
    setUsers([
      {
        id: '1',
        email: 'user1@example.com',
        employee_id: 'EMP001',
        name: '张三',
        created_at: Date.now() - 86400000 * 30,
        status: 'active',
      },
      {
        id: '2',
        email: 'user2@example.com',
        employee_id: 'EMP002',
        name: '李四',
        created_at: Date.now() - 86400000 * 15,
        status: 'active',
      },
    ]);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email.includes(searchTerm) ||
      user.employee_id.includes(searchTerm) ||
      user.name.includes(searchTerm)
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'disabled' : 'active' }
          : user
      )
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">用户管理</h2>
        <button className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90">
          + 添加用户
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索用户（邮箱/工号/姓名）..."
          className="w-full rounded border border-[var(--color-border)] bg-[#252526] px-4 py-2 text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      {/* 用户列表 */}
      <div className="rounded-lg bg-[#252526]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-sm text-gray-400">
              <th className="p-4">邮箱</th>
              <th className="p-4">工号</th>
              <th className="p-4">姓名</th>
              <th className="p-4">注册时间</th>
              <th className="p-4">状态</th>
              <th className="p-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--color-border)] text-sm text-gray-300 hover:bg-[#2e2e2e]"
              >
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.employee_id}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{formatDate(user.created_at)}</td>
                <td className="p-4">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      user.status === 'active'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-red-900 text-red-400'
                    }`}
                  >
                    {user.status === 'active' ? '正常' : '已禁用'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="rounded bg-[#3e3e3e] px-2 py-1 text-xs text-gray-300 hover:bg-[#4e4e4e]"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`rounded px-2 py-1 text-xs ${
                        user.status === 'active'
                          ? 'bg-red-900 text-red-400 hover:bg-red-800'
                          : 'bg-green-900 text-green-400 hover:bg-green-800'
                      }`}
                    >
                      {user.status === 'active' ? '禁用' : '启用'}
                    </button>
                    <button className="rounded bg-[#3e3e3e] px-2 py-1 text-xs text-gray-300 hover:bg-[#4e4e4e]">
                      重置密码
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-400">暂无用户数据</div>
        )}
      </div>

      {/* 用户详情弹窗 */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-[500px] rounded-lg bg-[#252526] p-6">
            <h3 className="mb-4 text-lg font-medium text-white">用户详情</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">用户 ID:</span>
                <span className="text-white">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">邮箱:</span>
                <span className="text-white">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">工号:</span>
                <span className="text-white">{selectedUser.employee_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">姓名:</span>
                <span className="text-white">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">注册时间:</span>
                <span className="text-white">{formatDate(selectedUser.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">状态:</span>
                <span
                  className={
                    selectedUser.status === 'active' ? 'text-green-400' : 'text-red-400'
                  }
                >
                  {selectedUser.status === 'active' ? '正常' : '已禁用'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded bg-[#3e3e3e] px-4 py-2 text-sm text-white hover:bg-[#4e4e4e]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;