import React, { useState } from 'react'
import { X, UserPlus, MessageSquare } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

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

interface JoinGroupModalProps {
  group: StudyGroup
  onClose: () => void
  onJoin: () => void
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  group,
  onClose,
  onJoin
}) => {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call for join request
      await new Promise(resolve => setTimeout(resolve, 1000))
      onJoin()
    } catch (error) {
      console.error('Error joining group:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Join Study Group</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Group Info */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-2xl">
              {group.avatar || '📚'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600">{group.subject} • {group.difficulty}</p>
            </div>
          </div>

          {group.privacy === 'invite-only' ? (
            <div>
              <p className="text-gray-700 mb-4">
                This is an invite-only group. Send a message to the group moderators explaining why you'd like to join.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to moderators
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi! I'd like to join this group because..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-6">
                You're about to join <strong>{group.name}</strong>. You'll be able to participate in study sessions, access shared materials, and collaborate with other members.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onJoin}
                  loading={loading}
                  className="flex-1"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}