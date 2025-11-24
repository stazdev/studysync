import api from '../lib/api';

export interface StudySessionWithDetails {
  id: string;
  title: string;
  description: string;
  scheduled_for: string;
  duration_minutes: number;
  status: string;
  host: {
    username: string;
    profile_image_url: string | null;
  };
  group: {
    name: string;
    avatar: string;
  };
  participants: Array<{
    user_id: string;
    username: string;
    profile_image_url: string | null;
    joined_at: string;
  }>;
  participant_count: number;
}

export const sessionService = {
  async createSession(sessionData: any): Promise<any> {
    try {
      const { data } = await api.post('/sessions', sessionData);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async getGroupSessions(groupId: string): Promise<StudySessionWithDetails[]> {
    try {
      const { data } = await api.get(`/groups/${groupId}/sessions`);
      return data;
    } catch (error) {
      console.error('Error fetching group sessions:', error);
      return [];
    }
  },

  async getUserSessions(): Promise<StudySessionWithDetails[]> {
    try {
      const { data } = await api.get('/sessions');
      return data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  },

  async getSession(sessionId: string): Promise<StudySessionWithDetails | null> {
    try {
      const { data } = await api.get(`/sessions/${sessionId}`);
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  },

  async joinSession(sessionId: string): Promise<void> {
    try {
      await api.post(`/sessions/${sessionId}/join`);
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  },

  async leaveSession(sessionId: string): Promise<void> {
    try {
      await api.post(`/sessions/${sessionId}/leave`);
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  },

  async updateSessionStatus(sessionId: string, status: string): Promise<void> {
    try {
      await api.put(`/sessions/${sessionId}`, { status });
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`/sessions/${sessionId}`);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeTo_SessionParticipants(sessionId: string, callback: (participant: any) => void) {
    // Mock implementation
    console.log(`Subscribed to session ${sessionId}`);
    return { unsubscribe: () => {} };
  },

  unsubscribeFromSession(subscription: any) {
    if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
    }
  }
};
