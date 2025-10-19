import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const JoinMeeting = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetingCode, setMeetingCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);

  const extractMeetingCode = (input: string) => {
    const trimmed = input.trim().toUpperCase();
    // Extract 8-char alphanumeric code even if a full URL is pasted
    const matches = trimmed.match(/[A-Z0-9]{8}/g);
    return matches ? matches[matches.length - 1] : null;
  };

  const checkMeeting = async () => {
    const code = extractMeetingCode(meetingCode);
    if (!code) {
      toast({
        title: "That doesn't look right",
        description: "Try pasting the full link or just the 8-character code.",
        variant: "destructive",
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        title: "Who are you?",
        description: "Let everyone know your name before jumping in",
        variant: "destructive",
      });
      return;
    }

    // Check if meeting exists and requires password
    const { data: meeting, error } = await supabase
      .from("meetings")
      .select("password")
      .eq("meeting_code", code)
      .maybeSingle();

    if (error || !meeting) {
      toast({
        title: "Can't find that meeting",
        description: "Double-check the code - maybe there's a typo?",
        variant: "destructive",
      });
      return;
    }

    if (meeting.password) {
      setRequiresPassword(true);
    } else {
      localStorage.setItem("displayName", displayName);
      navigate(`/meeting/${code}`);
    }
  };

  const joinMeeting = async () => {
    const code = extractMeetingCode(meetingCode);
    if (!code) return;

    // Verify password
    const { data: meeting, error } = await supabase
      .from("meetings")
      .select("password")
      .eq("meeting_code", code)
      .maybeSingle();

    if (error || !meeting) {
      toast({
        title: "Meeting not found",
        description: "The meeting code you entered doesn't exist.",
        variant: "destructive",
      });
      return;
    }

    if (meeting.password !== password) {
      toast({
        title: "Wrong password",
        description: "That's not quite right - check with whoever invited you.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("displayName", displayName);
    navigate(`/meeting/${code}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="w-5 h-5 text-primary" />
          Join a Meeting
        </CardTitle>
        <CardDescription>
          Got an invite? Pop the code in here and you're good to go
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            Meeting Code
          </label>
          <Input
            id="code"
            placeholder="Enter code or paste link"
            value={meetingCode}
            onChange={(e) => {
              setMeetingCode(e.target.value);
              setRequiresPassword(false);
              setPassword("");
            }}
            className="uppercase"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="joinName" className="text-sm font-medium">
            Your Name
          </label>
          <Input
            id="joinName"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !requiresPassword && checkMeeting()}
          />
        </div>
        {requiresPassword && (
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Meeting Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
            />
          </div>
        )}
        <Button 
          onClick={requiresPassword ? joinMeeting : checkMeeting} 
          className="w-full" 
          size="lg"
        >
          {requiresPassword ? "Join Meeting" : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JoinMeeting;