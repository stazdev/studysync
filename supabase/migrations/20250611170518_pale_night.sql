/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `type` (text)
      - `priority` (text)
      - `is_read` (boolean)
      - `action_url` (text)
      - `action_label` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
      - `read_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for notification management
*/

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'quiz', 'group', 'session', 'achievement')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_read boolean DEFAULT false,
  action_url text,
  action_label text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  read_at timestamptz
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy for users to update their own notifications
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy for system to create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;