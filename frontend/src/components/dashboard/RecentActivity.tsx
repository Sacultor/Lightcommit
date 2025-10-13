import { ActivityItem, type ActivityItemProps } from './ActivityItem'

interface RecentActivityProps {
  activities?: ActivityItemProps[]
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无活动记录
          </div>
        ) : (
          activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))
        )}
      </div>
    </div>
  )
}