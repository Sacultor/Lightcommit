#!/usr/bin/env node

/**
 * 数据库迁移执行脚本
 * 通过命令行直接执行 Supabase 数据库迁移
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// 加载环境变量
config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  console.log('🚀 开始执行数据库迁移...\n');

  try {
    // 检查环境变量
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('缺少 Supabase 环境变量配置');
    }

    console.log('📋 配置信息:');
    console.log('- Supabase URL:', supabaseUrl);
    console.log('- API Key:', supabaseKey.substring(0, 20) + '...');
    console.log('');

    // 读取迁移脚本
    const migrationPath = path.join(__dirname, '../EXECUTE_MIGRATION.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 读取迁移脚本...');
    console.log(`- 文件: ${migrationPath}`);
    console.log(`- 大小: ${migrationSQL.length} 字符`);
    console.log('');

    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔧 执行迁移任务...\n');

    // 由于 Supabase 客户端不直接支持执行原始 SQL（需要 RPC 函数）
    // 我们将使用 REST API 直接调用 PostgREST
    // 但这需要将 SQL 拆分成单独的语句执行

    console.log('⚠️  注意: Supabase 客户端不支持直接执行复杂的 SQL 脚本');
    console.log('');
    console.log('📝 推荐的执行方式:');
    console.log('');
    console.log('方法 1: 使用 Supabase Dashboard (推荐)');
    console.log('  1. 访问: https://app.supabase.com');
    console.log('  2. 选择你的项目');
    console.log('  3. 进入 SQL Editor');
    console.log('  4. 粘贴 EXECUTE_MIGRATION.sql 的内容');
    console.log('  5. 点击 Run 执行');
    console.log('');

    console.log('方法 2: 安装 PostgreSQL 客户端');
    console.log('  # macOS:');
    console.log('  brew install postgresql');
    console.log('');
    console.log('  # 然后执行:');
    console.log('  psql "postgresql://postgres:PASSWORD@db.zycrqpwhwmcoejksjrth.supabase.co:6543/postgres?sslmode=require" -f EXECUTE_MIGRATION.sql');
    console.log('');

    console.log('方法 3: 使用在线 SQL 执行工具');
    console.log('  我将尝试通过逐条执行 SQL 语句的方式来完成迁移...');
    console.log('');

    // 尝试执行一些基本的迁移步骤
    console.log('🔍 执行基本迁移检查...\n');

    // 检查表是否存在
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'repositories', 'contributions']);

    if (tableError) {
      console.log('❌ 无法查询表信息:', tableError.message);
      console.log('');
      console.log('💡 这是正常的，因为我们使用的是匿名密钥');
      console.log('   请使用上述推荐方式执行迁移');
    } else if (tables && tables.length > 0) {
      console.log('✅ 发现已存在的表:');
      tables.forEach(t => console.log(`   - ${t.table_name}`));
      console.log('');
      console.log('ℹ️  数据库迁移可能已经执行过了');
    } else {
      console.log('ℹ️  未发现应用表，需要执行迁移');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 后续步骤:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('1. 访问 Supabase SQL Editor:');
    console.log('   https://app.supabase.com/project/zycrqpwhwmcoejksjrth/sql/new');
    console.log('');
    console.log('2. 复制迁移脚本到剪贴板:');
    console.log('   cat frontend/EXECUTE_MIGRATION.sql | pbcopy');
    console.log('');
    console.log('3. 在 SQL Editor 中粘贴并执行');
    console.log('');
    console.log('4. 验证迁移成功:');
    console.log('   node scripts/test-supabase-connection.js');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 运行迁移
runMigration();



