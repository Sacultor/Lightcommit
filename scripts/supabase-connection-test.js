#!/usr/bin/env node

const { Pool, Client } = require('pg');
const path = require('path');

// 从环境变量读取数据库配置
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function supabaseConnectionTest() {
  console.log('🔍 Supabase 数据库连接测试');
  console.log('='.repeat(50));
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 未设置');
    return;
  }

  // 解析原始URL
  const originalUrl = new URL(databaseUrl);
  console.log('📋 原始连接信息:');
  console.log(`  主机: ${originalUrl.hostname}`);
  console.log(`  端口: ${originalUrl.port}`);
  console.log(`  数据库: ${originalUrl.pathname.slice(1)}`);
  console.log('');

  // 测试1: 使用连接池模式 (推荐用于应用程序)
  console.log('🧪 测试1: 连接池模式 (端口 6543)');
  const poolingUrl = databaseUrl.replace(':5432/', ':6543/');
  
  try {
    const pool = new Pool({
      connectionString: poolingUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 20000,
    });

    const client = await pool.connect();
    console.log('✅ 连接池模式连接成功！');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📊 当前时间:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    
    return true; // 成功连接
    
  } catch (error) {
    console.error('❌ 连接池模式失败:', error.message);
  }

  // 测试2: 直接连接模式 (端口 5432)
  console.log('\n🧪 测试2: 直接连接模式 (端口 5432)');
  
  try {
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
    });

    await client.connect();
    console.log('✅ 直接连接模式连接成功！');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📊 当前时间:', result.rows[0].current_time);
    
    await client.end();
    
    return true; // 成功连接
    
  } catch (error) {
    console.error('❌ 直接连接模式失败:', error.message);
  }

  // 测试3: 使用分离的参数连接
  console.log('\n🧪 测试3: 分离参数连接');
  
  try {
    const url = new URL(databaseUrl);
    const client = new Client({
      host: url.hostname,
      port: parseInt(url.port),
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
    });

    await client.connect();
    console.log('✅ 分离参数连接成功！');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📊 当前时间:', result.rows[0].current_time);
    
    await client.end();
    
    return true; // 成功连接
    
  } catch (error) {
    console.error('❌ 分离参数连接失败:', error.message);
  }

  // 测试4: 尝试IPv4连接
  console.log('\n🧪 测试4: 尝试IPv4连接');
  
  try {
    const url = new URL(databaseUrl);
    const client = new Client({
      host: url.hostname,
      port: parseInt(url.port),
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
      // 强制使用IPv4
      family: 4,
    });

    await client.connect();
    console.log('✅ IPv4连接成功！');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📊 当前时间:', result.rows[0].current_time);
    
    await client.end();
    
    return true; // 成功连接
    
  } catch (error) {
    console.error('❌ IPv4连接失败:', error.message);
  }

  console.log('\n❌ 所有连接方式都失败了');
  console.log('\n💡 可能的解决方案:');
  console.log('1. 检查 Supabase 项目是否处于活跃状态');
  console.log('2. 确认数据库密码是否正确');
  console.log('3. 检查 Supabase 项目的网络访问设置');
  console.log('4. 尝试重置数据库密码');
  console.log('5. 检查防火墙或网络代理设置');
  
  return false;
}

supabaseConnectionTest().catch(console.error);