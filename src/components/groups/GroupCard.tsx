import React from 'react'
import { 
  Users, 
  Calendar, 
  Star, 
  Crown, 
  Shield, 
  Globe, 
  Lock, 
  Eye, 
  UserPlus,
  Clock,
  TrendingUp,
  Award,
  MessageSquare
} from 'lucide-react'
import { Button } from '../ui/Button'

interface StudyGroup {
  id: string
  name: string
  description: string
  subject: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  privacy: 'public' | 'private' | 'invite-only'
  memberCount: number
  maxMembers: number
  createdBy: string
  createdAt: string
  lastActivity: string
  tags: string[]
  nextSession?: {
    date: string
    time: string
    topic: string
  }
  stats: {
    totalSessions: number
    avgRating: number
    completionRate: number
  }
  isJoined: boolean
  role?: 'owner' | 'moderator' | 'member'
  avatar?: string
}

interface GroupCardProps {
  group: StudyGroup
  onJoin: () => void
  onLeave: () => void
  onViewDetails: () => void
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onJoin,
  onLeave,
  onViewDetails
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getPrivacyIcon = () => {
    switch (group.privacy) {
      case 'public': return Globe
      case 'private': return Lock
      case 'invite-only': return UserPlus
      default: return Globe
    }
  }

  const PrivacyIcon = getPrivacyIcon()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {group.avatar || '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1 truncate" title={group.name}>
                {group.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{group.subject}</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <PrivacyIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>
          {group.role && (
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              {group.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" />}
              {group.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
            </div>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4" title={group.description}>
          {group.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {group.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs truncate max-w-[80px]"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {group.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
              +{group.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {group.memberCount}/{group.maxMembers}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Members</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {group.stats.avgRating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Rating</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {group.stats.completionRate}%
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(group.difficulty)}`}>
            {group.difficulty}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Active {group.lastActivity}
          </span>
        </div>

        {/* Next Session */}
        {group.nextSession && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Next Session</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 truncate" title={group.nextSession.topic}>
              {group.nextSession.topic}
            </p>
            <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
              <span>{formatDate(group.nextSession.date)}</span>
              <span>•</span>
              <span>{group.nextSession.time}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          {group.isJoined ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              Leave
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onJoin}
              className="flex-1"
              disabled={group.memberCount >= group.maxMembers}
            >
              {group.memberCount >= group.maxMembers ? 'Full' : 'Join'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}