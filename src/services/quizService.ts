import api from '../lib/api';

export interface QuizWithAttempts {
  _id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  questions: any[];
  createdBy: string;
  createdAt: string;
  quiz_attempts: any[];
  creator: {
    username: string;
    profile_image_url: string | null;
  };
}

export const quizService = {
  async createQuiz(quizData: any): Promise<any> {
    try {
      const { data } = await api.post('/quizzes', quizData);
      return data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  async getQuizzes(): Promise<QuizWithAttempts[]> {
    try {
      const { data } = await api.get('/quizzes');
      return data.map((quiz: any) => ({
        ...quiz,
        quiz_attempts: [], // Populate if needed
        creator: {
            username: 'User', // Populate if needed
            profile_image_url: ''
        }
      }));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  },

  async getQuiz(quizId: string): Promise<any | null> {
    try {
      const { data } = await api.get(`/quizzes/${quizId}`);
      return data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
  },

  async getUserQuizzes(): Promise<any[]> {
     // Reuse getQuizzes as it filters by user in backend currently
    return this.getQuizzes();
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGroupQuizzes(_groupId: string): Promise<any[]> {
    // Not implemented in backend
    return [];
  },

  async submitQuizAttempt(
    quizId: string, 
    answers: any, 
    score: number, 
    totalQuestions: number,
    timeSpent: number
  ): Promise<any> {
     try {
        const { data } = await api.post(`/quizzes/${quizId}/submit`, {
            answers,
            score,
            totalQuestions,
            timeSpent
        });
        return data;
     } catch (error) {
         console.error("Error submitting quiz", error);
         throw error;
     }
  },

  async getUserQuizAttempts(): Promise<any[]> {
     // Not implemented in backend
    return [];
  },

  async getQuizAttempts(quizId: string): Promise<any[]> {
    // Not implemented in backend
    // Could fetch from /quizzes/:id/attempts if implemented
    console.log(`Fetching attempts for ${quizId}`);
    return [];
  },

  async updateQuiz(quizId: string, updates: any): Promise<any> {
     // Not implemented in backend
     console.log(`Update quiz ${quizId}`, updates);
     return {};
  },

  async deleteQuiz(quizId: string): Promise<void> {
    // Not implemented in backend
    console.log(`Delete quiz ${quizId}`);
  }
};
