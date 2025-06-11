# Supabase Integration Guide for StudySync

## Overview
This guide explains how to integrate the Supabase database schema with your StudySync application.

## Database Schema Overview

### Core Tables
1. **profiles** - User profile information
2. **study_groups** - Study group data
3. **group_members** - Group membership relationships
4. **study_materials** - Uploaded content and analysis
5. **quizzes** - Quiz definitions and settings
6. **quiz_attempts** - User quiz attempts and scores
7. **study_sessions** - Live study sessions
8. **session_participants** - Session attendance tracking
9. **notifications** - User notifications
10. **chat_messages** - Group chat messages
11. **user_preferences** - User settings and preferences

### Storage Buckets
1. **avatars** - Profile images (public)
2. **study-materials** - Uploaded documents (private)
3. **chat-files** - Chat file attachments (private)

## Integration Steps

### 1. Environment Setup

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 2. Run Database Migrations

Execute the migration files in order:

1. `create_profiles_table.sql`
2. `create_study_groups_table.sql`
3. `create_group_members_table.sql`
4. `create_study_materials_table.sql`
5. `create_quizzes_table.sql`
6. `create_study_sessions_table.sql`
7. `create_notifications_table.sql`
8. `create_chat_messages_table.sql`
9. `create_storage_buckets.sql`
10. `create_helper_functions.sql`
11. `create_realtime_subscriptions.sql`

### 3. Update Supabase Client Configuration

Update `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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

// Database types (auto-generated)
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
      // Add other table types as needed
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
      // Add other function types
    }
  }
}
```

### 4. Authentication Integration

Update `src/contexts/AuthContext.tsx` to use the new profile system:

```typescript
const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) throw error
  
  // Profile will be created automatically via trigger
  return data
}
```

### 5. Profile Management

Update `src/contexts/ProfileContext.tsx`:

```typescript
const fetchProfile = async () => {
  if (!user) return

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    setProfile(data)
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

const updateProfile = async (updates: Partial<ProfileData>) => {
  if (!user) return

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    setProfile(data)
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}
```

### 6. Study Groups Integration

Create `src/services/groupService.ts`:

```typescript
import { supabase } from '../lib/supabase'

export const groupService = {
  async getUserGroups() {
    const { data, error } = await supabase.rpc('get_user_groups')
    if (error) throw error
    return data
  },

  async createGroup(groupData: any) {
    const { data, error } = await supabase
      .from('study_groups')
      .insert(groupData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async joinGroup(groupId: string) {
    const { data, error } = await supabase.rpc('join_group', {
      target_group_id: groupId
    })
    
    if (error) throw error
    return data
  },

  async leaveGroup(groupId: string) {
    const { data, error } = await supabase.rpc('leave_group', {
      target_group_id: groupId
    })
    
    if (error) throw error
    return data
  },

  async getGroupMembers(groupId: string) {
    const { data, error } = await supabase.rpc('get_group_members', {
      target_group_id: groupId
    })
    
    if (error) throw error
    return data
  }
}
```

### 7. Real-time Chat Integration

Create `src/services/chatService.ts`:

```typescript
import { supabase } from '../lib/supabase'

export const chatService = {
  async getMessages(groupId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles:user_id (
          username,
          profile_image_url
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  async sendMessage(groupId: string, message: string, messageType = 'text') {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        group_id: groupId,
        message,
        message_type: messageType,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  subscribeToMessages(groupId: string, callback: (message: any) => void) {
    return supabase
      .channel(`chat:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${groupId}`
        },
        callback
      )
      .subscribe()
  }
}
```

### 8. Notifications Integration

Create `src/services/notificationService.ts`:

```typescript
import { supabase } from '../lib/supabase'

export const notificationService = {
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase.rpc('mark_notification_read', {
      notification_id: notificationId
    })
    
    if (error) throw error
  },

  async markAllAsRead() {
    const { error } = await supabase.rpc('mark_all_notifications_read')
    if (error) throw error
  },

  subscribeToNotifications(callback: (notification: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${(supabase.auth.getUser()).data.user?.id}`
        },
        callback
      )
      .subscribe()
  }
}
```

### 9. File Upload Integration

Create `src/services/uploadService.ts`:

```typescript
import { supabase } from '../lib/supabase'

export const uploadService = {
  async uploadFile(file: File, bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    return data
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  async uploadProfileImage(file: File, userId: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await this.uploadFile(file, 'avatars', filePath)
    if (error) throw error

    const publicUrl = await this.getPublicUrl('avatars', filePath)
    
    // Update profile with new image URL
    await supabase
      .from('profiles')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId)

    return publicUrl
  },

  async uploadStudyMaterial(file: File, userId: string, analysis: any) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await this.uploadFile(file, 'study-materials', filePath)
    if (error) throw error

    const fileUrl = await this.getPublicUrl('study-materials', filePath)
    
    // Save material record
    const { data: material, error: materialError } = await supabase
      .from('study_materials')
      .insert({
        title: file.name,
        file_name: file.name,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        analysis,
        uploaded_by: userId
      })
      .select()
      .single()

    if (materialError) throw materialError
    return material
  }
}
```

### 10. Quiz Integration

Create `src/services/quizService.ts`:

```typescript
import { supabase } from '../lib/supabase'

export const quizService = {
  async createQuiz(quizData: any) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .or('is_public.eq.true,created_by.eq.' + (await supabase.auth.getUser()).data.user?.id)
    
    if (error) throw error
    return data
  },

  async submitQuizAttempt(quizId: string, answers: any, score: number, timeSpent: number) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        answers,
        score,
        time_spent: timeSpent,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserQuizAttempts() {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          title,
          subject,
          difficulty
        )
      `)
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
```

## Usage Examples

### 1. Creating a Study Group

```typescript
import { groupService } from '../services/groupService'

const createGroup = async (groupData) => {
  try {
    const group = await groupService.createGroup({
      name: groupData.name,
      description: groupData.description,
      subject: groupData.subject,
      difficulty: groupData.difficulty,
      privacy: groupData.privacy,
      max_members: groupData.maxMembers,
      avatar: groupData.avatar,
      tags: groupData.tags,
      created_by: user.id
    })
    
    console.log('Group created:', group)
  } catch (error) {
    console.error('Error creating group:', error)
  }
}
```

### 2. Real-time Chat

```typescript
import { chatService } from '../services/chatService'

const setupChat = (groupId) => {
  // Subscribe to new messages
  const subscription = chatService.subscribeToMessages(groupId, (payload) => {
    const newMessage = payload.new
    setMessages(prev => [...prev, newMessage])
  })

  // Send a message
  const sendMessage = async (message) => {
    await chatService.sendMessage(groupId, message)
  }

  // Cleanup
  return () => {
    subscription.unsubscribe()
  }
}
```

### 3. File Upload with Progress

```typescript
import { uploadService } from '../services/uploadService'

const uploadFile = async (file, onProgress) => {
  try {
    // Upload file
    const material = await uploadService.uploadStudyMaterial(
      file, 
      user.id, 
      analysisResults
    )
    
    console.log('File uploaded:', material)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all tables
2. **Storage policies** restrict file access to authorized users
3. **Helper functions** use `SECURITY DEFINER` for controlled access
4. **Input validation** should be implemented on the client side
5. **File size limits** are enforced in storage policies

## Performance Optimization

1. **Indexes** are automatically created on foreign keys
2. **Realtime subscriptions** should be limited to necessary tables
3. **Pagination** should be implemented for large datasets
4. **File compression** should be considered for uploads
5. **CDN** integration for static assets

## Monitoring and Analytics

1. Use Supabase Dashboard for monitoring
2. Set up alerts for error rates
3. Monitor storage usage
4. Track user engagement metrics
5. Implement logging for critical operations

This integration guide provides a complete foundation for your StudySync application with Supabase. The schema is designed to be scalable, secure, and feature-rich while maintaining good performance.