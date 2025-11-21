/**
 * JWT Session 管理工具
 * 
 * 核心概念：
 * 
 * 1. JWT (JSON Web Token)：
 *    - 一种安全传输信息的标准格式
 *    - 结构：Header.Payload.Signature
 *    - 服务端签名，客户端无法篡改
 *    - 无需在服务端存储 session，节省资源
 * 
 * 2. Cookie：
 *    - 浏览器存储数据的机制
 *    - 自动在每次请求时发送给服务端
 *    - httpOnly: 防止 JavaScript 访问（防 XSS 攻击）
 *    - secure: 仅在 HTTPS 下传输
 *    - sameSite: 防止 CSRF 攻击
 * 
 * 3. Session：
 *    - 用户登录状态的数据
 *    - 本项目中包含：GitHub 用户信息 + accessToken
 *    - 存储在 JWT 中，JWT 存储在 Cookie 中
 * 
 * 工作流程：
 * 1. 用户通过 GitHub OAuth 登录
 * 2. 后端获取 GitHub 用户信息和 accessToken
 * 3. 将信息打包成 JWT（签名保证安全）
 * 4. JWT 存储在 httpOnly Cookie 中
 * 5. 后续请求自动携带 Cookie
 * 6. 后端验证 JWT 并解析用户信息
 * 
 * 功能：
 * - createSession: 创建 JWT token
 * - verifySession: 验证 JWT token
 * - getSession: 从 Cookie 读取并验证 session
 * - setSessionCookie: 设置 session cookie
 * - clearSessionCookie: 清除 session cookie
 * - getGitHubUser: 从 GitHub API 获取用户信息
 * 
 * 依赖：
 * - jose：现代化的 JWT 库，支持边缘运行时（比 jsonwebtoken 更适合 Next.js）
 * - next/headers：Next.js 的 Cookie 操作 API
 * 
 * 环境变量：
 * - JWT_SECRET：JWT 签名密钥（必须配置，至少 32 字符，生产环境必须使用强密钥）
 * 
 * 安全特性：
 * - JWT 签名防篡改
 * - httpOnly Cookie 防 XSS
 * - sameSite 防 CSRF
 * - 生产环境强制 HTTPS
 * - 30 天自动过期
 */

// 导入 jose 库：用于创建和验证 JWT
// SignJWT: 用于签名生成 JWT
// jwtVerify: 用于验证 JWT 的签名和有效期
import { SignJWT, jwtVerify } from 'jose';

// 导入 Next.js 的 cookies API：用于读取和设置 Cookie（仅服务端可用）
import { cookies } from 'next/headers';

// ============================================================
// 第一部分：类型定义与配置
// ============================================================

/**
 * Session 数据结构
 * 
 * 说明：
 * - 这是存储在 JWT 中的数据
 * - JWT 会被编码（但不加密），所以不要存储敏感信息（如密码）
 * - 这些数据会在服务端的 API Routes 中使用
 */
export interface SessionData {
  user: {
    id: number;              // GitHub 用户 ID（数字类型）
    login: string;           // GitHub 用户名（如 "octocat"）
    name: string | null;     // GitHub 显示名（如 "The Octocat"，可能为 null）
    email: string | null;    // GitHub 邮箱（可能为 null，取决于用户隐私设置）
    avatar_url: string;      // GitHub 头像 URL
  };
  accessToken: string;       // GitHub access_token（用于调用 GitHub API，获取仓库、提交等信息）
  createdAt: number;         // Session 创建时间戳（毫秒）
  expiresAt: number;         // Session 过期时间戳（毫秒）
}

/**
 * Session 配置常量
 * 
 * 配置说明：
 * - cookieName: Cookie 的名称，用于在浏览器中标识这个 Cookie
 * - maxAge: Cookie 的最大存活时间（30 天 = 30 * 24 * 60 * 60 秒）
 * - secret: JWT 签名密钥
 *   - 必须是 Uint8Array 格式（jose 库要求）
 *   - 从环境变量 JWT_SECRET 读取
 *   - 默认值仅用于开发，生产环境必须配置
 *   - 密钥泄露会导致任何人都能伪造 JWT！
 */
const SESSION_CONFIG = {
  cookieName: 'lightcommit_session',      // Cookie 名称（会出现在浏览器的 DevTools 中）
  maxAge: 30 * 24 * 60 * 60,              // 30 天（秒）= 2,592,000 秒
  secret: new TextEncoder().encode(       // 将字符串转换为 Uint8Array（jose 要求的格式）
    process.env.JWT_SECRET || 'default-secret-please-change-in-production-min-32-chars'
  ),
};

// ============================================================
// 第二部分：JWT 创建与验证
// ============================================================

/**
 * 创建 JWT token
 * 
 * 功能：将 Session 数据打包成 JWT 字符串
 * 
 * JWT 结构说明：
 * - Header（头部）：{ alg: 'HS256', typ: 'JWT' }
 *   - alg: 签名算法（HMAC SHA256）
 *   - typ: Token 类型
 * 
 * - Payload（载荷）：sessionData（用户信息、accessToken 等）
 *   - iat: 签发时间（Issued At）
 *   - exp: 过期时间（Expiration Time）
 * 
 * - Signature（签名）：HMAC-SHA256(base64(header) + "." + base64(payload), secret)
 *   - 确保 JWT 未被篡改
 *   - 只有拥有 secret 的服务端才能生成有效签名
 * 
 * 安全性：
 * - JWT 是编码而非加密，任何人都能解码查看内容
 * - 但签名确保内容不被篡改
 * - 因此不要在 JWT 中存储密码等敏感信息
 * 
 * @param sessionData - Session 数据（用户信息、accessToken 等）
 * @returns JWT token 字符串（格式：xxxxx.yyyyy.zzzzz）
 * 
 * @example
 * const session = {
 *   user: { id: 123, login: 'octocat', ... },
 *   accessToken: 'gho_xxxxx',
 *   createdAt: Date.now(),
 *   expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
 * };
 * const token = await createSession(session);
 * // 返回：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7...
 */
export async function createSession(sessionData: SessionData): Promise<string> {
  // 使用 jose 库的 SignJWT 类创建 JWT
  const token = await new SignJWT({ ...sessionData })    // 将 sessionData 作为 payload
    .setProtectedHeader({ alg: 'HS256' })                // 设置 Header：使用 HS256 算法（HMAC SHA256）
    .setIssuedAt()                                        // 设置 iat（签发时间）为当前时间
    .setExpirationTime(`${SESSION_CONFIG.maxAge}s`)      // 设置 exp（过期时间）为 30 天后
    .sign(SESSION_CONFIG.secret);                        // 使用密钥签名生成 JWT

  return token;  // 返回完整的 JWT 字符串
}

/**
 * 验证 JWT token 并解析数据
 * 
 * 功能：
 * 1. 验证 JWT 签名是否正确（防止篡改）
 * 2. 验证 JWT 是否过期
 * 3. 解析并返回 payload 中的数据
 * 
 * 验证失败的情况：
 * - JWT 格式错误（不是三段式）
 * - 签名验证失败（被篡改或使用了错误的 secret）
 * - JWT 已过期（exp 时间早于当前时间）
 * - JWT 还未生效（nbf 时间晚于当前时间，本项目未使用）
 * 
 * 安全性：
 * - 只有拥有正确 secret 的服务端才能验证 JWT
 * - 客户端无法伪造 JWT（因为没有 secret）
 * - 即使 JWT 被截获，也无法修改其中的内容
 * 
 * @param token - JWT token 字符串
 * @returns Session 数据或 null（验证失败时返回 null）
 * 
 * @example
 * const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
 * const session = await verifySession(token);
 * if (session) {
 *   console.log('用户:', session.user.login);
 * } else {
 *   console.log('JWT 无效或已过期');
 * }
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    // 使用 jose 库的 jwtVerify 函数验证 JWT
    // 会自动检查：签名是否正确、JWT 是否过期
    const { payload } = await jwtVerify(token, SESSION_CONFIG.secret);
    
    // 验证成功，返回 payload 中的数据（即 SessionData）
    // 使用 as unknown as 是因为 jose 返回的类型是 JWTPayload，需要转换
    return payload as unknown as SessionData;
  } catch (error) {
    // JWT 验证失败（签名错误、已过期、格式错误等）
    console.error('JWT 验证失败:', error);
    return null;  // 返回 null 表示验证失败
  }
}

// ============================================================
// 第三部分：Cookie 操作
// ============================================================

/**
 * 从 Cookies 中获取 Session
 * 
 * 功能：
 * 1. 从浏览器的 Cookie 中读取 JWT token
 * 2. 验证 JWT 的有效性
 * 3. 解析并返回 Session 数据
 * 
 * 使用场景：
 * - API Routes 中验证用户身份
 * - 服务端组件中获取当前登录用户
 * - 中间件中检查登录状态
 * 
 * 注意：
 * - 这个函数只能在服务端使用（因为使用了 next/headers）
 * - 客户端组件需要通过 API 获取 Session
 * 
 * @returns Session 数据或 null（未登录或 JWT 失效时返回 null）
 * 
 * @example
 * // 在 API Route 中使用
 * import { getSession } from '@/lib/auth/session';
 * 
 * export async function GET(request: NextRequest) {
 *   const session = await getSession();
 *   
 *   if (!session) {
 *     return NextResponse.json({ error: '未登录' }, { status: 401 });
 *   }
 *   
 *   // 使用 session.user 获取用户信息
 *   console.log('当前用户:', session.user.login);
 *   return NextResponse.json({ user: session.user });
 * }
 */
export async function getSession(): Promise<SessionData | null> {
  // 1. 获取 Next.js 的 Cookie 存储（异步操作）
  const cookieStore = await cookies();
  
  // 2. 从 Cookie 中读取 JWT token
  // 使用 ?. 可选链操作符，如果 Cookie 不存在则返回 undefined
  const token = cookieStore.get(SESSION_CONFIG.cookieName)?.value;

  // 3. 如果没有 token（用户未登录），返回 null
  if (!token) {
    return null;
  }

  // 4. 验证 JWT token 并返回 Session 数据
  // 如果验证失败（JWT 过期、被篡改等），verifySession 会返回 null
  return await verifySession(token);
}

/**
 * 设置 Session Cookie
 * 
 * 功能：
 * 1. 将 Session 数据打包成 JWT
 * 2. 将 JWT 存储到 httpOnly Cookie 中
 * 
 * 使用场景：
 * - GitHub OAuth 回调后创建 Session
 * - 刷新 Session（更新 accessToken）
 * 
 * Cookie 安全属性说明：
 * - httpOnly: JavaScript 无法访问，防止 XSS 攻击窃取 Cookie
 * - secure: 仅在 HTTPS 下传输，防止中间人攻击
 * - sameSite: 防止 CSRF 攻击
 *   - 'lax': 允许从外部网站通过 GET 请求携带 Cookie（适合大多数场景）
 *   - 'strict': 完全禁止跨站携带 Cookie（更安全但可能影响用户体验）
 * - maxAge: Cookie 的最大存活时间（30 天）
 * - path: Cookie 的作用路径（'/' 表示全站可用）
 * 
 * @param sessionData - Session 数据（用户信息、accessToken 等）
 * 
 * @example
 * // 在 GitHub OAuth 回调中使用
 * import { setSessionCookie } from '@/lib/auth/session';
 * 
 * export async function GET(request: NextRequest) {
 *   // 1. 从 GitHub 获取 access_token
 *   const accessToken = 'gho_xxxxx';
 *   
 *   // 2. 使用 access_token 获取用户信息
 *   const githubUser = await fetch('https://api.github.com/user', {
 *     headers: { 'Authorization': `Bearer ${accessToken}` }
 *   }).then(res => res.json());
 *   
 *   // 3. 创建 Session 数据
 *   const sessionData = {
 *     user: {
 *       id: githubUser.id,
 *       login: githubUser.login,
 *       name: githubUser.name,
 *       email: githubUser.email,
 *       avatar_url: githubUser.avatar_url,
 *     },
 *     accessToken,
 *     createdAt: Date.now(),
 *     expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
 *   };
 *   
 *   // 4. 设置 Session Cookie
 *   await setSessionCookie(sessionData);
 *   
 *   // 5. 重定向到首页
 *   return NextResponse.redirect(new URL('/', request.url));
 * }
 */
export async function setSessionCookie(sessionData: SessionData): Promise<void> {
  // 1. 创建 JWT token（将 Session 数据编码并签名）
  const token = await createSession(sessionData);

  // 2. 获取 Cookie 存储
  const cookieStore = await cookies();
  
  // 3. 设置 Cookie
  cookieStore.set(SESSION_CONFIG.cookieName, token, {
    httpOnly: true,                                // 仅服务端可访问，JavaScript 无法读取（防止 XSS）
    secure: process.env.NODE_ENV === 'production', // 生产环境强制 HTTPS（防止中间人攻击）
    sameSite: 'lax',                               // 防止 CSRF 攻击，同时允许从外部 GET 请求携带
    maxAge: SESSION_CONFIG.maxAge,                 // Cookie 过期时间（30 天 = 2,592,000 秒）
    path: '/',                                     // Cookie 作用路径（全站可用）
  });
}

/**
 * 清除 Session Cookie（登出）
 * 
 * 功能：删除浏览器中的 Session Cookie，实现登出
 * 
 * 使用场景：
 * - 用户点击登出按钮
 * - Session 失效后强制登出
 * - 切换账号
 * 
 * 注意：
 * - 删除 Cookie 后，用户的 Session 立即失效
 * - 但 JWT 本身仍然有效（无法撤销），只是浏览器不再发送
 * - 这是 JWT 的特性：无状态，无法主动撤销
 * 
 * @example
 * // 在登出 API 中使用
 * import { clearSessionCookie } from '@/lib/auth/session';
 * 
 * export async function POST(request: NextRequest) {
 *   // 清除 Session Cookie
 *   await clearSessionCookie();
 *   
 *   // 返回成功响应
 *   return NextResponse.json({ message: '登出成功' });
 * }
 */
export async function clearSessionCookie(): Promise<void> {
  // 获取 Cookie 存储
  const cookieStore = await cookies();
  
  // 删除 Session Cookie
  // 浏览器会立即移除这个 Cookie，后续请求不再携带
  cookieStore.delete(SESSION_CONFIG.cookieName);
}

// ============================================================
// 第四部分：GitHub API 集成
// ============================================================

/**
 * 从 GitHub API 获取用户信息
 * 
 * 功能：使用 GitHub access_token 调用 GitHub API 获取用户详细信息
 * 
 * API 端点：https://api.github.com/user
 * 文档：https://docs.github.com/en/rest/users/users#get-the-authenticated-user
 * 
 * 使用场景：
 * - GitHub OAuth 回调后获取用户信息
 * - 刷新用户信息（使用 session.accessToken）
 * 
 * 返回数据示例：
 * {
 *   id: 123456,
 *   login: 'octocat',
 *   name: 'The Octocat',
 *   email: 'octocat@github.com',
 *   avatar_url: 'https://avatars.githubusercontent.com/u/123456',
 *   bio: '...',
 *   public_repos: 10,
 *   followers: 100,
 *   ...
 * }
 * 
 * 注意：
 * - 需要有效的 GitHub access_token
 * - access_token 必须包含 'user:email' 和 'read:user' 权限
 * - 如果 token 无效或过期，会抛出错误
 * 
 * @param accessToken - GitHub access_token（从 OAuth 流程获得）
 * @returns GitHub 用户信息对象
 * @throws 如果 API 请求失败（token 无效、网络错误等）
 * 
 * @example
 * const accessToken = 'gho_xxxxxxxxxxxxx';
 * const githubUser = await getGitHubUser(accessToken);
 * console.log('用户名:', githubUser.login);
 * console.log('邮箱:', githubUser.email);
 */
export async function getGitHubUser(accessToken: string) {
  // 调用 GitHub REST API 获取认证用户信息
  const response = await fetch('https://api.github.com/user', {
    headers: {
      // Authorization: Bearer <token> 是 GitHub API 的标准认证方式
      'Authorization': `Bearer ${accessToken}`,
      
      // Accept: 指定 API 版本（v3）和响应格式（JSON）
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  // 检查响应状态
  if (!response.ok) {
    // 如果请求失败（401 Unauthorized, 403 Forbidden 等）
    throw new Error('Failed to fetch GitHub user');
  }

  // 解析并返回 JSON 数据
  return await response.json();
}

