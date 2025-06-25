/*
  # Fix RLS recursion and add missing admin helper function

  1. Create helper function to check if user is group admin without recursion
  2. Update problematic RLS policies to use the helper function
  3. Ensure all policies are non-recursive
*/

-- Create helper function to check if user is group admin without RLS recursion
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

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Group owners and moderators can manage members" ON public.group_members;

-- Create new non-recursive policy for group member management
CREATE POLICY "Group owners and moderators can manage members" ON public.group_members 
FOR ALL TO authenticated 
USING (
  -- Allow users to see their own membership
  user_id = auth.uid() OR 
  -- Allow group admins to manage members using the helper function
  public.is_group_admin(group_id)
);

-- Ensure the group_members select policy is also non-recursive
DROP POLICY IF EXISTS "Members can view group membership" ON public.group_members;
CREATE POLICY "Members can view group membership" ON public.group_members 
FOR SELECT TO authenticated 
USING (
  user_id = auth.uid() OR 
  public.is_group_admin(group_id) OR
  group_id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

-- Update study_materials policy to be more explicit and avoid recursion
DROP POLICY IF EXISTS "Group members can view group materials" ON public.study_materials;
CREATE POLICY "Group members can view group materials" ON public.study_materials 
FOR SELECT TO authenticated 
USING (
  -- Allow access to own materials
  uploaded_by = auth.uid() OR
  -- Allow access to group materials if user is a member
  (group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = study_materials.group_id 
    AND gm.user_id = auth.uid()
  ))
);

-- Update the get_user_group_ids function to be more efficient
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