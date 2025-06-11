import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

interface ProfileData {
  id: string
  username: string
  email: string
  full_name?: string
  bio?: string
  location?: string
  profile_image_url?: string
  study_buddy_persona?: string
  created_at: string
  updated_at: string
}

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

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        // Create default profile if none exists
        await createDefaultProfile()
      } else if (data) {
        setProfile(data)
      } else {
        // No profile found, create one
        await createDefaultProfile()
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      // Create default profile on error
      await createDefaultProfile()
    } finally {
      setLoading(false)
    }
  }

  const createDefaultProfile = async () => {
    if (!user) return

    const defaultProfile: Partial<ProfileData> = {
      id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(defaultProfile)
        .select()
        .single()

      if (error) {
        console.error('Error creating default profile:', error)
        // Set local profile anyway for demo
        setProfile(defaultProfile as ProfileData)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error)
      // Set local profile anyway for demo
      setProfile(defaultProfile as ProfileData)
    }
  }

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user || !profile) return

    try {
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        // Update local state anyway for demo
        setProfile(updatedProfile)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      // Update local state anyway for demo
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      }
      setProfile(updatedProfile)
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
      updateProfile({ profile_image_url: imageUrl })
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