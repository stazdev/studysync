import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type ProfileData = Database['public']['Tables']['profiles']['Row']

interface ProfileContextType {
  profile: ProfileData | null
  loading: boolean
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>
  updateProfileImage: (imageUrl: string) => void
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

interface ProfileProviderProps {
  children: React.ReactNode
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, it should be created by trigger
          console.log('Profile not found, waiting for creation...')
          // Retry after a short delay
          setTimeout(fetchProfile, 1000)
          return
        }
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      
      // Create a fallback profile if needed
      if (user) {
        const fallbackProfile: Partial<ProfileData> = {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          study_buddy_persona: 'professor-synapse',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProfile(fallbackProfile as ProfileData)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user || !profile) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error updating profile:', error)
      
      // Update local state anyway for demo purposes
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      }
      setProfile(updatedProfile)
      throw error
    }
  }

  const updateProfileImage = (imageUrl: string) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        profile_image_url: imageUrl,
        updated_at: new Date().toISOString()
      }
      setProfile(updatedProfile)
      
      // Also update in database
      updateProfile({ profile_image_url: imageUrl }).catch(console.error)
    }
  }

  const refreshProfile = async () => {
    await fetchProfile()
  }

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      updateProfile,
      updateProfileImage,
      refreshProfile
    }}>
      {children}
    </ProfileContext.Provider>
  )
}