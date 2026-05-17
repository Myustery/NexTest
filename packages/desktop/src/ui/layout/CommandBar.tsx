import { useState } from 'react';

interface CommandBarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentSession: { id: string; name: string } | null;
}

interface CommandTab {
  id: string;
  name: string;
  content: string;
}

function CommandBar({ collapsed, onToggle, currentSession }: CommandBarProps) {
  const [tabs, setTabs] = useState<CommandTab[]>([
    { id: '1', name: '命令 1', content: '' },
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const [isRunning, setIsRunning] = useState(false);

  const handleAddTab = () => {
    const newTab: CommandTab = {
      id: Date.now().toString(),
      name: `命令 ${tabs.length + 1}`,
      content: '',
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleRun = async () => {
    if (!currentSession) {
      alert('请先选择一个终端会话');
      return;
    }
    
    const tab = tabs.find(t => t.id === activeTab);
    if (!tab || !tab.content.trim()) return;
    
    setIsRunning(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const lines = tab.content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        await invoke('write_pty', { 
          sessionId: currentSession.id, 
          data: line + '\n' 
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('执行命令失败:', error);
    } finally {
      setIsRunning(false);
    }
  };

  if (collapsed) {
    return (
      <div className="flex h-[28px] items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
          <span>全局命令栏</span>
        </button>
        {currentSession && (
          <span className="text-xs text-[var(--color-fg-subtle)]">
            当前: {currentSession.name}
          </span>
        )}
      </div>
    );
  }

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="flex flex-col border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="flex h-[28px] items-center justify-between bg-[var(--color-bg-elevated)] px-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs cursor-pointer rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--color-bg)] text-[var(--color-fg)]'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="hover:text-[var(--color-error)]"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="flex items-center justify-center w-5 h-5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning || !currentSession}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors ${
              isRunning || !currentSession
                ? 'text-[var(--color-fg-subtle)] cursor-not-allowed'
                : 'text-[var(--color-success)] hover:bg-[var(--color-success)]/10'
            }`}
          >
            {isRunning ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <path d="M21 12a9 9 0 11-9-9c2.52 0 4.85.87 6.69 2.34"/>
                  <polyline points="21,3 21,9 15,9"/>
                </svg>
                <span>执行中</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                <span>执行</span>
              </>
            )}
          </button>
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-5 h-5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,15 12,9 18,15"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="h-[120px] overflow-hidden">
        <textarea
          value={currentTab?.content || ''}
          onChange={(e) => {
            setTabs(tabs.map(t => 
              t.id === activeTab ? { ...t, content: e.target.value } : t
            ));
          }}
          placeholder="输入命令，每行一条...&#10;例如:&#10;ls -la&#10;pwd&#10;echo 'Hello'"
          className="w-full h-full p-3 bg-transparent text-sm text-[var(--color-fg)] font-mono resize-none outline-none placeholder:text-[var(--color-fg-subtle)]"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default CommandBar;
