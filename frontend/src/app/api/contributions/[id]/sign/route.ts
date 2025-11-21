/**
 * ERC-8004 评分签名接口（核心接口）
 * 
 * 路由：GET /api/contributions/[id]/sign
 * 功能：为已评分的贡献生成 EIP-712 签名，用于提交到 ReputationRegistry 合约
 * 
 * 权限：内部接口（由评分者私钥签名）
 * 
 * 路径参数：
 * - id: 贡献 ID
 * 
 * 返回数据：
 * {
 *   params: {                  // ReputationRegistry.submitFeedback() 的参数
 *     contributor: string,     // 贡献者钱包地址
 *     repo: string,            // 仓库全名（owner/repo）
 *     commitSha: string,       // Commit SHA
 *     score: number,           // 评分（0-100）
 *     feedbackHash: string,    // 反馈哈希（唯一标识）
 *     metadataURI: string,     // IPFS 元数据 URI
 *     timestamp: number,       // 时间戳
 *     nonce: number,           // 签名者的 nonce（防重放）
 *   },
 *   signature: string,         // EIP-712 签名（0x...）
 *   metadataJSON: object,      // 元数据 JSON（包含评分细节）
 *   breakdown: object,         // 评分细节
 *   evaluator: string,         // 评分者地址
 *   shouldMint: boolean,       // 是否应该铸造 NFT（score >= 80）
 * }
 * 
 * 流程说明：
 * 1. 查询贡献记录，检查是否已评分
 * 2. 构造 ERC8004Feedback 数据结构
 * 3. 生成元数据 JSON 并上传到 IPFS
 * 4. 从链上读取评分者的当前 nonce
 * 5. 使用 EIP-712 签名反馈数据
 * 6. 验证签名正确性
 * 7. 返回签名和参数（前端用于调用合约）
 * 
 * 使用场景：
 * - /erc8004/validate/[id] 页面第2步"提交评分"
 * - 前端获取签名后调用 ReputationRegistry.submitFeedback()
 * 
 * 环境变量依赖：
 * - EVALUATOR_PRIVATE_KEY: 评分者的私钥（用于签名）
 * - NEXT_PUBLIC_RPC_URL: 区块链 RPC 节点
 * - NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS: ReputationRegistry 合约地址
 * - NEXT_PUBLIC_CHAIN_ID: 链 ID
 */
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { ContributionRepository } from '@/lib/database/repositories/contribution.repository';
import { ERC8004Service, ERC8004Feedback } from '@/lib/services/erc8004.service';
import { getConfig } from '@/lib/config';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    // 1. 从路径参数中获取贡献 ID
    const { id } = context.params;

    // 2. 从数据库查询贡献记录
    const contribution = await ContributionRepository.findById(id);
    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 },
      );
    }

    // 3. 检查贡献是否已评分（score 字段必须存在）
    if (!contribution.score) {
      return NextResponse.json(
        { error: 'Contribution not scored yet' },
        { status: 400 },
      );
    }

    // 4. 读取配置（RPC URL、合约地址等）
    const config = getConfig();
    
    // 5. 检查评分者私钥是否配置（用于签名）
    const privateKey = process.env.EVALUATOR_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Evaluator private key not configured' },
        { status: 500 },
      );
    }

    // 6. 创建 ethers.js provider 和 signer
    const provider = new ethers.JsonRpcProvider(config.rpc.url);
    const signer = new ethers.Wallet(privateKey, provider);
    const evaluatorAddress = await signer.getAddress();

    // 7. 检查贡献者的钱包地址（必须存在）
    const userWallet = contribution.user?.walletAddress;
    if (!userWallet) {
      return NextResponse.json(
        { error: 'User wallet address not found' },
        { status: 400 },
      );
    }

    // 8. 提取仓库全名和 commit SHA（从贡献元数据中）
    const repo = contribution.repository?.fullName || '';
    const commitSha = (contribution.metadata as Record<string, unknown>)?.sha as string || '';

    if (!repo || !commitSha) {
      return NextResponse.json(
        { error: 'Missing repo or commit SHA' },
        { status: 400 },
      );
    }

    // 9. 生成时间戳（当前时间，秒）
    const timestamp = Math.floor(Date.now() / 1000);

    // 10. 生成 feedbackHash（唯一标识此反馈）
    // 基于 repo + commitSha + score + timestamp 计算哈希
    const feedbackHash = ERC8004Service.generateFeedbackHash(
      repo,
      commitSha,
      contribution.score,
      timestamp,
    );

    // 11. 初始化 nonce（后续会从链上读取真实值）
    const nonce = 0;

    // 12. 构造 ERC8004Feedback 数据结构
    const feedback: ERC8004Feedback = {
      contributor: userWallet,
      repo,
      commitSha,
      score: contribution.score,
      feedbackHash,
      timestamp,
      nonce,
    };

    // 13. 提取评分细节（如果存在）
    const breakdown = (contribution.scoreBreakdown as Record<string, number>) || {
      convention: 0,          // 代码规范得分
      size: 0,                // 代码量得分
      filesImpact: 0,         // 文件影响得分
      mergeSignal: 0,         // 合并信号得分
      metadataCompleteness: 0, // 元数据完整性得分
    };

    // 14. 构造证据对象（测试结果、Linter 报告等）
    const evidence = {
      diffUrl: contribution.url || '',    // GitHub diff 链接
      testResults: 'pending',             // 测试结果（待实现）
      linterReport: 'pending',            // Linter 报告（待实现）
    };

    // 15. 生成元数据 JSON（包含评分细节和证据）
    const metadataJSON = await ERC8004Service.generateMetadataJSON(
      feedback,
      breakdown,
      evidence,
    );

    // 16. 上传元数据到 IPFS，获取 URI
    const metadataURI = await ERC8004Service.uploadToIPFS(metadataJSON);

    // 17. 读取区块链配置
    const chainId = config.blockchain.chainId;
    const reputationRegistryAddress = config.blockchain.reputationRegistry;

    // 18. 创建 ReputationRegistry 合约实例
    const { ReputationRegistryABI } = await import('@/lib/contracts');
    const reputationContract = new ethers.Contract(
      reputationRegistryAddress,
      ReputationRegistryABI,
      provider,
    );

    // 19. 从链上读取评分者的当前 nonce（防重放攻击）
    const currentNonce = await reputationContract.nonces(evaluatorAddress);

    // 20. 构造 submitFeedback() 的参数
    const params = {
      contributor: userWallet,
      repo,
      commitSha,
      score: contribution.score,
      feedbackHash,
      metadataURI,
      timestamp,
      nonce: Number(currentNonce),
    };

    // 21. 使用 EIP-712 签名反馈数据
    const signature = await ERC8004Service.signFeedback(
      { ...feedback, nonce: Number(currentNonce) },
      signer,
      chainId,
      reputationRegistryAddress,
    );

    // 22. 验证签名是否正确（恢复签名者地址）
    const recoveredAddress = await ERC8004Service.verifySignature(
      { ...feedback, nonce: Number(currentNonce) },
      signature,
      chainId,
      reputationRegistryAddress,
    );

    // 23. 确保签名者地址与评分者地址一致
    if (recoveredAddress.toLowerCase() !== evaluatorAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 500 },
      );
    }

    // 24. 返回签名和参数（前端用于调用合约）
    return NextResponse.json({
      params,                             // 合约调用参数
      signature,                          // EIP-712 签名
      metadataJSON,                       // 元数据 JSON
      breakdown,                          // 评分细节
      evaluator: evaluatorAddress,        // 评分者地址
      shouldMint: contribution.score >= 80, // 是否应该铸造 NFT
    });
  } catch (error) {
    // 25. 捕获所有异常并返回 500 错误
    console.error('Sign feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to sign feedback' },
      { status: 500 },
    );
  }
}


