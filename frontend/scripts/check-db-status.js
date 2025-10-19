#!/usr/bin/env node

/**
 * Supabase 数据库状态详细检查脚本
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { config } = require('dotenv');

// 加载环境变量
config({ path: path.join(__dirname, '../.env.local') });

async function checkDatabaseStatus() {
  console.log('🔍 Supabase 数据库状态检查\n');
  console.log('═'.repeat(60));

  try {
    // 1. 环境变量检查
    console.log('\n📋 第 1 步：环境变量检查');
    console.log('─'.repeat(60));
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('缺少必需的环境变量');
    }

    console.log('✅ SUPABASE_URL:', supabaseUrl);
    console.log('✅ SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');

    // 2. 创建客户端
    console.log('\n📡 第 2 步：创建 Supabase 客户端');
    console.log('─'.repeat(60));
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
    console.log('✅ Supabase 客户端创建成功');

    // 3. 测试认证服务
    console.log('\n🔐 第 3 步：测试认证服务');
    console.log('─'.repeat(60));
    
    const { error: authError } = await supabase.auth.getSession();
    if (authError && !authError.message.includes('session_not_found') && !authError.message.includes('Auth session missing')) {
      console.log('⚠️  认证服务异常:', authError.message);
    } else {
      console.log('✅ 认证服务正常（未登录状态）');
    }

    // 4. 尝试查询应用表
    console.log('\n📊 第 4 步：检查应用表');
    console.log('─'.repeat(60));
    
    const tables = ['users', 'repositories', 'contributions'];
    let existingTables = [];
    let missingTables = [];

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.message.includes('Could not find the table') || 
              error.message.includes('relation') ||
              error.code === 'PGRST205') {
            console.log(`❌ 表 "${tableName}" 不存在或无法访问`);
            missingTables.push(tableName);
          } else if (error.message.includes('permission') || error.message.includes('policy')) {
            console.log(`⚠️  表 "${tableName}" 存在但 RLS 策略阻止访问`);
            existingTables.push(tableName);
          } else {
            console.log(`❓ 表 "${tableName}" 状态未知:`, error.message);
          }
        } else {
          console.log(`✅ 表 "${tableName}" 存在 (记录数: ${data?.length || 0})`);
          existingTables.push(tableName);
        }
      } catch (err) {
        console.log(`❌ 检查表 "${tableName}" 时出错:`, err.message);
        missingTables.push(tableName);
      }
    }

    // 5. 检查 RPC 函数
    console.log('\n🔧 第 5 步：检查 RPC 函数');
    console.log('─'.repeat(60));
    
    const rpcFunctions = ['health_check', 'get_db_version'];
    
    for (const funcName of rpcFunctions) {
      try {
        const { data, error } = await supabase.rpc(funcName);
        
        if (error) {
          if (error.message.includes('Could not find the function')) {
            console.log(`❌ RPC 函数 "${funcName}" 未创建`);
          } else {
            console.log(`⚠️  RPC 函数 "${funcName}":`, error.message);
          }
        } else {
          console.log(`✅ RPC 函数 "${funcName}" 正常`);
          if (funcName === 'health_check' && data) {
            console.log('   健康检查结果:', JSON.stringify(data, null, 2).substring(0, 100));
          }
        }
      } catch (err) {
        console.log(`❌ 调用 RPC 函数 "${funcName}" 失败:`, err.message);
      }
    }

    // 6. 生成总结报告
    console.log('\n═'.repeat(60));
    console.log('📊 检查结果总结');
    console.log('═'.repeat(60));

    console.log('\n✅ 已确认存在的表:');
    if (existingTables.length > 0) {
      existingTables.forEach(t => console.log(`   • ${t}`));
    } else {
      console.log('   （无）');
    }

    console.log('\n❌ 缺失或无法访问的表:');
    if (missingTables.length > 0) {
      missingTables.forEach(t => console.log(`   • ${t}`));
    } else {
      console.log('   （无）');
    }

    // 7. 给出建议
    console.log('\n💡 建议操作:');
    console.log('─'.repeat(60));

    if (missingTables.length === tables.length) {
      console.log('❗ 所有表都不存在，需要执行数据库迁移！');
      console.log('');
      console.log('📝 执行迁移的步骤：');
      console.log('');
      console.log('方式 1: 使用 Supabase Dashboard（推荐）');
      console.log('  1. 访问: https://app.supabase.com/project/zycrqpwhwmcoejksjrth/sql/new');
      console.log('  2. 复制迁移脚本:');
      console.log('     cat EXECUTE_MIGRATION.sql | pbcopy');
      console.log('  3. 在 SQL Editor 中粘贴并点击 Run');
      console.log('');
      console.log('方式 2: 使用 Supabase CLI');
      console.log('  1. 安装: npm install -g supabase');
      console.log('  2. 登录: supabase login');
      console.log('  3. 链接项目: supabase link');
      console.log('  4. 执行迁移: supabase db push');
      console.log('');
      console.log('方式 3: 使用 psql 命令行（需要安装 PostgreSQL）');
      console.log('  brew install postgresql');
      console.log('  psql "postgresql://postgres:[PASSWORD]@db.zycrqpwhwmcoejksjrth.supabase.co:6543/postgres?sslmode=require" -f EXECUTE_MIGRATION.sql');
      console.log('');
    } else if (missingTables.length > 0) {
      console.log(`⚠️  部分表缺失 (${missingTables.length}/${tables.length})`);
      console.log('   建议重新执行完整的迁移脚本');
    } else {
      console.log('✅ 所有应用表都已存在');
      console.log('   数据库迁移已完成，可以开始使用了！');
      console.log('');
      console.log('🚀 下一步：启动开发服务器');
      console.log('   npm run dev');
    }

    console.log('\n═'.repeat(60));

  } catch (error) {
    console.error('\n❌ 检查失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行检查
checkDatabaseStatus();



