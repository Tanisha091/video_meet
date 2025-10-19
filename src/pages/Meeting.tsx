import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import VideoGrid from "@/components/meeting/VideoGrid";
import ControlBar from "@/components/meeting/ControlBar";
import ChatPanel from "@/components/meeting/ChatPanel";
import { Loader2 } from "lucide-react";
import { playUserJoinSound, playUserLeaveSound } from "@/utils/sounds";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useWebRTC } from "@/hooks/useWebRTC";

interface Participant {
  id: string;
  displayName: string;
  userId: string;
  stream?: MediaStream;
}

const Meeting = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  
  const { isRecording, startRecording, stopRecording } = useMediaRecorder(
    localStream,
    meeting?.id || "",
    user?.id || ""
  );

  const { peerConnectionsRef } = useWebRTC({
    meetingId: meeting?.id || "",
    userId: user?.id || "",
    localStream,
    participants,
    setParticipants,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch user's display name
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name);
        }
      });

    initializeMeeting();
    return () => {
      cleanup();
    };
  }, [meetingCode, user]);

  const initializeMeeting = async () => {
    try {
      console.log("Initializing meeting with code:", meetingCode);
      
      // Get meeting info
      const { data: meetingData, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("meeting_code", meetingCode)
        .single();

      console.log("Meeting query result:", { meetingData, meetingError });

      if (meetingError || !meetingData) {
        console.error("Meeting not found:", meetingCode);
        toast({
          title: "Meeting not found",
          description: "The meeting code you entered doesn't exist.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setMeeting(meetingData);

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      // Join meeting as participant
      const { error: participantError } = await supabase
        .from("meeting_participants")
        .insert({
          meeting_id: meetingData.id,
          user_id: user!.id,
          display_name: displayName,
        });

      if (participantError) {
        console.error("Error joining meeting:", participantError);
      }

      // Subscribe to participant changes
      const participantChannel = supabase
        .channel(`meeting-${meetingData.id}-participants`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "meeting_participants",
            filter: `meeting_id=eq.${meetingData.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new.user_id !== user!.id) {
              playUserJoinSound();
            } else if (payload.eventType === 'UPDATE' && payload.new.left_at && payload.new.user_id !== user!.id) {
              playUserLeaveSound();
            }
            loadParticipants(meetingData.id);
          }
        )
        .subscribe();

      await loadParticipants(meetingData.id);
      setIsLoading(false);

      return () => {
        supabase.removeChannel(participantChannel);
      };
    } catch (error) {
      console.error("Error initializing meeting:", error);
      toast({
        title: "Error",
        description: "Failed to join the meeting. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const loadParticipants = async (meetingId: string) => {
    const { data, error } = await supabase
      .from("meeting_participants")
      .select("*")
      .eq("meeting_id", meetingId)
      .is("left_at", null);

    if (!error && data) {
      setParticipants(
        data.map((p) => ({
          id: p.id,
          displayName: p.display_name,
          userId: p.user_id,
        }))
      );
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      // Replace video track with screen share
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionsRef.current.values().next().value
        ?.getSenders()
        .find((s: RTCRtpSender) => s.track?.kind === 'video');
      
      if (sender) {
        sender.replaceTrack(videoTrack);
      }

      videoTrack.onended = () => {
        // Restore camera when screen sharing stops
        if (localStream) {
          const cameraTrack = localStream.getVideoTracks()[0];
          sender?.replaceTrack(cameraTrack);
        }
      };

      toast({
        title: "Screen sharing started",
        description: "You are now sharing your screen",
      });
    } catch (error) {
      console.error("Error sharing screen:", error);
      toast({
        title: "Screen share failed",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const leaveMeeting = async () => {
    if (isRecording) {
      stopRecording();
    }
    await cleanup();
    navigate("/");
  };

  const cleanup = async () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // Update participant status
    if (meeting && user) {
      await supabase
        .from("meeting_participants")
        .update({ left_at: new Date().toISOString() })
        .eq("meeting_id", meeting.id)
        .eq("user_id", user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--video-bg))]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-white">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[hsl(var(--video-bg))] overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-hidden">
          <VideoGrid
            participants={participants}
            localStream={localStream}
            currentUserId={user?.id || ""}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
          />
        </div>
        <ControlBar
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onShareScreen={shareScreen}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onToggleRecording={toggleRecording}
          onLeaveMeeting={leaveMeeting}
          isChatOpen={isChatOpen}
          isRecording={isRecording}
        />
      </div>
      {isChatOpen && meeting && user && (
        <ChatPanel
          meetingId={meeting.id}
          userId={user.id}
          displayName={displayName}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Meeting;