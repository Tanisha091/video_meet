import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateMeeting from "@/components/home/CreateMeeting";
import JoinMeeting from "@/components/home/JoinMeeting";
import { Video, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-elegant)]">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VideoMeet
              </h1>
            </div>
            <Button onClick={signOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Video calls that just work. No hassle, no fees.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Jump on a call with your team, share your screen, and chat in real-time. 
              Everything you need, nothing you don't.
            </p>
          </div>

          {/* Meeting Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <CreateMeeting />
            <JoinMeeting />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Crystal Clear Video</h3>
              <p className="text-sm text-muted-foreground">
                See everyone clearly, whether it's just you two or the whole squad
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Chat While You Talk</h3>
              <p className="text-sm text-muted-foreground">
                Drop links, share thoughts, or crack jokes without interrupting
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Show What You Mean</h3>
              <p className="text-sm text-muted-foreground">
                Share your screen to walk through ideas, demos, or that meme you just found
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
