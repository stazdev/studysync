/*
  # Create storage buckets for file uploads

  1. Storage Buckets
    - `avatars` - for profile images
    - `study-materials` - for uploaded documents
    - `chat-files` - for chat file attachments

  2. Storage Policies
    - Users can upload their own files
    - Users can view files they have access to
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('study-materials', 'study-materials', false),
  ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Study materials storage policies
CREATE POLICY "Users can view study materials they have access to"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'study-materials' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.study_materials sm
        WHERE sm.file_url LIKE '%' || name || '%'
        AND (
          sm.uploaded_by = auth.uid() OR
          sm.is_public = true OR
          sm.group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can upload study materials"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'study-materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own study materials"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'study-materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own study materials"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'study-materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Chat files storage policies
CREATE POLICY "Group members can view chat files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-files' AND
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.group_members gm ON cm.group_id = gm.group_id
      WHERE cm.file_url LIKE '%' || name || '%'
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload chat files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );