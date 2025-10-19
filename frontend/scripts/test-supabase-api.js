#!/usr/bin/env node

/**
 * Supabase API连接测试脚本
 * 测试基础的REST API连接
 */

const path = require('path');
const { config } = require('dotenv');

// 加载环境变量
config({ path: path.join(__dirname, '../.env.local') });

async function testSupabaseAPI() {
  try {
    console.log('🚀 开始测试Supabase API连接...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase环境变量未正确配置');
    }

    console.log('📋 配置信息:');
    console.log('- Supabase URL:', supabaseUrl);
    console.log('- API Key:', supabaseKey.substring(0, 20) + '...');
    console.log('');

    // 测试REST API健康检查
    console.log('🔍 测试REST API连接...');
    
    const healthUrl = `${supabaseUrl}/rest/v1/`;
    
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('HTTP状态码:', response.status);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        console.log('✅ REST API连接成功');
        
        const responseText = await response.text();
        console.log('响应内容:', responseText.substring(0, 200) + '...');
      } else {
        console.log('❌ REST API连接失败');
        const errorText = await response.text();
        console.log('错误响应:', errorText);
      }
    } catch (fetchError) {
      console.log('❌ 网络请求失败:', fetchError.message);
    }

    // 测试认证API
    console.log('\n🔐 测试认证API...');
    
    const authUrl = `${supabaseUrl}/auth/v1/user`;
    
    try {
      const authResponse = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('认证API状态码:', authResponse.status);

      if (authResponse.status === 401) {
        console.log('✅ 认证API正常 (未认证用户返回401是预期的)');
      } else if (authResponse.ok) {
        console.log('✅ 认证API连接成功');
        const authData = await authResponse.json();
        console.log('认证响应:', authData);
      } else {
        console.log('❌ 认证API异常');
        const authError = await authResponse.text();
        console.log('认证错误:', authError);
      }
    } catch (authError) {
      console.log('❌ 认证API请求失败:', authError.message);
    }

    // 使用Supabase客户端测试
    console.log('\n📡 使用Supabase客户端测试...');
    
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试简单的认证状态
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('ℹ️ 获取会话信息:', sessionError.message);
    } else {
      console.log('✅ 客户端连接成功，会话状态:', session ? '已登录' : '未登录');
    }

    console.log('\n🎉 Supabase API测试完成！');
    
    console.log('\n📊 测试总结:');
    console.log('- Supabase客户端库: ✅ 可以正常创建');
    console.log('- API连接: 需要检查上述测试结果');
    console.log('- 数据库功能: 可能需要在Supabase控制台中启用');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行测试
testSupabaseAPI();