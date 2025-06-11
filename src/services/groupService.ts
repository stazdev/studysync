import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type StudyGroup = Database['public']['Tables']['study_groups']['Row']
type StudyGroupInsert = Database['public']['Tables']['study_groups']['Insert']
type GroupMember = Database['public']['Tables']['group_members']['Row']

export interface StudyGroupWithStats extends StudyGroup {
  member_count: number
  user_role?: string
  is_joined: boolean
  next_session?: {
    date: string
    time: string
    topic: string
  }
  stats: {
    totalSessions: number
    avgRating: number
    completionRate: number
  }
}

export const groupService = {
  async getUserGroups(): Promise<StudyGroupWithStats[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_groups')
      if (error) throw error

      return data.map(group => ({
        id: group.group_id,
        name: group.group_name,
        description: group.description,
        subject: group.subject,
        difficulty: group.difficulty,
        privacy: group.privacy,
        max_members: 20, // Default from schema
        avatar: group.avatar,
        tags: group.tags,
        created_by: group.created_by,
        created_at: group.created_at,
        updated_at: group.created_at, // Fallback
        member_count: group.member_count,
        user_role: group.user_role,
        is_joined: true,
        stats: {
          totalSessions: 0,
          avgRating: 4.5,
          completionRate: 85
        }
      }))
    } catch (error) {
      console.error('Error fetching user groups:', error)
      return []
    }
  },

  async getPublicGroups(): Promise<StudyGroupWithStats[]> {
    try {
      const { data: groups, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          group_members!inner(count)
        `)
        .eq('privacy', 'public')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get user's groups to check membership
      const { data: userMemberships } = await supabase
        .from('group_members')
        .select('group_id, role')

      const userGroupIds = new Set(userMemberships?.map(m => m.group_id) || [])

      return groups.map(group => ({
        ...group,
        member_count: group.group_members?.[0]?.count || 0,
        user_role: userMemberships?.find(m => m.group_id === group.id)?.role,
        is_joined: userGroupIds.has(group.id),
        stats: {
          totalSessions: 0,
          avgRating: 4.5,
          completionRate: 85
        }
      }))
    } catch (error) {
      console.error('Error fetching public groups:', error)
      return []
    }
  },

  async createGroup(groupData: StudyGroupInsert): Promise<StudyGroup> {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .insert(groupData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating group:', error)
      throw error
    }
  },

  async joinGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('join_group', {
        target_group_id: groupId
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error joining group:', error)
      throw error
    }
  },

  async leaveGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('leave_group', {
        target_group_id: groupId
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error leaving group:', error)
      throw error
    }
  },

  async getGroupMembers(groupId: string) {
    try {
      const { data, error } = await supabase.rpc('get_group_members', {
        target_group_id: groupId
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching group members:', error)
      return []
    }
  },

  async updateGroupRole(groupId: string, userId: string, role: string) {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role })
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating group role:', error)
      throw error
    }
  },

  async deleteGroup(groupId: string) {
    try {
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting group:', error)
      throw error
    }
  }
}