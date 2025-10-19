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

  // 加载合约信息
  useEffect(() => {
    if (contract) {
      loadContractInfo();
    }
  }, [contract]);

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
    } catch (error) {
      console.error('Failed to load contract info:', error);
    }
  };

  const handleMintTest = async () => {
    if (!contract || !account) {
      toast.error('请先连接钱包');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('请切换到正确的网络');
      return;
    }

    setLoading(true);
    setMintResult('');
    
    try {
      const service = new ContractService(contract);
      
      const commitData = {
        repo: 'test/repo',
        commit: `test-${Date.now()}`,
        linesAdded: 100,
        linesDeleted: 50,
        testsPass: true,
        timestamp: Math.floor(Date.now() / 1000),
        author: account,
        message: 'Test commit for NFT minting',
        merged: true,
      };

      toast.loading('正在铸造 NFT...', { id: 'minting' });
      
      const result = await service.mintCommit(
        account,
        commitData,
        `https://api.lightcommit.com/metadata/${Date.now()}`
      );

      toast.dismiss('minting');

      if (result.success) {
        toast.success('NFT 铸造成功！');
        setMintResult(`✅ 成功!\n交易哈希: ${result.transactionHash}\nToken ID: ${result.tokenId}`);
        await loadContractInfo(); // 重新加载供应量
      } else {
        toast.error('铸造失败: ' + result.error);
        setMintResult(`❌ 失败: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Mint error:', error);
      toast.dismiss('minting');
      toast.error('铸造失败');
      setMintResult(`❌ 错误: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black text-black mb-8">🧪 合约测试面板</h1>

          {/* 连接状态 */}
          <div className="mb-8 p-6 bg-gray-50 border-2 border-black rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">📡 连接状态</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex gap-2">
                <span className="font-bold">钱包:</span>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? `✅ 已连接 (${account?.slice(0, 10)}...)` : '❌ 未连接'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">Chain ID:</span>
                <span>{chainId || '未知'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">网络:</span>
                <span className={isCorrectNetwork ? 'text-green-600' : 'text-red-600'}>
                  {isCorrectNetwork ? '✅ 正确' : '❌ 错误'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">合约地址:</span>
                <span className="text-xs break-all">
                  {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '未配置'}
                </span>
              </div>
            </div>
            
            {!isConnected && (
              <button
                onClick={connect}
                className="mt-4 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800"
              >
                连接钱包
              </button>
            )}
          </div>

          {/* 合约信息 */}
          {contract && (
            <div className="mb-8 p-6 bg-blue-50 border-2 border-black rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">📝 合约信息</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex gap-2">
                  <span className="font-bold">名称:</span>
                  <span>{contractName || 'Loading...'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">符号:</span>
                  <span>{contractSymbol || 'Loading...'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">总供应量:</span>
                  <span>{totalSupply !== null ? totalSupply : 'Loading...'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">最大供应量:</span>
                  <span>1,000,000</span>
                </div>
              </div>
            </div>
          )}

          {/* 铸造测试 */}
          <div className="mb-8 p-6 bg-green-50 border-2 border-black rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">🎨 铸造测试</h2>
            <p className="mb-4 text-gray-700">
              点击按钮铸造一个测试 NFT，这将向合约发送真实的交易。
            </p>
            <button
              onClick={handleMintTest}
              disabled={!isConnected || !isCorrectNetwork || loading}
              className={`px-8 py-3 font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                isConnected && isCorrectNetwork && !loading
                  ? 'bg-green-400 hover:bg-green-500 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? '铸造中...' : '🚀 铸造测试 NFT'}
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
            <h2 className="text-2xl font-bold mb-4">📖 使用说明</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>确保已安装 MetaMask 浏览器扩展</li>
              <li>点击右上角 "Connect Wallet" 连接钱包</li>
              <li>确保连接到正确的网络 (本地: Chain ID 31337)</li>
              <li>点击 "铸造测试 NFT" 按钮</li>
              <li>在 MetaMask 中确认交易</li>
              <li>等待交易完成，查看结果</li>
            </ol>
            
            <div className="mt-4 p-4 bg-white border-2 border-gray-300 rounded-xl">
              <p className="font-bold mb-2">🌐 本地网络配置:</p>
              <ul className="text-xs font-mono space-y-1">
                <li>• RPC URL: http://127.0.0.1:8545</li>
                <li>• Chain ID: 31337</li>
                <li>• 货币符号: ETH</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

