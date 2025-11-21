/**
 * 获取 NFT 元数据接口
 * 
 * 路由：GET /api/nft/metadata/:tokenId
 * 功能：获取指定 Token ID 的 NFT 元数据
 * 
 * 权限：公开接口（不需要登录）
 * 
 * 参数：
 * - tokenId: Token ID（路径参数）
 * 
 * 返回数据：
 * {
 *   name: string,
 *   description: string,
 *   image: string,
 *   attributes: Array<{
 *     trait_type: string,
 *     value: string | number
 *   }>,
 *   external_url?: string
 * }
 * 
 * 使用场景：
 * - NFT 详情页展示元数据
 * - OpenSea 等市场读取元数据
 * 
 * 标准：
 * - 符合 ERC-721 Metadata JSON Schema
 * - 符合 OpenSea 元数据标准
 */
import { NextRequest, NextResponse } from 'next/server';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } },
) {
  try {
    const { tokenId } = params;

    // 1. 验证 Token ID 格式
    if (!tokenId || isNaN(parseInt(tokenId))) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 },
      );
    }

    // 2. 从数据库查询贡献记录
    const contribution = await ContributionRepository.findByTokenId(tokenId);

    if (!contribution) {
      return NextResponse.json(
        { error: 'NFT not found' },
        { status: 404 },
      );
    }

    // 3. 构造符合 ERC-721 标准的元数据
    const metadata = {
      name: contribution.title || `Contribution #${tokenId}`,
      description: contribution.description || '',
      // TODO: 替换为真实的图片 URL（从 IPFS 或其他存储获取）
      image: `${process.env.NEXT_PUBLIC_API_URL}/nft/image/${tokenId}.png`,
      external_url: contribution.url || '',
      attributes: [
        {
          trait_type: 'Type',
          value: contribution.type,
        },
        {
          trait_type: 'Repository',
          value: contribution.repository?.fullName || '',
        },
        {
          trait_type: 'Contributor',
          value: contribution.contributor,
        },
        {
          trait_type: 'Status',
          value: contribution.status,
        },
        {
          trait_type: 'GitHub ID',
          value: contribution.githubId,
        },
        // 添加更多属性（从 metadata 中提取）
        ...(contribution.metadata?.additions ? [{
          trait_type: 'Lines Added',
          value: contribution.metadata.additions,
        }] : []),
        ...(contribution.metadata?.deletions ? [{
          trait_type: 'Lines Deleted',
          value: contribution.metadata.deletions,
        }] : []),
      ],
      // 背景颜色（根据贡献类型设置不同颜色）
      background_color: contribution.type === 'commit' ? 'FFE0B2' : 
                        contribution.type === 'pull_request' ? 'B2DFDB' : 
                        'E1BEE7',
    };

    // 4. 返回元数据
    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Get NFT metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT metadata' },
      { status: 500 },
    );
  }
}


