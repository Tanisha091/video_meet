import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CreateMeeting = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch user's display name from profiles
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
    }
  }, [user]);

  const generateMeetingCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createMeeting = async () => {
    setIsCreating(true);
    try {
      const meetingCode = generateMeetingCode();
      console.log("Creating meeting with code:", meetingCode);
      
      const { data, error } = await supabase
        .from("meetings")
        .insert({
          meeting_code: meetingCode,
          title: meetingTitle || `${displayName}'s Meeting`,
          host_id: user?.id,
          password: password || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Meeting created successfully:", data);
      localStorage.setItem("meetingCode", meetingCode);
      const link = `${window.location.origin}/meeting/${meetingCode}`;
      setMeetingLink(link);
      
      toast({
        title: "Room's ready!",
        description: "Grab the link and send it to whoever needs to join",
      });
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Hmm, that didn't work",
        description: "Give it another shot - sometimes these things happen.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    toast({
      title: "Got it!",
      description: "Link's on your clipboard - just paste and send",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const joinCreatedMeeting = () => {
    const meetingCode = localStorage.getItem("meetingCode");
    console.log("Joining meeting with code:", meetingCode);
    if (meetingCode) {
      navigate(`/meeting/${meetingCode}`);
    } else {
      toast({
        title: "Error",
        description: "Meeting code not found. Please try creating a new meeting.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Start a Meeting
        </CardTitle>
        <CardDescription>
          Fire up a quick call and get your team together
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!meetingLink ? (
          <div className="space-y-4">
            <Input
              placeholder="Meeting title (optional)"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              onClick={createMeeting}
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? "Creating..." : "Create Meeting"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Meeting Link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background px-3 py-2 rounded border">
                  {meetingLink}
                </code>
                <Button
                  onClick={copyMeetingLink}
                  variant="outline"
                  size="icon"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={joinCreatedMeeting} className="w-full" size="lg">
              Join Meeting
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateMeeting;