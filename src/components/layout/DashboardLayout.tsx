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
  Brain,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Info,
  UserPlus,
  BookOpen,
  Video,
  Zap,
  Target,
  TrendingUp,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '../ui/Button'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'info' | 'success' | 'warning' | 'error' | 'quiz' | 'group' | 'session' | 'achievement'
  actionUrl?: string
  actionLabel?: string
  avatar?: string
  priority: 'low' | 'medium' | 'high'
}

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = React.useState(false)
  const [showAllNotifications, setShowAllNotifications] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize notifications
  React.useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New quiz available',
        message: 'Biology Chapter 5 quiz is ready for you to take. Test your knowledge on cellular respiration and photosynthesis.',
        time: '2 min ago',
        unread: true,
        type: 'quiz',
        actionUrl: '/quiz',
        actionLabel: 'Take Quiz',
        avatar: '🧬',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Study group invitation',
        message: 'You were invited to join "Advanced Math Study Group" by Dr. Sarah Chen. The group focuses on calculus and linear algebra.',
        time: '1 hour ago',
        unread: true,
        type: 'group',
        actionUrl: '/groups',
        actionLabel: 'View Invitation',
        avatar: '👩‍🏫',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Study reminder',
        message: 'Time to review your Chemistry notes. You have a quiz scheduled for tomorrow on organic compounds.',
        time: '3 hours ago',
        unread: false,
        type: 'info',
        actionUrl: '/upload',
        actionLabel: 'Review Notes',
        avatar: '⏰',
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Achievement unlocked!',
        message: 'Congratulations! You\'ve earned the "Study Streak" badge for studying 7 days in a row.',
        time: '5 hours ago',
        unread: false,
        type: 'achievement',
        actionUrl: '/profile',
        actionLabel: 'View Achievements',
        avatar: '🏆',
        priority: 'low'
      },
      {
        id: '5',
        title: 'Live session starting',
        message: 'The "Advanced Calculus Study Session" will begin in 15 minutes. Join now to secure your spot.',
        time: '6 hours ago',
        unread: false,
        type: 'session',
        actionUrl: '/groups',
        actionLabel: 'Join Session',
        avatar: '📹',
        priority: 'high'
      },
      {
        id: '6',
        title: 'Quiz results available',
        message: 'Your Physics Quiz results are ready! You scored 92% - excellent work on electromagnetic fields.',
        time: '1 day ago',
        unread: false,
        type: 'success',
        actionUrl: '/quiz',
        actionLabel: 'View Results',
        avatar: '📊',
        priority: 'medium'
      },
      {
        id: '7',
        title: 'New study material uploaded',
        message: 'Alex Rodriguez shared "Integration Techniques Practice Problems" in your Calculus study group.',
        time: '1 day ago',
        unread: false,
        type: 'info',
        actionUrl: '/groups',
        actionLabel: 'View Material',
        avatar: '📚',
        priority: 'low'
      },
      {
        id: '8',
        title: 'Weekly progress report',
        message: 'Your weekly study report is ready. You completed 5 quizzes and studied for 12 hours this week.',
        time: '2 days ago',
        unread: false,
        type: 'info',
        actionUrl: '/profile',
        actionLabel: 'View Report',
        avatar: '📈',
        priority: 'low'
      }
    ]
    setNotifications(mockNotifications)
  }, [])

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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, unread: false }
        : notification
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, unread: false })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
  }

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      markAsRead(notification.id)
      setNotificationDropdownOpen(false)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'quiz': return Target
      case 'group': return Users
      case 'session': return Video
      case 'achievement': return Award
      case 'success': return CheckCircle
      case 'warning': return AlertCircle
      case 'error': return AlertCircle
      default: return Info
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'quiz': return 'text-blue-600 dark:text-blue-400'
      case 'group': return 'text-purple-600 dark:text-purple-400'
      case 'session': return 'text-green-600 dark:text-green-400'
      case 'achievement': return 'text-yellow-600 dark:text-yellow-400'
      case 'success': return 'text-green-600 dark:text-green-400'
      case 'warning': return 'text-orange-600 dark:text-orange-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      default: return 'text-blue-600 dark:text-blue-400'
    }
  }

  const unreadCount = notifications.filter(n => n.unread).length
  const displayNotifications = showAllNotifications ? notifications : notifications.slice(0, 5)

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
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-slide-up max-h-[80vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNotificationDropdownOpen(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto">
                    {displayNotifications.length > 0 ? (
                      displayNotifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type)
                        return (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-l-4 ${
                              notification.unread 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500' 
                                : 'border-l-transparent'
                            }`}
                            onClick={() => handleNotificationAction(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.avatar ? (
                                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                                    {notification.avatar}
                                  </div>
                                ) : (
                                  <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                )}
                                {notification.unread && (
                                  <div className="w-3 h-3 bg-blue-500 rounded-full -mt-1 ml-7"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className={`text-sm font-medium ${
                                    notification.unread 
                                      ? 'text-gray-900 dark:text-white' 
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {notification.time}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification(notification.id)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                  {notification.message}
                                </p>
                                {notification.actionLabel && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleNotificationAction(notification)
                                    }}
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 5 && (
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                        onClick={() => {
                          setShowAllNotifications(!showAllNotifications)
                        }}
                      >
                        {showAllNotifications ? 'Show less' : `View all ${notifications.length} notifications`}
                      </Button>
                    </div>
                  )}
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