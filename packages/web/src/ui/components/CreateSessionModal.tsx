import { useState } from 'react';

interface ConnectionProtocol {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const PROTOCOLS: ConnectionProtocol[] = [
  { id: 'local', name: '本地终端', icon: '💻', description: '本地 Shell (CMD, PowerShell, Bash)' },
  { id: 'ssh', name: 'SSH', icon: '🔐', description: '安全 Shell 连接' },
  { id: 'telnet', name: 'Telnet', icon: '🌐', description: 'Telnet 远程连接' },
  { id: 'serial', name: '串口', icon: '🔌', description: 'COM 串口连接' },
];

const LOCAL_SHELLS = [
  { id: 'powershell', name: 'PowerShell', icon: '⚡' },
  { id: 'cmd', name: 'CMD', icon: '🖥️' },
  { id: 'pwsh', name: 'PowerShell 7', icon: '💙' },
  { id: 'bash', name: 'Git Bash', icon: '🐧' },
  { id: 'wsl', name: 'WSL', icon: '🐧' },
];

interface FormData {
  name: string;
  protocol: string;
  localShell: string;
  sshHost: string;
  sshPort: string;
  sshUsername: string;
  sshPassword: string;
  sshKeyPath: string;
  sshKeyPassphrase: string;
  telnetHost: string;
  telnetPort: string;
  serialPort: string;
  serialBaudRate: string;
  serialDataBits: string;
  serialParity: string;
  serialStopBits: string;
  serialFlowControl: string;
}

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: SessionConfig) => void;
}

export interface SessionConfig {
  name: string;
  protocol: string;
  shell?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  keyPath?: string;
  keyPassphrase?: string;
  serialPort?: string;
  baudRate?: number;
  dataBits?: number;
  parity?: string;
  stopBits?: number;
  flowControl?: string;
}

const BAUD_RATES = ['9600', '19200', '38400', '57600', '115200', '230400', '460800', '921600'];
const DATA_BITS = ['5', '6', '7', '8'];
const PARITY_OPTIONS = [
  { value: 'none', label: '无' },
  { value: 'odd', label: '奇校验' },
  { value: 'even', label: '偶校验' },
];
const STOP_BITS = ['1', '1.5', '2'];
const FLOW_CONTROL_OPTIONS = [
  { value: 'none', label: '无' },
  { value: 'hardware', label: '硬件 (RTS/CTS)' },
  { value: 'software', label: '软件 (XON/XOFF)' },
];

const AVAILABLE_PORTS = ['COM1', 'COM2', 'COM3', 'COM4', '/dev/ttyUSB0', '/dev/ttyACM0'];

function CreateSessionModal({ isOpen, onClose, onCreate }: CreateSessionModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    protocol: 'local',
    localShell: 'powershell',
    sshHost: '',
    sshPort: '22',
    sshUsername: '',
    sshPassword: '',
    sshKeyPath: '',
    sshKeyPassphrase: '',
    telnetHost: '',
    telnetPort: '23',
    serialPort: 'COM1',
    serialBaudRate: '115200',
    serialDataBits: '8',
    serialParity: 'none',
    serialStopBits: '1',
    serialFlowControl: 'none',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showKeyPassphrase, setShowKeyPassphrase] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入会话名称';
    }

    if (formData.protocol === 'ssh') {
      if (!formData.sshHost.trim()) {
        newErrors.sshHost = '请输入主机地址';
      }
      if (!formData.sshUsername.trim()) {
        newErrors.sshUsername = '请输入用户名';
      }
      if (!formData.sshPassword && !formData.sshKeyPath) {
        newErrors.auth = '请输入密码或选择密钥文件';
      }
    }

    if (formData.protocol === 'telnet') {
      if (!formData.telnetHost.trim()) {
        newErrors.telnetHost = '请输入主机地址';
      }
    }

    if (formData.protocol === 'serial') {
      if (!formData.serialPort.trim()) {
        newErrors.serialPort = '请选择串口';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const config: SessionConfig = {
      name: formData.name.trim(),
      protocol: formData.protocol,
    };

    switch (formData.protocol) {
      case 'local':
        config.shell = formData.localShell;
        break;
      case 'ssh':
        config.host = formData.sshHost.trim();
        config.port = parseInt(formData.sshPort, 10) || 22;
        config.username = formData.sshUsername.trim();
        if (formData.sshKeyPath) {
          config.keyPath = formData.sshKeyPath;
          config.keyPassphrase = formData.sshKeyPassphrase;
        } else {
          config.password = formData.sshPassword;
        }
        break;
      case 'telnet':
        config.host = formData.telnetHost.trim();
        config.port = parseInt(formData.telnetPort, 10) || 23;
        break;
      case 'serial':
        config.serialPort = formData.serialPort;
        config.baudRate = parseInt(formData.serialBaudRate, 10);
        config.dataBits = parseInt(formData.serialDataBits, 10);
        config.parity = formData.serialParity;
        config.stopBits = parseFloat(formData.serialStopBits);
        config.flowControl = formData.serialFlowControl;
        break;
    }

    onCreate(config);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      protocol: 'local',
      localShell: 'powershell',
      sshHost: '',
      sshPort: '22',
      sshUsername: '',
      sshPassword: '',
      sshKeyPath: '',
      sshKeyPassphrase: '',
      telnetHost: '',
      telnetPort: '23',
      serialPort: 'COM1',
      serialBaudRate: '115200',
      serialDataBits: '8',
      serialParity: 'none',
      serialStopBits: '1',
      serialFlowControl: 'none',
    });
    setErrors({});
    onClose();
  };

  const handleBrowseKeyFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pem,.key,.pub,.ppk';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData(prev => ({ ...prev, sshKeyPath: file.name }));
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn" onClick={handleClose}>
      <div
        className="w-[520px] max-h-[85vh] overflow-hidden rounded-lg bg-[var(--color-bg)] shadow-2xl animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 className="text-base font-semibold">新建终端会话</h2>
          <button onClick={handleClose} className="btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium">
              会话名称 <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入会话名称..."
              className={`input-field ${errors.name ? 'border-[var(--color-error)]' : ''}`}
            />
            {errors.name && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">连接类型</label>
            <div className="grid grid-cols-2 gap-2">
              {PROTOCOLS.map((protocol) => (
                <button
                  key={protocol.id}
                  onClick={() => setFormData({ ...formData, protocol: protocol.id })}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    formData.protocol === protocol.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-fg-muted)]'
                  }`}
                >
                  <span className="text-xl">{protocol.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{protocol.name}</div>
                    <div className="text-xs text-[var(--color-fg-muted)]">{protocol.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {formData.protocol === 'local' && (
            <div className="animate-slideIn">
              <label className="mb-2 block text-sm font-medium">Shell 类型</label>
              <div className="grid grid-cols-3 gap-2">
                {LOCAL_SHELLS.map((shell) => (
                  <button
                    key={shell.id}
                    onClick={() => setFormData({ ...formData, localShell: shell.id })}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-all ${
                      formData.localShell === shell.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-fg-muted)]'
                    }`}
                  >
                    <span>{shell.icon}</span>
                    <span>{shell.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.protocol === 'ssh' && (
            <div className="space-y-4 animate-slideIn">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">
                    主机地址 <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sshHost}
                    onChange={(e) => setFormData({ ...formData, sshHost: e.target.value })}
                    placeholder="hostname 或 IP"
                    className={`input-field ${errors.sshHost ? 'border-[var(--color-error)]' : ''}`}
                  />
                  {errors.sshHost && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.sshHost}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">端口</label>
                  <input
                    type="number"
                    value={formData.sshPort}
                    onChange={(e) => setFormData({ ...formData, sshPort: e.target.value })}
                    placeholder="22"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  用户名 <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sshUsername}
                  onChange={(e) => setFormData({ ...formData, sshUsername: e.target.value })}
                  placeholder="username"
                  className={`input-field ${errors.sshUsername ? 'border-[var(--color-error)]' : ''}`}
                />
                {errors.sshUsername && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.sshUsername}</p>}
              </div>

              <div className="border-t border-[var(--color-border)] pt-4">
                <div className="mb-3 flex items-center gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, sshKeyPath: '', sshKeyPassphrase: '' })}
                    className={`text-sm ${!formData.sshKeyPath ? 'text-[var(--color-primary)]' : 'text-[var(--color-fg-muted)]'}`}
                  >
                    密码认证
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, sshPassword: '' })}
                    className={`text-sm ${formData.sshKeyPath ? 'text-[var(--color-primary)]' : 'text-[var(--color-fg-muted)]'}`}
                  >
                    密钥认证
                  </button>
                </div>

                {!formData.sshKeyPath ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">密码</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.sshPassword}
                        onChange={(e) => setFormData({ ...formData, sshPassword: e.target.value })}
                        placeholder="输入密码..."
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">密钥文件</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.sshKeyPath}
                          onChange={(e) => setFormData({ ...formData, sshKeyPath: e.target.value })}
                          placeholder="选择或输入密钥文件路径..."
                          className="input-field flex-1"
                        />
                        <button onClick={handleBrowseKeyFile} className="btn-secondary">
                          浏览
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">密钥密码</label>
                      <div className="relative">
                        <input
                          type={showKeyPassphrase ? 'text' : 'password'}
                          value={formData.sshKeyPassphrase}
                          onChange={(e) => setFormData({ ...formData, sshKeyPassphrase: e.target.value })}
                          placeholder="可选"
                          className="input-field pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeyPassphrase(!showKeyPassphrase)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                        >
                          {showKeyPassphrase ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {errors.auth && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.auth}</p>}
              </div>
            </div>
          )}

          {formData.protocol === 'telnet' && (
            <div className="space-y-4 animate-slideIn">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">
                    主机地址 <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.telnetHost}
                    onChange={(e) => setFormData({ ...formData, telnetHost: e.target.value })}
                    placeholder="hostname 或 IP"
                    className={`input-field ${errors.telnetHost ? 'border-[var(--color-error)]' : ''}`}
                  />
                  {errors.telnetHost && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.telnetHost}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">端口</label>
                  <input
                    type="number"
                    value={formData.telnetPort}
                    onChange={(e) => setFormData({ ...formData, telnetPort: e.target.value })}
                    placeholder="23"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.protocol === 'serial' && (
            <div className="space-y-4 animate-slideIn">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    串口 <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <select
                    value={formData.serialPort}
                    onChange={(e) => setFormData({ ...formData, serialPort: e.target.value })}
                    className={`input-field ${errors.serialPort ? 'border-[var(--color-error)]' : ''}`}
                  >
                    {AVAILABLE_PORTS.map((port) => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                  {errors.serialPort && <p className="mt-1 text-xs text-[var(--color-error)]">{errors.serialPort}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">波特率</label>
                  <select
                    value={formData.serialBaudRate}
                    onChange={(e) => setFormData({ ...formData, serialBaudRate: e.target.value })}
                    className="input-field"
                  >
                    {BAUD_RATES.map((rate) => (
                      <option key={rate} value={rate}>{rate}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">数据位</label>
                  <select
                    value={formData.serialDataBits}
                    onChange={(e) => setFormData({ ...formData, serialDataBits: e.target.value })}
                    className="input-field"
                  >
                    {DATA_BITS.map((bits) => (
                      <option key={bits} value={bits}>{bits}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">校验位</label>
                  <select
                    value={formData.serialParity}
                    onChange={(e) => setFormData({ ...formData, serialParity: e.target.value })}
                    className="input-field"
                  >
                    {PARITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">停止位</label>
                  <select
                    value={formData.serialStopBits}
                    onChange={(e) => setFormData({ ...formData, serialStopBits: e.target.value })}
                    className="input-field"
                  >
                    {STOP_BITS.map((bits) => (
                      <option key={bits} value={bits}>{bits}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">流控</label>
                  <select
                    value={formData.serialFlowControl}
                    onChange={(e) => setFormData({ ...formData, serialFlowControl: e.target.value })}
                    className="input-field"
                  >
                    {FLOW_CONTROL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-xs text-[var(--color-fg-subtle)]">
                注意：Web 版本不支持真实的串口连接，此处仅供演示
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
          <button onClick={handleClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            创建会话
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateSessionModal;
