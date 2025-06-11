/*
  # Helper functions for the application

  1. Functions
    - `get_user_groups()` - Get groups for current user
    - `get_group_members(group_id)` - Get members of a group
    - `join_group(group_id)` - Join a study group
    - `leave_group(group_id)` - Leave a study group
    - `create_notification(user_id, title, message, type)` - Create notification
    - `get_user_stats()` - Get user statistics
*/

-- Function to get user's groups with member count and role
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

-- Function to get group members with profile info
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
  -- Check if user is a member of the group
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = target_group_id AND user_id = auth.uid()
  ) THEN
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

-- Function to join a group
CREATE OR REPLACE FUNCTION public.join_group(target_group_id uuid)
RETURNS json AS $$
DECLARE
  group_info record;
  member_count integer;
BEGIN
  -- Get group info
  SELECT * INTO group_info
  FROM public.study_groups
  WHERE id = target_group_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  -- Check if group is public or user has permission
  IF group_info.privacy = 'private' THEN
    RAISE EXCEPTION 'Cannot join private group without invitation';
  END IF;

  -- Check member count
  SELECT COUNT(*) INTO member_count
  FROM public.group_members
  WHERE group_id = target_group_id;

  IF member_count >= group_info.max_members THEN
    RAISE EXCEPTION 'Group is full';
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = target_group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;

  -- Join the group
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (target_group_id, auth.uid(), 'member');

  -- Create notification for group owner
  PERFORM public.create_notification(
    group_info.created_by,
    'New Group Member',
    (SELECT username FROM public.profiles WHERE id = auth.uid()) || ' joined ' || group_info.name,
    'group'
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully joined group'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to leave a group
CREATE OR REPLACE FUNCTION public.leave_group(target_group_id uuid)
RETURNS json AS $$
DECLARE
  user_role text;
  owner_count integer;
BEGIN
  -- Get user's role in the group
  SELECT role INTO user_role
  FROM public.group_members
  WHERE group_id = target_group_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not a member of this group';
  END IF;

  -- Check if user is the only owner
  IF user_role = 'owner' THEN
    SELECT COUNT(*) INTO owner_count
    FROM public.group_members
    WHERE group_id = target_group_id AND role = 'owner';

    IF owner_count = 1 THEN
      RAISE EXCEPTION 'Cannot leave group: You are the only owner. Transfer ownership first.';
    END IF;
  END IF;

  -- Remove from group
  DELETE FROM public.group_members
  WHERE group_id = target_group_id AND user_id = auth.uid();

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully left group'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text,
  notification_type text DEFAULT 'info',
  notification_priority text DEFAULT 'medium',
  notification_action_url text DEFAULT NULL,
  notification_action_label text DEFAULT NULL,
  notification_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, type, priority, action_url, action_label, metadata
  )
  VALUES (
    target_user_id, notification_title, notification_message, 
    notification_type, notification_priority, notification_action_url, 
    notification_action_label, notification_metadata
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS json AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'groups_joined', (
      SELECT COUNT(*) FROM public.group_members WHERE user_id = auth.uid()
    ),
    'materials_uploaded', (
      SELECT COUNT(*) FROM public.study_materials WHERE uploaded_by = auth.uid()
    ),
    'quizzes_taken', (
      SELECT COUNT(*) FROM public.quiz_attempts WHERE user_id = auth.uid()
    ),
    'average_quiz_score', (
      SELECT COALESCE(AVG(score), 0) FROM public.quiz_attempts WHERE user_id = auth.uid()
    ),
    'sessions_attended', (
      SELECT COUNT(*) FROM public.session_participants WHERE user_id = auth.uid()
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM public.notifications WHERE user_id = auth.uid() AND is_read = false
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;