'use client';

import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/auth.service';
import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'landing' | 'dashboard';
  showBorder?: boolean;
  children?: ReactNode;
}

export default function Navbar({ variant = 'landing', showBorder = true, children }: NavbarProps) {
  const isLanding = variant === 'landing';
  const isDashboard = variant === 'dashboard';
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await AuthService.getUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleDiscoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const handleProfilesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/api/auth/github';
      return;
    }
    router.push('/profiles');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          .main-card {
            position: relative;
          }
          
          .main-card::before {
            content: '';
            position: absolute;
            bottom: -20px;
            left: -20px;
            width: 60px;
            height: 60px;
            border-bottom-left-radius: 60px;
            border: 2px solid black;
            border-top: none;
            border-right: none;
            background: transparent;
            z-index: -1;
          }
          
          .main-card::after {
            content: '';
            position: absolute;
            top: -20px;
            right: -20px;
            width: 60px;
            height: 60px;
            border-top-right-radius: 60px;
            border: 2px solid black;
            border-bottom: none;
            border-left: none;
            background: transparent;
            z-index: -1;
          }
        `,
      }} />

      <nav className={cn(
        'relative z-10',
        isLanding ? 'bg-transparent' : 'border-b border-gray-200/20 shadow-sm',
        isDashboard && 'bg-gray-300/30 backdrop-blur-[27px]',
      )}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className={`flex items-center space-x-3 ${isDashboard ? 'flex-1' : ''}`}>
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="Lightcommit Logo"
                  width={37}
                  height={30}
                  priority
                  className="object-contain"
                />
              </div>
              <span onClick={() => router.push('/')} className="text-xl font-normal text-[#111111] uppercase leading-20 cursor-pointer">
                Lightcommit
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-12">
              <button onClick={handleDiscoverClick} className="text-gray-900 font-extralight text-2xl hover:text-gray-600 transition-colors cursor-pointer">
                Discover
              </button>
              <button onClick={handleProfilesClick} className="text-gray-900 font-extralight text-2xl hover:text-gray-600 transition-colors cursor-pointer">
                Profiles
              </button>
              <a href="#docs" className="text-gray-900 font-extralight text-2xl hover:text-gray-600 transition-colors cursor-pointer">
                Docs
              </a>
            </div>

            {/* Right Section */}
            <div className={`flex items-center ${isDashboard ? 'justify-end space-x-4 flex-1' : ''}`}>
              {isDashboard ? (
                <>
                  {/* 通知按钮 */}
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    </svg>
                  </button>

                  {/* 用户头像 */}
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full border-2 border-white shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer" />
                </>
              ) : (
                /* CTA Button */
                <a href="/api/auth/github" className="px-6 py-2.5 border-2 border-black rounded-[39px] backdrop-blur-[13.591px] bg-[rgba(220,220,220,0.3)] hover:bg-[rgba(220,220,220,0.4)] transition-all duration-200 font-normal text-black text-[18px]">
                  <span className="decoration-solid">Start with GitHub</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom border line - now integrated within navbar */}
        {showBorder && (
          <div className="w-9/10 mx-auto border-b-2 border-black"></div>
        )}
      </nav>

      {/* Children content */}
      {children}
    </div>
  );
}
