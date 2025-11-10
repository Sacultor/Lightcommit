#!/usr/bin/env node

const { config } = require('dotenv');
const path = require('path');
const fs = require('fs');

// 加载环境变量
config({ path: path.join(__dirname, '../.env') });

async function fixRLSPolicy() {
  console.log('🔧 修复 users 表的 RLS 策略...\n');

  try {
    const { createClient } = require('@supabase/supabase-js');

    // 使用 service role key 来执行管理操作
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY 环境变量');
      console.log('💡 请在 .env 中添加 SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
    );

    console.log('📡 使用 Service Role 连接到 Supabase...');

    // 读取修复 SQL
    const sqlPath = path.join(__dirname, '../FIX_RLS_POLICY.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 执行 RLS 策略修复...');

    // 分割 SQL 语句并逐个执行
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('🔄 执行:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });

        if (error) {
          console.error('❌ 执行失败:', error);
        } else {
          console.log('✅ 执行成功');
        }
      }
    }

    // 测试修复后的插入操作
    console.log('\n🧪 测试修复后的插入操作...');

    // 切换回普通客户端测试
    const normalClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    const testUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      githubId: 'test-user-rls',
      username: 'test-user-rls',
      avatarUrl: 'https://example.com/avatar.jpg',
      accessToken: null,
      walletAddress: null,
      updatedAt: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await normalClient
      .from('users')
      .upsert(testUser, { onConflict: 'id' });

    if (insertError) {
      console.error('❌ 测试插入仍然失败:', insertError);
      console.log('\n💡 可能需要手动在 Supabase Dashboard 中执行 FIX_RLS_POLICY.sql');
    } else {
      console.log('✅ 测试插入成功！RLS 策略已修复');

      // 清理测试数据
      await normalClient
        .from('users')
        .delete()
        .eq('id', testUser.id);
      console.log('🧹 测试数据已清理');
    }

    console.log('\n🎉 RLS 策略修复完成！');

  } catch (error) {
    console.error('💥 修复过程中出错:', error);
  }
}

// 运行修复
fixRLSPolicy().catch(error => {
  console.error('💥 脚本执行失败:', error);
  process.exit(1);
});
