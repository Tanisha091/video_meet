import { useEffect, useRef } from "react";
import VideoTile from "./VideoTile";

interface Participant {
  id: string;
  displayName: string;
  userId: string;
  stream?: MediaStream;
}

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
  currentUserId: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const VideoGrid = ({ participants, localStream, currentUserId, isVideoEnabled, isAudioEnabled }: VideoGridProps) => {
  const getGridColumns = () => {
    const totalParticipants = participants.length + 1; // +1 for local user
    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    if (totalParticipants <= 6) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div className={`grid ${getGridColumns()} gap-4 h-full w-full`}>
      {/* Local video */}
      <VideoTile
        stream={localStream}
        displayName="You"
        isLocal={true}
        isMuted={!isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
      />
      
      {/* Remote participants */}
      {participants
        .filter((p) => p.userId !== currentUserId)
        .map((participant) => (
          <VideoTile
            key={participant.id}
            stream={participant.stream}
            displayName={participant.displayName}
            isLocal={false}
            isMuted={false}
            isVideoEnabled={true}
          />
        ))}
    </div>
  );
};

export default VideoGrid;