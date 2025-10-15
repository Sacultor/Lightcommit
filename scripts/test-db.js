#!/usr/bin/env node

const { Pool } = require('pg');
const path = require('path');

// 从环境变量读取数据库配置
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testConnection() {
  console.log('🔗 测试数据库连接...');
  
  const databaseUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL:', databaseUrl ? databaseUrl.replace(/:[^:@]*@/, ':****@') : '未设置');

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 未设置');
    return;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    console.log('⏳ 尝试连接...');
    const client = await pool.connect();
    console.log('✅ 连接成功！');
    
    // 测试简单查询
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📊 数据库信息:');
    console.log('  当前时间:', result.rows[0].current_time);
    console.log('  PostgreSQL 版本:', result.rows[0].pg_version.split(' ')[0]);
    
    client.release();
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('错误代码:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 建议: 检查主机名是否正确');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 建议: 检查端口和防火墙设置');
    } else if (error.message.includes('password')) {
      console.log('💡 建议: 检查用户名和密码');
    } else if (error.message.includes('database')) {
      console.log('💡 建议: 检查数据库名称');
    }
  } finally {
    await pool.end();
  }
}

testConnection().catch(console.error);