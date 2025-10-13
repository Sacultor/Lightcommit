'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    name: '概览',
    href: '/dashboard',
    icon: '📊'
  },
  {
    name: '我的贡献',
    href: '/dashboard/contributions',
    icon: '🔗'
  },
  {
    name: '我的NFT',
    href: '/dashboard/nfts',
    icon: '🎨'
  },
  {
    name: '项目管理',
    href: '/dashboard/projects',
    icon: '📁'
  },
  {
    name: '设置',
    href: '/dashboard/settings',
    icon: '⚙️'
  }
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="px-3 pb-6">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}