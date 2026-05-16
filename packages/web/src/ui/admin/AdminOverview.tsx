/**
 * 管理员概览页面
 */

import { useState, useEffect } from 'react';

interface OverviewStats {
  totalUsers: number;
  todayActiveUsers: number;
  totalSessions: number;
  totalDevices: number;
}

/**
 * 统计卡片组件
 */
function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number | string; 
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-[#252526] p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

/**
 * 管理员概览页面
 */
function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    todayActiveUsers: 0,
    totalSessions: 0,
    totalDevices: 0,
  });

  useEffect(() => {
    // TODO: 从 API 获取统计数据
    setStats({
      totalUsers: 128,
      todayActiveUsers: 45,
      totalSessions: 1024,
      totalDevices: 156,
    });
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">系统概览</h2>

      {/* 统计卡片 */}
      <div className="mb-8 grid grid-cols-4 gap-6">
        <StatCard
          title="用户总数"
          value={stats.totalUsers}
          icon="👥"
          color="text-blue-400"
        />
        <StatCard
          title="今日活跃"
          value={stats.todayActiveUsers}
          icon="🔥"
          color="text-green-400"
        />
        <StatCard
          title="会话总数"
          value={stats.totalSessions}
          icon="💻"
          color="text-purple-400"
        />
        <StatCard
          title="设备总数"
          value={stats.totalDevices}
          icon="📱"
          color="text-orange-400"
        />
      </div>

      {/* 快捷操作 */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-medium text-white">快捷操作</h3>
        <div className="grid grid-cols-4 gap-4">
          <button className="rounded-lg bg-[#252526] p-4 text-center text-gray-300 transition-colors hover:bg-[#3e3e3e]">
            <div className="mb-2 text-2xl">👤</div>
            <div className="text-sm">添加用户</div>
          </button>
          <button className="rounded-lg bg-[#252526] p-4 text-center text-gray-300 transition-colors hover:bg-[#3e3e3e]">
            <div className="mb-2 text-2xl">📦</div>
            <div className="text-sm">发布版本</div>
          </button>
          <button className="rounded-lg bg-[#252526] p-4 text-center text-gray-300 transition-colors hover:bg-[#3e3e3e]">
            <div className="mb-2 text-2xl">📢</div>
            <div className="text-sm">发布公告</div>
          </button>
          <button className="rounded-lg bg-[#252526] p-4 text-center text-gray-300 transition-colors hover:bg-[#3e3e3e]">
            <div className="mb-2 text-2xl">⚙️</div>
            <div className="text-sm">系统设置</div>
          </button>
        </div>
      </div>

      {/* 最近活动 */}
      <div>
        <h3 className="mb-4 text-lg font-medium text-white">最近活动</h3>
        <div className="rounded-lg bg-[#252526] p-4">
          <div className="text-center text-gray-400">暂无最近活动</div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;