'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function TestRainbowKitPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-black mb-4">
            RainbowKit 钱包连接测试
          </h1>
          <p className="text-gray-600">
            测试 RainbowKit 是否正常工作
          </p>
        </div>

        <div className="bg-white border-[3px] border-black rounded-2xl p-8 text-center"
          style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.8)' }}>
          
          <div className="mb-6">
            <ConnectButton />
          </div>

          <div className="h-px bg-black my-6" />

          <div className="text-left space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">连接状态:</span>
              <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? '✅ 已连接' : '❌ 未连接'}
              </span>
            </div>

            {address && (
              <div className="flex justify-between">
                <span className="text-gray-600">钱包地址:</span>
                <span className="font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-bold mb-2">💡 使用说明:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>点击上方的 "Connect Wallet" 按钮</li>
            <li>选择 MetaMask</li>
            <li>在 MetaMask 弹窗中点击"连接"</li>
            <li>连接成功后会显示地址</li>
          </ol>
        </div>

        <div className="text-center">
          <a
            href="/erc8004/contributions"
            className="inline-block px-8 py-3 bg-black text-white rounded-2xl font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all"
          >
            前往 ERC8004 贡献页面
          </a>
        </div>
      </div>
    </div>
  );
}

