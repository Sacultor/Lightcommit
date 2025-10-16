import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/services/github.service';

export async function POST(request: NextRequest) {
  try {
    // 获取请求头
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    // 检查必需的请求头
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 },
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Missing event type' },
        { status: 400 },
      );
    }

    // 获取请求体
    const payload = await request.json();
    const payloadString = JSON.stringify(payload);

    // 验证 webhook 签名
    const isValid = GitHubService.verifyWebhookSignature(payloadString, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 },
      );
    }

    // 处理 webhook 事件
    await GitHubService.handleWebhook(event, payload);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }
}
