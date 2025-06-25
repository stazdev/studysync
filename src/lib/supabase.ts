import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('Invalid VITE_SUPABASE_URL format. Expected a valid URL.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string | null
          bio: string | null
          location: string | null
          profile_image_url: string | null
          study_buddy_persona: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          profile_image_url?: string | null
          study_buddy_persona?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          email?: string
          full_name?: string | null
          bio?: string | null
          location?: string | null
          profile_image_url?: string | null
          study_buddy_persona?: string
          updated_at?: string
        }
      }
      study_groups: {
        Row: {
          id: string
          name: string
          description: string
          subject: string
          difficulty: string
          privacy: string
          max_members: number
          avatar: string
          tags: string[]
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          subject: string
          difficulty: string
          privacy: string
          max_members?: number
          avatar?: string
          tags?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          subject?: string
          difficulty?: string
          privacy?: string
          max_members?: number
          avatar?: string
          tags?: string[]
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          role?: string
        }
      }
      study_materials: {
        Row: {
          id: string
          title: string
          description: string | null
          file_name: string
          file_url: string
          file_type: string
          file_size: number
          analysis: any
          uploaded_by: string
          group_id: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          file_name: string
          file_url: string
          file_type: string
          file_size: number
          analysis?: any
          uploaded_by: string
          group_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          analysis?: any
          is_public?: boolean
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          subject: string
          difficulty: string
          questions: any
          settings: any
          created_by: string
          group_id: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          subject: string
          difficulty: string
          questions: any
          settings?: any
          created_by: string
          group_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          questions?: any
          settings?: any
          is_public?: boolean
          updated_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          answers: any
          score: number
          total_questions: number
          time_spent: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          answers: any
          score: number
          total_questions: number
          time_spent: number
          completed_at?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          priority: string
          is_read: boolean
          action_url: string | null
          action_label: string | null
          metadata: any
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          priority?: string
          is_read?: boolean
          action_url?: string | null
          action_label?: string | null
          metadata?: any
          created_at?: string
          read_at?: string | null
        }
        Update: {
          is_read?: boolean
          read_at?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          group_id: string
          user_id: string
          message: string
          message_type: string
          file_url: string | null
          file_name: string | null
          reply_to: string | null
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          message: string
          message_type?: string
          file_url?: string | null
          file_name?: string | null
          reply_to?: string | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          message?: string
          is_edited?: boolean
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          title: string
          description: string | null
          group_id: string
          host_id: string
          scheduled_for: string
          duration_minutes: number
          session_type: string
          status: string
          max_participants: number
          meeting_url: string | null
          resources: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          group_id: string
          host_id: string
          scheduled_for: string
          duration_minutes?: number
          session_type?: string
          status?: string
          max_participants?: number
          meeting_url?: string | null
          resources?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          scheduled_for?: string
          duration_minutes?: number
          status?: string
          meeting_url?: string | null
          resources?: any
          updated_at?: string
        }
      }
      session_participants: {
        Row: {
          id: string
          session_id: string
          user_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          left_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          preferences: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          preferences?: any
          updated_at?: string
        }
      }
    }
    Functions: {
      get_user_groups: {
        Args: {}
        Returns: Array<{
          group_id: string
          group_name: string
          description: string
          subject: string
          difficulty: string
          privacy: string
          avatar: string
          tags: string[]
          member_count: number
          user_role: string
          created_by: string
          created_at: string
        }>
      }
      get_group_members: {
        Args: { target_group_id: string }
        Returns: Array<{
          user_id: string
          username: string
          full_name: string | null
          profile_image_url: string | null
          role: string
          joined_at: string
        }>
      }
      join_group: {
        Args: { target_group_id: string }
        Returns: { success: boolean; message: string }
      }
      leave_group: {
        Args: { target_group_id: string }
        Returns: { success: boolean; message: string }
      }
      create_notification: {
        Args: {
          target_user_id: string
          notification_title: string
          notification_message: string
          notification_type?: string
          notification_priority?: string
          notification_action_url?: string | null
          notification_action_label?: string | null
          notification_metadata?: any
        }
        Returns: string
      }
      get_user_stats: {
        Args: {}
        Returns: {
          groups_joined: number
          materials_uploaded: number
          quizzes_taken: number
          average_quiz_score: number
          sessions_attended: number
          unread_notifications: number
        }
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: void
      }
      mark_all_notifications_read: {
        Args: {}
        Returns: void
      }
    }
  }
}