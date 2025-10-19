#!/usr/bin/env node

const { config } = require('dotenv');
const path = require('path');

// 加载环境变量
config({ path: path.join(__dirname, '../.env.local') });

async function testNewAuth() {
  console.log('🧪 测试新的 Supabase 认证配置...\n');

  let hasErrors = false;

  // 1. 检查环境变量
  console.log('📋 检查环境变量:');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  requiredEnvVars.forEach(key => {
    if (process.env[key]) {
      console.log(`  ✅ ${key}`);
    } else {
      console.log(`  ❌ ${key} - 缺失`);
      hasErrors = true;
    }
  });

  console.log('');

  // 2. 测试 Supabase 连接
  if (!hasErrors) {
    console.log('🔌 测试 Supabase 连接:');
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // 测试基本连接
      const { data, error } = await supabase.auth.getSession();
      
      if (error && !error.message.includes('session_not_found')) {
        console.log(`  ❌ 连接失败: ${error.message}`);
        hasErrors = true;
      } else {
        console.log('  ✅ Supabase 连接成功');
      }
    } catch (error) {
      console.log(`  ❌ 连接测试失败: ${error.message}`);
      hasErrors = true;
    }
  }

  console.log('');

  // 3. 检查必要文件
  console.log('📁 检查认证文件:');
  const requiredFiles = [
    'src/lib/supabase/client.ts',
    'src/lib/supabase/server.ts',
    'src/lib/supabase/middleware.ts',
    'src/lib/services/auth.service.ts',
    'src/app/api/auth/github/route.ts',
    'src/app/auth/callback/page.tsx',
    'src/app/api/auth/logout/route.ts',
    'src/app/api/auth/user/route.ts',
    'src/middleware.ts'
  ];

  const fs = require('fs');
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - 缺失`);
      hasErrors = true;
    }
  });

  console.log('');

  // 4. 总结
  if (hasErrors) {
    console.log('❌ 测试失败 - 发现问题需要修复');
    process.exit(1);
  } else {
    console.log('✅ 所有测试通过！新的认证系统配置正确');
    console.log('');
    console.log('📝 下一步:');
    console.log('1. 启动开发服务器: npm run dev');
    console.log('2. 访问 http://localhost:3000');
    console.log('3. 测试 GitHub 登录功能');
    console.log('');
    console.log('🔧 Supabase Dashboard 配置要求:');
    console.log('- Site URL: http://localhost:3000');
    console.log('- Redirect URLs: http://localhost:3000/auth/callback');
  }
}

// 运行测试
testNewAuth().catch(error => {
  console.error('💥 测试脚本执行失败:', error);
  process.exit(1);
});
