-- Add password field to meetings table
ALTER TABLE public.meetings
ADD COLUMN password TEXT;

-- Create recordings table
CREATE TABLE public.meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on recordings table
ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies for recordings
CREATE POLICY "Users can view recordings of meetings they participated in"
ON public.meeting_recordings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meeting_participants
    WHERE meeting_participants.meeting_id = meeting_recordings.meeting_id
    AND meeting_participants.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can create recordings"
ON public.meeting_recordings
FOR INSERT
WITH CHECK (auth.uid()::text = recorded_by::text);

CREATE POLICY "Users can delete their own recordings"
ON public.meeting_recordings
FOR DELETE
USING (auth.uid()::text = recorded_by::text);

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-recordings', 'meeting-recordings', false);

-- Storage policies for recordings
CREATE POLICY "Users can upload their recordings"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'meeting-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view recordings they have access to"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'meeting-recordings'
  AND EXISTS (
    SELECT 1 FROM public.meeting_recordings
    WHERE meeting_recordings.file_path = storage.objects.name
    AND EXISTS (
      SELECT 1 FROM public.meeting_participants
      WHERE meeting_participants.meeting_id = meeting_recordings.meeting_id
      AND meeting_participants.user_id::text = auth.uid()::text
    )
  )
);

CREATE POLICY "Users can delete their own recordings"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'meeting-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add trigger for recordings updated_at
CREATE TRIGGER update_meeting_recordings_updated_at
BEFORE UPDATE ON public.meeting_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();