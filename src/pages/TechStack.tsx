import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TechStack = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">VideoMeet Tech Stack</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Frontend</CardTitle>
              <CardDescription>User interface and client-side logic</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li><strong>React 18</strong> - UI framework with hooks</li>
                <li><strong>TypeScript</strong> - Type-safe development</li>
                <li><strong>Tailwind CSS</strong> - Utility-first styling</li>
                <li><strong>shadcn/ui</strong> - Accessible component library</li>
                <li><strong>Vite</strong> - Fast build tool</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Communication</CardTitle>
              <CardDescription>Video, audio, and signaling</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li><strong>WebRTC</strong> - Peer-to-peer video/audio streaming</li>
                <li><strong>getUserMedia API</strong> - Camera and microphone access</li>
                <li><strong>getDisplayMedia API</strong> - Screen sharing</li>
                <li><strong>RTCPeerConnection</strong> - Direct peer connections</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend & Database</CardTitle>
              <CardDescription>Server-side infrastructure powered by Lovable Cloud</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li><strong>Lovable Cloud (Supabase)</strong> - Backend-as-a-service platform</li>
                <li><strong>PostgreSQL</strong> - Relational database for meetings, participants, and chat</li>
                <li><strong>Supabase Realtime</strong> - WebSocket-based real-time subscriptions</li>
                <li><strong>Supabase Auth</strong> - User authentication and authorization</li>
                <li><strong>Row Level Security (RLS)</strong> - Database-level access control</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Features</CardTitle>
              <CardDescription>Live updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li><strong>Supabase Realtime</strong> - Database change subscriptions for:
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>• Participant join/leave events</li>
                    <li>• Live chat messages</li>
                    <li>• Meeting status updates</li>
                  </ul>
                </li>
                <li><strong>Web Audio API</strong> - Notification sounds for user events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication & Security</CardTitle>
              <CardDescription>User management and data protection</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li><strong>Email/Password Authentication</strong> - Secure user accounts</li>
                <li><strong>JWT Tokens</strong> - Session management</li>
                <li><strong>Row Level Security</strong> - Database access policies</li>
                <li><strong>User Profiles</strong> - Extended user data storage</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
              <CardDescription>What makes VideoMeet work</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✅ HD video/audio calls with WebRTC peer connections</li>
                <li>✅ Real-time chat with instant message delivery</li>
                <li>✅ Screen sharing capabilities</li>
                <li>✅ Audio/video controls (mute, disable camera)</li>
                <li>✅ User authentication and profiles</li>
                <li>✅ Meeting codes for easy joining</li>
                <li>✅ Sound notifications for user events</li>
                <li>✅ Responsive design for all devices</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TechStack;
