#!/usr/bin/env node

/**
 * Supabase连接测试脚本
 * 用于验证新的Supabase客户端连接是否正常工作
 */

const path = require('path');
const { config } = require('dotenv');

// 加载环境变量
config({ path: path.join(__dirname, '../.env') });

async function testSupabaseConnection() {
  try {
    console.log('🚀 开始测试Supabase连接...\n');

    // 检查环境变量
    console.log('📋 环境变量检查:');
    console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
    console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置');
    console.log('- DB_CONNECTION_TYPE:', process.env.DB_CONNECTION_TYPE || 'supabase (默认)');
    console.log('');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase环境变量未正确配置');
    }

    // 直接使用Supabase客户端
    const { createClient } = require('@supabase/supabase-js');
    
    console.log('📡 创建Supabase客户端...');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        db: {
          schema: 'public'
        }
      }
    );
    
    console.log('✅ Supabase客户端创建成功');

    // 测试基本连接 - 尝试获取数据库版本
    console.log('\n🔍 测试数据库连接...');
    try {
      const { data, error } = await supabase.rpc('version');
      
      if (error) {
        console.log('❌ 版本查询失败:', error.message);
        
        // 尝试另一种测试方法
        console.log('🔄 尝试备用连接测试...');
        const { data: testData, error: testError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .limit(1);
          
        if (testError) {
          console.log('❌ 备用测试也失败:', testError.message);
        } else {
          console.log('✅ 备用连接测试成功');
        }
      } else {
        console.log('✅ 数据库连接成功，版本:', data);
      }
    } catch (connectionError) {
      console.log('❌ 连接测试异常:', connectionError.message);
    }

    // 测试简单查询
    console.log('\n📊 测试数据库查询...');
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);

      if (error) {
        console.log('❌ 查询失败:', error.message);
        console.log('错误详情:', error);
      } else {
        console.log('✅ 查询成功，找到', data?.length || 0, '个表');
        if (data && data.length > 0) {
          console.log('表名示例:', data.map(t => t.table_name).slice(0, 3));
        }
      }
    } catch (queryError) {
      console.log('❌ 查询异常:', queryError.message);
    }

    // 测试认证状态
    console.log('\n🔐 检查认证状态...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️ 未认证用户 (这是正常的):', authError.message);
    } else {
      console.log('👤 当前用户:', user ? user.email : '匿名用户');
    }

    console.log('\n🎉 Supabase连接测试完成！');
    console.log('\n💡 提示: 如果看到连接错误，请检查:');
    console.log('   1. Supabase项目是否已激活');
    console.log('   2. 数据库功能是否已启用');
    console.log('   3. 网络连接是否正常');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行测试
testSupabaseConnection();