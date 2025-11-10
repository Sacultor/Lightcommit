#!/usr/bin/env node
/**
 * 快速验证数据库表结构
 */
const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const path = require('path');

config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function verifyTables() {
  console.log('🔍 验证数据库表结构\n');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 环境变量');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const tables = ['users', 'repositories', 'contributions'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ 表 ${table} 访问失败:`, error.message);
    } else {
      console.log(`✅ 表 ${table} 正常`);
    }
  }

  // 验证评分字段
  const { data: contrib, error: contribError } = await supabase
    .from('contributions')
    .select('id, score, scoreBreakdown, eligibility, aiVersion')
    .limit(1);

  if (contribError) {
    console.error('❌ 评分字段不存在，请执行 004-add-scoring-fields.sql');
  } else {
    console.log('✅ 评分字段已添加');
  }

  console.log('\n✨ 数据层配置验证完成');
}

verifyTables().catch(console.error);

