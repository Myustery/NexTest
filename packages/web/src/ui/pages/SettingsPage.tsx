import { useState } from 'react';

const FONT_OPTIONS = [
  "'JetBrains Mono', monospace",
  "'Fira Code', monospace",
  "Consolas, monospace",
  "'Courier New', monospace",
];

const THEMES = [
  { id: 'dark', name: '深色', preview: '#1e1e1e' },
  { id: 'light', name: '浅色', preview: '#ffffff' },
  { id: 'hc', name: '高对比度', preview: '#000000' },
];

function SettingsPage() {
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0]);
  const [cursorStyle, setCursorStyle] = useState<'block' | 'bar' | 'underline'>('bar');
  const [cursorBlink, setCursorBlink] = useState(true);
  const [scrollback, setScrollback] = useState(10000);

  return (
    <div className="flex h-full flex-col bg-[var(--color-bg-deep)]">
      <div className="flex h-[var(--tab-height)] items-center border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4">
        <span className="text-[13px]">设置</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[800px] py-8">
          <div className="mb-8">
            <h2 className="mb-6 text-xl font-semibold">终端</h2>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">字体大小</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-sm">{fontSize}px</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">字体</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="input-field"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>{font.replace(/'/g, '').split(',')[0]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">光标样式</label>
                <div className="flex gap-2">
                  {(['block', 'bar', 'underline'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setCursorStyle(style)}
                      className={`flex items-center justify-center rounded px-4 py-2 text-sm transition-colors ${
                        cursorStyle === style
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-hover)]'
                      }`}
                    >
                      {style === 'block' && '▊'}
                      {style === 'bar' && '|'}
                      {style === 'underline' && '＿'}
                      <span className="ml-2">{style}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">光标闪烁</label>
                <button
                  onClick={() => setCursorBlink(!cursorBlink)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    cursorBlink ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      cursorBlink ? 'left-4' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">滚动缓冲区大小</label>
                <input
                  type="number"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={scrollback}
                  onChange={(e) => setScrollback(Number(e.target.value))}
                  className="input-field w-32"
                />
                <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">
                  保留的历史行数
                </p>
              </div>
            </div>
          </div>

          <div className="separator my-8" />

          <div className="mb-8">
            <h2 className="mb-6 text-xl font-semibold">外观</h2>
            
            <div>
              <label className="mb-2 block text-sm font-medium">主题</label>
              <div className="flex gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    className="flex flex-col items-center gap-2 rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:border-[var(--color-fg-muted)]"
                  >
                    <div
                      className="h-12 w-12 rounded border border-[var(--color-border)]"
                      style={{ background: theme.preview }}
                    />
                    <span className="text-xs">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="separator my-8" />

          <div>
            <h2 className="mb-4 text-xl font-semibold">关于</h2>
            <div className="rounded-lg bg-[var(--color-bg-elevated)] p-4">
              <div className="mb-2 flex items-center gap-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary)]">
                  <polyline points="4,17 10,11 4,5"/>
                  <line x1="12" y1="19" x2="20" y2="19"/>
                </svg>
                <div>
                  <div className="text-lg font-semibold">NexTest Web</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">v0.1.0</div>
                </div>
              </div>
              <p className="text-sm text-[var(--color-fg-muted)]">
                跨平台终端工具，支持 Windows、macOS 和 Linux
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href="https://github.com/Myustery/NexTest"
                  className="btn-secondary text-xs"
                >
                  GitHub
                </a>
                <a
                  href="https://github.com/Myustery/NexTest/issues"
                  className="btn-secondary text-xs"
                >
                  反馈问题
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
