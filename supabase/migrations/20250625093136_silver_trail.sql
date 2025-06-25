/*
  # Fix infinite recursion in RLS policies

  1. Create helper function to get user group IDs without RLS recursion
  2. Update policies to use the helper function
  3. Remove recursive policy dependencies
*/

-- Create helper function to get user's group IDs without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_group_ids()
RETURNS uuid[] AS $$
DECLARE
  group_ids uuid[];
BEGIN
  SELECT array_agg(group_id) INTO group_ids
  FROM public.group_members
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(group_ids, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the problematic policies to fix recursion

-- Fix group_members policies
DROP POLICY IF EXISTS "Members can view group membership" ON public.group_members;
CREATE POLICY "Members can view group membership" ON public.group_members 
FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  group_id = ANY(public.get_user_group_ids())
);

-- Fix study_materials policies
DROP POLICY IF EXISTS "Group members can view group materials" ON public.study_materials;
CREATE POLICY "Group members can view group materials" ON public.study_materials 
FOR SELECT TO authenticated USING (
  group_id IS NOT NULL AND 
  group_id = ANY(public.get_user_group_ids())
);

-- Fix study_sessions policies
DROP POLICY IF EXISTS "Group members can view sessions" ON public.study_sessions;
CREATE POLICY "Group members can view sessions" ON public.study_sessions 
FOR SELECT TO authenticated USING (
  group_id = ANY(public.get_user_group_ids())
);

-- Fix session_participants policies
DROP POLICY IF EXISTS "Users can view session participants" ON public.session_participants;
CREATE POLICY "Users can view session participants" ON public.session_participants 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.study_sessions s 
    WHERE s.id = session_participants.session_id AND s.group_id = ANY(public.get_user_group_ids())
  )
);

-- Fix chat_messages policies
DROP POLICY IF EXISTS "Group members can view messages" ON public.chat_messages;
CREATE POLICY "Group members can view messages" ON public.chat_messages 
FOR SELECT TO authenticated USING (
  group_id = ANY(public.get_user_group_ids())
);

DROP POLICY IF EXISTS "Group members can send messages" ON public.chat_messages;
CREATE POLICY "Group members can send messages" ON public.chat_messages 
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND 
  group_id = ANY(public.get_user_group_ids())
);

-- Update get_user_groups function to use the helper
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