/**
 * 系统配置页面
 */

import { useState, useEffect } from 'react';

interface SystemConfig {
  system_name: string;
  check_update_frequency: string;
  max_upload_size: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
}

/**
 * 系统配置页面
 */
function AdminConfig() {
  const [config, setConfig] = useState<SystemConfig>({
    system_name: 'NexTest',
    check_update_frequency: 'daily',
    max_upload_size: '104857600',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // TODO: 从 API 加载配置
  }, []);

  const handleSave = () => {
    // TODO: 保存配置到 API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">系统配置</h2>
        <button
          onClick={handleSave}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          {saved ? '已保存 ✓' : '保存配置'}
        </button>
      </div>

      <div className="space-y-6">
        {/* 基本设置 */}
        <div className="rounded-lg bg-[#252526] p-6">
          <h3 className="mb-4 text-lg font-medium text-white">基本设置</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-400">系统名称</label>
              <input
                type="text"
                value={config.system_name}
                onChange={(e) =>
                  setConfig({ ...config, system_name: e.target.value })
                }
                className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">版本检查频率</label>
              <select
                value={config.check_update_frequency}
                onChange={(e) =>
                  setConfig({ ...config, check_update_frequency: e.target.value })
                }
                className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white"
              >
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="manual">手动</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">
                最大上传大小（字节）
              </label>
              <input
                type="number"
                value={config.max_upload_size}
                onChange={(e) =>
                  setConfig({ ...config, max_upload_size: e.target.value })
                }
                className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                当前: {parseInt(config.max_upload_size) / 1024 / 1024} MB
              </p>
            </div>
          </div>
        </div>

        {/* 邮件配置 */}
        <div className="rounded-lg bg-[#252526] p-6">
          <h3 className="mb-4 text-lg font-medium text-white">邮件配置</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">SMTP 服务器</label>
                <input
                  type="text"
                  value={config.smtp_host}
                  onChange={(e) =>
                    setConfig({ ...config, smtp_host: e.target.value })
                  }
                  placeholder="smtp.example.com"
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">端口</label>
                <input
                  type="number"
                  value={config.smtp_port}
                  onChange={(e) =>
                    setConfig({ ...config, smtp_port: e.target.value })
                  }
                  className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">用户名</label>
              <input
                type="text"
                value={config.smtp_user}
                onChange={(e) =>
                  setConfig({ ...config, smtp_user: e.target.value })
                }
                placeholder="your-email@example.com"
                className="w-full rounded border border-[var(--color-border)] bg-[#1e1e1e] px-3 py-2 text-white focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="rounded-lg bg-[#252526] p-6">
          <h3 className="mb-4 text-lg font-medium text-white">安全设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">强制密码强度</div>
                <div className="text-sm text-gray-400">要求用户密码包含大小写字母和数字</div>
              </div>
              <input type="checkbox" className="h-5 w-5" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">双因素认证</div>
                <div className="text-sm text-gray-400">启用双因素认证增强安全性</div>
              </div>
              <input type="checkbox" className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminConfig;