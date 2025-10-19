import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Participant {
  id: string;
  displayName: string;
  userId: string;
  stream?: MediaStream;
}

interface UseWebRTCProps {
  meetingId: string;
  userId: string;
  localStream: MediaStream | null;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

export const useWebRTC = ({
  meetingId,
  userId,
  localStream,
  participants,
  setParticipants,
}: UseWebRTCProps) => {
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const signalingChannelRef = useRef<any>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (!meetingId || !userId || !localStream) return;

    // Setup signaling channel
    const channel = supabase.channel(`meeting-${meetingId}-signaling`);
    signalingChannelRef.current = channel;

    channel
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.to === userId) {
          await handleOffer(payload.from, payload.offer, payload.fromUserId);
        }
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.to === userId) {
          await handleAnswer(payload.from, payload.answer);
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.to === userId) {
          await handleIceCandidate(payload.from, payload.candidate);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Create offers for all existing participants
          participants.forEach((participant) => {
            if (participant.userId !== userId) {
              createPeerConnection(participant.id, participant.userId, true);
            }
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
    };
  }, [meetingId, userId, localStream]);

  const createPeerConnection = (
    participantId: string,
    participantUserId: string,
    shouldCreateOffer: boolean
  ) => {
    if (peerConnectionsRef.current.has(participantId) || !localStream) return;

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionsRef.current.set(participantId, peerConnection);

    // Add local stream tracks
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log("Received remote track from:", participantId);
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, stream: event.streams[0] } : p
        )
      );
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        signalingChannelRef.current?.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: {
            from: participantId,
            to: participantUserId,
            candidate: event.candidate,
          },
        });
      }
    };

    // Create offer if needed
    if (shouldCreateOffer) {
      peerConnection
        .createOffer()
        .then((offer) => peerConnection.setLocalDescription(offer))
        .then(() => {
          signalingChannelRef.current?.send({
            type: "broadcast",
            event: "offer",
            payload: {
              from: participantId,
              fromUserId: userId,
              to: participantUserId,
              offer: peerConnection.localDescription,
            },
          });
        })
        .catch((error) => console.error("Error creating offer:", error));
    }

    return peerConnection;
  };

  const handleOffer = async (
    participantId: string,
    offer: RTCSessionDescriptionInit,
    participantUserId: string
  ) => {
    const peerConnection = createPeerConnection(participantId, participantUserId, false);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      signalingChannelRef.current?.send({
        type: "broadcast",
        event: "answer",
        payload: {
          from: participantId,
          to: participantUserId,
          answer: peerConnection.localDescription,
        },
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (
    participantId: string,
    answer: RTCSessionDescriptionInit
  ) => {
    const peerConnection = peerConnectionsRef.current.get(participantId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (
    participantId: string,
    candidate: RTCIceCandidateInit
  ) => {
    const peerConnection = peerConnectionsRef.current.get(participantId);
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  return { peerConnectionsRef };
};
