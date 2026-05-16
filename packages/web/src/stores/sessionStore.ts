/**
 * 会话状态管理
 * 
 * 管理会话列表、文件夹结构等状态
 */

import { create } from 'zustand';

/** 会话接口 */
interface Session {
  id: string;
  name: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}

/** 文件夹接口 */
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
}

/** 会话状态接口 */
interface SessionState {
  /** 会话列表 */
  sessions: Session[];
  /** 文件夹列表 */
  folders: Folder[];
  /** 当前选中的会话 ID */
  selectedSessionId: string | null;

  /** 创建会话 */
  createSession: (name: string, folderId?: string) => void;
  /** 更新会话 */
  updateSession: (id: string, updates: Partial<Session>) => void;
  /** 删除会话 */
  deleteSession: (id: string) => void;
  /** 选择会话 */
  selectSession: (id: string | null) => void;

  /** 创建文件夹 */
  createFolder: (name: string, parentId?: string) => void;
  /** 更新文件夹 */
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  /** 删除文件夹 */
  deleteFolder: (id: string) => void;
}

/** 会话状态 Store */
export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  folders: [],
  selectedSessionId: null,

  createSession: (name, folderId) => {
    const session: Session = {
      id: crypto.randomUUID(),
      name,
      folderId: folderId ?? null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({
      sessions: [...state.sessions, session],
    }));
  },

  updateSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id
          ? { ...session, ...updates, updatedAt: Date.now() }
          : session
      ),
    }));
  },

  deleteSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter((session) => session.id !== id),
      selectedSessionId:
        state.selectedSessionId === id ? null : state.selectedSessionId,
    }));
  },

  selectSession: (id) => {
    set({ selectedSessionId: id });
  },

  createFolder: (name, parentId) => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name,
      parentId: parentId ?? null,
      order: 0,
    };
    set((state) => ({
      folders: [...state.folders, folder],
    }));
  },

  updateFolder: (id, updates) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    }));
  },

  deleteFolder: (id) => {
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      sessions: state.sessions.map((session) =>
        session.folderId === id ? { ...session, folderId: null } : session
      ),
    }));
  },
}));