/**
 * Next.js 根布局组件
 * 
 * 功能：
 * - 定义全局 HTML 结构
 * - 配置字体（Inter from Google Fonts）
 * - 设置 SEO 元数据（title, description）
 * - 包裹全局 Providers（RainbowKit, Web3, Toast）
 * 
 * 特点：
 * - 服务端组件（支持 SEO）
 * - 中文语言设置（lang="zh-CN"）
 * - 全局字体应用（Inter）
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// 配置 Inter 字体（Google Fonts）
const inter = Inter({ subsets: ['latin'] });

// SEO 元数据配置
export const metadata: Metadata = {
  title: 'LightCommit',
  description: '将每一次代码贡献铸造成 NFT，让你的开源之路永久记录在区块链上',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // HTML 根元素，设置语言为中文
    <html lang="zh-CN">
      {/* Body 应用 Inter 字体 */}
      <body className={inter.className}>
        {/* 包裹全局 Providers（RainbowKit, Web3Provider, Toaster） */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
