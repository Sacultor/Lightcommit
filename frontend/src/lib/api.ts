/**
 * API 客户端模块
 * 
 * 功能：
 * - 基于 axios 创建统一的 HTTP 客户端
 * - 自动添加认证 Token
 * - 统一处理 401 错误（未授权自动登出）
 * - 封装常用 API 接口（认证、贡献、健康检查、NFT、仓库）
 * 
 * 依赖：
 * - axios：HTTP 客户端库，类似浏览器的 fetch 但功能更强大
 */

// 导入 axios：一个基于 Promise 的 HTTP 客户端，用于浏览器和 Node.js
import axios from 'axios';

// ============================================================
// 第一部分：配置 API 基础 URL
// ============================================================

/**
 * API 基础 URL
 * - 优先使用环境变量 NEXT_PUBLIC_API_URL
 * - 如果未设置，默认使用 http://localhost:3000/api
 * 
 * 注意：Next.js 中以 NEXT_PUBLIC_ 开头的环境变量会暴露到浏览器端
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ============================================================
// 第二部分：创建 Axios 实例
// ============================================================

/**
 * apiClient：统一的 HTTP 客户端实例
 * 
 * axios.create() 的作用：
 * - 创建一个新的 axios 实例，拥有独立的配置
 * - 可以设置默认的 baseURL、headers、timeout 等
 * - 避免污染全局 axios 配置
 * 
 * 配置说明：
 * - baseURL: 所有请求的基础 URL，后续请求会自动拼接
 *   例如：apiClient.get('/auth/user') → http://localhost:3000/api/auth/user
 * 
 * - headers: 默认请求头
 *   'Content-Type: application/json' 表示发送 JSON 格式的数据
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,          // 设置基础 URL
  headers: {
    'Content-Type': 'application/json',  // 默认发送 JSON 数据
  },
});

// ============================================================
// 第三部分：请求拦截器（Request Interceptor）
// ============================================================

/**
 * 请求拦截器：在每次发送请求前自动执行
 * 
 * 作用：自动添加认证 Token 到请求头
 * 
 * 工作流程：
 * 1. 从 localStorage 读取 token（如果在浏览器环境）
 * 2. 如果 token 存在，添加到 Authorization 请求头
 * 3. 返回修改后的配置，axios 会用这个配置发送请求
 * 
 * 为什么检查 typeof window !== 'undefined'？
 * - Next.js 同时运行在服务端和客户端
 * - localStorage 只在浏览器中存在，服务端没有
 * - 这个检查避免服务端渲染时报错
 */
apiClient.interceptors.request.use((config) => {
  // 检查是否在浏览器环境（服务端没有 window 对象）
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // 如果 token 存在，添加到请求头
  if (token) {
    // Authorization: Bearer <token> 是标准的认证头格式
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 返回修改后的配置
  return config;
});

// ============================================================
// 第四部分：响应拦截器（Response Interceptor）
// ============================================================

/**
 * 响应拦截器：在收到响应后自动执行
 * 
 * 作用：统一处理错误，特别是 401 未授权错误
 * 
 * 参数说明：
 * - 第一个函数：处理成功响应（状态码 2xx）
 * - 第二个函数：处理失败响应（状态码 4xx, 5xx）
 * 
 * 401 错误处理逻辑：
 * 1. 检测到 401 Unauthorized（未授权/登录过期）
 * 2. 清除本地的 token（已失效）
 * 3. 重定向到首页（让用户重新登录）
 */
apiClient.interceptors.response.use(
  // 成功响应：直接返回
  (response) => response,
  
  // 错误响应：处理逻辑
  (error) => {
    // 检查是否是 401 错误（未授权）
    if (error.response?.status === 401) {
      // 确保在浏览器环境（服务端没有 localStorage 和 window）
      if (typeof window !== 'undefined') {
        // 清除失效的 token
        localStorage.removeItem('token');
        
        // 重定向到首页（触发重新登录）
        window.location.href = '/';
      }
    }
    
    // 继续抛出错误，让调用方可以捕获
    return Promise.reject(error);
  },
);

// ============================================================
// 第五部分：认证 API 封装
// ============================================================

/**
 * authApi：认证相关的 API 接口
 * 
 * 包含的方法：
 * - githubLogin: GitHub OAuth 登录（重定向到登录页）
 * - getProfile: 获取当前登录用户信息
 */
export const authApi = {
  /**
   * GitHub OAuth 登录
   * 
   * 工作原理：
   * 1. 重定向到后端 API：/api/auth/github
   * 2. 后端会进一步重定向到 GitHub OAuth 授权页
   * 3. 用户在 GitHub 上授权后，GitHub 会回调到后端
   * 4. 后端处理回调，创建 session，重定向回前端
   * 
   * 注意：这是一个同步方法（直接重定向），不是异步请求
   */
  githubLogin: () => {
    // 直接跳转到后端的 GitHub OAuth 入口
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  /**
   * 获取当前用户信息
   * 
   * 请求：GET /api/auth/user
   * 返回：{ session: { user: {...}, accessToken: '...' } }
   * 
   * 使用 apiClient.get() 会自动：
   * - 拼接 baseURL：http://localhost:3000/api/auth/user
   * - 添加 Authorization 头（如果有 token）
   * - 返回 response.data（解包 axios 响应）
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/user');
    return response.data;  // 只返回数据部分，不包含 status、headers 等
  },
};

// ============================================================
// 第六部分：贡献 API 封装
// ============================================================

/**
 * contributionsApi：贡献相关的 API 接口
 * 
 * 包含的方法：
 * - getAll: 查询所有贡献（支持过滤）
 * - getLatest: 查询最新贡献（用于 Explore 页面）
 * - getOne: 查询单个贡献详情
 * - getMy: 查询当前用户的贡献
 * - getStats: 查询贡献统计信息
 */
export const contributionsApi = {
  /**
   * 获取所有贡献列表（支持过滤）
   * 
   * 请求：GET /api/contributions?type=commit&status=pending
   * 
   * 参数说明：
   * - type?: 贡献类型（commit, pull_request, issue）
   * - status?: 贡献状态（pending, minting, minted, failed）
   * - userId?: 用户 ID（筛选特定用户的贡献）
   * - repositoryId?: 仓库 ID（筛选特定仓库的贡献）
   * 
   * axios 会自动将 params 对象转换为 URL 查询字符串
   * 例如：{ type: 'commit', status: 'pending' } → ?type=commit&status=pending
   */
  getAll: async (params?: {
    type?: string;
    status?: string;
    userId?: string;
    repositoryId?: string;
  }) => {
    // params 会自动转换为查询字符串
    const response = await apiClient.get('/contributions', { params });
    return response.data;
  },

  /**
   * 获取最新贡献列表
   * 
   * 请求：GET /api/contributions/latest?limit=20&type=commit
   * 
   * 参数说明：
   * - limit?: 返回数量（默认 20）
   * - type?: 贡献类型（可选）
   * 
   * 用于：
   * - Explore 页面展示最新的 commit
   * - 首页展示最近活动
   */
  getLatest: async (params?: {
    limit?: number;
    type?: string;
  }) => {
    const response = await apiClient.get('/contributions/latest', { params });
    return response.data;
  },

  /**
   * 获取单个贡献详情
   * 
   * 请求：GET /api/contributions/123
   * 
   * 参数说明：
   * - id: 贡献 ID（UUID）
   * 
   * 使用模板字符串拼接 URL
   */
  getOne: async (id: string) => {
    const response = await apiClient.get(`/contributions/${id}`);
    return response.data;
  },

  /**
   * 获取当前用户的贡献列表
   * 
   * 请求：GET /api/contributions/my
   * 
   * 后端会从 JWT session 中识别当前用户
   * 自动返回该用户的所有贡献
   */
  getMy: async () => {
    const response = await apiClient.get('/contributions/my');
    return response.data;
  },

  /**
   * 获取贡献统计信息
   * 
   * 请求：GET /api/contributions/stats?userId=123
   * 
   * 参数说明：
   * - userId?: 用户 ID（可选，不传则返回全局统计）
   * 
   * 返回数据示例：
   * {
   *   totalContributions: 100,
   *   mintedContributions: 50,
   *   pendingContributions: 30,
   *   typeDistribution: [
   *     { type: 'commit', count: 80 },
   *     { type: 'pull_request', count: 20 }
   *   ]
   * }
   */
  getStats: async (userId?: string) => {
    const response = await apiClient.get('/contributions/stats', {
      params: { userId },  // 可选参数
    });
    return response.data;
  },
};

// ============================================================
// 第七部分：NFT API 封装
// ============================================================

/**
 * nftApi：NFT 相关的 API 接口
 * 
 * 包含的方法：
 * - getUserNFTs: 获取用户拥有的 NFT 列表
 * - getNFTMetadata: 获取 NFT 元数据
 */
export const nftApi = {
  /**
   * 获取用户拥有的 NFT 列表
   * 
   * 请求：GET /api/nft/user/:address
   * 
   * 参数说明：
   * - address: 用户钱包地址
   * 
   * 返回数据：
   * {
   *   data: {
   *     tokenId: string,
   *     owner: string,
   *     metadataUri: string,
   *     metadata: NFTMetadata,
   *     commitData: CommitData
   *   }[]
   * }
   */
  getUserNFTs: async (address: string) => {
    const response = await apiClient.get(`/nft/user/${address}`);
    return response.data;
  },

  /**
   * 获取 NFT 元数据
   * 
   * 请求：GET /api/nft/metadata/:tokenId
   * 
   * 参数说明：
   * - tokenId: Token ID
   * 
   * 返回数据：NFTMetadata
   */
  getNFTMetadata: async (tokenId: string) => {
    const response = await apiClient.get(`/nft/metadata/${tokenId}`);
    return response.data;
  },
};

// ============================================================
// 第八部分：GitHub API 封装
// ============================================================

/**
 * githubApi：GitHub 相关的 API 接口
 * 
 * 包含的方法：
 * - getUserRepos: 获取用户的仓库列表
 * - getRepoCommits: 获取仓库的提交历史
 */
export const githubApi = {
  /**
   * 获取用户的仓库列表
   * 
   * 请求：GET /api/github/repos?username=xxx
   * 
   * 参数说明：
   * - username?: GitHub 用户名（可选，不传则获取当前用户的仓库）
   */
  getUserRepos: async (username?: string) => {
    const response = await apiClient.get('/github/repos', {
      params: { username },
    });
    return response.data;
  },

  /**
   * 获取仓库的提交历史
   * 
   * 请求：GET /api/github/repos/:owner/:repo/commits
   * 
   * 参数说明：
   * - owner: 仓库所有者
   * - repo: 仓库名称
   * - options: 可选参数（page, per_page, since, until, author）
   */
  getRepoCommits: async (
    owner: string,
    repo: string,
    options?: {
      page?: number;
      per_page?: number;
      since?: string;
      until?: string;
      author?: string;
    },
  ) => {
    const response = await apiClient.get(`/github/repos/${owner}/${repo}/commits`, {
      params: options,
    });
    return response.data;
  },
};

// ============================================================
// 第九部分：健康检查 API 封装
// ============================================================

/**
 * healthApi：健康检查接口
 * 
 * 用途：检查后端 API 是否正常运行
 * 
 * 请求：GET /api/health
 * 返回：{ status: 'ok', timestamp: '...' }
 */
export const healthApi = {
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
