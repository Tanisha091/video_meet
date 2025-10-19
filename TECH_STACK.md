# VideoMeet - Technical Stack Overview

## Frontend Technologies

### Core Framework
- **React 18** - Modern UI library with concurrent features
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Lightning-fast build tool and dev server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful, consistent icon set

### State Management & Routing
- **React Router v6** - Client-side routing
- **React Query (TanStack Query)** - Data fetching and caching
- **React Context** - Authentication state management

## Real-time Video/Audio Communication

### WebRTC Stack
- **WebRTC API** - Peer-to-peer real-time communication
- **getUserMedia()** - Access camera and microphone streams
- **getDisplayMedia()** - Screen sharing capability
- **RTCPeerConnection** - Manage peer connections for video/audio
- **MediaStream API** - Handle media tracks and streams

### Audio Features
- **Web Audio API** - Generate notification sounds
- Custom sound functions for:
  - User join events (ascending tone)
  - User leave events (descending tone)
  - New message notifications (quick beep)

## Backend & Database (Lovable Cloud)

### Platform
- **Lovable Cloud** - Integrated backend-as-a-service
- Built on **Supabase** infrastructure

### Database
- **PostgreSQL** - Powerful relational database
- **Tables**:
  - `profiles` - User display names and metadata
  - `meetings` - Meeting information and codes
  - `meeting_participants` - Active participants tracking
  - `chat_messages` - Real-time chat history

### Real-time Features
- **Supabase Realtime** - WebSocket-based database subscriptions
- **Postgres Changes** - Live updates on:
  - Participant join/leave events
  - New chat messages
  - Meeting status changes

## Authentication & Security

### Authentication
- **Supabase Auth** - Built-in authentication service
- **Email/Password** - Standard credential-based login
- **JWT Tokens** - Secure session management
- **Auto-confirm Email** - Enabled for faster development

### Security Measures
- **Row Level Security (RLS)** - Database-level access control
- **Authenticated Policies** - All operations require authentication
- **User Profiles** - Separate table for extended user data (not stored in auth.users)
- **Secure Triggers** - Automatic profile creation on signup

## Key Architecture Patterns

### Real-time Synchronization
1. **Participant Tracking**
   - Users join meetings via unique 8-character codes
   - Real-time presence updates via Supabase subscriptions
   - Audio notifications on join/leave events

2. **Chat System**
   - Instant message delivery using Realtime
   - Message history loaded on panel open
   - Sound notifications for incoming messages

3. **Meeting Management**
   - Meeting codes stored in localStorage
   - URL-based meeting access (`/meeting/:code`)
   - Graceful cleanup on user disconnect

### WebRTC Signaling
- Currently uses **local signaling** (suitable for small meetings)
- Peer connections established via RTCPeerConnection
- Future enhancement: Dedicated signaling server for larger scale

### State Management
- **AuthContext** - Global authentication state
- **Local Component State** - Meeting-specific data
- **Supabase Client** - Centralized database access

## Development Tools

### Build & Development
- **Vite** - Sub-second HMR (Hot Module Replacement)
- **TypeScript** - Type checking at compile time
- **ESLint** - Code quality and consistency

### Version Control & Deployment
- **Git** - Source control
- **Lovable Platform** - Integrated deployment pipeline
- **Preview Builds** - Instant preview on code changes

## Feature Implementation Summary

| Feature | Technology Used |
|---------|----------------|
| Video Calls | WebRTC + getUserMedia |
| Audio Calls | WebRTC + getUserMedia |
| Screen Share | getDisplayMedia API |
| Real-time Chat | Supabase Realtime |
| User Presence | Supabase Realtime + PostgreSQL |
| Authentication | Supabase Auth (JWT) |
| Database | PostgreSQL via Lovable Cloud |
| Notifications | Web Audio API |
| UI Components | shadcn/ui + Tailwind CSS |
| Routing | React Router v6 |

## Scalability Considerations

### Current Architecture
- ✅ Suitable for small to medium meetings (2-10 participants)
- ✅ Efficient real-time database subscriptions
- ✅ Serverless backend (auto-scaling)

### Future Enhancements
- 🔄 Dedicated signaling server for WebRTC
- 🔄 TURN servers for NAT traversal
- 🔄 Recording functionality
- 🔄 Advanced user permissions and roles
- 🔄 Meeting scheduling and calendar integration

## Performance Optimizations

- **Lazy Loading** - Components loaded on demand
- **Optimized Builds** - Vite's production optimization
- **Database Indexes** - Fast query performance
- **Real-time Filtering** - Server-side query filters
- **Efficient Re-renders** - React hooks optimization

---

**Built with ❤️ using Lovable - Full-stack development platform**
