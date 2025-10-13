import { Button } from './ui/button'
import { Home, Layers, Clock, Calendar, Settings, HelpCircle } from 'lucide-react'

export function Sidebar() {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Layers, label: 'Repositories', active: false },
    { icon: Clock, label: 'Recent', active: false },
    { icon: Calendar, label: 'Calendar', active: false },
    { icon: Settings, label: 'Settings', active: false },
    { icon: HelpCircle, label: 'Help', active: false },
  ]

  return (
    <aside className="w-16 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col items-center py-6 space-y-4">
      {/* Logo/Brand */}
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
        <span className="text-white font-bold text-sm">LC</span>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex flex-col space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              size="icon"
              className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'bg-gray-900 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}