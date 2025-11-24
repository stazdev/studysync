import api from '../lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
  priority: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data } = await api.get('/notifications');
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const { data } = await api.get('/notifications/unread-count');
      return data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  subscribeToNotifications(callback: (notification: Notification) => void) {
    // Real-time notifications via socket could be added here
    // For now, we can just poll or leave empty if not critical
    console.log('Subscribing to notifications (mock)');
    // Return a mock subscription object
    return { unsubscribe: () => {} };
  },

  unsubscribeFromNotifications(subscription: any) {
    if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
    }
  }
};
