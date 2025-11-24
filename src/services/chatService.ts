import io from 'socket.io-client';
import api from '../lib/api';

const socket = io('http://localhost:5000');

export interface ChatMessageWithProfile {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  groupId: string;
}

export const chatService = {
  async getMessages(groupId: string): Promise<ChatMessageWithProfile[]> {
    try {
      const { data } = await api.get(`/chat/${groupId}`);
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(
    groupId: string, 
    message: string, 
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _messageType: string = 'text',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fileUrl?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fileName?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _replyTo?: string
  ): Promise<void> {
    // We emit socket event for real-time
    socket.emit('send_message', {
        groupId,
        content: message,
        senderId: userId
    });
    // Note: The server saves the message to DB when it receives the socket event
  },

  joinGroup(groupId: string) {
      socket.emit('join_group', groupId);
  },

  leaveGroup(groupId: string) {
      socket.emit('leave_group', groupId);
  },

  subscribeToMessages(callback: (message: ChatMessageWithProfile) => void) {
    socket.on('receive_message', (message: any) => {
        callback(message);
    });
  },

  unsubscribeFromMessages() {
    socket.off('receive_message');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async editMessage(_messageId: string, _newMessage: string): Promise<void> {
     // Placeholder
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteMessage(_messageId: string): Promise<void> {
     // Placeholder
  }
};
