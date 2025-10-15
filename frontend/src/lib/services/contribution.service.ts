import { ContributionRepository } from '../database/repositories/contribution.repository';
import { 
  Contribution, 
  QueryContributionParams,
  ContributionType,
  ContributionStatus 
} from '../../types/contribution';

export class ContributionService {
  // 获取所有贡献
  static async findAll(query: QueryContributionParams = {}, limit = 50, offset = 0): Promise<Contribution[]> {
    return ContributionRepository.findAll(query, limit, offset);
  }

  // 根据 ID 获取单个贡献
  static async findOne(id: string): Promise<Contribution | null> {
    return ContributionRepository.findById(id);
  }

  // 根据用户 ID 获取贡献
  static async findByUser(userId: string, limit = 50, offset = 0): Promise<Contribution[]> {
    return ContributionRepository.findByUserId(userId, limit, offset);
  }

  // 根据仓库 ID 获取贡献
  static async findByRepository(repositoryId: string, limit = 50, offset = 0): Promise<Contribution[]> {
    const query: QueryContributionParams = { repositoryId };
    return ContributionRepository.findAll(query, limit, offset);
  }

  // 获取贡献统计信息
  static async getStats(userId?: string): Promise<any> {
    return ContributionRepository.getStats(userId);
  }

  // 获取用户的贡献统计
  static async getUserContributionStats(userId: string): Promise<any> {
    const stats = await ContributionRepository.getStats(userId);
    const contributions = await ContributionRepository.findByUserId(userId);

    // 计算额外的统计信息
    const monthlyStats = this.calculateMonthlyStats(contributions);
    const typeDistribution = this.calculateTypeDistribution(contributions);
    const statusDistribution = this.calculateStatusDistribution(contributions);

    return {
      ...stats,
      monthlyStats,
      typeDistribution,
      statusDistribution,
      totalContributions: contributions.length,
      recentContributions: contributions.slice(0, 10), // 最近 10 个贡献
    };
  }

  // 获取仓库的贡献统计
  static async getRepositoryContributionStats(repositoryId: string): Promise<any> {
    const query: QueryContributionParams = { repositoryId };
    const contributions = await ContributionRepository.findAll(query);

    const stats = {
      total: contributions.length,
      byType: this.calculateTypeDistribution(contributions),
      byStatus: this.calculateStatusDistribution(contributions),
      byContributor: this.calculateContributorDistribution(contributions),
      monthlyStats: this.calculateMonthlyStats(contributions),
    };

    return stats;
  }

  // 获取全局统计信息
  static async getGlobalStats(): Promise<any> {
    const allContributions = await ContributionRepository.findAll({});
    
    return {
      totalContributions: allContributions.length,
      typeDistribution: this.calculateTypeDistribution(allContributions),
      statusDistribution: this.calculateStatusDistribution(allContributions),
      monthlyStats: this.calculateMonthlyStats(allContributions),
      topContributors: this.getTopContributors(allContributions, 10),
      recentActivity: allContributions.slice(0, 20),
    };
  }

  // 搜索贡献
  static async searchContributions(
    searchTerm: string, 
    filters: QueryContributionParams = {},
    limit = 50,
    offset = 0
  ): Promise<Contribution[]> {
    // 这里简化实现，实际应该在数据库层面进行全文搜索
    const allContributions = await ContributionRepository.findAll(filters, 1000, 0);
    
    const filteredContributions = allContributions.filter(contribution => 
      contribution.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.contributor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredContributions.slice(offset, offset + limit);
  }

  // 计算月度统计
  private static calculateMonthlyStats(contributions: Contribution[]): any[] {
    const monthlyData: { [key: string]: number } = {};

    contributions.forEach(contribution => {
      const date = new Date(contribution.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // 计算类型分布
  private static calculateTypeDistribution(contributions: Contribution[]): any[] {
    const typeCount: { [key in ContributionType]?: number } = {};

    contributions.forEach(contribution => {
      typeCount[contribution.type] = (typeCount[contribution.type] || 0) + 1;
    });

    return Object.entries(typeCount).map(([type, count]) => ({ type, count }));
  }

  // 计算状态分布
  private static calculateStatusDistribution(contributions: Contribution[]): any[] {
    const statusCount: { [key in ContributionStatus]?: number } = {};

    contributions.forEach(contribution => {
      statusCount[contribution.status] = (statusCount[contribution.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
  }

  // 计算贡献者分布
  private static calculateContributorDistribution(contributions: Contribution[]): any[] {
    const contributorCount: { [key: string]: number } = {};

    contributions.forEach(contribution => {
      contributorCount[contribution.contributor] = (contributorCount[contribution.contributor] || 0) + 1;
    });

    return Object.entries(contributorCount)
      .map(([contributor, count]) => ({ contributor, count }))
      .sort((a, b) => b.count - a.count);
  }

  // 获取顶级贡献者
  private static getTopContributors(contributions: Contribution[], limit: number): any[] {
    const contributorStats: { [key: string]: any } = {};

    contributions.forEach(contribution => {
      if (!contributorStats[contribution.contributor]) {
        contributorStats[contribution.contributor] = {
          contributor: contribution.contributor,
          totalContributions: 0,
          mintedContributions: 0,
          types: {} as { [key in ContributionType]?: number },
        };
      }

      const stats = contributorStats[contribution.contributor];
      stats.totalContributions++;
      
      if (contribution.status === ContributionStatus.MINTED) {
        stats.mintedContributions++;
      }

      stats.types[contribution.type] = (stats.types[contribution.type] || 0) + 1;
    });

    return Object.values(contributorStats)
      .sort((a: any, b: any) => b.totalContributions - a.totalContributions)
      .slice(0, limit);
  }

  // 获取贡献趋势
  static async getContributionTrends(days = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const allContributions = await ContributionRepository.findAll({});
    
    const filteredContributions = allContributions.filter(contribution => {
      const contributionDate = new Date(contribution.createdAt);
      return contributionDate >= startDate && contributionDate <= endDate;
    });

    const dailyStats: { [key: string]: number } = {};
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyStats[dateKey] = 0;
    }

    filteredContributions.forEach(contribution => {
      const dateKey = new Date(contribution.createdAt).toISOString().split('T')[0];
      if (dailyStats[dateKey] !== undefined) {
        dailyStats[dateKey]++;
      }
    });

    return Object.entries(dailyStats).map(([date, count]) => ({ date, count }));
  }
}