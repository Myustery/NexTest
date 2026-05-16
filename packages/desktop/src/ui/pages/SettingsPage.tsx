/**
 * 设置页面（桌面端）
 */

import { useState } from 'react';

function SettingsPage() {
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState("Consolas, 'Courier New', monospace");

  return (
    <div className="flex h-full items-center justify-center bg-[var(--color-bg)]">
      <div className="w-[500px] rounded-lg bg-[#252526] p-6">
        <h2 className="mb-6 text-xl font-bold text-white">设置</h2>

        {/* 字体设置 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-white">字体</h3>
          
          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-400">字体大小</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-400">字体族</label>
            <input
              type="text"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* 关于 */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <h3 className="mb-3 text-sm font-medium text-white">关于</h3>
          <div className="text-sm text-gray-400">
            <div>NexTest v0.1.0</div>
            <div>跨平台终端工具</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;