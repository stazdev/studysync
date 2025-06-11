/*
  # Create quizzes and quiz attempts tables

  1. New Tables
    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `subject` (text)
      - `difficulty` (text)
      - `questions` (jsonb)
      - `settings` (jsonb)
      - `created_by` (uuid, references profiles)
      - `group_id` (uuid, references study_groups, optional)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `quiz_attempts`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, references quizzes)
      - `user_id` (uuid, references profiles)
      - `answers` (jsonb)
      - `score` (integer)
      - `total_questions` (integer)
      - `time_spent` (integer)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for quiz access and attempt management
*/

CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Mixed')),
  questions jsonb NOT NULL DEFAULT '[]',
  settings jsonb NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES public.study_groups(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  time_spent integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quiz policies
CREATE POLICY "Users can view their own quizzes"
  ON public.quizzes
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can view public quizzes"
  ON public.quizzes
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Group members can view group quizzes"
  ON public.quizzes
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quizzes"
  ON public.quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own quizzes"
  ON public.quizzes
  FOR UPDATE
  USING (created_by = auth.uid());

-- Quiz attempt policies
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create quiz attempts"
  ON public.quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Quiz creators can view attempts on their quizzes"
  ON public.quiz_attempts
  FOR SELECT
  USING (
    quiz_id IN (
      SELECT id FROM public.quizzes WHERE created_by = auth.uid()
    )
  );