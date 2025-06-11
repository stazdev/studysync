import { supabase } from '../lib/supabase'

export interface UserStats {
  groups_joined: number
  materials_uploaded: number
  quizzes_taken: number
  average_quiz_score: number
  sessions_attended: number
  unread_notifications: number
}

export const statsService = {
  async getUserStats(): Promise<UserStats> {
    try {
      const { data, error } = await supabase.rpc('get_user_stats')
      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        groups_joined: 0,
        materials_uploaded: 0,
        quizzes_taken: 0,
        average_quiz_score: 0,
        sessions_attended: 0,
        unread_notifications: 0
      }
    }
  },

  async getGroupStats(groupId: string) {
    try {
      // Get group member count
      const { count: memberCount, error: memberError } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)

      if (memberError) throw memberError

      // Get session count
      const { count: sessionCount, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)

      if (sessionError) throw sessionError

      // Get material count
      const { count: materialCount, error: materialError } = await supabase
        .from('study_materials')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)

      if (materialError) throw materialError

      return {
        member_count: memberCount || 0,
        session_count: sessionCount || 0,
        material_count: materialCount || 0
      }
    } catch (error) {
      console.error('Error fetching group stats:', error)
      return {
        member_count: 0,
        session_count: 0,
        material_count: 0
      }
    }
  },

  async getQuizStats(quizId: string) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('score, time_spent, completed_at')
        .eq('quiz_id', quizId)

      if (error) throw error

      const attempts = data || []
      const totalAttempts = attempts.length
      const averageScore = totalAttempts > 0 
        ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
        : 0
      const averageTime = totalAttempts > 0
        ? attempts.reduce((sum, attempt) => sum + attempt.time_spent, 0) / totalAttempts
        : 0

      return {
        total_attempts: totalAttempts,
        average_score: Math.round(averageScore * 100) / 100,
        average_time: Math.round(averageTime),
        completion_rate: totalAttempts > 0 ? 100 : 0 // Simplified for now
      }
    } catch (error) {
      console.error('Error fetching quiz stats:', error)
      return {
        total_attempts: 0,
        average_score: 0,
        average_time: 0,
        completion_rate: 0
      }
    }
  }
}