#!/usr/bin/env node

const { Pool } = require('pg');
const path = require('path');

// 从 frontend/.env.local 读取环境变量
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

async function testConnectionModes() {
  console.log('🔍 测试不同的数据库连接模式');
  console.log('='.repeat(50));
  
  const originalUrl = process.env.DATABASE_URL;
  
  // 解析原始URL
  const url = new URL(originalUrl);
  const baseConfig = {
    user: url.username,
    password: url.password,
    host: url.hostname,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false }
  };
  
  const testConfigs = [
    {
      name: '直连模式 (端口 5432)',
      config: { ...baseConfig, port: 5432 }
    },
    {
      name: '连接池模式 (端口 6543)',
      config: { ...baseConfig, port: 6543 }
    },
    {
      name: '事务模式 (端口 6543)',
      config: { 
        ...baseConfig, 
        port: 6543,
        options: '--search_path=public'
      }
    }
  ];
  
  for (const { name, config } of testConfigs) {
    console.log(`\n🧪 测试: ${name}`);
    console.log(`   主机: ${config.host}:${config.port}`);
    
    const pool = new Pool(config);
    
    try {
      // 设置连接超时
      const client = await pool.connect();
      
      try {
        // 执行简单查询
        const result = await client.query('SELECT version()');
        console.log(`   ✅ 连接成功!`);
        console.log(`   📊 PostgreSQL版本: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        
        // 测试基本操作
        const timeResult = await client.query('SELECT NOW() as current_time');
        console.log(`   ⏰ 服务器时间: ${timeResult.rows[0].current_time}`);
        
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.log(`   ❌ 连接失败: ${error.message}`);
      
      if (error.code) {
        console.log(`   🔍 错误代码: ${error.code}`);
      }
      
      // 提供具体的错误分析
      if (error.message.includes('ENOTFOUND')) {
        console.log(`   💡 DNS解析失败 - 检查网络连接或主机名`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`   💡 连接被拒绝 - 检查端口和防火墙设置`);
      } else if (error.message.includes('timeout')) {
        console.log(`   💡 连接超时 - 可能是网络延迟或服务器负载`);
      } else if (error.message.includes('authentication')) {
        console.log(`   💡 认证失败 - 检查用户名和密码`);
      }
    } finally {
      await pool.end();
    }
  }
  
  console.log('\n🔧 建议:');
  console.log('1. 如果连接池模式成功，更新 .env.local 使用端口 6543');
  console.log('2. 如果所有模式都失败，检查 Supabase 项目状态');
  console.log('3. 确认项目没有被暂停或删除');
  console.log('4. 检查网络连接和防火墙设置');
}

testConnectionModes().catch(console.error);