export function UserProfile() {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex flex-col text-right">
        <span className="text-sm font-medium text-gray-900">开发者</span>
        <span className="text-xs text-gray-500">0x1234...5678</span>
      </div>
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">D</span>
      </div>
    </div>
  )
}