/*
  # Create group members table

  1. New Tables
    - `group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references study_groups)
      - `user_id` (uuid, references profiles)
      - `role` (text)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on `group_members` table
    - Add policies for member management
*/

CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'moderator', 'member')) DEFAULT 'member',
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policy for group members to view membership
CREATE POLICY "Group members can view group membership"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Policy for users to join groups
CREATE POLICY "Users can join groups"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for group owners/moderators to manage members
CREATE POLICY "Group owners and moderators can manage members"
  ON public.group_members
  FOR ALL
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'moderator')
    )
  );

-- Function to automatically add group creator as owner
CREATE OR REPLACE FUNCTION public.add_group_creator_as_owner()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add creator as owner when group is created
DROP TRIGGER IF EXISTS on_group_created ON public.study_groups;
CREATE TRIGGER on_group_created
  AFTER INSERT ON public.study_groups
  FOR EACH ROW EXECUTE FUNCTION public.add_group_creator_as_owner();