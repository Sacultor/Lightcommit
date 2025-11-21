/**
 * Webhook 数据验证工具
 * 
 * 功能：
 * - 查询数据库中最新的贡献记录
 * - 验证 webhook 数据是否正确存储
 * - 显示详细的数据信息
 * 
 * 使用方法：
 * ```bash
 * # 查看最新的 5 条贡献
 * node scripts/verify-webhook-data.js
 * 
 * # 查看最新的 10 条贡献
 * node scripts/verify-webhook-data.js 10
 * 
 * # 查看特定用户的贡献
 * GITHUB_USERNAME=testuser node scripts/verify-webhook-data.js
 * ```
 * 
 * 环境变量：
 * - DATABASE_URL: 数据库连接字符串
 * - GITHUB_USERNAME: 筛选的用户名（可选）
 */

const { Pool } = require('pg');

// ============================================================
// 配置
// ============================================================

const DATABASE_URL = process.env.DATABASE_URL;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const LIMIT = parseInt(process.argv[2]) || 5;

if (!DATABASE_URL) {
  console.error('❌ 缺少环境变量: DATABASE_URL');
  console.log('\n请设置数据库连接字符串:');
  console.log('export DATABASE_URL=postgresql://user:password@localhost:5432/lightcommit');
  process.exit(1);
}

// ============================================================
// 数据库连接
// ============================================================

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// ============================================================
// 查询函数
// ============================================================

/**
 * 查询最新的贡献记录
 */
async function queryLatestContributions() {
  console.log('🔍 查询最新的贡献记录...');
  console.log('━'.repeat(80));

  let query = `
    SELECT 
      c.id,
      c.github_id,
      c.type,
      c.title,
      c.contributor,
      c.status,
      c.metadata,
      c.created_at,
      r.full_name as repository_name,
      u.username as user_name
    FROM contributions c
    LEFT JOIN repositories r ON c.repository_id = r.id
    LEFT JOIN users u ON c.user_id = u.id
  `;

  const params = [];
  if (GITHUB_USERNAME) {
    query += ' WHERE c.contributor = $1';
    params.push(GITHUB_USERNAME);
  }

  query += ' ORDER BY c.created_at DESC LIMIT $' + (params.length + 1);
  params.push(LIMIT);

  try {
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      console.log('⚠️  没有找到贡献记录');
      console.log('\n可能的原因:');
      console.log('1. Webhook 还未触发');
      console.log('2. 数据库为空');
      console.log('3. 用户名不匹配');
      return;
    }

    console.log(`📊 找到 ${result.rows.length} 条记录:\n`);

    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.title || '(无标题)'}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   GitHub ID: ${row.github_id}`);
      console.log(`   类型: ${row.type}`);
      console.log(`   贡献者: ${row.contributor}`);
      console.log(`   用户: ${row.user_name || '(未关联)'}`);
      console.log(`   仓库: ${row.repository_name || '(未关联)'}`);
      console.log(`   状态: ${row.status}`);
      console.log(`   创建时间: ${new Date(row.created_at).toLocaleString('zh-CN')}`);
      
      if (row.metadata) {
        const metadata = typeof row.metadata === 'string' 
          ? JSON.parse(row.metadata) 
          : row.metadata;
        console.log(`   元数据:`);
        console.log(`     - SHA: ${metadata.sha || 'N/A'}`);
        console.log(`     - 新增: ${metadata.additions || 0} 行`);
        console.log(`     - 删除: ${metadata.deletions || 0} 行`);
        console.log(`     - 修改: ${metadata.modifications || 0} 个文件`);
      }
      
      console.log('');
    });

    console.log('━'.repeat(80));
    console.log('✅ 数据查询完成');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    throw error;
  }
}

/**
 * 查询统计信息
 */
async function queryStats() {
  console.log('\n📈 统计信息:');
  console.log('━'.repeat(80));

  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'minted' THEN 1 END) as minted,
        COUNT(CASE WHEN type = 'commit' THEN 1 END) as commits,
        COUNT(CASE WHEN type = 'pull_request' THEN 1 END) as pull_requests
      FROM contributions
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    console.log(`总贡献数: ${stats.total}`);
    console.log(`待处理: ${stats.pending}`);
    console.log(`已铸造: ${stats.minted}`);
    console.log(`Commits: ${stats.commits}`);
    console.log(`Pull Requests: ${stats.pull_requests}`);
    console.log('━'.repeat(80));

  } catch (error) {
    console.error('❌ 统计查询失败:', error.message);
  }
}

/**
 * 测试数据库连接
 */
async function testConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功\n');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// ============================================================
// 主函数
// ============================================================

async function main() {
  console.log('🔍 Webhook 数据验证工具');
  console.log('━'.repeat(80));
  console.log(`📊 查询数量: ${LIMIT}`);
  if (GITHUB_USERNAME) {
    console.log(`👤 筛选用户: ${GITHUB_USERNAME}`);
  }
  console.log('━'.repeat(80));
  console.log('');

  // 测试连接
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    // 查询最新贡献
    await queryLatestContributions();

    // 查询统计信息
    await queryStats();

  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 执行
main();


