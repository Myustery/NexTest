/**
 * API 客户端
 * 
 * 封装所有 API 请求
 */

const API_BASE = '/api';

/** 通用请求函数 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/** 用户信息 */
export interface User {
  id: string;
  email: string;
  employee_id: string;
  name: string;
}

/** 登录响应 */
export interface LoginResponse {
  token: string;
  user: User;
}

/** 会话信息 */
export interface Session {
  id: string;
  name: string;
  folder_id: string | null;
  created_at: number;
  updated_at: number;
}

/** 文件夹信息 */
export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  order: number;
}

/** 版本信息 */
export interface Version {
  version: string;
  changelog: string;
  download_url: string;
  size: number;
}

/** 版本检查响应 */
export interface CheckVersionResponse {
  has_update: boolean;
  latest_version: Version | null;
}

/** 认证 API */
export const authApi = {
  /** 用户注册 */
  register: (data: {
    email: string;
    employee_id: string;
    password: string;
    name: string;
  }): Promise<User> => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /** 用户登录 */
  login: (data: { email: string; password: string }): Promise<LoginResponse> =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 用户登出 */
  logout: (): Promise<void> =>
    request('/auth/logout', { method: 'POST' }),

  /** 获取当前用户 */
  me: (): Promise<User> => request('/auth/me'),
};

/** 会话 API */
export const sessionApi = {
  /** 获取会话列表 */
  list: (): Promise<Session[]> => request('/sessions'),

  /** 创建会话 */
  create: (data: { name: string; folder_id?: string }): Promise<Session> =>
    request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 获取单个会话 */
  get: (id: string): Promise<Session> => request(`/sessions/${id}`),

  /** 更新会话 */
  update: (
    id: string,
    data: { name?: string; folder_id?: string }
  ): Promise<Session> =>
    request(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** 删除会话 */
  delete: (id: string): Promise<void> =>
    request(`/sessions/${id}`, { method: 'DELETE' }),
};

/** 文件夹 API */
export const folderApi = {
  /** 获取文件夹列表 */
  list: (): Promise<Folder[]> => request('/sessions/folders'),

  /** 创建文件夹 */
  create: (data: { name: string; parent_id?: string }): Promise<Folder> =>
    request('/sessions/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 更新文件夹 */
  update: (
    id: string,
    data: { name?: string; parent_id?: string; order?: number }
  ): Promise<void> =>
    request(`/sessions/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** 删除文件夹 */
  delete: (id: string): Promise<void> =>
    request(`/sessions/folders/${id}`, { method: 'DELETE' }),
};

/** 分享 API */
export const shareApi = {
  /** 创建分享 */
  create: (data: {
    to_user_ids: string[];
    share_type: 'session' | 'command-tool';
    content_id: string;
    include_command_editors?: boolean;
    allow_forward?: boolean;
  }): Promise<{ id: string }> =>
    request('/shares', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 获取收到的分享 */
  received: (): Promise<
    Array<{
      id: string;
      from_user_id: string;
      share_type: string;
      content_id: string;
    }>
  > => request('/shares/received'),

  /** 接受分享 */
  accept: (id: string): Promise<void> =>
    request(`/shares/${id}/accept`, { method: 'POST' }),

  /** 查看分享更新 */
  updates: (id: string): Promise<{ id: string }> =>
    request(`/shares/${id}/updates`),
};

/** 版本 API */
export const versionApi = {
  /** 检查更新 */
  check: (): Promise<CheckVersionResponse> => request('/version/check'),
};