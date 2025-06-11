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

      if (error) throw error
      return data
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

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      })

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      const { error } = await supabase.rpc('mark_all_notifications_read')
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
      const { data, error } = await supabase.rpc('create_notification', {
        target_user_id: userId,
        notification_title: title,
        notification_message: message,
        notification_type: type,
        notification_priority: priority,
        notification_action_url: actionUrl,
        notification_action_label: actionLabel,
        notification_metadata: metadata
      })

      if (error) throw error
      return data
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