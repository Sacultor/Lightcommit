#!/bin/bash

echo "🔍 Webhook 调试测试"
echo "===================="
echo ""

cd /Users/frederick/Lightcommit/frontend

# 1. 检查环境变量
echo "1️⃣ 检查环境变量..."
if [ ! -f .env ]; then
  echo "❌ .env 文件不存在"
  exit 1
fi

SECRET=$(grep ^GITHUB_WEBHOOK_SECRET .env | cut -d '=' -f2)
if [ -z "$SECRET" ]; then
  echo "❌ GITHUB_WEBHOOK_SECRET 未配置"
  exit 1
fi
echo "✅ GITHUB_WEBHOOK_SECRET: ${SECRET:0:20}..."

# 2. 检查 Next.js
echo ""
echo "2️⃣ 检查 Next.js 服务..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Next.js 未运行"
  echo "   请运行: pnpm --filter frontend dev"
  exit 1
fi
echo "✅ Next.js 正在运行"

# 3. 检查用户是否存在（可选，需要安装 jq）
echo ""
echo "3️⃣ 准备 payload（用户: scottcwy）..."

# 4. 构造 payload
PAYLOAD='{
  "ref": "refs/heads/main",
  "repository": {
    "id": 123456,
    "name": "test-repo",
    "full_name": "scottcwy/test-repo",
    "html_url": "https://github.com/scottcwy/test-repo",
    "private": false,
    "owner": { "id": 1, "login": "scottcwy" }
  },
  "pusher": { "name": "scottcwy", "email": "2794692336@qq.com" },
  "sender": { "id": 1, "login": "scottcwy" },
  "commits": [{
    "id": "test-commit-'$(date +%s)'",
    "message": "test: webhook for scottcwy",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "url": "https://github.com/scottcwy/test-repo/commit/abc123",
    "author": { "name": "scottcwy", "email": "2794692336@qq.com", "username": "scottcwy" },
    "committer": { "name": "scottcwy", "email": "2794692336@qq.com", "username": "scottcwy" },
    "added": ["a.txt"], "removed": [], "modified": ["README.md"]
  }]
}'

# 5. 计算签名
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* /sha256=/')
echo "✅ 签名: ${SIG:0:30}..."

# 6. 发送请求
echo ""
echo "4️⃣ 发送 webhook 请求..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /tmp/webhook_resp.txt \
  -X POST http://localhost:3000/api/github/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: $SIG" \
  -d "$PAYLOAD")

RESPONSE=$(cat /tmp/webhook_resp.txt)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 响应结果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Webhook 请求成功！"
  echo ""
  echo "📋 下一步检查："
  echo ""
  echo "   1. 查看 Next.js 终端，应该显示："
  echo "      🔔 Webhook received"
  echo "      📋 Event type: push"
  echo "      🔐 Verifying signature..."
  echo "      ✅ Signature verified"
  echo "      ⚙️  Processing webhook event..."
  echo "      Created contribution xxx for commit yyy"
  echo "      ✅ Webhook processed successfully"
  echo ""
  echo "   2. 查询 Supabase:"
  echo "      SELECT \"githubId\", contributor, title"
  echo "      FROM contributions"
  echo "      ORDER BY \"createdAt\" DESC"
  echo "      LIMIT 1;"
  echo ""
  echo "   3. 如果没有 'Created contribution' 日志："
  echo "      - 用户 scottcwy 可能不存在于 users 表"
  echo "      - 或者被 continue 跳过了"
  echo "      - 查看 Next.js 终端的完整日志"
  echo ""
elif [ "$HTTP_CODE" = "400" ]; then
  echo "❌ 请求被拒绝 (400)"
  if echo "$RESPONSE" | grep -q "signature"; then
    echo "   原因: 签名验证失败"
  fi
elif [ "$HTTP_CODE" = "500" ] || [ "$HTTP_CODE" = "502" ]; then
  echo "❌ 服务器错误 ($HTTP_CODE)"
  echo "   查看 Next.js 终端的错误堆栈"
else
  echo "❌ 未知错误 (HTTP $HTTP_CODE)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示:"
echo "   - 确保 users 表有 username='scottcwy' 的记录"
echo "   - 修改 .env 后需重启 Next.js"
echo "   - 查看 Next.js 终端的详细日志定位问题"

rm -f /tmp/webhook_resp.txt