/**
 * NFT 相关的自定义 Hooks
 * 
 * 功能：
 * - useUserNFTs: 获取用户拥有的 NFT 列表
 * - useNFTMetadata: 获取 NFT 元数据
 * 
 * 基于：
 * - React Query（数据缓存和自动刷新）
 * - /api/nft/* API 接口
 * 
 * 使用场景：
 * - Collections 页面展示用户的 NFT
 * - NFT 详情页展示元数据
 */
import { useQuery } from '@tanstack/react-query';
import { nftApi } from '@/lib/api';

/**
 * NFT 数据类型
 */
interface NFTData {
  tokenId: string;
  owner: string;
  metadataUri: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  commitData: Record<string, unknown>;
  contribution: any;
}

/**
 * 获取用户拥有的 NFT 列表
 * 
 * @param address - 用户钱包地址
 * @returns React Query 结果对象
 * 
 * 使用示例：
 * ```tsx
 * const { data, isLoading, error } = useUserNFTs('0x123...');
 * 
 * if (isLoading) return <div>加载中...</div>;
 * if (error) return <div>加载失败</div>;
 * 
 * return data?.map(nft => <NFTCard key={nft.tokenId} {...nft} />);
 * ```
 */
export function useUserNFTs(address: string | undefined) {
  return useQuery({
    // 查询键：唯一标识这个查询
    queryKey: ['user-nfts', address],
    
    // 查询函数：实际的数据获取逻辑
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is required');
      }
      const response = await nftApi.getUserNFTs(address);
      return response.data as NFTData[];
    },
    
    // 仅在 address 存在时启用查询
    enabled: !!address,
    
    // 缓存时间：5 分钟
    staleTime: 5 * 60 * 1000,
    
    // 错误重试：最多 3 次
    retry: 3,
  });
}

/**
 * 获取 NFT 元数据
 * 
 * @param tokenId - Token ID
 * @returns React Query 结果对象
 * 
 * 使用示例：
 * ```tsx
 * const { data, isLoading } = useNFTMetadata('123');
 * 
 * if (isLoading) return <div>加载中...</div>;
 * 
 * return (
 *   <div>
 *     <h1>{data.name}</h1>
 *     <img src={data.image} alt={data.name} />
 *   </div>
 * );
 * ```
 */
export function useNFTMetadata(tokenId: string | undefined) {
  return useQuery({
    queryKey: ['nft-metadata', tokenId],
    
    queryFn: async () => {
      if (!tokenId) {
        throw new Error('Token ID is required');
      }
      return await nftApi.getNFTMetadata(tokenId);
    },
    
    enabled: !!tokenId,
    
    // 元数据很少变化，可以缓存更长时间
    staleTime: 30 * 60 * 1000, // 30 分钟
    
    retry: 3,
  });
}


