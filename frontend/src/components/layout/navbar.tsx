import Image from 'next/image';
import { ReactNode } from 'react';

interface NavbarProps {
  variant?: 'landing' | 'dashboard';
  showBorder?: boolean;
  children?: ReactNode;
}

export default function Navbar({ variant = 'landing', showBorder = true, children }: NavbarProps) {
  const isLanding = variant === 'landing';
  const isDashboard = variant === 'dashboard';

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

      <nav className={`relative z-10 ${isLanding ? 'bg-transparent' : 'border-b border-gray-200/20 shadow-sm'} ${isDashboard ? 'bg-gray-300/30 backdrop-blur-[27px]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className={`flex items-center space-x-3 ${isDashboard ? 'flex-1' : ''}`}>
              {isLanding ? (
                <>
                  <div className="w-[37px] h-[30px] relative">
                    <Image
                      src="/logo.png"
                      alt="Lightcommit Logo"
                      width={37}
                      height={30}
                      priority
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[20px] font-normal text-[#111111] uppercase leading-[80px]">
                    Lightcommit
                  </span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">L</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Lightcommit</span>
                </>
              )}
            </div>

            {/* Navigation Links */}
            <div className={`flex items-center ${isDashboard ? 'justify-center flex-1' : 'space-x-12'}`}>
              {isDashboard ? (
                <div className="hidden md:flex items-center space-x-10">
                  <a href="#" className="text-gray-900 font-extralight hover:text-gray-600 transition-colors duration-200 relative group font-sans">
                    Discover
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
                  </a>
                  <a href="#" className="text-gray-600 font-extralight hover:text-gray-900 transition-colors duration-200 relative group font-sans">
                    Profiles
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
                  </a>
                  <a href="#" className="text-gray-600 font-extralight hover:text-gray-900 transition-colors duration-200 relative group font-sans">
                    Docs
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
                  </a>
                </div>
              ) : (
                <>
                  <a href="#discover" className="text-gray-900 font-extralight text-2xl hover:text-gray-600 transition-colors">
                    Discover
                  </a>
                  <a href="#profiles" className="text-gray-900 font-extralight text-[27px] hover:text-gray-600 transition-colors">
                    Profiles
                  </a>
                  <a href="#docs" className="text-gray-900 font-extralight text-[27px] hover:text-gray-600 transition-colors">
                    Docs
                  </a>
                </>
              )}
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
                <button className="px-6 py-2.5 border-2 border-black rounded-[39px] backdrop-blur-[13.591px] bg-[rgba(220,220,220,0.3)] hover:bg-[rgba(220,220,220,0.4)] transition-all duration-200 font-normal text-black text-[18px]">
                  <span className="decoration-solid">Start with GitHub</span>
                </button>
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
