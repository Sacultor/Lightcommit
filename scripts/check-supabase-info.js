#!/usr/bin/env node

const path = require('path');

// 从 frontend/.env.local 读取环境变量
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

async function checkSupabaseInfo() {
  console.log('🔍 Supabase 项目信息检查');
  console.log('='.repeat(50));
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 配置不完整');
    return;
  }
  
  // 从 SUPABASE_URL 提取项目ID
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = urlMatch ? urlMatch[1] : null;
  
  console.log('📋 当前配置:');
  console.log(`  项目ID: ${projectId}`);
  console.log(`  Supabase URL: ${supabaseUrl}`);
  console.log(`  数据库URL: ${databaseUrl}`);
  console.log('');
  
  // 测试 REST API
  console.log('🧪 测试 Supabase REST API...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ REST API 连接成功');
      
      // 尝试获取项目信息
      const healthResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/version`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });
      
      if (healthResponse.ok) {
        const versionData = await healthResponse.text();
        console.log(`📊 数据库版本信息: ${versionData}`);
      }
    } else {
      console.log(`⚠️  REST API 返回状态: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ REST API 测试失败:', error.message);
  }
  
  // 分析数据库连接问题
  console.log('\n🔧 数据库连接分析:');
  
  if (projectId) {
    const expectedDbHost = `db.${projectId}.supabase.co`;
    const currentDbUrl = new URL(databaseUrl);
    const currentDbHost = currentDbUrl.hostname;
    
    console.log(`  期望的数据库主机: ${expectedDbHost}`);
    console.log(`  当前的数据库主机: ${currentDbHost}`);
    
    if (currentDbHost === expectedDbHost) {
      console.log('  ✅ 数据库主机名正确');
    } else {
      console.log('  ❌ 数据库主机名可能不正确');
    }
    
    // 提供可能的解决方案
    console.log('\n💡 可能的解决方案:');
    console.log('1. 检查 Supabase 项目设置中的数据库连接信息');
    console.log('2. 确认项目是否启用了数据库功能');
    console.log('3. 检查项目是否处于暂停状态');
    console.log('4. 尝试重置数据库密码');
    
    // 生成正确的连接字符串建议
    const currentUrl = new URL(databaseUrl);
    const suggestedUrl = `postgresql://${currentUrl.username}:${currentUrl.password}@${expectedDbHost}:5432/${currentUrl.pathname.slice(1)}?sslmode=require`;
    
    console.log('\n🔗 建议的数据库连接字符串:');
    console.log(`DATABASE_URL=${suggestedUrl}`);
    
    // 尝试连接池端口 (6543)
    const poolingUrl = suggestedUrl.replace(':5432/', ':6543/');
    console.log('\n🔗 连接池模式 (推荐用于应用程序):');
    console.log(`DATABASE_URL=${poolingUrl}`);
  }
}

checkSupabaseInfo().catch(console.error);