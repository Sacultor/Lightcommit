/**
 * 全局 Providers 组件
 * 
 * 功能：
 * - 包裹所有需要的 Context Providers
 * - 配置全局 Toast 通知
 * - 提供 Web3 和钱包连接能力
 * 
 * Provider 层级结构：
 * RainbowKitProvider (最外层)
 *   └─ Web3Provider (适配 RainbowKit 到 Web3Context)
 *       └─ children (应用页面)
 *       └─ Toaster (全局 Toast 通知)
 * 
 * 注意：
 * - 必须标记为 'use client'（包含客户端逻辑）
 * - 在 layout.tsx 中被引用
 * - 所有子页面都可以使用 useWeb3() hook
 */
'use client';

import { Toaster } from 'react-hot-toast';
import { RainbowKitProvider } from '@/lib/contexts/RainbowKitProvider';
import { Web3Provider } from '@/lib/contexts/Web3Context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // 1. RainbowKitProvider：提供钱包连接 UI 和 Wagmi 配置
    <RainbowKitProvider>
      {/* 2. Web3Provider：适配 RainbowKit/Wagmi 到自定义 Web3Context */}
      <Web3Provider>
        {/* 3. 渲染应用页面 */}
        {children}
        
        {/* 4. 全局 Toast 通知组件 */}
        <Toaster
          position="top-right"              // 显示位置：右上角
          toastOptions={{
            style: {
              background: '#1f2937',        // 深灰色背景
              color: '#fff',                // 白色文字
              border: '1px solid #374151',  // 灰色边框
            },
          }}
        />
      </Web3Provider>
    </RainbowKitProvider>
  );
}

