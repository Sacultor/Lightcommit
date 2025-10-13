interface ContributionData {
  month: string
  contributions: number
}

interface ContributionChartProps {
  data?: ContributionData[]
}

export function ContributionChart({ data = [] }: ContributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">贡献趋势</h3>
        <div className="text-center text-gray-500 py-8">
          暂无贡献数据
        </div>
      </div>
    )
  }

  const maxContributions = Math.max(...data.map(d => d.contributions))
  const totalContributions = data.reduce((sum, d) => sum + d.contributions, 0)
  const averageContributions = Math.round(totalContributions / data.length)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">贡献趋势</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 w-8">{item.month}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(item.contributions / maxContributions) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-8">{item.contributions}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>总计: {totalContributions} 次贡献</span>
          <span>平均: {averageContributions} 次/月</span>
        </div>
      </div>
    </div>
  )
}