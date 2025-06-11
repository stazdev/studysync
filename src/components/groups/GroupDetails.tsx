import React, { useState } from 'react'
import { 
  X, 
  Users, 
  Calendar, 
  Star, 
  Crown, 
  Shield, 
  Globe, 
  Lock, 
  UserPlus,
  MessageSquare,
  Video,
  Settings,
  Award,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Zap
} from 'lucide-react'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'

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

interface GroupDetailsProps {
  group: StudyGroup
  onClose: () => void
  onJoin: () => void
  onLeave: () => void
}

export const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  onClose,
  onJoin,
  onLeave
}) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'sessions' | 'materials'>('overview')

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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

  // Mock data for tabs
  const mockMembers = [
    { id: '1', name: 'Sarah Chen', role: 'owner', avatar: '👩‍🏫', joinedAt: '2024-01-15', contributions: 45 },
    { id: '2', name: 'Alex Rodriguez', role: 'moderator', avatar: '👨‍🎓', joinedAt: '2024-01-16', contributions: 32 },
    { id: '3', name: 'Emma Wilson', role: 'member', avatar: '👩‍💼', joinedAt: '2024-01-18', contributions: 28 },
    { id: '4', name: 'Mike Johnson', role: 'member', avatar: '👨‍💻', joinedAt: '2024-01-20', contributions: 15 },
  ]

  const mockSessions = [
    { id: '1', title: 'Integration Techniques', date: '2024-01-25', time: '3:00 PM', type: 'study', status: 'upcoming' },
    { id: '2', title: 'Calculus Quiz Review', date: '2024-01-22', time: '7:00 PM', type: 'quiz', status: 'completed' },
    { id: '3', title: 'Problem Solving Workshop', date: '2024-01-20', time: '4:00 PM', type: 'workshop', status: 'completed' },
  ]

  const mockMaterials = [
    { id: '1', title: 'Calculus Fundamentals.pdf', type: 'pdf', uploadedBy: 'Sarah Chen', uploadedAt: '2024-01-20' },
    { id: '2', title: 'Integration Practice Problems', type: 'quiz', uploadedBy: 'Alex Rodriguez', uploadedAt: '2024-01-19' },
    { id: '3', title: 'Derivative Rules Cheat Sheet', type: 'document', uploadedBy: 'Emma Wilson', uploadedAt: '2024-01-18' },
  ]

  const handleJoinSession = () => {
    navigate(`/session/${group.id}`)
  }

  const handleOpenChat = () => {
    navigate(`/chat/${group.id}`)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              {group.avatar || '📚'}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">{group.name}</h2>
                {group.role && (
                  <div className="flex items-center space-x-1">
                    {group.role === 'owner' && <Crown className="w-5 h-5 text-yellow-300" />}
                    {group.role === 'moderator' && <Shield className="w-5 h-5 text-blue-300" />}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 text-primary-100 mb-3">
                <div className="flex items-center space-x-1">
                  <PrivacyIcon className="w-4 h-4" />
                  <span className="text-sm capitalize">{group.privacy}</span>
                </div>
                <span>•</span>
                <span className="text-sm">{group.subject}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/20`}>
                  {group.difficulty}
                </span>
              </div>
              <p className="text-primary-100 mb-4">{group.description}</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{group.memberCount}</div>
                  <div className="text-xs text-primary-200">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{group.stats.totalSessions}</div>
                  <div className="text-xs text-primary-200">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{group.stats.avgRating.toFixed(1)}</div>
                  <div className="text-xs text-primary-200">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{group.stats.completionRate}%</div>
                  <div className="text-xs text-primary-200">Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            {group.isJoined ? (
              <>
                <Button 
                  className="bg-white text-primary-600 hover:bg-gray-100"
                  onClick={handleOpenChat}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button 
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  onClick={handleJoinSession}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Session
                </Button>
                {group.role === 'owner' && (
                  <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                )}
                <Button
                  onClick={onLeave}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Leave Group
                </Button>
              </>
            ) : (
              <Button
                onClick={onJoin}
                className="bg-white text-primary-600 hover:bg-gray-100"
                disabled={group.memberCount >= group.maxMembers}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {group.memberCount >= group.maxMembers ? 'Group Full' : 'Join Group'}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'materials', label: 'Materials', icon: Target }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Next Session */}
              {group.nextSession && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Next Session</h3>
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{group.nextSession.topic}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{group.nextSession.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{group.nextSession.time}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={handleJoinSession}>
                        <Video className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Group Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Group Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created by:</span>
                    <span className="ml-2 font-medium">{group.createdBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">{new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last activity:</span>
                    <span className="ml-2 font-medium">{group.lastActivity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Member limit:</span>
                    <span className="ml-2 font-medium">{group.maxMembers}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {mockMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{member.name}</span>
                        {member.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" />}
                        {member.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="text-sm text-gray-600">
                        Joined {new Date(member.joinedAt).toLocaleDateString()} • {member.contributions} contributions
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.role === 'owner' ? 'bg-yellow-100 text-yellow-700' :
                    member.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {mockSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{session.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{session.date}</span>
                      <span>•</span>
                      <span>{session.time}</span>
                      <span>•</span>
                      <span className="capitalize">{session.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      session.status === 'live' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {session.status}
                    </span>
                    {session.status === 'upcoming' && (
                      <Button size="sm" onClick={handleJoinSession}>
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              {mockMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {material.type === 'pdf' && <BookOpen className="w-5 h-5 text-red-600" />}
                      {material.type === 'quiz' && <Zap className="w-5 h-5 text-yellow-600" />}
                      {material.type === 'document' && <Target className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{material.title}</h4>
                      <div className="text-sm text-gray-600">
                        By {material.uploadedBy} • {new Date(material.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}