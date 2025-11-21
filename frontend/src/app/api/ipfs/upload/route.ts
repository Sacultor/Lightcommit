/**
 * IPFS 上传接口
 * 
 * 路由：POST /api/ipfs/upload
 * 功能：上传 JSON 数据到 IPFS（去中心化存储）
 * 
 * 权限：内部接口（由其他 API 调用）
 * 
 * 请求体：
 * {
 *   content: string  // JSON 字符串（需要上传的内容）
 * }
 * 
 * 返回数据：
 * {
 *   ipfsHash: string,  // IPFS 哈希（如 Qm...）
 *   warning?: string,  // 警告信息（如果使用 mock）
 * }
 * 
 * 支持的 IPFS 服务商：
 * 1. Pinata（优先）- 专业的 IPFS 固定服务
 * 2. Web3.Storage（备选）- Protocol Labs 的 IPFS 服务
 * 3. Mock（开发模式）- 生成假哈希用于测试
 * 
 * 流程说明：
 * 1. 接收 JSON 内容
 * 2. 尝试使用 Pinata 上传（如果配置了）
 * 3. 如果 Pinata 未配置，尝试 Web3.Storage
 * 4. 如果都未配置，返回 mock 哈希（仅用于开发）
 * 5. 返回 IPFS 哈希（ipfs://{hash} 格式）
 * 
 * 使用场景：
 * - /api/contributions/[id]/sign 中上传元数据到 IPFS
 * - 存储 NFT 元数据（评分细节、证据等）
 * - 去中心化存储贡献记录
 * 
 * 环境变量依赖：
 * - PINATA_API_KEY: Pinata API 密钥（推荐）
 * - PINATA_SECRET_KEY: Pinata Secret 密钥
 * - WEB3_STORAGE_TOKEN: Web3.Storage API Token（备选）
 * 
 * 配置建议：
 * 1. 注册 Pinata 账号：https://pinata.cloud
 * 2. 获取 API Key 和 Secret Key
 * 3. 配置到 .env
 * 
 * IPFS 网关访问：
 * - Pinata: https://gateway.pinata.cloud/ipfs/{hash}
 * - IPFS.io: https://ipfs.io/ipfs/{hash}
 * - Cloudflare: https://cloudflare-ipfs.com/ipfs/{hash}
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. 从请求体中获取要上传的内容（JSON 字符串）
    const { content } = await request.json();

    // 2. 验证内容是否存在
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 },
      );
    }

    // 3. 尝试使用 Pinata 上传（优先方案）
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    // 如果配置了 Pinata 凭证，使用 Pinata 服务
    if (pinataApiKey && pinataSecretKey) {
      // 调用 Pinata API 上传 JSON 数据
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': pinataApiKey,           // Pinata API Key
          'pinata_secret_api_key': pinataSecretKey, // Pinata Secret Key
        },
        body: JSON.stringify({
          pinataContent: JSON.parse(content),       // 上传的 JSON 内容
          pinataMetadata: {
            name: `lightcommit-${Date.now()}`,      // 文件名（带时间戳）
          },
        }),
      });

      // 检查上传是否成功
      if (!response.ok) {
        throw new Error('Pinata upload failed');
      }

      // 返回 IPFS 哈希
      const data = await response.json();
      return NextResponse.json({ ipfsHash: data.IpfsHash });
    }

    // 4. 如果 Pinata 未配置，尝试使用 Web3.Storage（备选方案）
    const web3StorageToken = process.env.WEB3_STORAGE_TOKEN;
    if (web3StorageToken) {
      // 将 content 转换为 Blob
      const blob = new Blob([content], { type: 'application/json' });
      // 创建 File 对象
      const file = new File([blob], 'metadata.json');

      // 构造 FormData（Web3.Storage 使用 multipart/form-data）
      const formData = new FormData();
      formData.append('file', file);

      // 调用 Web3.Storage API 上传文件
      const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${web3StorageToken}`, // Web3.Storage Token
        },
        body: formData,
      });

      // 检查上传是否成功
      if (!response.ok) {
        throw new Error('Web3.Storage upload failed');
      }

      // 返回 IPFS CID（Content Identifier）
      const data = await response.json();
      return NextResponse.json({ ipfsHash: data.cid });
    }

    // 5. 如果所有 IPFS 服务都未配置，返回 mock 哈希（仅用于开发测试）
    // 使用 base64 编码生成一个假的 IPFS 哈希
    const hash = Buffer.from(content).toString('base64').substring(0, 46);
    return NextResponse.json({
      ipfsHash: `Qm${hash}`,  // IPFS 哈希都以 Qm 开头
      warning: 'Using mock IPFS hash. Configure PINATA_API_KEY or WEB3_STORAGE_TOKEN for real uploads.',
    });

  } catch (error) {
    // 6. 捕获所有异常并返回 500 错误
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 },
    );
  }
}

