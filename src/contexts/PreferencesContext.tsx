import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeContext'
import { supabase } from '../lib/supabase'
import { useToast } from './ToastContext'

export interface UserPreferences {
  // General
  language: string
  timezone: string
  autoSave: boolean
  defaultDifficulty: string
  studyReminders: boolean
  
  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  groupInvites: boolean
  quizResults: boolean
  weeklyDigest: boolean
  soundEnabled: boolean
  
  // Privacy
  profileVisibility: string
  showOnlineStatus: boolean
  allowGroupInvites: boolean
  shareProgress: boolean
  dataCollection: boolean
  
  // Appearance
  theme: 'light' | 'dark' | 'auto'
  compactMode: boolean
  animationsEnabled: boolean
  highContrast: boolean
  fontSize: string
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  timezone: 'UTC',
  autoSave: true,
  defaultDifficulty: 'intermediate',
  studyReminders: true,
  emailNotifications: true,
  pushNotifications: true,
  groupInvites: true,
  quizResults: true,
  weeklyDigest: true,
  soundEnabled: true,
  profileVisibility: 'public',
  showOnlineStatus: true,
  allowGroupInvites: true,
  shareProgress: true,
  dataCollection: true,
  theme: 'light',
  compactMode: false,
  animationsEnabled: true,
  highContrast: false,
  fontSize: 'medium'
}

interface PreferencesContextType {
  preferences: UserPreferences
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  savePreferences: () => Promise<void>
  resetToDefaults: () => void
  loading: boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export const usePreferences = () => {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}

interface PreferencesProviderProps {
  children: React.ReactNode
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  const { success, error } = useToast()
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPreferences()
    } else {
      // Load from localStorage for non-authenticated users
      const saved = localStorage.getItem('userPreferences')
      if (saved) {
        try {
          const parsedPrefs = { ...defaultPreferences, ...JSON.parse(saved) }
          setPreferences(parsedPrefs)
          // Apply theme immediately
          setTheme(parsedPrefs.theme)
        } catch (e) {
          console.error('Error parsing saved preferences:', e)
          setTheme('light')
        }
      } else {
        setTheme('light')
      }
      setLoading(false)
    }
  }, [user, setTheme])

  // Update theme when preferences change
  useEffect(() => {
    setTheme(preferences.theme)
  }, [preferences.theme, setTheme])

  const fetchPreferences = async () => {
    if (!user) return

    try {
      // First, try to create the table if it doesn't exist (fallback)
      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No data found, use defaults
          console.log('No preferences found, using defaults')
          setTheme('light')
        } else if (fetchError.code === '42P01') {
          // Table doesn't exist
          console.log('User preferences table does not exist. Please run the database migration.')
          error('Database setup required', 'Please contact support to set up your preferences')
          setTheme('light')
        } else {
          throw fetchError
        }
      } else if (data?.preferences) {
        const mergedPrefs = { ...defaultPreferences, ...data.preferences }
        setPreferences(mergedPrefs)
        setTheme(mergedPrefs.theme)
      } else {
        // Set default theme if no preferences found
        setTheme('light')
      }
    } catch (err) {
      console.error('Error fetching preferences:', err)
      error('Failed to load preferences', 'Using default settings')
      setTheme('light')
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value }
      
      // Save to localStorage immediately for non-authenticated users
      if (!user) {
        localStorage.setItem('userPreferences', JSON.stringify(updated))
      }
      
      return updated
    })
  }

  const savePreferences = async () => {
    if (!user) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      success('Preferences saved', 'Your settings have been saved locally')
      return
    }

    try {
      const { error: saveError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (saveError) {
        if (saveError.code === '42P01') {
          error('Database setup required', 'Please contact support to set up preferences storage')
          // Still save locally as fallback
          localStorage.setItem('userPreferences', JSON.stringify(preferences))
          success('Preferences saved locally', 'Settings saved to your browser')
          return
        }
        throw saveError
      }

      success('Preferences saved', 'Your settings have been updated successfully')
    } catch (err) {
      console.error('Error saving preferences:', err)
      error('Failed to save preferences', 'Please try again')
      throw err
    }
  }

  const resetToDefaults = () => {
    setPreferences(defaultPreferences)
    setTheme('light')
    if (!user) {
      localStorage.removeItem('userPreferences')
    }
    success('Preferences reset', 'All settings have been restored to defaults')
  }

  return (
    <PreferencesContext.Provider value={{
      preferences,
      updatePreference,
      savePreferences,
      resetToDefaults,
      loading
    }}>
      {children}
    </PreferencesContext.Provider>
  )
}