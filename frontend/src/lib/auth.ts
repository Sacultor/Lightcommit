// 前端认证工具函数

// 设置 Cookie 的辅助函数
export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return; // 服务端渲染时跳过

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
}

// 获取 Cookie 的辅助函数
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // 服务端渲染时跳过

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// 删除 Cookie 的辅助函数
export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return; // 服务端渲染时跳过

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// 获取认证 token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null; // 服务端渲染时跳过

  // 优先从 localStorage 获取，然后从 Cookie 获取
  return localStorage.getItem('lc_token') || getCookie('lc_token');
}

// 设置认证 token
export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return; // 服务端渲染时跳过

  // 同时存储到 localStorage 和 Cookie
  localStorage.setItem('lc_token', token);
  setCookie('lc_token', token, 7); // 7天过期
}

// 清除认证 token
export function clearAuthToken() {
  if (typeof window === 'undefined') return; // 服务端渲染时跳过

  // 从 localStorage 和 Cookie 中清除
  localStorage.removeItem('lc_token');
  deleteCookie('lc_token');
}

// 检查是否已认证
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// 登出函数
export async function logout() {
  try {
    // 调用后端登出 API
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // 无论 API 调用是否成功，都清除本地 token
    clearAuthToken();

    // 重定向到首页
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}

// 获取带认证头的 fetch 配置
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  } : {
    'Content-Type': 'application/json',
  };
}

// 带认证的 fetch 封装
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 如果返回 401，说明 token 无效，自动登出
  if (response.status === 401) {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/?error=unauthorized';
    }
  }

  return response;
}
