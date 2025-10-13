import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search, Plus, GitBranch, Star, Users, Activity } from 'lucide-react'

interface DashboardContentProps {
  statsData?: Array<{
    title: string
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
    icon: string
  }>
  contributionData?: Array<{
    month: string
    contributions: number
  }>
  activities?: Array<{
    type: 'commit' | 'nft' | 'pr' | 'issue'
    title: string
    description: string
    time: string
    status: 'completed' | 'pending' | 'failed'
  }>
}

export function DashboardContent({ 
  statsData, 
  contributionData, 
  activities 
}: DashboardContentProps) {
  const repositoryCards = [
    {
      title: "Mint a new commit",
      description: "view on github",
      icon: Plus,
      isSpecial: true
    },
    {
      title: "Project Alpha",
      description: "React application",
      icon: GitBranch,
      isSpecial: false
    },
    {
      title: "Web3 Dashboard",
      description: "Next.js project",
      icon: Star,
      isSpecial: false
    },
    {
      title: "Smart Contracts",
      description: "Solidity contracts",
      icon: Users,
      isSpecial: false
    },
    {
      title: "API Gateway",
      description: "Node.js backend",
      icon: Activity,
      isSpecial: false
    },
    {
      title: "Mobile App",
      description: "React Native",
      icon: GitBranch,
      isSpecial: false
    }
  ]

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header with Search */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your repositories..."
            className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200/50 focus:border-gray-300 focus:ring-0"
          />
        </div>
      </div>

      {/* Repository Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositoryCards.map((repo, index) => {
          const Icon = repo.icon
          return (
            <Card 
              key={index}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200/50 ${
                repo.isSpecial 
                  ? 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150' 
                  : 'bg-white/50 backdrop-blur-sm hover:bg-white/80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${
                    repo.isSpecial 
                      ? 'bg-gray-200' 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {repo.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {repo.description}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}