#!/usr/bin/env node

/**
 * 测试 Next.js 环境中的数据库连接
 */

const { Pool } = require('pg');
const path = require('path');

// 从环境变量读取数据库配置
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testNextJSConnection() {
  console.log('🔗 测试 Next.js 环境中的数据库连接...');
  
  const databaseUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL:', databaseUrl ? databaseUrl.replace(/:[^:@]*@/, ':****@') : '未设置');

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 未设置');
    return;
  }

  // 使用与 Next.js 相同的连接配置
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    console.log('⏳ 尝试连接...');
    
    // 测试简单的健康检查查询
    const result = await pool.query('SELECT 1 as health');
    console.log('✅ 健康检查成功！');
    console.log('📊 查询结果:', result.rows);
    
    // 测试表是否存在
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📋 数据库表:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('完整错误:', error);
  } finally {
    await pool.end();
  }
}

testNextJSConnection().catch(console.error);