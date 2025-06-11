/*
  # Create user preferences table

  1. New Tables
    - `user_preferences`
      - `user_id` (uuid, primary key, references auth.users)
      - `preferences` (jsonb, stores user preference settings)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own preferences
CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own preferences
CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);