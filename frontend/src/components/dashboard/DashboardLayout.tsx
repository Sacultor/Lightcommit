import { ReactNode } from 'react';
import Navbar from '@/components/layout/navbar';

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Top Navigation - 使用统一的Navbar组件 */}
      <Navbar variant="dashboard" showBorder={true} />

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
