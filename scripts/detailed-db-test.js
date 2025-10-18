#!/usr/bin/env node

const { Pool, Client } = require('pg');
const path = require('path');
const url = require('url');

// 从环境变量读取数据库配置
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function detailedTest() {
  console.log('🔍 详细数据库连接测试');
  console.log('='.repeat(50));
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 未设置');
    return;
  }

  // 解析数据库URL
  try {
    const parsed = new URL(databaseUrl);
    console.log('📋 数据库配置信息:');
    console.log(`  主机: ${parsed.hostname}`);
    console.log(`  端口: ${parsed.port}`);
    console.log(`  数据库: ${parsed.pathname.slice(1)}`);
    console.log(`  用户: ${parsed.username}`);
    console.log(`  密码: ${'*'.repeat(parsed.password?.length || 0)}`);
    console.log('');
  } catch (error) {
    console.error('❌ DATABASE_URL 格式错误:', error.message);
    return;
  }

  // 测试1: 基本连接测试
  console.log('🧪 测试1: 基本连接测试');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('⏳ 尝试连接...');
    await client.connect();
    console.log('✅ 基本连接成功！');
    
    // 测试简单查询
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📊 数据库信息:');
    console.log('  当前时间:', result.rows[0].current_time);
    console.log('  PostgreSQL 版本:', result.rows[0].pg_version.split(' ')[0]);
    
    await client.end();
    
  } catch (error) {
    console.error('❌ 基本连接失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误详情:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 建议: 检查主机名是否正确');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 建议: 检查端口和防火墙设置');
    } else if (error.message.includes('password')) {
      console.log('💡 建议: 检查用户名和密码');
    } else if (error.message.includes('database')) {
      console.log('💡 建议: 检查数据库名称');
    } else if (error.message.includes('SSL')) {
      console.log('💡 建议: 检查SSL配置');
    }
    
    // 尝试不使用SSL
    console.log('\n🧪 测试2: 尝试不使用SSL连接');
    const clientNoSSL = new Client({
      connectionString: databaseUrl,
      ssl: false,
      connectionTimeoutMillis: 15000,
    });
    
    try {
      await clientNoSSL.connect();
      console.log('✅ 无SSL连接成功！');
      await clientNoSSL.end();
    } catch (noSSLError) {
      console.error('❌ 无SSL连接也失败:', noSSLError.message);
    }
    
    return;
  }

  console.log('\n🧪 测试3: 连接池测试');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

  try {
    const poolClient = await pool.connect();
    console.log('✅ 连接池连接成功！');
    
    // 测试表查询
    try {
      const tablesResult = await poolClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      console.log('📋 数据库中的表:');
      if (tablesResult.rows.length === 0) {
        console.log('  (没有找到表)');
      } else {
        tablesResult.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
      }
    } catch (tableError) {
      console.log('⚠️  无法查询表信息:', tableError.message);
    }
    
    poolClient.release();
    
  } catch (poolError) {
    console.error('❌ 连接池连接失败:', poolError.message);
  } finally {
    await pool.end();
  }

  console.log('\n✅ 测试完成');
}

detailedTest().catch(console.error);