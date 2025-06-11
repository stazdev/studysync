import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  GraduationCap, 
  Home, 
  Upload, 
  Users, 
  User, 
  Bell, 
  LogOut,
  Menu,
  X,
  Settings,
  HelpCircle,
  ChevronDown,
  Search,
  Plus,
  MessageSquare,
  Brain
} from 'lucide-react'
import { Button } from '../ui/Button'

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = React.useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Upload Content', href: '/upload', icon: Upload },
    { name: 'Study Groups', href: '/groups', icon: Users },
    { name: 'Take Quiz', href: '/quiz', icon: Brain },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const quickActions = [
    { name: 'New Study Group', icon: Users, action: () => navigate('/groups') },
    { name: 'Upload Material', icon: Upload, action: () => navigate('/upload') },
    { name: 'Start Quiz', icon: Brain, action: () => navigate('/quiz') },
  ]

  const notifications = [
    { id: 1, title: 'New quiz available', message: 'Biology Chapter 5 quiz is ready', time: '2 min ago', unread: true },
    { id: 2, title: 'Study group invitation', message: 'You were invited to Advanced Math group', time: '1 hour ago', unread: true },
    { id: 3, title: 'Study reminder', message: 'Time to review Chemistry notes', time: '3 hours ago', unread: false },
  ]

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setProfileDropdownOpen(false)
        setNotificationDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Starts from top, positioned first */}
      <div className={`
        fixed top-0 left-0 bottom-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-xl mr-3 shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                StudySync
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.name}
                    onClick={action.action}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    title={action.name}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center leading-tight">{action.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        navigate(item.href)
                        setSidebarOpen(false)
                      }}
                      className={`
                        w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group
                        ${isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.user_metadata?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Header - Positioned to not overlap sidebar */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Left side - Mobile menu and logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo - visible on mobile */}
            <div className="flex items-center lg:hidden">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-xl mr-3 shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                StudySync
              </span>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search materials, groups..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600"
              />
            </div>
          </div>

          {/* Right side - Actions and Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Create Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center space-x-2 border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20"
              onClick={() => navigate('/upload')}
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </Button>

            {/* Notifications Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {notifications.some(n => n.unread) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-slide-up">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                    <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium text-sm">
                    {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-slide-up">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-medium">
                          {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user?.user_metadata?.username || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate('/preferences')
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Preferences
                    </button>
                    <button
                      onClick={() => {
                        navigate('/feedback')
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-3" />
                      Feedback
                    </button>
                    <button
                      onClick={() => {
                        navigate('/help')
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 mr-3" />
                      Help & Support
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Adjusted for fixed header and sidebar */}
      <div className="pt-16 lg:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}