function DashboardLayout({ user, menuItems, activeView, onMenuClick, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">Lithic POC</h2>
          <p className="text-sm text-gray-400">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                activeView === item.id ? 'bg-gray-700 border-l-4 border-white' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout