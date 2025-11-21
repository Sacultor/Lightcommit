/**
 * GitHub Webhook 接收处理接口
 * 
 * 路由：POST /api/github/webhook
 * 功能：接收并处理 GitHub 发送的 Webhook 事件
 * 
 * 权限：公开接口（通过签名验证）
 * 
 * 支持的事件类型：
 * - push: 代码推送事件（新增 commit）
 * - pull_request: PR 事件（opened/closed/merged）
 * - issues: Issue 事件
 * - commit_comment: Commit 评论
 * 
 * 请求头（GitHub 自动添加）：
 * - X-Hub-Signature-256: HMAC SHA256 签名（用于验证来源）
 * - X-GitHub-Event: 事件类型（push/pull_request/issues 等）
 * - X-GitHub-Delivery: 事件唯一 ID
 * 
 * 请求体（JSON）：
 * - 根据事件类型不同，payload 结构不同
 * - 示例：push 事件包含 commits、repository、sender 等字段
 * 
 * 流程说明：
 * 1. 接收 GitHub Webhook 请求
 * 2. 验证请求签名（防止伪造）
 * 3. 解析事件类型和 payload
 * 4. 调用 GitHubService 处理事件（存储到数据库）
 * 5. 返回成功响应
 * 
 * 使用场景：
 * - 自动记录用户的 GitHub 贡献
 * - 实时同步 commit/PR/issue 到数据库
 * - 触发自动评分流程
 * 
 * 配置要求：
 * 1. 在 GitHub 仓库设置中配置 Webhook
 * 2. Webhook URL: https://your-domain.com/api/github/webhook
 * 3. Content type: application/json
 * 4. Secret: 与环境变量 GITHUB_WEBHOOK_SECRET 一致
 * 5. Events: 选择需要接收的事件（push/pull_request/issues）
 * 
 * 环境变量依赖：
 * - GITHUB_WEBHOOK_SECRET: Webhook 签名密钥（用于验证）
 * 
 * 安全性：
 * - ✅ HMAC SHA256 签名验证（防止伪造请求）
 * - ✅ 仅处理合法来源的请求
 * - ✅ 请求体解析异常处理
 */
import { NextRequest, NextResponse } from 'next/server';

// 指定运行时为 Node.js（需要使用 crypto 等 Node.js API）
export const runtime = 'nodejs';

import { GitHubService } from '@/lib/services/github.service';

export async function POST(request: NextRequest) {
  // 记录 Webhook 接收日志
  console.log('🔔 Webhook received');
  
  try {
    // 1. 从请求头中获取 GitHub 签名和事件类型
    // X-Hub-Signature-256: GitHub 使用 HMAC SHA256 计算的签名
    const signature = request.headers.get('x-hub-signature-256');
    // X-GitHub-Event: 事件类型（如 push、pull_request、issues）
    const event = request.headers.get('x-github-event');
    console.log('📋 Event type:', event);

    // 2. 检查必需的请求头是否存在
    // 如果缺少签名，返回 400 错误
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 },
      );
    }

    // 如果缺少事件类型，返回 400 错误
    if (!event) {
      return NextResponse.json(
        { error: 'Missing event type' },
        { status: 400 },
      );
    }

    // 3. 解析请求体（JSON 格式的 payload）
    let payload;
    try {
      // 尝试解析请求体为 JSON
      payload = await request.json();
    } catch (error) {
      // 如果解析失败（格式错误），返回 400 错误
      console.error('❌ Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    // 4. 将 payload 转换为字符串（用于签名验证）
    const payloadString = JSON.stringify(payload);

    // 5. 验证 webhook 签名（防止伪造请求）
    console.log('🔐 Verifying signature...');
    // 使用 GitHubService 验证签名
    // 内部会使用 HMAC SHA256 + GITHUB_WEBHOOK_SECRET 计算签名并对比
    const isValid = GitHubService.verifyWebhookSignature(payloadString, signature);

    // 如果签名验证失败，返回 400 错误（可能是伪造请求）
    if (!isValid) {
      console.log('❌ Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 },
      );
    }

    console.log('✅ Signature verified');
    
    // 6. 处理 webhook 事件
    console.log('⚙️  Processing webhook event...');
    // 调用 GitHubService.handleWebhook() 处理事件
    // 内部会根据事件类型（push/pull_request/issues）执行不同的逻辑
    // 例如：push 事件会将 commits 存储到数据库
    await GitHubService.handleWebhook(event, payload);

    // 7. 返回成功响应给 GitHub
    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    // 8. 捕获所有异常并返回 500 错误
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }
}
