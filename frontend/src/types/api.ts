// API 响应的通用类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  timestamp: string;
}

// API 错误响应类型
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
  timestamp: string;
}

// 分页查询参数类型
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求配置类型
export interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

// GitHub Webhook 事件类型
export interface GitHubWebhookEvent {
  action?: string;
  repository?: {
    id: number;
    name: string;
    full_name: string;
    description?: string;
    html_url: string;
    private: boolean;
  };
  sender?: {
    id: number;
    login: string;
    avatar_url: string;
  };
  [key: string]: unknown;
}