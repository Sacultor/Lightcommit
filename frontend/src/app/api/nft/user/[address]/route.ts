/**
 * 获取用户 NFT 列表接口
 * 
 * 路由：GET /api/nft/user/:address
 * 功能：获取指定地址拥有的所有 CommitNFT
 * 
 * 权限：公开接口（不需要登录）
 * 
 * 参数：
 * - address: 用户钱包地址（路径参数）
 * 
 * 返回数据：
 * {
 *   data: {
 *     tokenId: string,
 *     owner: string,
 *     metadataUri: string,
 *     metadata: NFTMetadata,
 *     commitData: CommitData,
 *     contribution: Contribution  // 关联的贡献记录
 *   }[]
 * }
 * 
 * 使用场景：
 * - Collections 页面展示用户的 NFT
 * - 用户个人主页展示 NFT 收藏
 */
import { NextRequest, NextResponse } from 'next/server';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const { address } = params;

    // 1. 验证地址格式
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 },
      );
    }

    // 2. 从数据库查询该用户已铸造的贡献
    const mintedContributions = await ContributionRepository.findAll({
      status: 'minted',
    }, 1000, 0);

    // 3. 筛选出属于该用户的贡献（通过 user.walletAddress 或 tokenId）
    // 注意：这里简化处理，实际应该在数据库层面关联 user.walletAddress
    const userContributions = mintedContributions.filter(c => 
      c.tokenId && c.user?.walletAddress?.toLowerCase() === address.toLowerCase()
    );

    // 4. 构造 NFT 数据列表
    const nftList = userContributions.map(contribution => ({
      tokenId: contribution.tokenId!,
      owner: address,
      metadataUri: contribution.metadataUri || '',
      metadata: {
        name: contribution.title || '',
        description: contribution.description || '',
        image: '', // TODO: 从 IPFS 或其他存储获取
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
        ],
      },
      commitData: contribution.metadata || {},
      contribution,
    }));

    // 5. 返回 NFT 列表
    return NextResponse.json({
      data: nftList,
    });

  } catch (error) {
    console.error('Get user NFTs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user NFTs' },
      { status: 500 },
    );
  }
}


