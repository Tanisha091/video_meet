import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMediaRecorder = (stream: MediaStream | null, meetingId: string, userId: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const startRecording = async () => {
    if (!stream) {
      toast({
        title: "Cannot start recording",
        description: "No media stream available",
        variant: "destructive",
      });
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        await uploadRecording(blob, duration);
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "Your meeting is now being recorded",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Processing your recording...",
      });
    }
  };

  const downloadRecording = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meetingId}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadRecording = async (blob: Blob, duration: number) => {
    try {
      // Download to device first
      downloadRecording(blob);
      
      const fileName = `${userId}/${meetingId}-${Date.now()}.webm`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('meeting-recordings')
        .upload(fileName, blob, {
          contentType: 'video/webm',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('meeting_recordings')
        .insert({
          meeting_id: meetingId,
          recorded_by: userId,
          file_path: fileName,
          file_size: blob.size,
          duration: duration,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Recording saved",
        description: "Your recording has been downloaded and saved to the cloud",
      });
    } catch (error) {
      console.error("Error uploading recording:", error);
      toast({
        title: "Upload failed",
        description: "Recording downloaded but cloud upload failed",
        variant: "destructive",
      });
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
