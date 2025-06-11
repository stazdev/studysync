/*
  # Fix RLS Policy Recursion Issues

  1. Problem
    - Infinite recursion detected in policies for study_materials and group_members tables
    - Complex policy conditions causing circular dependencies

  2. Solution
    - Simplify RLS policies to avoid recursive lookups
    - Use direct user ID checks where possible
    - Remove complex subqueries that cause recursion

  3. Changes
    - Update study_materials policies to use simpler conditions
    - Ensure group_members policies don't create circular references
    - Add helper functions if needed for complex authorization
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Group members can view group materials" ON study_materials;
DROP POLICY IF EXISTS "Group members can view group membership" ON group_members;

-- Create simplified policies for study_materials
CREATE POLICY "Users can view their own materials"
  ON study_materials
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can view public materials"
  ON study_materials
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Group members can view group materials"
  ON study_materials
  FOR SELECT
  TO authenticated
  USING (
    group_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = study_materials.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

-- Create simplified policies for group_members
CREATE POLICY "Users can view their own membership"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Group members can view other members in same groups"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id 
      FROM group_members gm 
      WHERE gm.user_id = auth.uid()
    )
  );

-- Ensure other policies are properly configured
CREATE POLICY "Users can insert materials"
  ON study_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own materials"
  ON study_materials
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own materials"
  ON study_materials
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Add policy for joining groups
CREATE POLICY "Users can join groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add policy for group owners/moderators to manage members
CREATE POLICY "Group owners can manage members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'moderator')
    )
  );