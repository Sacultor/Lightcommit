'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/contexts/Web3Context';
import { useContract } from '@/lib/hooks/useContract';
import { ContractService } from '@/lib/services/contract.service';
import toast from 'react-hot-toast';

export default function TestContractPage() {
  const { account, isConnected, connect, chainId, isCorrectNetwork } = useWeb3();
  const contract = useContract();
  const [loading, setLoading] = useState(false);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [contractName, setContractName] = useState<string>('');
  const [contractSymbol, setContractSymbol] = useState<string>('');
  const [mintResult, setMintResult] = useState<string>('');
  const [queryTokenId, setQueryTokenId] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any>(null);
  
  // 真实的 commit 数据表单
  const [formData, setFormData] = useState({
    repo: '',
    commit: '',
    linesAdded: '',
    linesDeleted: '',
    testsPass: true,
    author: '',
    message: '',
    merged: false,
  });

  // 从合约加载真实数据
  useEffect(() => {
    if (contract) {
      loadContractInfo();
    }
  }, [contract]);

  // 自动填充作者为当前账户
  useEffect(() => {
    if (account && !formData.author) {
      setFormData(prev => ({ ...prev, author: account }));
    }
  }, [account]);

  const loadContractInfo = async () => {
    if (!contract) return;
    
    try {
      const service = new ContractService(contract);
      const supply = await service.getTotalSupply();
      const name = await contract.name();
      const symbol = await contract.symbol();
      
      setTotalSupply(supply);
      setContractName(name);
      setContractSymbol(symbol);
      
      toast.success('Contract information loaded successfully');
    } catch (error) {
      console.error('Failed to load contract info:', error);
      toast.error('Failed to load contract information');
    }
  };

  // 从链上查询真实的 NFT 数据
  const handleQueryNFT = async () => {
    if (!contract || !queryTokenId) {
      toast.error('Please enter Token ID');
      return;
    }

    setLoading(true);
    try {
      const service = new ContractService(contract);
      const data = await service.getCommitData(parseInt(queryTokenId));
      
      if (data) {
        setQueryResult(data);
        toast.success('Query successful');
      } else {
        toast.error('Token does not exist');
        setQueryResult(null);
      }
    } catch (error: any) {
      console.error('Query error:', error);
      toast.error('Query failed: ' + (error.message || 'Unknown error'));
      setQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  // 使用真实数据铸造 NFT
  const handleMintWithRealData = async () => {
    if (!contract || !account) {
      toast.error('Please connect wallet first');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to the correct network');
      return;
    }

    // 验证必填字段
    if (!formData.repo || !formData.commit || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMintResult('');
    
    try {
      const service = new ContractService(contract);
      
      // 检查是否已铸造
      const isMinted = await service.isCommitMinted(formData.commit);
      if (isMinted) {
        toast.error('This commit has already been minted as NFT!');
        setLoading(false);
        return;
      }
      
      const commitData = {
        repo: formData.repo,
        commit: formData.commit,
        linesAdded: parseInt(formData.linesAdded) || 0,
        linesDeleted: parseInt(formData.linesDeleted) || 0,
        testsPass: formData.testsPass,
        timestamp: Math.floor(Date.now() / 1000),
        author: formData.author || account,
        message: formData.message,
        merged: formData.merged,
      };

      console.log('🚀 发送真实交易到链上...', commitData);
      toast.loading('Sending transaction to blockchain...', { id: 'minting' });
      
      const result = await service.mintCommit(
        account,
        commitData,
        `ipfs://metadata/${formData.commit}` // 使用 IPFS 格式
      );

      toast.dismiss('minting');

      if (result.success) {
        toast.success('✅ NFT minted successfully! Transaction on chain');
        setMintResult(`✅ 铸造成功!\n交易哈希: ${result.transactionHash}\nToken ID: ${result.tokenId}\n\n在 Hardhat 节点日志中可以看到真实的链上交易记录`);
        
        // 重新加载供应量
        await loadContractInfo();
        
        // 清空表单
        setFormData({
          repo: '',
          commit: '',
          linesAdded: '',
          linesDeleted: '',
          testsPass: true,
          author: account,
          message: '',
          merged: false,
        });
      } else {
        toast.error('❌ Minting failed: ' + result.error);
        setMintResult(`❌ 失败: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Mint error:', error);
      toast.dismiss('minting');
      toast.error('❌ Transaction failed');
      setMintResult(`❌ 错误: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black text-black mb-2">⛓️ 真实链上交互测试</h1>
          <p className="text-gray-600 mb-8">所有数据来自真实的区块链，无 Mock 数据</p>

          {/* 连接状态 */}
          <div className="mb-8 p-6 bg-gray-50 border-2 border-black rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">📡 链上连接状态</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex gap-2">
                <span className="font-bold">钱包地址:</span>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? `✅ ${account}` : '❌ 未连接'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">Chain ID:</span>
                <span className="text-blue-600">{chainId || '未知'} {chainId === 31337 && '(Hardhat Local)'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">网络状态:</span>
                <span className={isCorrectNetwork ? 'text-green-600' : 'text-red-600'}>
                  {isCorrectNetwork ? '✅ 正确' : '❌ 请切换网络'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">合约地址:</span>
                <span className="text-xs break-all text-purple-600">
                  {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '未配置'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">RPC 节点:</span>
                <span className="text-blue-600">{process.env.NEXT_PUBLIC_RPC_URL}</span>
              </div>
            </div>
            
            {!isConnected && (
              <button
                onClick={connect}
                className="mt-4 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
              >
                连接钱包
              </button>
            )}
          </div>

          {/* 从链上读取的合约信息 */}
          {contract && (
            <div className="mb-8 p-6 bg-blue-50 border-2 border-black rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">📝 链上合约信息</h2>
                <button
                  onClick={loadContractInfo}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 text-sm"
                >
                  🔄 刷新
                </button>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex gap-2">
                  <span className="font-bold">合约名称:</span>
                  <span>{contractName || 'Loading...'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">合约符号:</span>
                  <span>{contractSymbol || 'Loading...'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">当前供应量:</span>
                  <span className="text-green-600 font-bold">{totalSupply !== null ? totalSupply : 'Loading...'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">最大供应量:</span>
                  <span>1,000,000</span>
                </div>
              </div>
            </div>
          )}

          {/* 查询链上 NFT 数据 */}
          <div className="mb-8 p-6 bg-purple-50 border-2 border-black rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">🔍 查询链上 NFT 数据</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={queryTokenId}
                onChange={(e) => setQueryTokenId(e.target.value)}
                placeholder="输入 Token ID"
                className="flex-1 px-4 py-2 border-2 border-black rounded-lg font-mono"
              />
              <button
                onClick={handleQueryNFT}
                disabled={loading || !contract}
                className="px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 disabled:bg-gray-300"
              >
                查询
              </button>
            </div>
            
            {queryResult && (
              <div className="p-4 bg-white border-2 border-black rounded-xl font-mono text-xs">
                <div className="font-bold text-lg mb-2">📦 链上数据:</div>
                <div className="space-y-1">
                  <div><span className="text-gray-600">仓库:</span> {queryResult.repo}</div>
                  <div><span className="text-gray-600">Commit:</span> {queryResult.commit}</div>
                  <div><span className="text-gray-600">作者:</span> {queryResult.author}</div>
                  <div><span className="text-gray-600">消息:</span> {queryResult.message}</div>
                  <div><span className="text-gray-600">添加行数:</span> {queryResult.linesAdded}</div>
                  <div><span className="text-gray-600">删除行数:</span> {queryResult.linesDeleted}</div>
                  <div><span className="text-gray-600">测试通过:</span> {queryResult.testsPass ? '✅' : '❌'}</div>
                  <div><span className="text-gray-600">已合并:</span> {queryResult.merged ? '✅' : '❌'}</div>
                  <div><span className="text-gray-600">时间戳:</span> {new Date(queryResult.timestamp * 1000).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* 使用真实数据铸造 */}
          <div className="mb-8 p-6 bg-green-50 border-2 border-black rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">🎨 铸造真实 Commit NFT</h2>
            <p className="mb-4 text-sm text-gray-700">
              填写真实的 Git Commit 信息，数据将永久记录在区块链上
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">仓库名称 *</label>
                <input
                  type="text"
                  value={formData.repo}
                  onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
                  placeholder="例如: ethereum/go-ethereum"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg"
                />
              </div>
              
              <div>
                <label className="block font-bold mb-2">Commit Hash *</label>
                <input
                  type="text"
                  value={formData.commit}
                  onChange={(e) => setFormData({ ...formData, commit: e.target.value })}
                  placeholder="例如: a3f2b1c4d5e6f7g8h9i0..."
                  className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">添加行数</label>
                  <input
                    type="number"
                    value={formData.linesAdded}
                    onChange={(e) => setFormData({ ...formData, linesAdded: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-black rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">删除行数</label>
                  <input
                    type="number"
                    value={formData.linesDeleted}
                    onChange={(e) => setFormData({ ...formData, linesDeleted: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-black rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-bold mb-2">作者地址</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="自动填充为当前钱包地址"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block font-bold mb-2">Commit 消息 *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="例如: feat: add new feature"
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg"
                />
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.testsPass}
                    onChange={(e) => setFormData({ ...formData, testsPass: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="font-bold">测试通过</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.merged}
                    onChange={(e) => setFormData({ ...formData, merged: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="font-bold">已合并</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleMintWithRealData}
              disabled={!isConnected || !isCorrectNetwork || loading}
              className={`mt-6 w-full px-8 py-4 font-bold text-lg rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                isConnected && isCorrectNetwork && !loading
                  ? 'bg-green-400 hover:bg-green-500 cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? '⏳ 交易处理中...' : '🚀 发送交易到区块链'}
            </button>

            {mintResult && (
              <div className="mt-4 p-4 bg-white border-2 border-black rounded-xl">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {mintResult}
                </pre>
              </div>
            )}
          </div>

          {/* 使用说明 */}
          <div className="p-6 bg-yellow-50 border-2 border-black rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">📖 真实链上交互说明</h2>
            <div className="space-y-2 text-sm">
              <p className="font-bold">✅ 此页面的所有数据都来自真实区块链:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>合约信息从链上实时读取</li>
                <li>所有交易都发送到真实的 Hardhat 节点</li>
                <li>每次铸造都会产生真实的链上交易记录</li>
                <li>可以在 Hardhat 节点日志中看到所有交易</li>
                <li>查询功能直接从合约存储读取数据</li>
              </ul>
              
              <p className="font-bold mt-4">🔍 验证真实性:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>查看终端中的 Hardhat 节点日志</li>
                <li>每次交易都会显示 Gas 消耗</li>
                <li>交易哈希可以在节点日志中找到</li>
                <li>铸造后供应量会实时增加</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
