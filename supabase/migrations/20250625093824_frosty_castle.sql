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
  SELECT ARRAY_AGG(group_id) INTO group_ids
  FROM public.group_members
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(group_ids, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view group membership" ON public.group_members;
DROP POLICY IF EXISTS "Group members can view group materials" ON public.study_materials;

-- Create new non-recursive policies for group_members
CREATE POLICY "Members can view group membership" ON public.group_members 
FOR SELECT TO authenticated 
USING (
  user_id = auth.uid() OR 
  group_id = ANY(public.get_user_group_ids())
);

-- Create new non-recursive policy for study_materials
CREATE POLICY "Group members can view group materials" ON public.study_materials 
FOR SELECT TO authenticated 
USING (
  group_id IS NOT NULL AND 
  group_id = ANY(public.get_user_group_ids())
);

-- Update other functions that might have recursion issues
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

-- Update get_group_members function to avoid recursion
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
  -- Check if user is a member of the group using the helper function
  IF NOT (target_group_id = ANY(public.get_user_group_ids())) THEN
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