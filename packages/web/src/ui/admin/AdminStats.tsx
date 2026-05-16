/**
 * 数据统计页面
 */

import { useState } from 'react';

type TimeRange = 'day' | 'week' | 'month';

/**
 * 数据统计页面
 */
function AdminStats() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const stats = {
    userGrowth: [
      { date: '05-10', count: 5 },
      { date: '05-11', count: 8 },
      { date: '05-12', count: 3 },
      { date: '05-13', count: 12 },
      { date: '05-14', count: 7 },
      { date: '05-15', count: 15 },
      { date: '05-16', count: 10 },
    ],
    sessionStats: {
      total: 1024,
      avgPerUser: 8,
      peak: 256,
    },
    platformStats: [
      { platform: 'Windows', count: 120, percentage: 75 },
      { platform: 'Web', count: 30, percentage: 18.75 },
      { platform: 'macOS', count: 8, percentage: 5 },
      { platform: 'Linux', count: 2, percentage: 1.25 },
    ],
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">数据统计</h2>
        <div className="flex rounded bg-[#252526] p-1">
          {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-4 py-1 text-sm ${
                timeRange === range
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === 'day' ? '今日' : range === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </div>

      {/* 用户增长趋势 */}
      <div className="mb-8 rounded-lg bg-[#252526] p-6">
        <h3 className="mb-4 text-lg font-medium text-white">用户增长趋势</h3>
        <div className="flex h-48 items-end justify-between gap-2">
          {stats.userGrowth.map((item, index) => (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t bg-[var(--color-primary)] transition-all"
                style={{ height: `${item.count * 10}%` }}
              />
              <div className="mt-2 text-xs text-gray-400">{item.date}</div>
              <div className="text-xs text-white">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 会话统计 */}
        <div className="rounded-lg bg-[#252526] p-6">
          <h3 className="mb-4 text-lg font-medium text-white">会话统计</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">总会话数</span>
              <span className="text-2xl font-bold text-white">
                {stats.sessionStats.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">人均会话数</span>
              <span className="text-2xl font-bold text-white">
                {stats.sessionStats.avgPerUser}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">峰值并发</span>
              <span className="text-2xl font-bold text-white">
                {stats.sessionStats.peak}
              </span>
            </div>
          </div>
        </div>

        {/* 平台分布 */}
        <div className="rounded-lg bg-[#252526] p-6">
          <h3 className="mb-4 text-lg font-medium text-white">平台分布</h3>
          <div className="space-y-4">
            {stats.platformStats.map((item) => (
              <div key={item.platform}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-400">{item.platform}</span>
                  <span className="text-white">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-[#3e3e3e]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;