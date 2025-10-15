import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '../../../lib/config';
import { healthCheck } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const config = getConfig();
    const timestamp = new Date().toISOString();

    // 检查数据库连接
    let databaseStatus = 'unknown';
    try {
      const dbHealthy = await healthCheck();
      databaseStatus = dbHealthy ? 'healthy' : 'unhealthy';
    } catch (error) {
      console.error('Database health check failed:', error);
      databaseStatus = 'error';
    }

    // 基本健康检查信息
    const healthInfo = {
      status: 'ok',
      timestamp,
      version: process.env.npm_package_version || '0.1.0',
      environment: config.nodeEnv,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: databaseStatus,
        redis: 'unknown',    // 可以添加 Redis 连接检查
        github: 'unknown',   // 可以添加 GitHub API 检查
        blockchain: 'unknown', // 可以添加区块链连接检查
      },
    };

    return NextResponse.json(healthInfo);

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}

// 支持 HEAD 请求用于简单的存活检查
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}