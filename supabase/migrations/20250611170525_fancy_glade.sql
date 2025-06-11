/*
  # Create chat messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references study_groups)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `message_type` (text)
      - `file_url` (text)
      - `file_name` (text)
      - `reply_to` (uuid, references chat_messages)
      - `is_edited` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for message access and management
*/

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('text', 'file', 'image', 'system')) DEFAULT 'text',
  file_url text,
  file_name text,
  reply_to uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for group members to view messages
CREATE POLICY "Group members can view messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Policy for group members to send messages
CREATE POLICY "Group members can send messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Policy for users to edit their own messages
CREATE POLICY "Users can edit their own messages"
  ON public.chat_messages
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy for users to delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages
  FOR DELETE
  USING (user_id = auth.uid());