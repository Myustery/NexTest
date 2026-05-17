import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

interface ContextMenuContextType {
  showMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  hideMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider');
  }
  return context;
}

interface ContextMenuProviderProps {
  children: ReactNode;
}

export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  const [menu, setMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  });

  const showMenu = useCallback((x: number, y: number, items: ContextMenuItem[]) => {
    setMenu({ visible: true, x, y, items });
  }, []);

  const hideMenu = useCallback(() => {
    setMenu(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const handleClick = () => hideMenu();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideMenu();
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hideMenu]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <ContextMenuContext.Provider value={{ showMenu, hideMenu }}>
      {children}
      {menu.visible && (
        <div
          className="context-menu animate-fadeIn"
          style={{
            left: menu.x,
            top: menu.y,
            position: 'fixed',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu.items.map((item, index) => (
            item.divider ? (
              <div key={index} className="context-menu-separator" />
            ) : (
              <div
                key={index}
                className={`context-menu-item ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${item.danger ? 'text-[var(--color-error)]' : ''}`}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    hideMenu();
                  }
                }}
              >
                <span className="flex items-center gap-2">
                  {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
                {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
              </div>
            )
          ))}
        </div>
      )}
    </ContextMenuContext.Provider>
  );
}
