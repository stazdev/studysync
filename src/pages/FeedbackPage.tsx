import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../contexts/ToastContext'
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle, 
  Bug, 
  Lightbulb, 
  Heart, 
  Frown, 
  Meh, 
  Smile,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Zap,
  Target,
  Users,
  BookOpen,
  Upload
} from 'lucide-react'

export const FeedbackPage: React.FC = () => {
  const { success, error } = useToast()
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general')
  const [rating, setRating] = useState(0)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitted(true)
    setLoading(false)
    
    success('Feedback submitted successfully', 'Thank you for helping us improve StudySync!')
  }

  const categories = {
    bug: [
      'Login/Authentication',
      'File Upload',
      'AI Analysis',
      'Study Groups',
      'User Interface',
      'Performance',
      'Other'
    ],
    feature: [
      'AI Study Buddy',
      'Study Groups',
      'Content Analysis',
      'User Interface',
      'Mobile App',
      'Integrations',
      'Other'
    ],
    general: [
      'User Experience',
      'Content Quality',
      'Performance',
      'Documentation',
      'Support',
      'Billing',
      'Other'
    ]
  }

  const ratingLabels = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent']
  const ratingIcons = [Frown, Frown, Meh, Smile, Smile]

  if (submitted) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Thank You!</h1>
              <p className="text-green-100">Your feedback has been submitted successfully</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">We appreciate your feedback!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Your input helps us improve StudySync and create a better learning experience for everyone.
            We'll review your feedback and get back to you if needed.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                setSubmitted(false)
                setSubject('')
                setMessage('')
                setRating(0)
                setCategory('')
              }}
              variant="outline"
            >
              Submit Another
            </Button>
            <Button onClick={() => window.history.back()}>
              Back to App
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white dark:from-primary-700 dark:to-secondary-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Feedback & Support</h1>
            <p className="text-primary-100">Help us improve StudySync with your valuable feedback</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Share Your Feedback</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What type of feedback do you have?
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'red' },
                    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'blue' },
                    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'green' }
                  ].map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFeedbackType(type.value as any)}
                        className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                          feedbackType === type.value
                            ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${
                          feedbackType === type.value ? `text-${type.color}-600 dark:text-${type.color}-400` : 'text-gray-600 dark:text-gray-400'
                        }`} />
                        <span className="text-sm font-medium dark:text-gray-300">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Rating (for general feedback) */}
              {feedbackType === 'general' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    How would you rate your overall experience?
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const IconComponent = ratingIcons[star - 1]
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-lg transition-all ${
                            rating >= star
                              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      )
                    })}
                    {rating > 0 && (
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {ratingLabels[rating - 1]}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories[feedbackType].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {feedbackType === 'bug' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Subject */}
              <Input
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  feedbackType === 'bug' ? 'Brief description of the issue' :
                  feedbackType === 'feature' ? 'Feature you\'d like to see' :
                  'What\'s on your mind?'
                }
                required
              />

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {feedbackType === 'bug' ? 'Detailed Description' : 'Message'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' 
                      ? 'Please describe the issue in detail, including steps to reproduce...'
                      : feedbackType === 'feature'
                      ? 'Describe the feature and how it would help you...'
                      : 'Share your thoughts, suggestions, or any other feedback...'
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Contact Email */}
              <Input
                label="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setFeedbackType('bug')}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Bug className="w-5 h-5 text-red-600" />
                <span className="text-gray-700 dark:text-gray-300">Report a Bug</span>
              </button>
              <button
                onClick={() => setFeedbackType('feature')}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">Request Feature</span>
              </button>
              <button
                onClick={() => setFeedbackType('general')}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Heart className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">General Feedback</span>
              </button>
            </div>
          </div>

          {/* Feature Areas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Areas</h3>
            <div className="space-y-2">
              {[
                { name: 'AI Study Buddy', icon: Zap },
                { name: 'Content Upload', icon: Upload },
                { name: 'Study Groups', icon: Users },
                { name: 'Quiz System', icon: Target },
                { name: 'Materials Library', icon: BookOpen }
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.name} className="flex items-center space-x-3 p-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Immediate Help?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              For urgent issues or technical support, you can reach out to us directly.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">support@studysync.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">Response within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}