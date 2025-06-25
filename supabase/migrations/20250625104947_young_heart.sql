/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - Infinite recursion detected in policy for relation "group_members"
    - Complex policy conditions causing circular dependencies

  2. Solution
    - Create helper functions to check membership without recursion
    - Simplify RLS policies to avoid recursive lookups
    - Use direct user ID checks where possible
*/

-- Create helper function to check if user is a member of a group without RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id uuid)
RETURNS boolean AS $$
DECLARE
  is_member boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = target_group_id AND user_id = auth.uid()
  ) INTO is_member;
  
  RETURN is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is a group admin without RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_admin(target_group_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.group_members
  WHERE group_id = target_group_id AND user_id = auth.uid();
  
  RETURN user_role IN ('owner', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get all groups a user is a member of
CREATE OR REPLACE FUNCTION public.get_user_group_ids()
RETURNS uuid[] AS $$
DECLARE
  group_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(group_id) INTO group_ids
  FROM public.group_members
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(group_ids, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Group members can view group membership" ON public.group_members;
DROP POLICY IF EXISTS "Group members can view group materials" ON public.study_materials;
DROP POLICY IF EXISTS "Group owners and moderators can manage members" ON public.group_members;

-- Create new non-recursive policies for group_members
CREATE POLICY "Users can view own group membership" ON public.group_members 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can view other members in their groups" ON public.group_members 
FOR SELECT TO authenticated 
USING (public.is_group_member(group_id));

CREATE POLICY "Group admins can manage members" ON public.group_members 
FOR ALL TO authenticated 
USING (public.is_group_admin(group_id));

-- Create new non-recursive policy for study_materials
CREATE POLICY "Group members can view group materials" ON public.study_materials 
FOR SELECT TO authenticated 
USING (
  group_id IS NOT NULL AND public.is_group_member(group_id)
);

-- Update other policies that might have recursion issues
DROP POLICY IF EXISTS "Group members can view messages" ON public.chat_messages;
CREATE POLICY "Group members can view messages" ON public.chat_messages 
FOR SELECT TO authenticated 
USING (public.is_group_member(group_id));

DROP POLICY IF EXISTS "Group members can send messages" ON public.chat_messages;
CREATE POLICY "Group members can send messages" ON public.chat_messages 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid() AND public.is_group_member(group_id));

-- Update study sessions policies if they exist
DROP POLICY IF EXISTS "Group members can view sessions" ON public.study_sessions;
CREATE POLICY "Group members can view sessions" ON public.study_sessions 
FOR SELECT TO authenticated 
USING (public.is_group_member(group_id));