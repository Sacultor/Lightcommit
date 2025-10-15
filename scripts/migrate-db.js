#!/usr/bin/env node

/**
 * 数据库迁移脚本
 * 用于在 Supabase 数据库中创建初始表结构
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 从环境变量读取数据库配置
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  console.log('🚀 开始数据库迁移...');

  // 检查环境变量
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: DATABASE_URL 环境变量未设置');
    console.log('请在 .env 文件中配置 DATABASE_URL');
    process.exit(1);
  }

  // 创建数据库连接
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // 测试连接
    console.log('🔗 测试数据库连接...');
    const client = await pool.connect();
    console.log('✅ 数据库连接成功');
    client.release();

    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../frontend/src/lib/database/migrations/001-initial-schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ 错误: 迁移文件不存在:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 读取迁移文件:', migrationPath);

    // 执行迁移
    console.log('⚡ 执行数据库迁移...');
    await pool.query(migrationSQL);
    console.log('✅ 数据库迁移完成');

    // 验证表是否创建成功
    console.log('🔍 验证表结构...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 已创建的表:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('🎉 数据库迁移成功完成！');

  } catch (error) {
    console.error('❌ 数据库迁移失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行迁移
runMigration().catch(console.error);