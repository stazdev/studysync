import React from 'react'
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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()

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

  const recentMaterials = [
    { title: 'Calculus Chapter 5', type: 'PDF', date: '2 hours ago', progress: 85 },
    { title: 'Biology Notes', type: 'Text', date: '1 day ago', progress: 60 },
    { title: 'Chemistry Lab Report', type: 'PDF', date: '3 days ago', progress: 100 },
  ]

  const activeGroups = [
    { name: 'Advanced Mathematics', members: 12, nextSession: 'Today 3:00 PM' },
    { name: 'Organic Chemistry', members: 8, nextSession: 'Tomorrow 10:00 AM' },
  ]

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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Study Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
            <Users className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Quiz Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Study Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12h</p>
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
            {recentMaterials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{material.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{material.type} • {material.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${material.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{material.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Study Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Study Groups</h3>
          <div className="space-y-4">
            {activeGroups.map((group, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{group.members} members</span>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {group.nextSession}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Study Buddy Widget */}
      <StudyBuddyWidget />
    </div>
  )
}