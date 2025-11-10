import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { GitHubService } from '@/lib/services/github.service';

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received');
  try {
    // 获取请求头
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    console.log('📋 Event type:', event);

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
    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      console.error('❌ Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const payloadString = JSON.stringify(payload);

    // 验证 webhook 签名
    console.log('🔐 Verifying signature...');
    const isValid = GitHubService.verifyWebhookSignature(payloadString, signature);

    if (!isValid) {
      console.log('❌ Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 },
      );
    }

    console.log('✅ Signature verified');
    // 处理 webhook 事件
    console.log('⚙️  Processing webhook event...');
    await GitHubService.handleWebhook(event, payload);

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }
}
