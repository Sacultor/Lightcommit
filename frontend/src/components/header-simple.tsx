'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github, Wallet, LogOut } from 'lucide-react';
import { useState } from 'react';
import { ConnectWalletModal } from './connect-wallet-modal';
import { useWeb3 } from '@/lib/contexts/Web3Context';

export function HeaderSimple() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const pathname = usePathname();
  const { account, isConnected, disconnect } = useWeb3();

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'EXPLORE', href: '/explore' },
    { label: 'ABOUT US', href: '/#about' },
    { label: 'ROADMAP', href: '/roadmap' },
    { label: 'GALLERY', href: '/collections' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return pathname === '/';
    return pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F1E8] border-b border-black/10">
      <nav className="container mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="md:hidden flex-1" />
          
          <div className="hidden md:flex items-center space-x-16 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-black font-bold text-lg tracking-wide transition-all relative ${
                  isActive(item.href) 
                    ? 'after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[3px] after:bg-black' 
                    : 'hover:opacity-60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isConnected ? (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black rounded-[39px] bg-white hover:bg-gray-50 transition-all duration-200 font-bold text-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black rounded-[39px] bg-red-400 hover:bg-red-500 transition-all duration-200 font-bold text-white text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                </button>
                <button
                  onClick={disconnect}
                  className="inline-flex items-center justify-center p-2.5 border-2 border-black rounded-full bg-white hover:bg-gray-100 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  title="断开连接"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {process.env.NEXT_PUBLIC_SUPABASE_URL && 
             !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') && (
              <a
                href="/api/auth/github"
                className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black rounded-[39px] bg-[rgba(220,220,220,0.3)] hover:bg-[rgba(220,220,220,0.5)] transition-all duration-200 font-bold text-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
              >
                <Github className="w-5 h-5" />
                <span>Start with GitHub</span>
              </a>
            )}
          </div>

          <button
            className="md:hidden text-black z-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-8 pb-6 space-y-6 border-t border-black/10 pt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-black font-bold text-lg tracking-wide ${
                  isActive(item.href) ? 'underline underline-offset-4' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isConnected ? (
              <button
                onClick={() => {
                  setWalletModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-black rounded-[39px] bg-white font-bold text-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setWalletModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-black rounded-[39px] bg-red-400 font-bold text-white text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                </button>
                <button
                  onClick={() => {
                    disconnect();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center p-3 border-2 border-black rounded-full bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="断开连接"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            {process.env.NEXT_PUBLIC_SUPABASE_URL && 
             !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') && (
              <a
                href="/api/auth/github"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-black rounded-[39px] bg-[rgba(220,220,220,0.3)] font-bold text-black text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Github className="w-5 h-5" />
                <span>Start with GitHub</span>
              </a>
            )}
          </div>
        )}
      </nav>

      <ConnectWalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </header>
  );
}

