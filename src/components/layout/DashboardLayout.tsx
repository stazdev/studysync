import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../contexts/ProfileContext'
import { notificationService } from '../../services/notificationService'
import { statsService } from '../../services/statsService'
import { Avatar } from '../ui/Avatar'
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
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [userStats, setUserStats] = React.useState<any>({})
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const location = useLocation()

  // Load notifications and stats
  React.useEffect(() => {
    if (user) {
      loadNotifications()
      loadUserStats()
      
      // Subscribe to real-time notifications
      const subscription = notificationService.subscribeToNotifications((notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
      })

      return () => {
        notificationService.unsubscribeFromNotifications(subscription)
      }
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ])

      // Transform database notifications to UI format
      const transformedNotifications = notificationsData.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        time: formatTimeAgo(new Date(notification.created_at)),
        unread: !notification.is_read,
        type: notification.type as any,
        actionUrl: notification.action_url || undefined,
        actionLabel: notification.action_label || undefined,
        avatar: getNotificationAvatar(notification.type),
        priority: notification.priority as any
      }))

      setNotifications(transformedNotifications)
      setUnreadCount(unreadCountData)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadUserStats = async () => {
    try {
      const stats = await statsService.getUserStats()
      setUserStats(stats)
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const getNotificationAvatar = (type: string) => {
    switch (type) {
      case 'quiz': return '🧬'
      case 'group': return '👩‍🏫'
      case 'session': return '📹'
      case 'achievement': return '🏆'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '📢'
    }
  }

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

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(notification => ({ ...notification, unread: false })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification?.unread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
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

  const displayNotifications = showAllNotifications ? notifications : notifications.slice(0, 5)

  // Get user display info
  const userDisplayName = profile?.full_name || profile?.username || user?.fullName || 'User'
  const userInitials = userDisplayName[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
  const userProfileImage = profile?.profile_image_url || user?.avatarUrl

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
              <Avatar
                src={userProfileImage}
                fallback={userInitials}
                size="md"
                className="shadow-lg"
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {userDisplayName}
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
                <Avatar
                  src={userProfileImage}
                  fallback={userInitials}
                  size="sm"
                  className="shadow-sm"
                />
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-slide-up">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={userProfileImage}
                        fallback={userInitials}
                        size="md"
                        className="shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {userDisplayName}
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