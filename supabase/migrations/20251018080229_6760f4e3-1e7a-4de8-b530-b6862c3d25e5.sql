-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies on existing tables to require authentication
DROP POLICY IF EXISTS "Anyone can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can update meetings" ON public.meetings;

CREATE POLICY "Authenticated users can view meetings"
ON public.meetings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create meetings"
ON public.meetings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update meetings"
ON public.meetings FOR UPDATE
TO authenticated
USING (true);

-- Update meeting_participants policies
DROP POLICY IF EXISTS "Anyone can view participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Anyone can join meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Anyone can update participant info" ON public.meeting_participants;

CREATE POLICY "Authenticated users can view participants"
ON public.meeting_participants FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can join meetings"
ON public.meeting_participants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update participant info"
ON public.meeting_participants FOR UPDATE
TO authenticated
USING (true);

-- Update chat_messages policies
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can send chat messages" ON public.chat_messages;

CREATE POLICY "Authenticated users can view chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can send chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();