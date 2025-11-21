/**
 * 最新贡献相关的自定义 Hook
 * 
 * 功能：
 * - useLatestContributions: 获取最新的贡献列表
 * 
 * 基于：
 * - React Query（数据缓存和自动刷新）
 * - /api/contributions/latest API 接口
 * 
 * 使用场景：
 * - Explore 页面展示最新的 commit
 * - 首页展示最近活动
 */
import { useQuery } from '@tanstack/react-query';
import { contributionsApi } from '@/lib/api';
import { Contribution } from '@/types/contribution';

/**
 * 查询参数接口
 */
interface LatestContributionsParams {
  limit?: number;    // 返回数量（默认 20）
  type?: string;     // 贡献类型（可选）
}

/**
 * 获取最新贡献列表
 * 
 * @param params - 查询参数
 * @returns React Query 结果对象
 * 
 * 使用示例：
 * ```tsx
 * const { data, isLoading, error, refetch } = useLatestContributions({
 *   limit: 20,
 *   type: 'commit',
 * });
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <div>
 *     {data?.map(contribution => (
 *       <ContributionCard key={contribution.id} {...contribution} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useLatestContributions(params: LatestContributionsParams = {}) {
  return useQuery({
    // 查询键：根据参数动态生成
    queryKey: ['latest-contributions', params],
    
    // 查询函数：调用 API 获取数据
    queryFn: async () => {
      const response = await contributionsApi.getLatest(params);
      return response.data as Contribution[];
    },
    
    // 自动刷新间隔：30 秒
    refetchInterval: 30 * 1000,
    
    // 缓存时间：10 秒（最新数据需要频繁更新）
    staleTime: 10 * 1000,
    
    // 窗口聚焦时自动刷新
    refetchOnWindowFocus: true,
    
    // 错误重试：最多 3 次
    retry: 3,
  });
}


