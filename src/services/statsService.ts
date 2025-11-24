import api from '../lib/api';

export interface UserStats {
  groups_joined: number;
  materials_uploaded: number;
  quizzes_taken: number;
  average_quiz_score: number;
  sessions_attended: number;
  unread_notifications: number;
}

export const statsService = {
  async getUserStats(): Promise<UserStats> {
    try {
      const { data } = await api.get('/stats/user');
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        groups_joined: 0,
        materials_uploaded: 0,
        quizzes_taken: 0,
        average_quiz_score: 0,
        sessions_attended: 0,
        unread_notifications: 0
      };
    }
  },

  async getGroupStats(groupId: string) {
    try {
      const { data } = await api.get(`/groups/${groupId}/stats`);
      return data;
    } catch (error) {
      console.error('Error fetching group stats:', error);
      return {
        member_count: 0,
        session_count: 0,
        material_count: 0
      };
    }
  },

  async getQuizStats(quizId: string) {
    try {
      const { data } = await api.get(`/quizzes/${quizId}/stats`);
      return data;
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
      return {
        total_attempts: 0,
        average_score: 0,
        average_time: 0,
        completion_rate: 0
      };
    }
  }
};
