#!/usr/bin/env node

const { Pool } = require('pg');
const path = require('path');

// 从环境变量读取数据库配置
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkTables() {
  console.log('📋 检查数据库表结构...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 未设置');
    return;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    const client = await pool.connect();
    
    // 检查所有表
    console.log('\n📊 数据库中的表:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('  ❌ 没有找到任何表');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }
    
    // 检查枚举类型
    console.log('\n🔧 数据库中的枚举类型:');
    const enumsResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `);
    
    if (enumsResult.rows.length === 0) {
      console.log('  ❌ 没有找到任何枚举类型');
    } else {
      enumsResult.rows.forEach(row => {
        console.log(`  ✅ ${row.typname}`);
      });
    }
    
    // 如果有表，检查每个表的结构
    if (tablesResult.rows.length > 0) {
      console.log('\n📝 表结构详情:');
      for (const table of tablesResult.rows) {
        console.log(`\n  📋 ${table.table_name}:`);
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position;
        `, [table.table_name]);
        
        columnsResult.rows.forEach(col => {
          console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables().catch(console.error);