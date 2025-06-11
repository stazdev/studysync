import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      if (error) {
        console.error('Error fetching unread count:', error)
        return 0
      }
      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('is_read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  },

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    priority: string = 'medium',
    actionUrl?: string,
    actionLabel?: string,
    metadata: any = {}
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          priority,
          action_url: actionUrl,
          action_label: actionLabel,
          metadata,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  },

  subscribeToNotifications(callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  },

  unsubscribeFromNotifications(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}