/**
 * GitHub Webhook 模拟测试工具
 * 
 * 功能：
 * - 发送模拟的 GitHub Webhook 请求到本地服务器
 * - 自动计算 HMAC SHA256 签名
 * - 支持不同的事件类型（push, pull_request）
 * 
 * 使用方法：
 * ```bash
 * # 测试 push 事件
 * node scripts/test-webhook.js push
 * 
 * # 测试 pull_request 事件
 * node scripts/test-webhook.js pull_request
 * 
 * # 指定自定义 URL
 * WEBHOOK_URL=https://your-domain.com/api/github/webhook node scripts/test-webhook.js push
 * ```
 * 
 * 环境变量：
 * - WEBHOOK_URL: Webhook 接收地址（默认：http://localhost:3000/api/github/webhook）
 * - WEBHOOK_SECRET: Webhook 签名密钥（默认：test_secret_123）
 * - GITHUB_USERNAME: 测试用户名（默认：testuser）
 */

const crypto = require('crypto');

// ============================================================
// 配置
// ============================================================

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/github/webhook';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test_secret_123';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'testuser';

// 从命令行参数获取事件类型
const eventType = process.argv[2] || 'push';

// ============================================================
// Payload 模板
// ============================================================

/**
 * 创建 push 事件的 payload
 */
function createPushPayload() {
  return {
    ref: 'refs/heads/main',
    before: '0000000000000000000000000000000000000000',
    after: 'abc123def456789',
    repository: {
      id: 123456789,
      name: 'test-repo',
      full_name: `${GITHUB_USERNAME}/test-repo`,
      private: false,
      html_url: `https://github.com/${GITHUB_USERNAME}/test-repo`,
      description: 'Test repository for webhook testing',
    },
    commits: [
      {
        id: 'abc123def456789',
        message: 'feat: add new feature\n\nThis is a test commit for webhook testing.',
        timestamp: new Date().toISOString(),
        url: `https://github.com/${GITHUB_USERNAME}/test-repo/commit/abc123def456789`,
        author: {
          name: 'Test User',
          email: `${GITHUB_USERNAME}@example.com`,
          username: GITHUB_USERNAME,
        },
        committer: {
          name: 'Test User',
          email: `${GITHUB_USERNAME}@example.com`,
          username: GITHUB_USERNAME,
        },
        added: ['src/new-file.ts'],
        removed: [],
        modified: ['README.md'],
      },
    ],
    sender: {
      login: GITHUB_USERNAME,
      id: 12345678,
      avatar_url: `https://avatars.githubusercontent.com/u/12345678?v=4`,
      html_url: `https://github.com/${GITHUB_USERNAME}`,
    },
  };
}

/**
 * 创建 pull_request 事件的 payload
 */
function createPullRequestPayload() {
  return {
    action: 'closed',
    number: 1,
    pull_request: {
      id: 987654321,
      number: 1,
      state: 'closed',
      title: 'feat: add new feature',
      body: 'This is a test pull request for webhook testing.',
      html_url: `https://github.com/${GITHUB_USERNAME}/test-repo/pull/1`,
      merged: true,
      merged_at: new Date().toISOString(),
      user: {
        login: GITHUB_USERNAME,
        id: 12345678,
        avatar_url: `https://avatars.githubusercontent.com/u/12345678?v=4`,
        html_url: `https://github.com/${GITHUB_USERNAME}`,
      },
      additions: 150,
      deletions: 50,
      changed_files: 5,
    },
    repository: {
      id: 123456789,
      name: 'test-repo',
      full_name: `${GITHUB_USERNAME}/test-repo`,
      private: false,
      html_url: `https://github.com/${GITHUB_USERNAME}/test-repo`,
      description: 'Test repository for webhook testing',
    },
    sender: {
      login: GITHUB_USERNAME,
      id: 12345678,
      avatar_url: `https://avatars.githubusercontent.com/u/12345678?v=4`,
      html_url: `https://github.com/${GITHUB_USERNAME}`,
    },
  };
}

// ============================================================
// 主函数
// ============================================================

async function sendWebhook() {
  console.log('🚀 GitHub Webhook 测试工具');
  console.log('━'.repeat(50));
  console.log(`📍 URL: ${WEBHOOK_URL}`);
  console.log(`🔑 Secret: ${WEBHOOK_SECRET.slice(0, 10)}...`);
  console.log(`👤 User: ${GITHUB_USERNAME}`);
  console.log(`📋 Event: ${eventType}`);
  console.log('━'.repeat(50));

  // 1. 创建 payload
  let payload;
  switch (eventType) {
  case 'push':
    payload = createPushPayload();
    break;
  case 'pull_request':
    payload = createPullRequestPayload();
    break;
  default:
    console.error(`❌ 不支持的事件类型: ${eventType}`);
    console.log('支持的事件类型: push, pull_request');
    process.exit(1);
  }

  // 2. 转换为 JSON 字符串
  const payloadString = JSON.stringify(payload);

  // 3. 计算 HMAC SHA256 签名
  const signature = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex');

  console.log('\n📦 Payload 预览:');
  console.log(JSON.stringify(payload, null, 2).substring(0, 500) + '...');
  console.log(`\n🔐 Signature: ${signature}`);

  // 4. 发送请求
  console.log('\n📤 发送 Webhook 请求...');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
        'X-GitHub-Event': eventType,
        'X-GitHub-Delivery': crypto.randomUUID(),
        'User-Agent': 'GitHub-Hookshot/test',
      },
      body: payloadString,
    });

    const responseData = await response.json();

    console.log('━'.repeat(50));
    console.log(`📥 响应状态: ${response.status} ${response.statusText}`);
    console.log(`📄 响应数据:`, responseData);
    console.log('━'.repeat(50));

    if (response.ok) {
      console.log('✅ Webhook 发送成功！');
      console.log('\n下一步：');
      console.log('1. 查看后端日志确认处理成功');
      console.log('2. 查询数据库验证数据存储');
      console.log('3. 访问前端页面查看数据显示');
    } else {
      console.error('❌ Webhook 发送失败！');
      console.error('错误详情:', responseData);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 开发服务器未启动（npm run dev）');
    console.error('2. URL 配置错误');
    console.error('3. 网络连接问题');
    process.exit(1);
  }
}

// 执行
sendWebhook();


