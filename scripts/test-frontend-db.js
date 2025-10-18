#!/usr/bin/env node

const { Pool, Client } = require('pg');
const path = require('path');

// 从 frontend/.env.local 读取环境变量
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

async function testFrontendDatabase() {
  console.log('🔍 Frontend 数据库连接测试');
  console.log('='.repeat(50));
  
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  console.log('📋 环境变量检查:');
  console.log(`  DATABASE_URL: ${databaseUrl ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`  SUPABASE_ANON_KEY: ${supabaseKey ? '✅ 已设置' : '❌ 未设置'}`);
  console.log('');
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 未设置');
    return;
  }

  // 解析数据库URL
  try {
    const parsed = new URL(databaseUrl);
    console.log('📋 数据库连接信息:');
    console.log(`  主机: ${parsed.hostname}`);
    console.log(`  端口: ${parsed.port}`);
    console.log(`  数据库: ${parsed.pathname.slice(1)}`);
    console.log(`  用户: ${parsed.username}`);
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
    console.log('✅ 连接成功！');
    
    // 测试简单查询
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📊 数据库信息:');
    console.log('  当前时间:', result.rows[0].current_time);
    console.log('  PostgreSQL 版本:', result.rows[0].pg_version.split(' ')[0]);
    
    // 检查表是否存在
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 数据库中的表:');
    if (tablesResult.rows.length === 0) {
      console.log('  (没有找到表)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    await client.end();
    console.log('\n✅ 所有测试通过！');
    return true;
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('错误代码:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 DNS解析失败 - 可能的原因:');
      console.log('1. Supabase 项目不存在或已被删除');
      console.log('2. 项目ID不正确');
      console.log('3. 网络连接问题');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 连接被拒绝 - 可能的原因:');
      console.log('1. 端口被阻塞');
      console.log('2. 防火墙设置');
    } else if (error.message.includes('password')) {
      console.log('\n💡 认证失败 - 可能的原因:');
      console.log('1. 数据库密码不正确');
      console.log('2. 用户名不正确');
    }
    
    return false;
  }
}

// 测试Supabase URL的可访问性
async function testSupabaseUrl() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    console.log('⚠️  SUPABASE_URL 未设置，跳过URL测试');
    return;
  }
  
  console.log('\n🧪 测试2: Supabase URL 可访问性');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ Supabase REST API 可访问');
    } else {
      console.log(`⚠️  Supabase REST API 返回状态: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Supabase URL 测试失败:', error.message);
  }
}

async function main() {
  const dbSuccess = await testFrontendDatabase();
  await testSupabaseUrl();
  
  if (!dbSuccess) {
    console.log('\n🔧 建议的解决步骤:');
    console.log('1. 检查 Supabase 项目是否存在');
    console.log('2. 创建新的 Supabase 项目');
    console.log('3. 更新 frontend/.env.local 中的连接信息');
    process.exit(1);
  }
}

main().catch(console.error);