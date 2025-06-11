/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - The current RLS policies on study_materials table are causing infinite recursion
    - Policies that check group membership are creating circular dependencies
    
  2. Solution
    - Simplify the RLS policies to avoid recursive checks
    - Remove complex subqueries that can cause recursion
    - Use more direct policy conditions
    
  3. Changes
    - Update study_materials policies to be more direct
    - Ensure policies don't create circular references with group_members table
*/

-- Drop existing problematic policies on study_materials
DROP POLICY IF EXISTS "Group members can view group materials" ON study_materials;
DROP POLICY IF EXISTS "Users can view public materials" ON study_materials;
DROP POLICY IF EXISTS "Users can view their own materials" ON study_materials;
DROP POLICY IF EXISTS "Users can upload materials" ON study_materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON study_materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON study_materials;

-- Create simplified, non-recursive policies for study_materials
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

CREATE POLICY "Users can upload materials"
  ON study_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own materials"
  ON study_materials
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own materials"
  ON study_materials
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create a separate policy for group materials that doesn't cause recursion
-- This policy will be used when explicitly querying for group materials
CREATE POLICY "Group materials are viewable by group members"
  ON study_materials
  FOR SELECT
  TO authenticated
  USING (
    group_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = study_materials.group_id 
      AND gm.user_id = auth.uid()
    )
  );