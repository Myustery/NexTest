/**
 * 公告管理页面
 */

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  published: boolean;
  created_at: number;
}

/**
 * 公告管理页面
 */
function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as const,
  });

  useEffect(() => {
    // TODO: 从 API 获取公告列表
    setAnnouncements([
      {
        id: '1',
        title: '系统维护通知',
        content: '系统将于本周六进行维护，届时将暂停服务。',
        type: 'warning',
        published: true,
        created_at: Date.now() - 86400000,
      },
    ]);
  }, []);

  const handleAddAnnouncement = () => {
    const announcement: Announcement = {
      id: Date.now().toString(),
      ...newAnnouncement,
      published: false,
      created_at: Date.now(),
    };
    setAnnouncements([announcement, ...announcements]);
    setShowAddModal(false);
    setNewAnnouncement({ title: '', content: '', type: 'info' });
  };

  const handleTogglePublish = (id: string) => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === id ? { ...a, published: !a.published } : a
      )
    );
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-900 text-red-400';
      case 'warning':
        return 'bg-yellow-900 text-yellow-400';
      default:
        return 'bg-blue-900 text-blue-400';
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">公告管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          + 新建公告
        </button>
      </div>

      {/* 公告列表 */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-lg bg-[#252526] p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${getTypeColor(
                      announcement.type
                    )}`}
                  >
                    {announcement.type === 'urgent'
                      ? '紧急'
                      : announcement.type === 'warning'
                      ? '警告'
                      : '通知'}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      announcement.published
                        ? 'bg-green-900 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {announcement.published ? '已发布' : '草稿'}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-medium text-white">
                  {announcement.title}
                </h3>
                <p className="text-sm text-gray-400">{announcement.content}</p>
                <div className="mt-2 text-xs text-gray-500">
                  创建于 {formatDate(announcement.created_at)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePublish(announcement.id)}
                  className={`rounded px-3 py-1 text-xs ${
                    announcement.published
                      ? 'bg-yellow-900 text-yellow-400 hover:bg-yellow-800'
                      : 'bg-green-900 text-green-400 hover:bg-green-800'
                  }`}
                >
                  {announcement.published ? '撤回' : '发布'}
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="rounded bg-red-900 px-3 py-1 text-xs text-red-400 hover:bg-red-800"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="rounded-lg bg-[#252526] p-8 text-center text-gray-400">
            暂无公告
          </div>
        )}
      </div>

      {/* 添加公告弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-[500px] rounded-lg bg-[#252526] p-6">
            <h3 className="mb-4 text-lg font-medium text-white">新建公告</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">标题</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">类型</label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      type: e.target.value as 'info' | 'warning' | 'urgent',
                    })
                  }
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white"
                >
                  <option value="info">通知</option>
                  <option value="warning">警告</option>
                  <option value="urgent">紧急</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">内容</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
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
                onClick={handleAddAnnouncement}
                className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnnouncements;