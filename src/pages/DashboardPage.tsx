import React, { useEffect, useState } from 'react'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock,
  Plus,
  Play,
  Star,
  Calendar,
  Brain
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { StudyBuddyWidget } from '../components/study-buddy/StudyBuddyWidget'
import { useNavigate } from 'react-router-dom'
import { statsService } from '../services/statsService'
import { uploadService } from '../services/uploadService'
import { groupService } from '../services/groupService'
import { useAuth } from '../contexts/AuthContext'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<any>({})
  const [recentMaterials, setRecentMaterials] = useState<any[]>([])
  const [userGroups, setUserGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [stats, materials, groups] = await Promise.all([
        statsService.getUserStats(),
        uploadService.getUserMaterials(user!.id),
        groupService.getUserGroups()
      ])

      setUserStats(stats)
      setRecentMaterials(materials.slice(0, 3)) // Show only recent 3
      setUserGroups(groups.slice(0, 2)) // Show only 2 active groups
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Upload New Content',
      description: 'Add PDFs, images, or text to generate AI study materials',
      icon: Plus,
      color: 'bg-primary-500',
      href: '/upload',
    },
    {
      title: 'Join Study Room',
      description: 'Collaborate with others in real-time study sessions',
      icon: Users,
      color: 'bg-secondary-500',
      href: '/groups',
    },
    {
      title: 'Take Quiz',
      description: 'Test your knowledge with AI-generated quizzes',
      icon: Brain,
      color: 'bg-accent-500',
      href: '/quiz',
    },
  ]

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than an hour ago'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-primary-100 text-lg">Ready to continue your learning journey?</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <div
                key={action.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(action.href)}
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{action.description}</p>
                <Button variant="outline" size="sm">
                  Get Started
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Study Materials</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.materials_uploaded || 0}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Study Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.groups_joined || 0}</p>
            </div>
            <Users className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Quiz Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(userStats.average_quiz_score || 0)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.sessions_attended || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Study Materials */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Study Materials</h3>
          <div className="space-y-4">
            {recentMaterials.length > 0 ? (
              recentMaterials.map((material, index) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{material.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {material.file_type} • {formatTimeAgo(material.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">100%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No study materials yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/upload')}
                >
                  Upload your first material
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active Study Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Study Groups</h3>
          <div className="space-y-4">
            {userGroups.length > 0 ? (
              userGroups.map((group, index) => (
                <div key={group.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{group.member_count} members</span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No study groups yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/groups')}
                >
                  Join your first group
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Study Buddy Widget */}
      <StudyBuddyWidget />
    </div>
  )
}