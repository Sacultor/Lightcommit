/**
 * 服务健康检查接口
 * 
 * 路由：GET /api/health
 * 功能：检查服务运行状态和各模块连接状态
 * 
 * 权限：公开接口（无需认证）
 * 
 * 返回数据：
 * {
 *   status: 'ok',              // 总体状态（ok/error）
 *   timestamp: string,         // 检查时间（ISO 8601 格式）
 *   version: string,           // 应用版本号
 *   environment: string,       // 运行环境（development/production）
 *   uptime: number,            // 运行时长（秒）
 *   memory: {                  // 内存使用情况
 *     rss: number,             // 常驻内存（字节）
 *     heapTotal: number,       // 堆总量
 *     heapUsed: number,        // 已用堆
 *     external: number,        // 外部内存
 *   },
 *   services: {                // 各服务连接状态
 *     database: string,        // healthy/unhealthy/error
 *     redis: string,           // 缓存服务（待实现）
 *     github: string,          // GitHub API（待实现）
 *     blockchain: string,      // 区块链节点（待实现）
 *   }
 * }
 * 
 * 使用场景：
 * - 监控系统检查服务状态
 * - 负载均衡器健康检查
 * - DevOps 部署验证
 * - 故障排查和诊断
 * 
 * 监控建议：
 * - 设置定时任务（每 1-5 分钟）调用此接口
 * - 如果返回 500 或 status: 'error'，触发告警
 * - 监控 uptime 和 memory 指标
 */
import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { healthCheck } from '@/lib/database';

export async function GET(_request: NextRequest) {
  try {
    // 1. 读取应用配置
    const config = getConfig();
    
    // 2. 生成当前时间戳（ISO 8601 格式）
    const timestamp = new Date().toISOString();

    // 3. 检查数据库连接状态
    let databaseStatus = 'unknown';
    try {
      // 调用数据库健康检查函数（通常是执行一个简单的查询）
      const dbHealthy = await healthCheck();
      // 根据检查结果设置状态
      databaseStatus = dbHealthy ? 'healthy' : 'unhealthy';
    } catch (error) {
      // 如果检查失败（连接错误、查询超时等），标记为 error
      console.error('Database health check failed:', error);
      databaseStatus = 'error';
    }

    // 4. 构造健康检查信息对象
    const healthInfo = {
      status: 'ok',                                           // 总体状态
      timestamp,                                              // 检查时间
      version: process.env.npm_package_version || '0.1.0',   // 应用版本号
      environment: config.nodeEnv,                            // 运行环境（development/production）
      uptime: process.uptime(),                               // 进程运行时长（秒）
      memory: process.memoryUsage(),                          // 内存使用情况（字节）
      services: {
        database: databaseStatus,                             // 数据库状态
        redis: 'unknown',      // Redis 连接检查（待实现）
        github: 'unknown',     // GitHub API 可用性检查（待实现）
        blockchain: 'unknown', // 区块链节点连接检查（待实现）
      },
    };

    // 5. 返回健康检查结果（200 OK）
    return NextResponse.json(healthInfo);

  } catch (error) {
    // 6. 如果检查过程中发生异常，返回 500 错误
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',                    // 标记为错误状态
        timestamp: new Date().toISOString(), // 错误发生时间
        error: 'Health check failed',       // 错误描述
      },
      { status: 500 },
    );
  }
}

/**
 * HEAD 请求支持
 * 
 * 用途：轻量级存活检查（只返回状态码，无响应体）
 * 适用场景：
 * - 负载均衡器快速检查
 * - 高频监控（减少带宽消耗）
 * - CORS 预检请求
 */
export async function HEAD(_request: NextRequest) {
  // 直接返回 200 状态码，无响应体
  return new NextResponse(null, { status: 200 });
}
