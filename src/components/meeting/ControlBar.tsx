import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, PhoneOff, Circle, Square } from "lucide-react";

interface ControlBarProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onShareScreen: () => void;
  onToggleChat: () => void;
  onLeaveMeeting: () => void;
  onToggleRecording: () => void;
  isChatOpen: boolean;
  isRecording: boolean;
}

const ControlBar = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onShareScreen,
  onToggleChat,
  onLeaveMeeting,
  onToggleRecording,
  isChatOpen,
  isRecording,
}: ControlBarProps) => {
  return (
    <div className="bg-[hsl(var(--control-bar))] border-t border-white/10 px-6 py-4">
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={onToggleAudio}
          variant={isAudioEnabled ? "secondary" : "destructive"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={onToggleVideo}
          variant={isVideoEnabled ? "secondary" : "destructive"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={onShareScreen}
          variant="secondary"
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <Monitor className="w-5 h-5" />
        </Button>

        <Button
          onClick={onToggleRecording}
          variant={isRecording ? "destructive" : "secondary"}
          size="lg"
          className={`rounded-full w-14 h-14 ${isRecording ? 'animate-pulse' : ''}`}
        >
          {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </Button>

        <Button
          onClick={onToggleChat}
          variant={isChatOpen ? "default" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        <div className="w-px h-10 bg-white/10 mx-2" />

        <Button
          onClick={onLeaveMeeting}
          variant="destructive"
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ControlBar;