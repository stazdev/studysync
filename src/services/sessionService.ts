import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type StudySession = Database['public']['Tables']['study_sessions']['Row']
type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert']
type SessionParticipant = Database['public']['Tables']['session_participants']['Row']

export interface StudySessionWithDetails extends StudySession {
  host: {
    username: string
    profile_image_url: string | null
  }
  group: {
    name: string
    avatar: string
  }
  participants: Array<{
    user_id: string
    username: string
    profile_image_url: string | null
    joined_at: string
  }>
  participant_count: number
}

export const sessionService = {
  async createSession(sessionData: StudySessionInsert): Promise<StudySession> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  },

  async getGroupSessions(groupId: string): Promise<StudySessionWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          *,
          host:profiles!study_sessions_host_id_fkey (
            username,
            profile_image_url
          ),
          group:study_groups!study_sessions_group_id_fkey (
            name,
            avatar
          ),
          session_participants (
            user_id,
            joined_at,
            profiles:user_id (
              username,
              profile_image_url
            )
          )
        `)
        .eq('group_id', groupId)
        .order('scheduled_for', { ascending: true })

      if (error) throw error

      return data.map(session => ({
        ...session,
        participants: session.session_participants.map(p => ({
          user_id: p.user_id,
          username: p.profiles.username,
          profile_image_url: p.profiles.profile_image_url,
          joined_at: p.joined_at
        })),
        participant_count: session.session_participants.length
      })) as StudySessionWithDetails[]
    } catch (error) {
      console.error('Error fetching group sessions:', error)
      return []
    }
  },

  async getUserSessions(): Promise<StudySessionWithDetails[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          *,
          host:profiles!study_sessions_host_id_fkey (
            username,
            profile_image_url
          ),
          group:study_groups!study_sessions_group_id_fkey (
            name,
            avatar
          ),
          session_participants!inner (
            user_id,
            joined_at
          )
        `)
        .eq('session_participants.user_id', user.user.id)
        .order('scheduled_for', { ascending: true })

      if (error) throw error
      return data as StudySessionWithDetails[]
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      return []
    }
  },

  async getSession(sessionId: string): Promise<StudySessionWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          *,
          host:profiles!study_sessions_host_id_fkey (
            username,
            profile_image_url
          ),
          group:study_groups!study_sessions_group_id_fkey (
            name,
            avatar
          ),
          session_participants (
            user_id,
            joined_at,
            left_at,
            profiles:user_id (
              username,
              profile_image_url
            )
          )
        `)
        .eq('id', sessionId)
        .single()

      if (error) throw error

      return {
        ...data,
        participants: data.session_participants
          .filter(p => !p.left_at) // Only active participants
          .map(p => ({
            user_id: p.user_id,
            username: p.profiles.username,
            profile_image_url: p.profiles.profile_image_url,
            joined_at: p.joined_at
          })),
        participant_count: data.session_participants.filter(p => !p.left_at).length
      } as StudySessionWithDetails
    } catch (error) {
      console.error('Error fetching session:', error)
      return null
    }
  },

  async joinSession(sessionId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.user.id
        })

      if (error) throw error
    } catch (error) {
      console.error('Error joining session:', error)
      throw error
    }
  },

  async leaveSession(sessionId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('session_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', user.user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error leaving session:', error)
      throw error
    }
  },

  async updateSessionStatus(sessionId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating session status:', error)
      throw error
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  },

  subscribeToSessionParticipants(sessionId: string, callback: (participant: any) => void) {
    return supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe()
  },

  unsubscribeFromSession(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}