#!/usr/bin/env node

const { config } = require('dotenv');
const path = require('path');

// 加载环境变量
config({ path: path.join(__dirname, '../.env.local') });

async function checkUsersTable() {
  console.log('🔍 检查 users 表状态...\n');

  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('📡 连接到 Supabase...');

    // 1. 检查表是否存在
    console.log('1️⃣ 检查 users 表是否存在...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ users 表检查失败:', tableError);
      console.log('\n💡 可能的解决方案:');
      console.log('1. 运行数据库迁移: 在 Supabase Dashboard 执行 EXECUTE_MIGRATION.sql');
      console.log('2. 检查 RLS 策略是否正确配置');
      console.log('3. 确认 ANON_KEY 有正确的权限');
      return;
    }

    console.log('✅ users 表存在并可访问');

    // 2. 检查表结构
    console.log('\n2️⃣ 检查表结构...');
    let columns, columnError;
    try {
      const result = await supabase.rpc('get_table_columns', { table_name: 'users' });
      columns = result.data;
      columnError = result.error;
    } catch {
      // 如果 RPC 不存在，尝试直接查询
      const result = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'users')
        .eq('table_schema', 'public');
      columns = result.data;
      columnError = result.error;
    }

    if (columnError) {
      console.log('⚠️ 无法获取表结构信息，但表存在');
    } else {
      console.log('📋 表结构:', columns);
    }

    // 3. 测试插入操作
    console.log('\n3️⃣ 测试插入操作...');
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      githubId: 'test-user',
      username: 'test-user',
      avatarUrl: 'https://example.com/avatar.jpg',
      accessToken: null,
      walletAddress: null,
      updatedAt: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .upsert(testUser, { onConflict: 'id' });

    if (insertError) {
      console.error('❌ 测试插入失败:', insertError);
    } else {
      console.log('✅ 测试插入成功');
      
      // 清理测试数据
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id);
      console.log('🧹 测试数据已清理');
    }

    console.log('\n🎉 数据库检查完成！');

  } catch (error) {
    console.error('💥 检查过程中出错:', error);
  }
}

// 运行检查
checkUsersTable().catch(error => {
  console.error('💥 脚本执行失败:', error);
  process.exit(1);
});
