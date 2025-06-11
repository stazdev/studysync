import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Star, 
  MessageSquare, 
  Video, 
  BookOpen, 
  Settings,
  Crown,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Globe,
  Lock,
  MapPin,
  TrendingUp,
  Award,
  Zap,
  Target,
  ChevronRight,
  Users2,
  Brain,
  Timer,
  CheckCircle
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { CreateGroupModal } from '../components/groups/CreateGroupModal'
import { GroupCard } from '../components/groups/GroupCard'
import { GroupDetails } from '../components/groups/GroupDetails'
import { JoinGroupModal } from '../components/groups/JoinGroupModal'

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

interface StudySession {
  id: string
  groupId: string
  title: string
  description: string
  scheduledFor: string
  duration: number
  type: 'study' | 'quiz' | 'discussion' | 'presentation'
  status: 'upcoming' | 'live' | 'completed'
  participants: number
  maxParticipants: number
}

export const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'sessions'>('my-groups')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [mySessions, setMySessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - in real app, this would come from your backend
  useEffect(() => {
    const mockGroups: StudyGroup[] = [
      {
        id: '1',
        name: 'Advanced Calculus Study Circle',
        description: 'Deep dive into calculus concepts with problem-solving sessions and peer teaching.',
        subject: 'Mathematics',
        difficulty: 'Advanced',
        privacy: 'public',
        memberCount: 15,
        maxMembers: 20,
        createdBy: 'Dr. Sarah Chen',
        createdAt: '2024-01-15',
        lastActivity: '2 hours ago',
        tags: ['Calculus', 'Problem Solving', 'Peer Teaching'],
        nextSession: {
          date: '2024-01-25',
          time: '3:00 PM',
          topic: 'Integration Techniques'
        },
        stats: {
          totalSessions: 24,
          avgRating: 4.8,
          completionRate: 92
        },
        isJoined: true,
        role: 'member',
        avatar: '📐'
      },
      {
        id: '2',
        name: 'Organic Chemistry Lab Partners',
        description: 'Collaborative study group for organic chemistry with virtual lab sessions.',
        subject: 'Chemistry',
        difficulty: 'Intermediate',
        privacy: 'invite-only',
        memberCount: 8,
        maxMembers: 12,
        createdBy: 'Alex Rodriguez',
        createdAt: '2024-01-10',
        lastActivity: '1 day ago',
        tags: ['Organic Chemistry', 'Lab Work', 'Mechanisms'],
        nextSession: {
          date: '2024-01-26',
          time: '7:00 PM',
          topic: 'Reaction Mechanisms'
        },
        stats: {
          totalSessions: 18,
          avgRating: 4.6,
          completionRate: 88
        },
        isJoined: true,
        role: 'moderator',
        avatar: '🧪'
      },
      {
        id: '3',
        name: 'Python Programming Bootcamp',
        description: 'Learn Python from basics to advanced concepts with hands-on coding sessions.',
        subject: 'Computer Science',
        difficulty: 'Beginner',
        privacy: 'public',
        memberCount: 32,
        maxMembers: 50,
        createdBy: 'Mike Johnson',
        createdAt: '2024-01-05',
        lastActivity: '30 minutes ago',
        tags: ['Python', 'Programming', 'Coding', 'Beginner Friendly'],
        nextSession: {
          date: '2024-01-24',
          time: '6:00 PM',
          topic: 'Object-Oriented Programming'
        },
        stats: {
          totalSessions: 35,
          avgRating: 4.9,
          completionRate: 95
        },
        isJoined: false,
        avatar: '🐍'
      },
      {
        id: '4',
        name: 'World History Discussion Forum',
        description: 'Explore historical events and their impact through engaging discussions.',
        subject: 'History',
        difficulty: 'Intermediate',
        privacy: 'public',
        memberCount: 22,
        maxMembers: 30,
        createdBy: 'Prof. Emma Wilson',
        createdAt: '2024-01-12',
        lastActivity: '4 hours ago',
        tags: ['World History', 'Discussions', 'Critical Thinking'],
        stats: {
          totalSessions: 16,
          avgRating: 4.7,
          completionRate: 85
        },
        isJoined: false,
        avatar: '🏛️'
      },
      {
        id: '5',
        name: 'Physics Problem Solvers',
        description: 'Tackle challenging physics problems together with step-by-step solutions.',
        subject: 'Physics',
        difficulty: 'Advanced',
        privacy: 'public',
        memberCount: 18,
        maxMembers: 25,
        createdBy: 'Dr. James Park',
        createdAt: '2024-01-08',
        lastActivity: '6 hours ago',
        tags: ['Physics', 'Problem Solving', 'Quantum Mechanics'],
        nextSession: {
          date: '2024-01-27',
          time: '4:00 PM',
          topic: 'Quantum Mechanics Fundamentals'
        },
        stats: {
          totalSessions: 28,
          avgRating: 4.8,
          completionRate: 90
        },
        isJoined: true,
        role: 'owner',
        avatar: '⚛️'
      }
    ]

    const mockSessions: StudySession[] = [
      {
        id: 'session-1',
        groupId: '1',
        title: 'Integration Techniques Workshop',
        description: 'Hands-on practice with various integration methods',
        scheduledFor: '2024-01-25T15:00:00',
        duration: 90,
        type: 'study',
        status: 'upcoming',
        participants: 12,
        maxParticipants: 20
      },
      {
        id: 'session-2',
        groupId: '2',
        title: 'Organic Reactions Quiz',
        description: 'Test your knowledge of organic reaction mechanisms',
        scheduledFor: '2024-01-26T19:00:00',
        duration: 60,
        type: 'quiz',
        status: 'upcoming',
        participants: 8,
        maxParticipants: 12
      },
      {
        id: 'session-3',
        groupId: '5',
        title: 'Quantum Physics Live Session',
        description: 'Interactive discussion on quantum mechanics principles',
        scheduledFor: '2024-01-24T18:00:00',
        duration: 120,
        type: 'discussion',
        status: 'live',
        participants: 15,
        maxParticipants: 25
      }
    ]

    setStudyGroups(mockGroups)
    setMySessions(mockSessions)
    setLoading(false)
  }, [])

  const subjects = ['all', 'Mathematics', 'Chemistry', 'Physics', 'Computer Science', 'History', 'Biology', 'Literature']
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced']

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject
    const matchesDifficulty = selectedDifficulty === 'all' || group.difficulty === selectedDifficulty
    
    if (activeTab === 'my-groups') {
      return matchesSearch && matchesSubject && matchesDifficulty && group.isJoined
    }
    return matchesSearch && matchesSubject && matchesDifficulty
  })

  const myGroups = studyGroups.filter(group => group.isJoined)
  const upcomingSessions = mySessions.filter(session => session.status === 'upcoming')
  const liveSessions = mySessions.filter(session => session.status === 'live')

  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: true, memberCount: group.memberCount + 1, role: 'member' }
        : group
    ))
  }

  const handleLeaveGroup = (groupId: string) => {
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: false, memberCount: group.memberCount - 1, role: undefined }
        : group
    ))
  }

  const handleJoinSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`)
  }

  const handleJoinLiveSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`)
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Study Groups</h1>
              <p className="text-primary-100">Join collaborative learning communities and study together</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">My Groups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myGroups.length}</p>
            </div>
            <Users2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Live Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{liveSessions.length}</p>
            </div>
            <Video className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingSessions.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Study Hours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24h</p>
            </div>
            <Clock className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
        </div>
      </div>

      {/* Live Sessions Alert */}
      {liveSessions.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200">Live Sessions Active</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {liveSessions.length} study session{liveSessions.length > 1 ? 's' : ''} currently in progress
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
              onClick={() => handleJoinLiveSession(liveSessions[0].id)}
            >
              Join Now
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'my-groups', label: 'My Groups', icon: Users },
          { id: 'discover', label: 'Discover', icon: Search },
          { id: 'sessions', label: 'Sessions', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search and Filters */}
      {(activeTab === 'discover' || activeTab === 'my-groups') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search groups by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'sessions' ? (
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
              Upcoming Sessions
            </h3>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const group = studyGroups.find(g => g.id === session.groupId)
                  return (
                    <div key={session.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{group?.avatar}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{session.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{group?.name}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">{session.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(session.scheduledFor).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(session.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Timer className="w-4 h-4" />
                              <span>{session.duration} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{session.participants}/{session.maxParticipants}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.type === 'study' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            session.type === 'quiz' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            session.type === 'discussion' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          }`}>
                            {session.type}
                          </span>
                          <Button 
                            size="sm"
                            onClick={() => handleJoinSession(session.id)}
                          >
                            Join Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No upcoming sessions</p>
              </div>
            )}
          </div>

          {/* Live Sessions */}
          {liveSessions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Video className="w-5 h-5 mr-2 text-red-600" />
                Live Sessions
                <span className="ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </h3>
              <div className="space-y-4">
                {liveSessions.map((session) => {
                  const group = studyGroups.find(g => g.id === session.groupId)
                  return (
                    <div key={session.id} className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{group?.avatar}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{session.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{group?.name}</p>
                            </div>
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                              LIVE
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">{session.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{session.participants} active</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Timer className="w-4 h-4" />
                              <span>{session.duration} min session</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleJoinLiveSession(session.id)}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Live
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Groups Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={() => handleJoinGroup(group.id)}
              onLeave={() => handleLeaveGroup(group.id)}
              onViewDetails={() => setSelectedGroup(group)}
            />
          ))}
          
          {filteredGroups.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No groups found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {activeTab === 'my-groups' 
                  ? "You haven't joined any groups yet. Discover groups to get started!"
                  : "No groups match your search criteria. Try adjusting your filters."
                }
              </p>
              {activeTab === 'my-groups' && (
                <Button onClick={() => setActiveTab('discover')}>
                  Discover Groups
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={(group) => {
            setStudyGroups(prev => [...prev, { ...group, isJoined: true, role: 'owner' }])
            setShowCreateModal(false)
          }}
        />
      )}

      {showJoinModal && selectedGroup && (
        <JoinGroupModal
          group={selectedGroup}
          onClose={() => {
            setShowJoinModal(false)
            setSelectedGroup(null)
          }}
          onJoin={() => {
            handleJoinGroup(selectedGroup.id)
            setShowJoinModal(false)
            setSelectedGroup(null)
          }}
        />
      )}

      {selectedGroup && !showJoinModal && (
        <GroupDetails
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onJoin={() => {
            if (selectedGroup.privacy === 'invite-only') {
              setShowJoinModal(true)
            } else {
              handleJoinGroup(selectedGroup.id)
              setSelectedGroup(null)
            }
          }}
          onLeave={() => {
            handleLeaveGroup(selectedGroup.id)
            setSelectedGroup(null)
          }}
        />
      )}
    </div>
  )
}