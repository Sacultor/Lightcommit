#!/usr/bin/env node

/**
 * 数据库配置验证脚本
 * 验证 Supabase 配置是否正确
 */

const path = require('path');
const { config } = require('dotenv');

// 加载环境变量
config({ path: path.join(__dirname, '../.env') });

async function verifyDatabaseConfig() {
  console.log('🔍 开始验证数据库配置...\n');

  let hasErrors = false;
  const errors = [];
  const warnings = [];

  // 1. 检查必需的环境变量
  console.log('📋 检查环境变量配置:');

  const requiredEnvVars = [
    { key: 'SUPABASE_URL', description: 'Supabase项目URL' },
    { key: 'SUPABASE_ANON_KEY', description: 'Supabase匿名密钥' },
  ];

  requiredEnvVars.forEach(({ key, description }) => {
    if (process.env[key]) {
      console.log(`  ✅ ${key} (${description})`);
      if (key === 'SUPABASE_URL') {
        const url = process.env[key];
        if (!url.startsWith('https://')) {
          warnings.push(`${key} 应该以 https:// 开头`);
          console.log('     ⚠️ 警告: 应该以 https:// 开头');
        }
        if (!url.includes('supabase.co')) {
          warnings.push(`${key} 可能不是有效的 Supabase URL`);
          console.log('     ⚠️ 警告: 可能不是有效的 Supabase URL');
        }
      }
    } else {
      errors.push(`缺少必需的环境变量: ${key}`);
      console.log(`  ❌ ${key} (${description}) - 未设置`);
      hasErrors = true;
    }
  });

  console.log('');

  // 2. 检查可选的环境变量
  console.log('📋 检查可选配置:');

  const optionalEnvVars = [
    { key: 'DATABASE_URL', description: 'PostgreSQL连接字符串（已弃用）' },
    { key: 'DB_CONNECTION_TYPE', description: '连接类型（已弃用）' },
  ];

  optionalEnvVars.forEach(({ key, description }) => {
    if (process.env[key]) {
      console.log(`  ⚠️ ${key} (${description}) - 已设置但不再使用`);
      warnings.push(`${key} 已不再使用，建议从环境变量中移除`);
    } else {
      console.log(`  ℹ️ ${key} (${description}) - 未设置（正常）`);
    }
  });

  console.log('');

  // 3. 测试 Supabase 连接
  if (!hasErrors) {
    console.log('🔌 测试 Supabase 连接...');

    try {
      const { createClient } = require('@supabase/supabase-js');

      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: false,
          },
        },
      );

      // 测试认证端点
      const { error: authError } = await supabase.auth.getSession();

      if (authError && !authError.message.includes('session_not_found')) {
        console.log('  ❌ 认证测试失败:', authError.message);
        errors.push(`认证测试失败: ${authError.message}`);
        hasErrors = true;
      } else {
        console.log('  ✅ 认证端点连接正常');
      }

      // 测试数据库连接
      console.log('  🔍 测试数据库查询...');

      // 尝试查询系统表
      const { error: dbError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      if (dbError) {
        console.log('  ⚠️ 数据库查询警告:', dbError.message);
        warnings.push(`数据库查询警告: ${dbError.message}`);
        console.log('  ℹ️ 这可能是正常的，取决于您的 RLS 配置');
      } else {
        console.log('  ✅ 数据库连接正常');
      }

    } catch (connectionError) {
      console.log('  ❌ 连接测试失败:', connectionError.message);
      errors.push(`连接测试失败: ${connectionError.message}`);
      hasErrors = true;
    }
  }

  console.log('');

  // 4. 显示总结
  console.log('═'.repeat(60));
  console.log('📊 验证结果总结\n');

  if (hasErrors) {
    console.log('❌ 发现错误:');
    errors.forEach(err => console.log(`   • ${err}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️ 警告信息:');
    warnings.forEach(warn => console.log(`   • ${warn}`));
    console.log('');
  }

  if (!hasErrors && warnings.length === 0) {
    console.log('✅ 所有配置检查通过！');
    console.log('');
    console.log('🚀 您的数据库配置已正确设置，可以开始使用了。');
    console.log('');
  } else if (!hasErrors) {
    console.log('⚠️ 配置基本正确，但有一些警告信息需要注意。');
    console.log('');
  } else {
    console.log('❌ 配置存在问题，请修复上述错误后重试。');
    console.log('');
    console.log('💡 配置指南:');
    console.log('   1. 在 Supabase Dashboard 中获取项目 URL 和 API Key');
    console.log('   2. 创建 .env 文件并添加以下配置:');
    console.log('      SUPABASE_URL=your_project_url');
    console.log('      SUPABASE_ANON_KEY=your_anon_key');
    console.log('');
    process.exit(1);
  }

  console.log('═'.repeat(60));
  console.log('');
  console.log('📚 下一步操作:');
  console.log('   1. 在 Supabase SQL 编辑器中运行迁移脚本:');
  console.log('      - frontend/src/lib/database/migrations/001-initial-schema.sql');
  console.log('      - frontend/src/lib/database/migrations/002-create-rpc-functions.sql');
  console.log('   2. 运行连接测试: node scripts/test-supabase-connection.js');
  console.log('   3. 启动开发服务器: npm run dev');
  console.log('');
}

// 运行验证
verifyDatabaseConfig().catch(error => {
  console.error('\n💥 验证过程出错:', error);
  process.exit(1);
});



