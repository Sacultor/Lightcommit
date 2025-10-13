import { Card } from './ui/card'
import { Avatar } from './ui/avatar'

interface UserCardProps {
  user?: {
    name: string
    avatar?: string
    repositories: number
    commits: number
  }
}

export function UserCard({ user }: UserCardProps) {
  const defaultUser = {
    name: "Frederick",
    repositories: 5,
    commits: 1200,
    avatar: undefined
  }

  const userData = user || defaultUser

  return (
    <div className="w-80 p-6">
      <Card className="p-6 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 text-white border-0 shadow-xl">
        <div className="space-y-6">
          {/* User Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
              {userData.avatar ? (
                <Avatar className="w-20 h-20">
                  <img src={userData.avatar} alt={userData.name} />
                </Avatar>
              ) : (
                <div className="w-full h-full bg-black rounded-full" />
              )}
            </div>
          </div>

          {/* User Name */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {userData.name}
            </h2>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-white/90 text-sm">
                {userData.repositories} repositories synced
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-white/90 text-sm">
                Total {userData.commits} commits
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}