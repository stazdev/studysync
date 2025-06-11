/*
  # Create study sessions table

  1. New Tables
    - `study_sessions`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `group_id` (uuid, references study_groups)
      - `host_id` (uuid, references profiles)
      - `scheduled_for` (timestamp)
      - `duration_minutes` (integer)
      - `session_type` (text)
      - `status` (text)
      - `max_participants` (integer)
      - `meeting_url` (text)
      - `resources` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `session_participants`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references study_sessions)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamp)
      - `left_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for session management
*/

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_for timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  session_type text NOT NULL CHECK (session_type IN ('study', 'quiz', 'discussion', 'presentation')) DEFAULT 'study',
  status text NOT NULL CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
  max_participants integer DEFAULT 20,
  meeting_url text,
  resources jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.session_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  left_at timestamptz,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Session policies
CREATE POLICY "Group members can view group sessions"
  ON public.study_sessions
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create sessions"
  ON public.study_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Session hosts can update their sessions"
  ON public.study_sessions
  FOR UPDATE
  USING (host_id = auth.uid());

-- Participant policies
CREATE POLICY "Users can view session participants"
  ON public.session_participants
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.study_sessions s
      WHERE s.group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can join sessions"
  ON public.session_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
  ON public.session_participants
  FOR UPDATE
  USING (user_id = auth.uid());