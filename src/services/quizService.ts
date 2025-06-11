import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Quiz = Database['public']['Tables']['quizzes']['Row']
type QuizInsert = Database['public']['Tables']['quizzes']['Insert']
type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
type QuizAttemptInsert = Database['public']['Tables']['quiz_attempts']['Insert']

export interface QuizWithAttempts extends Quiz {
  quiz_attempts: QuizAttempt[]
  creator: {
    username: string
    profile_image_url: string | null
  }
}

export const quizService = {
  async createQuiz(quizData: QuizInsert): Promise<Quiz> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating quiz:', error)
      throw error
    }
  },

  async getQuizzes(): Promise<QuizWithAttempts[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_attempts(*),
          profiles:created_by (
            username,
            profile_image_url
          )
        `)
        .or(`is_public.eq.true,created_by.eq.${user.user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(quiz => ({
        ...quiz,
        creator: quiz.profiles
      })) as QuizWithAttempts[]
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      return []
    }
  },

  async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching quiz:', error)
      return null
    }
  },

  async getUserQuizzes(): Promise<Quiz[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('created_by', user.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user quizzes:', error)
      return []
    }
  },

  async getGroupQuizzes(groupId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          profiles:created_by (
            username,
            profile_image_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching group quizzes:', error)
      return []
    }
  },

  async submitQuizAttempt(
    quizId: string, 
    answers: any, 
    score: number, 
    totalQuestions: number,
    timeSpent: number
  ): Promise<QuizAttempt> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          user_id: user.user.id,
          answers,
          score,
          total_questions: totalQuestions,
          time_spent: timeSpent
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error submitting quiz attempt:', error)
      throw error
    }
  },

  async getUserQuizAttempts(): Promise<QuizAttempt[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching user quiz attempts:', error)
      return []
    }
  },

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          profiles:user_id (
            username,
            profile_image_url
          )
        `)
        .eq('quiz_id', quizId)
        .order('completed_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching quiz attempts:', error)
      return []
    }
  },

  async updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<Quiz> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating quiz:', error)
      throw error
    }
  },

  async deleteQuiz(quizId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting quiz:', error)
      throw error
    }
  }
}