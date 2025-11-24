import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { PersonaSelector } from '../components/profile/PersonaSelector'
import { ProfileImageUpload } from '../components/profile/ProfileImageUpload'
import { StudyBuddyAvatar } from '../components/study-buddy/StudyBuddyAvatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { 
  User, 
  Settings, 
  Sparkles, 
  Save, 
  Camera, 
  Mail, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Trophy, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  Star,
  Users,
  Brain,
  Zap,
  CheckCircle,
  Edit3,
  Shield,
  Bell,
  Eye,
  Lock
} from 'lucide-react'
import { StudyBuddyPersona, studyBuddyPersonas } from '../lib/gemini'
import { useToast } from '../contexts/ToastContext'

export const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfile()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'stats' | 'achievements'>('profile')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [selectedPersona, setSelectedPersona] = useState('professor-synapse')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setFullName(profile.full_name || '')
      setBio(profile.bio || '')
      setLocation(profile.location || '')
      setSelectedPersona(profile.study_buddy_persona || 'professor-synapse')
    }
  }, [profile])

  const handlePersonaSelect = async (persona: StudyBuddyPersona) => {
    setSelectedPersona(persona.id)
    await savePersonaPreference(persona.id)
  }

  const savePersonaPreference = async (personaId: string) => {
    if (!user) return

    setSaving(true)
    try {
      await updateProfile({ study_buddy_persona: personaId })
      success('AI Buddy updated!', `Selected ${studyBuddyPersonas.find(p => p.id === personaId)?.name}`)
    } catch (error) {
      console.error('Error saving persona preference:', error)
      error('Failed to save preference', 'Please try again')
    } finally {
      setSaving(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      await updateProfile({
        username,
        full_name: fullName,
        bio,
        location,
        study_buddy_persona: selectedPersona
      })
      
      setIsEditing(false)
      success('Profile saved!', 'Your profile has been updated')
    } catch (error) {
      console.error('Error saving profile:', error)
      error('Failed to save profile', 'Please try again')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpdate = (imageUrl: string) => {
    // The ProfileImageUpload component handles the database update
    // This callback is for any additional UI updates if needed
    success('Profile image updated!', 'Your new profile picture is now visible')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const currentPersona = studyBuddyPersonas.find(p => p.id === selectedPersona) || studyBuddyPersonas[0]

  // Mock stats data
  const stats = {
    studyHours: 127,
    materialsUploaded: 24,
    groupsJoined: 8,
    quizzesTaken: 45,
    averageScore: 87,
    streakDays: 12,
    achievements: 15,
    rank: 'Advanced Learner'
  }

  const achievements = [
    { id: 1, name: 'First Upload', description: 'Uploaded your first study material', icon: '🎯', earned: true },
    { id: 2, name: 'Study Streak', description: '7 days of continuous studying', icon: '🔥', earned: true },
    { id: 3, name: 'Group Leader', description: 'Created your first study group', icon: '👑', earned: true },
    { id: 4, name: 'Quiz Master', description: 'Scored 90+ on 10 quizzes', icon: '🧠', earned: true },
    { id: 5, name: 'Collaborator', description: 'Joined 5 study groups', icon: '🤝', earned: true },
    { id: 6, name: 'Knowledge Seeker', description: 'Uploaded 20+ materials', icon: '📚', earned: false },
    { id: 7, name: 'Mentor', description: 'Helped 50+ students', icon: '🌟', earned: false },
    { id: 8, name: 'Scholar', description: '100 hours of study time', icon: '🎓', earned: false }
  ]

  const recentActivity = [
    { type: 'upload', description: 'Uploaded "Advanced Calculus Notes"', time: '2 hours ago' },
    { type: 'quiz', description: 'Completed Physics Quiz with 92%', time: '1 day ago' },
    { type: 'group', description: 'Joined "Organic Chemistry Study Group"', time: '2 days ago' },
    { type: 'session', description: 'Attended live study session', time: '3 days ago' }
  ]

  const userDisplayName = profile.full_name || profile.username || user?.fullName || 'User'
  const userInitials = userDisplayName[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <ProfileImageUpload
                  currentImageUrl={profile.profile_image_url || user?.avatarUrl}
                  onImageUpdate={handleImageUpdate}
                  size="xl"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{userDisplayName}</h1>
                <p className="text-primary-100 mb-2">@{profile.username || user?.email?.split('@')[0]}</p>
                <div className="flex items-center space-x-4 text-primary-100">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined {new Date(user?.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-primary-100 mt-3 max-w-md">{profile.bio}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.rank}</div>
                <div className="text-xs text-primary-200">Current Rank</div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
          <Clock className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.studyHours}h</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Study Time</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
          <BookOpen className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.materialsUploaded}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Materials</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
          <Users className="w-8 h-8 text-accent-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.groupsJoined}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Groups</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
          <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.achievements}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'preferences', label: 'AI Buddy', icon: Sparkles },
          { id: 'stats', label: 'Statistics', icon: TrendingUp },
          { id: 'achievements', label: 'Achievements', icon: Award }
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

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                {isEditing && (
                  <Button
                    onClick={saveProfile}
                    loading={saving}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                />

                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:text-white ${
                      !isEditing ? 'bg-gray-50 dark:bg-gray-700' : 'dark:bg-gray-800'
                    }`}
                  />
                </div>

                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}
                />

                <Input
                  label="Email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'upload' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.type === 'quiz' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.type === 'group' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {activity.type === 'upload' && <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      {activity.type === 'quiz' && <Brain className="w-4 h-4 text-green-600 dark:text-green-400" />}
                      {activity.type === 'group' && <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {activity.type === 'session' && <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Study Buddy Preferences</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose your AI learning companion</p>
            </div>

            {/* Current AI Buddy Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <StudyBuddyAvatar personaId={selectedPersona} size="lg" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Current AI Study Buddy: {currentPersona.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{currentPersona.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Personality: {currentPersona.personality}
                  </p>
                </div>
              </div>
            </div>

            {/* Persona Selector */}
            <PersonaSelector
              selectedPersona={selectedPersona}
              onPersonaSelect={handlePersonaSelect}
              loading={saving}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Statistics</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700 dark:text-gray-300">Quizzes Taken</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.quizzesTaken}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-700 dark:text-gray-300">Average Score</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.averageScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-700 dark:text-gray-300">Current Streak</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.streakDays} days</span>
                </div>
              </div>
            </div>

            {/* Study Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Study Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Weekly Goal</span>
                    <span className="text-gray-900 dark:text-white">12/15 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Materials</span>
                    <span className="text-gray-900 dark:text-white">8/10 uploads</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-secondary-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Quiz Performance</span>
                    <span className="text-gray-900 dark:text-white">87% average</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-accent-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-xl border-2 text-center transition-all duration-200 ${
                    achievement.earned
                      ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20 hover:shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h4 className={`font-semibold mb-2 ${
                    achievement.earned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.earned && (
                    <div className="mt-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}