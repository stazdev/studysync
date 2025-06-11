/*
  # Create study materials table

  1. New Tables
    - `study_materials`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `analysis` (jsonb)
      - `uploaded_by` (uuid, references profiles)
      - `group_id` (uuid, references study_groups, optional)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `study_materials` table
    - Add policies for material access and management
*/

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

-- Policy for users to view their own materials
CREATE POLICY "Users can view their own materials"
  ON public.study_materials
  FOR SELECT
  USING (uploaded_by = auth.uid());

-- Policy for users to view public materials
CREATE POLICY "Users can view public materials"
  ON public.study_materials
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Policy for group members to view group materials
CREATE POLICY "Group members can view group materials"
  ON public.study_materials
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Policy for users to upload materials
CREATE POLICY "Users can upload materials"
  ON public.study_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Policy for users to update their own materials
CREATE POLICY "Users can update their own materials"
  ON public.study_materials
  FOR UPDATE
  USING (uploaded_by = auth.uid());

-- Policy for users to delete their own materials
CREATE POLICY "Users can delete their own materials"
  ON public.study_materials
  FOR DELETE
  USING (uploaded_by = auth.uid());