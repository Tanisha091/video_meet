import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send } from "lucide-react";
import { playMessageSound } from "@/utils/sounds";

interface ChatMessage {
  id: string;
  user_id: string;
  display_name: string;
  message: string;
  created_at: string;
}

interface ChatPanelProps {
  meetingId: string;
  userId: string;
  displayName: string;
  onClose: () => void;
}

const ChatPanel = ({ meetingId, userId, displayName, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`meeting-${meetingId}-chat`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          // Play sound for messages from others
          if (newMsg.user_id !== userId) {
            playMessageSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("chat_messages").insert({
      meeting_id: meetingId,
      user_id: userId,
      display_name: displayName,
      message: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
  };

  return (
    <div className="w-80 bg-[hsl(var(--chat-bg))] border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Chat</h3>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.user_id === userId ? "items-end" : "items-start"
              }`}
            >
              <span className="text-xs text-muted-foreground mb-1">
                {msg.user_id === userId ? "You" : msg.display_name}
              </span>
              <div
                className={`px-3 py-2 rounded-lg max-w-[85%] ${
                  msg.user_id === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;