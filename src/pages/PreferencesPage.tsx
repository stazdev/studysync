import React, { useState } from 'react'
import { usePreferences } from '../contexts/PreferencesContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  Settings, 
  Bell, 
  Eye, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  Save,
  RefreshCw,
  Download,
  Trash2,
  Lock,
  Key,
  Database,
  Palette,
  Monitor,
  Zap,
  Clock,
  Target,
  Brain
} from 'lucide-react'

export const PreferencesPage: React.FC = () => {
  const { preferences, updatePreference, savePreferences, resetToDefaults, loading } = usePreferences()
  const { theme, setTheme, actualTheme } = useTheme()
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'appearance'>('general')

  const handleSave = async () => {
    setSaving(true)
    try {
      await savePreferences()
    } catch (err) {
      // Error is handled in the context
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
    updatePreference('theme', newTheme)
    success('Theme updated', `Switched to ${newTheme} theme`)
  }

  const handleLanguageChange = (language: string) => {
    updatePreference('language', language)
    success('Language updated', 'Language preference has been changed')
  }

  const handleReset = () => {
    resetToDefaults()
    setTheme('light')
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
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Preferences</h1>
            <p className="text-primary-100">Customize your StudySync experience</p>
          </div>
        </div>
      </div>

      {/* Current Theme Debug Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Current theme: <strong>{theme}</strong> | Actual theme: <strong>{actualTheme}</strong>
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'general', label: 'General', icon: Settings },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'privacy', label: 'Privacy', icon: Shield },
          { id: 'appearance', label: 'Appearance', icon: Palette }
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => updatePreference('timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="CET">Central European Time (CET)</option>
                    <option value="JST">Japan Standard Time (JST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Difficulty Level
                  </label>
                  <select
                    value={preferences.defaultDifficulty}
                    onChange={(e) => updatePreference('defaultDifficulty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoSave}
                    onChange={(e) => updatePreference('autoSave', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Auto-save progress</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.studyReminders}
                    onChange={(e) => updatePreference('studyReminders', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Enable study reminders</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Delivery Methods</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">Email notifications</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.pushNotifications}
                        onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">Push notifications</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.soundEnabled}
                        onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex items-center space-x-2">
                        {preferences.soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-gray-500" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-gray-700 dark:text-gray-300">Sound notifications</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Notification Types</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.groupInvites}
                        onChange={(e) => updatePreference('groupInvites', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Study group invitations</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.quizResults}
                        onChange={(e) => updatePreference('quizResults', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Quiz results and feedback</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.weeklyDigest}
                        onChange={(e) => updatePreference('weeklyDigest', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Weekly progress digest</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Privacy Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={preferences.profileVisibility}
                    onChange={(e) => updatePreference('profileVisibility', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="public">Public - Anyone can see your profile</option>
                    <option value="friends">Friends only - Only group members can see</option>
                    <option value="private">Private - Only you can see your profile</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.showOnlineStatus}
                      onChange={(e) => updatePreference('showOnlineStatus', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Show online status</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.allowGroupInvites}
                      onChange={(e) => updatePreference('allowGroupInvites', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Allow group invitations</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.shareProgress}
                      onChange={(e) => updatePreference('shareProgress', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Share study progress with groups</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.dataCollection}
                      onChange={(e) => updatePreference('dataCollection', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Allow data collection for improving AI features</span>
                    </div>
                  </label>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Data Privacy</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Your study data is encrypted and never shared with third parties. 
                        You can export or delete your data at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Appearance Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: Sun, desc: 'Light theme for daytime use' },
                      { value: 'dark', label: 'Dark', icon: Moon, desc: 'Dark theme for low-light environments' },
                      { value: 'auto', label: 'Auto', icon: Monitor, desc: 'Follows your system preference' }
                    ].map((themeOption) => {
                      const Icon = themeOption.icon
                      const isSelected = theme === themeOption.value
                      return (
                        <button
                          key={themeOption.value}
                          onClick={() => handleThemeChange(themeOption.value as any)}
                          className={`p-6 border-2 rounded-xl flex flex-col items-center space-y-3 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isSelected 
                              ? 'bg-primary-100 dark:bg-primary-800' 
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              isSelected 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="text-center">
                            <span className={`font-medium ${
                              isSelected 
                                ? 'text-primary-700 dark:text-primary-300' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {themeOption.label}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {themeOption.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size
                  </label>
                  <select
                    value={preferences.fontSize}
                    onChange={(e) => updatePreference('fontSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.compactMode}
                      onChange={(e) => updatePreference('compactMode', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Compact mode (reduced spacing)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.animationsEnabled}
                      onChange={(e) => updatePreference('animationsEnabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Enable animations</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.highContrast}
                      onChange={(e) => updatePreference('highContrast', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">High contrast mode</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-600">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}