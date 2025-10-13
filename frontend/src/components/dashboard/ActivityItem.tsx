export interface ActivityItemProps {
  type: 'commit' | 'nft' | 'pr' | 'issue'
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'failed'
}

export function ActivityItem({ type, title, description, time, status }: ActivityItemProps) {
  const typeIcons = {
    commit: '📝',
    nft: '🎨',
    pr: '🔀',
    issue: '🐛'
  }

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    completed: '已完成',
    pending: '进行中',
    failed: '失败'
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="text-2xl">{typeIcons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{time}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>
    </div>
  )
}