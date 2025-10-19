-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_code TEXT NOT NULL UNIQUE,
  host_id UUID,
  title TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting participants table
CREATE TABLE public.meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_host BOOLEAN DEFAULT false
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for meetings (allow anyone to read, create)
CREATE POLICY "Anyone can view meetings"
  ON public.meetings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update meetings"
  ON public.meetings FOR UPDATE
  USING (true);

-- Policies for meeting participants
CREATE POLICY "Anyone can view participants"
  ON public.meeting_participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join meetings"
  ON public.meeting_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update participant info"
  ON public.meeting_participants FOR UPDATE
  USING (true);

-- Policies for chat messages
CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can send chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

-- Enable realtime for chat messages and participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_participants;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on meetings
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();