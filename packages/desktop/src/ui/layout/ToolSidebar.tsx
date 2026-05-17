import { useState } from 'react';

interface ToolSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const QUICK_COMMANDS = [
  { id: 'ls', label: 'ls -la', description: '列出所有文件' },
  { id: 'clear', label: 'clear', description: '清屏' },
  { id: 'pwd', label: 'pwd', description: '当前目录' },
  { id: 'git-status', label: 'git status', description: 'Git 状态' },
  { id: 'npm-test', label: 'npm test', description: '运行测试' },
  { id: 'npm-dev', label: 'npm run dev', description: '开发模式' },
];

const SNIPPETS = [
  { id: '1', name: '项目构建', commands: ['npm install', 'npm run build'] },
  { id: '2', name: 'Git 提交', commands: ['git add .', 'git commit -m "update"'] },
];

function ToolSidebar({ collapsed, onToggle }: ToolSidebarProps) {
  const [activeTab, setActiveTab] = useState<'commands' | 'snippets'>('commands');
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());

  const toggleSnippet = (id: string) => {
    const newExpanded = new Set(expandedSnippets);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSnippets(newExpanded);
  };

  if (collapsed) {
    return (
      <div className="flex w-[40px] flex-col items-center border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] py-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)]"
          title="展开工具栏"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>
        
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            className="flex items-center justify-center w-8 h-8 rounded text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)]"
            title="快捷命令"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4,17 10,11 4,5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 rounded text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)]"
            title="命令片段"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[var(--sidebar-width)] min-w-[180px] max-w-[400px] flex-col border-l border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
      <div className="flex h-[var(--panel-header-height)] items-center justify-between border-b border-[var(--color-border-subtle)] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
          工具
        </span>
        <div className="monaco-toolbar">
          <button
            onClick={onToggle}
            title="折叠面板"
            className="flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border-subtle)]">
        <button
          onClick={() => setActiveTab('commands')}
          className={`flex-1 px-3 py-2 text-[11px] font-medium transition-colors ${
            activeTab === 'commands'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-fg)]'
              : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
          }`}
        >
          快捷命令
        </button>
        <button
          onClick={() => setActiveTab('snippets')}
          className={`flex-1 px-3 py-2 text-[11px] font-medium transition-colors ${
            activeTab === 'snippets'
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-fg)]'
              : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
          }`}
        >
          命令片段
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {activeTab === 'commands' && (
          <div className="panel-section">
            <div className="px-2">
              {QUICK_COMMANDS.map((cmd) => (
                <div
                  key={cmd.id}
                  className="list-item group"
                  title={cmd.description}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-[var(--color-fg-subtle)]">
                    <polyline points="4,17 10,11 4,5"/>
                    <line x1="12" y1="19" x2="20" y2="19"/>
                  </svg>
                  <span className="flex-1 truncate font-mono text-[12px]">{cmd.label}</span>
                  <button
                    className="btn-icon opacity-0 group-hover:opacity-100"
                    title="执行"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="separator mx-2 my-2" />
            <button className="mx-2 flex w-[calc(100%-16px)] items-center justify-center gap-1 rounded border border-dashed border-[var(--color-border)] py-2 text-[11px] text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              添加快捷命令
            </button>
          </div>
        )}

        {activeTab === 'snippets' && (
          <div className="panel-section">
            {SNIPPETS.map((snippet) => (
              <div key={snippet.id}>
                <div
                  onClick={() => toggleSnippet(snippet.id)}
                  className="panel-section-header"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`mr-1 transition-transform ${expandedSnippets.has(snippet.id) ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                  <span className="flex-1">{snippet.name}</span>
                  <span className="text-[var(--color-fg-subtle)]">{snippet.commands.length}</span>
                </div>
                {expandedSnippets.has(snippet.id) && (
                  <div className="animate-slideIn">
                    {snippet.commands.map((cmd, index) => (
                      <div key={index} className="list-item pl-6 group">
                        <span className="flex-1 truncate font-mono text-[12px]">{cmd}</span>
                        <button className="btn-icon opacity-0 group-hover:opacity-100" title="执行">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="separator mx-2 my-2" />
            <button className="mx-2 flex w-[calc(100%-16px)] items-center justify-center gap-1 rounded border border-dashed border-[var(--color-border)] py-2 text-[11px] text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              新建命令片段
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolSidebar;
