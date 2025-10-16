import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lightcommit',
  description: 'Own Your Contribution - Build your developer portfolio with verifiable, on-chain proof of your work.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* 全局背景图片 */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/background.png)',
          }}
        />

        {/* 内容容器 - 在背景之上 */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
