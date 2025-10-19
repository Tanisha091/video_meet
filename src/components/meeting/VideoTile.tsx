import { useEffect, useRef } from "react";
import { User, MicOff } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null | undefined;
  displayName: string;
  isLocal: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

const VideoTile = ({ stream, displayName, isLocal, isMuted, isVideoEnabled }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.log("Video play error:", err));
    }
  }, [stream, isVideoEnabled]);

  return (
    <div className="relative bg-[hsl(var(--video-bg))] rounded-xl overflow-hidden shadow-[var(--shadow-video)] aspect-video">
      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>
      )}
      
      {/* Name overlay */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
        {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
        <span className="text-white text-sm font-medium">{displayName}</span>
      </div>
    </div>
  );
};

export default VideoTile;