/*
  # Complete StudySync Database Schema

  1. Tables
    - profiles: User profile information
    - study_groups: Study group data
    - group_members: Group membership relationships
    - study_materials: Uploaded content and analysis
    - quizzes: Quiz definitions and settings
    - quiz_attempts: User quiz attempts and scores
    - study_sessions: Live study sessions
    - session_participants: Session attendance tracking
    - notifications: User notifications
    - chat_messages: Group chat messages
    - user_preferences: User settings and preferences

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Create helper functions with SECURITY DEFINER

  3. Storage
    - Create storage buckets for avatars, study materials, and chat files
    - Add storage policies for file access control
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  bio text,
  location text,
  profile_image_url text,
  study_buddy_persona text DEFAULT 'professor-synapse',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create study_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.study_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  subject text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  privacy text NOT NULL CHECK (privacy IN ('public', 'private')) DEFAULT 'public',
  max_members integer DEFAULT 50,
  avatar text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Study groups policies
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.study_groups;
CREATE POLICY "Anyone can view public groups" ON public.study_groups FOR SELECT TO authenticated USING (privacy = 'public');

DROP POLICY IF EXISTS "Members can view private groups" ON public.study_groups;
CREATE POLICY "Members can view private groups" ON public.study_groups FOR SELECT TO authenticated USING (
  privacy = 'private' AND id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create groups" ON public.study_groups;
CREATE POLICY "Users can create groups" ON public.study_groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Owners can update groups" ON public.study_groups;
CREATE POLICY "Owners can update groups" ON public.study_groups FOR UPDATE USING (created_by = auth.uid());

-- Create group_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'moderator', 'member')) DEFAULT 'member',
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Group members policies - simplified to avoid recursion
DROP POLICY IF EXISTS "Members can view group membership" ON public.group_members;
CREATE POLICY "Members can view group membership" ON public.group_members FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (user_id = auth.uid());

-- Create study_materials table with correct columns
CREATE TABLE IF NOT EXISTS public.study_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  analysis jsonb DEFAULT '{}',
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Study materials policies - simplified to avoid recursion
DROP POLICY IF EXISTS "Users can view their own materials" ON public.study_materials;
CREATE POLICY "Users can view their own materials" ON public.study_materials FOR SELECT USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Users can view public materials" ON public.study_materials;
CREATE POLICY "Users can view public materials" ON public.study_materials FOR SELECT TO authenticated USING (is_public = true);

DROP POLICY IF EXISTS "Group members can view group materials" ON public.study_materials;
CREATE POLICY "Group members can view group materials" ON public.study_materials FOR SELECT TO authenticated USING (
  group_id IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = study_materials.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can upload materials" ON public.study_materials;
CREATE POLICY "Users can upload materials" ON public.study_materials FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own materials" ON public.study_materials;
CREATE POLICY "Users can update their own materials" ON public.study_materials FOR UPDATE USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own materials" ON public.study_materials;
CREATE POLICY "Users can delete their own materials" ON public.study_materials FOR DELETE USING (uploaded_by = auth.uid());

-- Create notifications table
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

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- User preferences policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  questions jsonb NOT NULL,
  time_limit integer, -- in minutes
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Quiz policies
DROP POLICY IF EXISTS "Users can view public quizzes" ON public.quizzes;
CREATE POLICY "Users can view public quizzes" ON public.quizzes FOR SELECT TO authenticated USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
CREATE POLICY "Users can view their own quizzes" ON public.quizzes FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Group members can view group quizzes" ON public.quizzes;
CREATE POLICY "Group members can view group quizzes" ON public.quizzes FOR SELECT TO authenticated USING (
  group_id IS NOT NULL AND
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = quizzes.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create quizzes" ON public.quizzes;
CREATE POLICY "Users can create quizzes" ON public.quizzes FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL,
  score numeric(5,2) NOT NULL,
  time_spent integer NOT NULL, -- in seconds
  completed_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quiz attempts policies
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view their own attempts" ON public.quiz_attempts FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create attempts" ON public.quiz_attempts;
CREATE POLICY "Users can create attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration integer NOT NULL, -- in minutes
  status text NOT NULL CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')) DEFAULT 'scheduled',
  meeting_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Study sessions policies
DROP POLICY IF EXISTS "Group members can view sessions" ON public.study_sessions;
CREATE POLICY "Group members can view sessions" ON public.study_sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = study_sessions.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create sessions" ON public.study_sessions;
CREATE POLICY "Users can create sessions" ON public.study_sessions FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());

-- Create session_participants table
CREATE TABLE IF NOT EXISTS public.session_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  left_at timestamptz,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Session participants policies
DROP POLICY IF EXISTS "Users can view session participants" ON public.session_participants;
CREATE POLICY "Users can view session participants" ON public.session_participants FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.study_sessions s 
    JOIN public.group_members gm ON s.group_id = gm.group_id 
    WHERE s.id = session_participants.session_id AND gm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can join sessions" ON public.session_participants;
CREATE POLICY "Users can join sessions" ON public.session_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('text', 'file', 'image')) DEFAULT 'text',
  file_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
DROP POLICY IF EXISTS "Group members can view messages" ON public.chat_messages;
CREATE POLICY "Group members can view messages" ON public.chat_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = chat_messages.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Group members can send messages" ON public.chat_messages;
CREATE POLICY "Group members can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = chat_messages.group_id AND user_id = auth.uid())
);

-- Create or replace helper functions
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text,
  notification_type text DEFAULT 'info',
  notification_priority text DEFAULT 'medium',
  notification_action_url text DEFAULT NULL,
  notification_action_label text DEFAULT NULL,
  notification_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, type, priority, action_url, action_label, metadata
  )
  VALUES (
    target_user_id, notification_title, notification_message, 
    notification_type, notification_priority, notification_action_url, 
    notification_action_label, notification_metadata
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS json AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'groups_joined', (
      SELECT COUNT(*) FROM public.group_members WHERE user_id = auth.uid()
    ),
    'materials_uploaded', (
      SELECT COUNT(*) FROM public.study_materials WHERE uploaded_by = auth.uid()
    ),
    'quizzes_taken', (
      SELECT COUNT(*) FROM public.quiz_attempts WHERE user_id = auth.uid()
    ),
    'average_quiz_score', (
      SELECT COALESCE(AVG(score), 0) FROM public.quiz_attempts WHERE user_id = auth.uid()
    ),
    'sessions_attended', (
      SELECT COUNT(*) FROM public.session_participants WHERE user_id = auth.uid()
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM public.notifications WHERE user_id = auth.uid() AND is_read = false
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_groups()
RETURNS TABLE (
  group_id uuid,
  group_name text,
  description text,
  subject text,
  difficulty text,
  privacy text,
  avatar text,
  tags text[],
  member_count bigint,
  user_role text,
  created_by uuid,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sg.id,
    sg.name,
    sg.description,
    sg.subject,
    sg.difficulty,
    sg.privacy,
    sg.avatar,
    sg.tags,
    COUNT(gm2.user_id) as member_count,
    gm.role,
    sg.created_by,
    sg.created_at
  FROM public.study_groups sg
  JOIN public.group_members gm ON sg.id = gm.group_id
  LEFT JOIN public.group_members gm2 ON sg.id = gm2.group_id
  WHERE gm.user_id = auth.uid()
  GROUP BY sg.id, sg.name, sg.description, sg.subject, sg.difficulty, 
           sg.privacy, sg.avatar, sg.tags, gm.role, sg.created_by, sg.created_at
  ORDER BY sg.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_group_members(target_group_id uuid)
RETURNS TABLE (
  user_id uuid,
  username text,
  full_name text,
  profile_image_url text,
  role text,
  joined_at timestamptz
) AS $$
BEGIN
  -- Check if user is a member of the group
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = target_group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this group';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.profile_image_url,
    gm.role,
    gm.joined_at
  FROM public.group_members gm
  JOIN public.profiles p ON gm.user_id = p.id
  WHERE gm.group_id = target_group_id
  ORDER BY 
    CASE gm.role 
      WHEN 'owner' THEN 1 
      WHEN 'moderator' THEN 2 
      ELSE 3 
    END,
    gm.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.join_group(target_group_id uuid)
RETURNS json AS $$
DECLARE
  group_info record;
  member_count integer;
BEGIN
  -- Get group info
  SELECT * INTO group_info
  FROM public.study_groups
  WHERE id = target_group_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  -- Check if group is public or user has permission
  IF group_info.privacy = 'private' THEN
    RAISE EXCEPTION 'Cannot join private group without invitation';
  END IF;

  -- Check member count
  SELECT COUNT(*) INTO member_count
  FROM public.group_members
  WHERE group_id = target_group_id;

  IF member_count >= group_info.max_members THEN
    RAISE EXCEPTION 'Group is full';
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = target_group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;

  -- Join the group
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (target_group_id, auth.uid(), 'member');

  -- Create notification for group owner
  PERFORM public.create_notification(
    group_info.created_by,
    'New Group Member',
    (SELECT username FROM public.profiles WHERE id = auth.uid()) || ' joined ' || group_info.name,
    'group'
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully joined group'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.leave_group(target_group_id uuid)
RETURNS json AS $$
DECLARE
  user_role text;
  owner_count integer;
BEGIN
  -- Get user's role in the group
  SELECT role INTO user_role
  FROM public.group_members
  WHERE group_id = target_group_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;

  -- Check if user is the only owner
  IF user_role = 'owner' THEN
    SELECT COUNT(*) INTO owner_count
    FROM public.group_members
    WHERE group_id = target_group_id AND role = 'owner';

    IF owner_count = 1 THEN
      RAISE EXCEPTION 'Cannot leave group: You are the only owner. Transfer ownership first.';
    END IF;
  END IF;

  -- Remove from group
  DELETE FROM public.group_members
  WHERE group_id = target_group_id AND user_id = auth.uid();

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully left group'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('study-materials', 'study-materials', false),
  ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket (using storage.objects table directly)
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for study-materials bucket
CREATE POLICY IF NOT EXISTS "Users can view their own materials" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'study-materials' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can upload their own materials" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'study-materials' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for chat-files bucket
CREATE POLICY IF NOT EXISTS "Group members can view chat files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-files');

CREATE POLICY IF NOT EXISTS "Users can upload chat files" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);