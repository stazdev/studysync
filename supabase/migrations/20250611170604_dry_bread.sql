/*
  # Enable realtime for tables that need live updates

  1. Enable realtime for:
    - chat_messages (for live chat)
    - notifications (for live notifications)
    - session_participants (for live session updates)
    - group_members (for live membership updates)

  2. Create publication for realtime
*/

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for session participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;

-- Enable realtime for group members
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- Enable realtime for study sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;