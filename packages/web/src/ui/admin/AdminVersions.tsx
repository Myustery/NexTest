/**
 * 版本管理页面
 */

import { useState, useEffect } from 'react';

interface Version {
  id: string;
  version: string;
  platform: string;
  release_date: number;
  changelog: string;
  size: number;
  active: boolean;
}

/**
 * 版本管理页面
 */
function AdminVersions() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version: '',
    platform: 'windows',
    changelog: '',
  });

  useEffect(() => {
    // TODO: 从 API 获取版本列表
    setVersions([
      {
        id: '1',
        version: '0.1.0',
        platform: 'windows',
        release_date: Date.now() - 86400000,
        changelog: '初始版本',
        size: 50 * 1024 * 1024,
        active: true,
      },
    ]);
  }, []);

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const handleAddVersion = () => {
    // TODO: 调用 API 创建版本
    console.log('添加版本:', newVersion);
    setShowAddModal(false);
    setNewVersion({ version: '', platform: 'windows', changelog: '' });
  };

  const handleToggleActive = (versionId: string) => {
    setVersions(
      versions.map((v) =>
        v.id === versionId ? { ...v, active: !v.active } : v
      )
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">版本管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          + 发布新版本
        </button>
      </div>

      {/* 版本列表 */}
      <div className="rounded-lg bg-[#252526]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-sm text-gray-400">
              <th className="p-4">版本号</th>
              <th className="p-4">平台</th>
              <th className="p-4">发布日期</th>
              <th className="p-4">大小</th>
              <th className="p-4">状态</th>
              <th className="p-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr
                key={v.id}
                className="border-b border-[var(--color-border)] text-sm text-gray-300 hover:bg-[#2e2e2e]"
              >
                <td className="p-4 font-mono">{v.version}</td>
                <td className="p-4">{v.platform}</td>
                <td className="p-4">{formatDate(v.release_date)}</td>
                <td className="p-4">{formatSize(v.size)}</td>
                <td className="p-4">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      v.active
                        ? 'bg-green-900 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {v.active ? '已发布' : '已撤回'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="rounded bg-[#3e3e3e] px-2 py-1 text-xs text-gray-300 hover:bg-[#4e4e4e]">
                      查看日志
                    </button>
                    <button
                      onClick={() => handleToggleActive(v.id)}
                      className={`rounded px-2 py-1 text-xs ${
                        v.active
                          ? 'bg-red-900 text-red-400 hover:bg-red-800'
                          : 'bg-green-900 text-green-400 hover:bg-green-800'
                      }`}
                    >
                      {v.active ? '撤回' : '恢复'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {versions.length === 0 && (
          <div className="p-8 text-center text-gray-400">暂无版本数据</div>
        )}
      </div>

      {/* 添加版本弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-[500px] rounded-lg bg-[#252526] p-6">
            <h3 className="mb-4 text-lg font-medium text-white">发布新版本</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">版本号</label>
                <input
                  type="text"
                  value={newVersion.version}
                  onChange={(e) =>
                    setNewVersion({ ...newVersion, version: e.target.value })
                  }
                  placeholder="例如: 1.0.0"
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">平台</label>
                <select
                  value={newVersion.platform}
                  onChange={(e) =>
                    setNewVersion({ ...newVersion, platform: e.target.value })
                  }
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white"
                >
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                  <option value="linux">Linux</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">更新日志</label>
                <textarea
                  value={newVersion.changelog}
                  onChange={(e) =>
                    setNewVersion({ ...newVersion, changelog: e.target.value })
                  }
                  placeholder="请输入更新日志..."
                  rows={4}
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">安装包</label>
                <input
                  type="file"
                  accept=".exe,.msi"
                  className="w-full text-sm text-gray-400"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded bg-[#3e3e3e] px-4 py-2 text-sm text-white hover:bg-[#4e4e4e]"
              >
                取消
              </button>
              <button
                onClick={handleAddVersion}
                className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVersions;