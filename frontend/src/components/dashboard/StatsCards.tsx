import { StatCard } from './StatCard'

interface StatsCardsProps {
  data?: Array<{
    title: string
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
    icon: string
  }>
}

export function StatsCards({ data = [] }: StatsCardsProps) {
  if (data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          暂无统计数据
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}