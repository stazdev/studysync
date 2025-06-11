/*
  # Create study groups table

  1. New Tables
    - `study_groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `subject` (text)
      - `difficulty` (text)
      - `privacy` (text)
      - `max_members` (integer)
      - `avatar` (text)
      - `tags` (text array)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `study_groups` table
    - Add policies for group visibility and management
*/

CREATE TABLE IF NOT EXISTS public.study_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  subject text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  privacy text NOT NULL CHECK (privacy IN ('public', 'private', 'invite-only')),
  max_members integer DEFAULT 20 CHECK (max_members > 0),
  avatar text DEFAULT '📚',
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Policy for viewing public groups
CREATE POLICY "Public groups are viewable by authenticated users"
  ON public.study_groups
  FOR SELECT
  TO authenticated
  USING (privacy = 'public' OR created_by = auth.uid());

-- Policy for group creators to manage their groups
CREATE POLICY "Group creators can manage their groups"
  ON public.study_groups
  FOR ALL
  USING (created_by = auth.uid());

-- Policy for authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
  ON public.study_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());