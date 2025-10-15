import { NextRequest, NextResponse } from 'next/server';
import { ContributionService } from '../../../../lib/services/contribution.service';
import { AuthService } from '../../../../lib/services/auth.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户身份
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);
    const user = await AuthService.getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 获取贡献 ID
    const { id } = await params;
    const contributionId = id;

    if (!contributionId) {
      return NextResponse.json(
        { error: 'Missing contribution ID' },
        { status: 400 }
      );
    }

    // 获取贡献详情
    const contribution = await ContributionService.findOne(contributionId);

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contribution);

  } catch (error) {
    console.error('Get contribution error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution' },
      { status: 500 }
    );
  }
}