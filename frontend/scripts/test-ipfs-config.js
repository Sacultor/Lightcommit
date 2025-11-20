#!/usr/bin/env node

// IPFS配置测试脚本
// 用于验证IPFS相关配置是否正确设置

const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 颜色输出函数
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试结果统计
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// 检查环境变量
function checkEnvironmentVariables() {
  log('\n=== 检查IPFS环境变量 ===', 'blue');
  
  const requiredVars = [
    'WEB3_STORAGE_TOKEN',
    'NEXT_PUBLIC_IPFS_GATEWAY'
  ];
  
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✓ ${varName} 已设置`, 'green');
      testResults.passed++;
    } else {
      log(`✗ ${varName} 未设置`, 'red');
      testResults.failed++;
      allVarsPresent = false;
    }
  });
  
  // 检查可选变量
  const optionalVars = [
    'NEXT_PUBLIC_PINATA_GATEWAY',
    'IPFS_API_URL',
    'IPFS_API_KEY',
    'IPFS_SECRET_KEY'
  ];
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      log(`ℹ ${varName} 已设置 (可选)`, 'yellow');
      testResults.warnings++;
    } else {
      log(`ℹ ${varName} 未设置 (可选)`, 'yellow');
    }
  });
  
  return allVarsPresent;
}

// 检查必要文件
function checkRequiredFiles() {
  log('\n=== 检查IPFS相关文件 ===', 'blue');
  
  const requiredFiles = [
    '../src/lib/ipfs.js',
    '../src/app/api/ipfs/upload/route.js',
    '../src/app/api/ipfs/pin/route.js'
  ];
  
  let allFilesPresent = true;
  
  requiredFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      log(`✓ ${filePath} 存在`, 'green');
      testResults.passed++;
    } else {
      log(`✗ ${filePath} 不存在`, 'red');
      testResults.failed++;
      allFilesPresent = false;
    }
  });
  
  return allFilesPresent;
}

// 测试IPFS上传功能
async function testIPFSUpload() {
  log('\n=== 测试IPFS上传功能 ===', 'blue');
  
  try {
    // 创建测试文件
    const testContent = '这是一个IPFS测试文件';
    const testBuffer = Buffer.from(testContent);
    
    // 调用本地API进行测试
    const response = await fetch('http://localhost:3000/api/ipfs/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test-file.txt',
        fileBuffer: testBuffer.toString('base64')
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      log(`✓ IPFS上传测试成功，CID: ${result.cid}`, 'green');
      testResults.passed++;
      return true;
    } else {
      log(`✗ IPFS上传测试失败，状态码: ${response.status}`, 'red');
      testResults.failed++;
      return false;
    }
  } catch (error) {
    log(`✗ IPFS上传测试出错: ${error.message}`, 'red');
    testResults.failed++;
    return false;
  }
}

// 测试Web3.Storage配置
async function testWeb3Storage() {
  log('\n=== 测试Web3.Storage配置 ===', 'blue');
  
  if (!process.env.WEB3_STORAGE_TOKEN) {
    log('✗ Web3.Storage令牌未设置，跳过测试', 'red');
    return false;
  }
  
  try {
    // 这里应该导入Web3Storage客户端进行测试
    // 由于这是测试脚本，我们只检查令牌格式
    const token = process.env.WEB3_STORAGE_TOKEN;
    if (token.startsWith('ey') && token.length > 50) {
      log('✓ Web3.Storage令牌格式正确', 'green');
      testResults.passed++;
      return true;
    } else {
      log('✗ Web3.Storage令牌格式不正确', 'red');
      testResults.failed++;
      return false;
    }
  } catch (error) {
    log(`✗ Web3.Storage测试出错: ${error.message}`, 'red');
    testResults.failed++;
    return false;
  }
}

// 测试Pinata配置
async function testPinata() {
  log('\n=== 测试Pinata配置 ===', 'blue');
  
  if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    log('✗ Pinata JWT未设置，跳过测试', 'red');
    return false;
  }
  
  try {
    // 检查JWT格式
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (jwt.startsWith('ey') && jwt.length > 50) {
      log('✓ Pinata JWT格式正确', 'green');
      testResults.passed++;
      return true;
    } else {
      log('✗ Pinata JWT格式不正确', 'red');
      testResults.failed++;
      return false;
    }
  } catch (error) {
    log(`✗ Pinata测试出错: ${error.message}`, 'red');
    testResults.failed++;
    return false;
  }
}

// 显示测试结果总结
function showSummary() {
  log('\n=== IPFS配置测试总结 ===', 'blue');
  log(`通过: ${testResults.passed}`, 'green');
  log(`失败: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'reset');
  log(`警告: ${testResults.warnings}`, 'yellow');
  
  const totalTests = testResults.passed + testResults.failed + testResults.warnings;
  const successRate = Math.round((testResults.passed / totalTests) * 100);
  
  log(`成功率: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red');
  
  if (testResults.failed > 0) {
    log('\n=== 修复建议 ===', 'yellow');
    log('1. 确保所有必需的环境变量已在.env.local文件中设置', 'yellow');
    log('2. 检查IPFS相关文件是否存在', 'yellow');
    log('3. 确保本地开发服务器正在运行 (http://localhost:3000)', 'yellow');
    log('4. 验证Web3.Storage和Pinata的API密钥是否有效', 'yellow');
  }
  
  log('\n=== 下一步 ===', 'blue');
  log('1. 如果所有测试通过，可以开始使用IPFS功能', 'blue');
  log('2. 如果有失败项，请根据上述建议进行修复', 'blue');
  log('3. 运行 "npm run dev" 启动开发服务器', 'blue');
  log('4. 在应用中测试IPFS上传功能', 'blue');
}

// 主函数
async function main() {
  log('IPFS配置测试开始...', 'blue');
  
  // 检查环境变量
  const envVarsOk = checkEnvironmentVariables();
  
  // 检查必要文件
  const filesOk = checkRequiredFiles();
  
  // 测试Web3.Storage配置
  const web3StorageOk = await testWeb3Storage();
  
  // 测试Pinata配置
  const pinataOk = await testPinata();
  
  // 如果基本配置正确，测试IPFS上传功能
  if (envVarsOk && filesOk) {
    await testIPFSUpload();
  } else {
    log('\n跳过IPFS上传测试，因为基本配置不正确', 'yellow');
  }
  
  // 显示测试结果总结
  showSummary();
  
  // 根据测试结果设置退出码
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// 运行主函数
main().catch(error => {
  log(`测试过程中发生错误: ${error.message}`, 'red');
  process.exit(1);
});