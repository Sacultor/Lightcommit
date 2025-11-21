/**
 * 贡献数据 Hooks
 * 
 * 功能：
 * - 获取贡献列表（支持筛选）
 * - 获取单个贡献详情
 * - 获取当前用户的贡献
 * - 获取贡献统计数据
 * 
 * 依赖：
 * - @tanstack/react-query：数据缓存和自动刷新
 * - contributionsApi：贡献 API 封装
 * 
 * 特点：
 * - 自动缓存数据（避免重复请求）
 * - 自动刷新（配置的时间间隔）
 * - 支持筛选条件
 */
import { useQuery } from '@tanstack/react-query';
import { contributionsApi } from '@/lib/api';

/**
 * 获取贡献列表（支持筛选）
 * 
 * @param params - 筛选参数
 *   - type: 贡献类型（commit/pull_request/issue）
 *   - status: 状态（pending/scored/minted/failed）
 *   - userId: 用户 ID
 *   - repositoryId: 仓库 ID
 * 
 * @returns React Query 结果对象
 *   - data: 贡献列表
 *   - isLoading: 是否正在加载
 *   - error: 错误信息
 *   - refetch(): 手动刷新数据
 */
export function useContributions(params?: {
  type?: string;
  status?: string;
  userId?: string;
  repositoryId?: string;
}) {
  return useQuery({
    queryKey: ['contributions', params],  // 缓存键（包含筛选参数）
    queryFn: () => contributionsApi.getAll(params),  // 调用 API
  });
}

/**
 * 获取单个贡献详情
 * 
 * @param id - 贡献 ID
 * 
 * @returns React Query 结果对象
 *   - data: 贡献详情
 *   - isLoading: 是否正在加载
 *   - error: 错误信息
 */
export function useContribution(id: string) {
  return useQuery({
    queryKey: ['contribution', id],  // 缓存键
    queryFn: () => contributionsApi.getOne(id),  // 调用 API
    enabled: !!id,  // 仅当 id 存在时才执行查询
  });
}

/**
 * 获取当前用户的贡献列表
 * 
 * @returns React Query 结果对象
 *   - data: 当前用户的贡献列表
 *   - isLoading: 是否正在加载
 *   - error: 错误信息
 */
export function useMyContributions() {
  return useQuery({
    queryKey: ['my-contributions'],  // 缓存键
    queryFn: () => contributionsApi.getMy(),  // 调用 /api/contributions/my
  });
}

/**
 * 获取贡献统计数据
 * 
 * @param userId - 用户 ID（可选，默认当前用户）
 * 
 * @returns React Query 结果对象
 *   - data: 统计数据（总数、类型分布、状态分布等）
 *   - isLoading: 是否正在加载
 *   - error: 错误信息
 */
export function useContributionStats(userId?: string) {
  return useQuery({
    queryKey: ['contribution-stats', userId],  // 缓存键
    queryFn: () => contributionsApi.getStats(userId),  // 调用 API
  });
}

