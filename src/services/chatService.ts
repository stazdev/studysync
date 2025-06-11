import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']

export interface ChatMessageWithProfile extends ChatMessage {
  profiles: {
    username: string
    profile_image_url: string | null
  }
}

export const chatService = {
  async getMessages(groupId: string): Promise<ChatMessageWithProfile[]> {
    try {
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
      return data as ChatMessageWithProfile[]
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  },

  async sendMessage(
    groupId: string, 
    message: string, 
    messageType: string = 'text',
    fileUrl?: string,
    fileName?: string,
    replyTo?: string
  ): Promise<ChatMessage> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          group_id: groupId,
          user_id: user.user.id,
          message,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          reply_to: replyTo
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },

  async editMessage(messageId: string, newMessage: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          message: newMessage, 
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  },

  subscribeToMessages(groupId: string, callback: (message: ChatMessageWithProfile) => void) {
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
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles:user_id (
                username,
                profile_image_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            callback(data as ChatMessageWithProfile)
          }
        }
      )
      .subscribe()
  },

  unsubscribeFromMessages(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}