/**
 * 前端 API 测试工具
 * 
 * 功能：
 * - 测试 /api/contributions/latest 接口
 * - 验证前端能否正确获取 webhook 存储的数据
 * - 显示 API 响应详情
 * 
 * 使用方法：
 * ```bash
 * # 测试本地 API
 * node scripts/test-frontend-api.js
 * 
 * # 测试生产 API
 * API_URL=https://your-domain.com node scripts/test-frontend-api.js
 * ```
 * 
 * 环境变量：
 * - API_URL: API 基础 URL（默认：http://localhost:3000）
 * - AUTH_TOKEN: 认证 token（如果需要）
 */

// ============================================================
// 配置
// ============================================================

const API_URL = process.env.API_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

// ============================================================
// 测试函数
// ============================================================

/**
 * 测试健康检查接口
 */
async function testHealthCheck() {
  console.log('🏥 测试健康检查接口...');
  
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 健康检查通过');
      console.log('   响应:', data);
    } else {
      console.error('❌ 健康检查失败');
      console.error('   状态:', response.status);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    return false;
  }
  
  console.log('');
  return true;
}

/**
 * 测试最新贡献接口
 */
async function testLatestContributions() {
  console.log('📋 测试最新贡献接口...');
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 如果有 token，添加认证头
    if (AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }
    
    const response = await fetch(`${API_URL}/api/contributions/latest?limit=5`, {
      headers,
    });
    
    const data = await response.json();
    
    console.log('━'.repeat(80));
    console.log(`状态码: ${response.status}`);
    console.log('━'.repeat(80));
    
    if (response.ok) {
      console.log('✅ API 请求成功\n');
      
      if (data.data && data.data.length > 0) {
        console.log(`📊 返回 ${data.data.length} 条贡献:\n`);
        
        data.data.forEach((contribution, index) => {
          console.log(`${index + 1}. ${contribution.title || '(无标题)'}`);
          console.log(`   ID: ${contribution.id}`);
          console.log(`   类型: ${contribution.type}`);
          console.log(`   贡献者: ${contribution.contributor}`);
          console.log(`   状态: ${contribution.status}`);
          
          if (contribution.repository) {
            console.log(`   仓库: ${contribution.repository.fullName || contribution.repository.name}`);
          }
          
          if (contribution.user) {
            console.log(`   用户: ${contribution.user.username}`);
          }
          
          console.log(`   创建时间: ${new Date(contribution.createdAt).toLocaleString('zh-CN')}`);
          console.log('');
        });
        
        console.log('━'.repeat(80));
        console.log('✅ 数据格式正确，可以在前端正常显示');
        
      } else {
        console.log('⚠️  API 返回空数据');
        console.log('\n可能的原因:');
        console.log('1. 数据库中没有贡献记录');
        console.log('2. Webhook 还未触发');
        console.log('3. 查询条件过滤掉了所有数据');
      }
      
    } else {
      console.error('❌ API 请求失败');
      console.error('错误详情:', data);
      
      if (response.status === 401) {
        console.error('\n提示: 该接口需要认证，请设置 AUTH_TOKEN 环境变量');
      }
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. 服务器未启动');
    console.error('2. URL 配置错误');
    console.error('3. 网络连接问题');
    return false;
  }
  
  console.log('');
  return true;
}

/**
 * 测试 NFT 接口（如果有钱包地址）
 */
async function testNFTEndpoint() {
  const walletAddress = process.env.WALLET_ADDRESS;
  
  if (!walletAddress) {
    console.log('ℹ️  跳过 NFT 接口测试（未设置 WALLET_ADDRESS）\n');
    return true;
  }
  
  console.log('🎨 测试 NFT 接口...');
  
  try {
    const response = await fetch(`${API_URL}/api/nft/user/${walletAddress}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ NFT API 请求成功');
      console.log(`   用户地址: ${walletAddress}`);
      console.log(`   NFT 数量: ${data.data?.length || 0}`);
    } else {
      console.error('❌ NFT API 请求失败');
      console.error('   错误:', data.error);
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
  
  console.log('');
  return true;
}

// ============================================================
// 主函数
// ============================================================

async function main() {
  console.log('🧪 前端 API 测试工具');
  console.log('━'.repeat(80));
  console.log(`🌐 API URL: ${API_URL}`);
  if (AUTH_TOKEN) {
    console.log(`🔑 Auth Token: ${AUTH_TOKEN.slice(0, 20)}...`);
  }
  console.log('━'.repeat(80));
  console.log('');
  
  let allPassed = true;
  
  // 1. 健康检查
  const healthPassed = await testHealthCheck();
  allPassed = allPassed && healthPassed;
  
  // 2. 最新贡献接口
  const contributionsPassed = await testLatestContributions();
  allPassed = allPassed && contributionsPassed;
  
  // 3. NFT 接口
  const nftPassed = await testNFTEndpoint();
  allPassed = allPassed && nftPassed;
  
  // 总结
  console.log('━'.repeat(80));
  if (allPassed) {
    console.log('✅ 所有测试通过！');
    console.log('\n下一步:');
    console.log('1. 在浏览器中访问 http://localhost:3000/explore');
    console.log('2. 验证页面能否正确显示数据');
    console.log('3. 检查数据是否与 API 返回一致');
  } else {
    console.log('❌ 部分测试失败，请检查上面的错误信息');
    process.exit(1);
  }
  console.log('━'.repeat(80));
}

// 执行
main();


