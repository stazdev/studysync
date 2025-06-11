import React, { useState } from 'react'
import { X, Users, Globe, Lock, UserPlus, Upload, Hash } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface CreateGroupModalProps {
  onClose: () => void
  onGroupCreated: (group: any) => void
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  onClose,
  onGroupCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    privacy: 'public' as 'public' | 'private' | 'invite-only',
    maxMembers: 20,
    tags: '',
    avatar: '📚'
  })
  const [loading, setLoading] = useState(false)

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Psychology', 'Economics', 'Art', 'Music', 'Other'
  ]

  const avatarOptions = [
    '📚', '🔬', '🧮', '🎨', '🎵', '🏛️', '💻', '🧪', '🌍', '📖', '✏️', '🎓'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newGroup = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        subject: formData.subject,
        difficulty: formData.difficulty,
        privacy: formData.privacy,
        memberCount: 1,
        maxMembers: formData.maxMembers,
        createdBy: 'You',
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: 'just now',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        stats: {
          totalSessions: 0,
          avgRating: 0,
          completionRate: 0
        },
        isJoined: true,
        role: 'owner' as const,
        avatar: formData.avatar
      }

      onGroupCreated(newGroup)
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Study Group</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter group name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what your group is about..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Privacy & Access</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Group Privacy
              </label>
              <div className="space-y-3">
                {[
                  { value: 'public', icon: Globe, label: 'Public', desc: 'Anyone can find and join' },
                  { value: 'invite-only', icon: UserPlus, label: 'Invite Only', desc: 'Members must be invited' },
                  { value: 'private', icon: Lock, label: 'Private', desc: 'Hidden from search' }
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        value={option.value}
                        checked={formData.privacy === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value as any }))}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <Icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-900">{option.label}</span>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Members
              </label>
              <Input
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                min="2"
                max="100"
                placeholder="20"
              />
            </div>
          </div>

          {/* Customization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Customization</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                      formData.avatar === avatar
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., calculus, problem solving, peer teaching"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add tags to help others find your group
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
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
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}