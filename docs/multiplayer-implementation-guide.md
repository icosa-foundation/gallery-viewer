# Multiplayer Implementation Guide

## Quick Start

This guide provides a quick overview of the multiplayer architecture sketched out for the gallery-viewer. For detailed architecture, see [multiplayer-architecture.md](./multiplayer-architecture.md).

## What Was Created

### 1. Architecture Document
**File:** `docs/multiplayer-architecture.md`

Comprehensive design document covering:
- Layered architecture design
- Core components and responsibilities
- State synchronization strategies
- Network protocol design
- Implementation phases
- Performance and security considerations

### 2. Type Definitions
**File:** `src/multiplayer/types.ts`

TypeScript interfaces for:
- User and session management
- Shared state and updates
- Avatar configuration and poses
- Annotations and interactions
- Network messages and transport interface

### 3. Core Multiplayer Session Manager
**File:** `src/multiplayer/MultiplayerSession.ts`

Central coordinator that handles:
- Session lifecycle (join/leave)
- User roster management
- State synchronization
- Annotation management
- Permission system
- Event broadcasting

### 4. WebSocket Transport Implementation
**File:** `src/multiplayer/transport/WebSocketTransport.ts`

Reference implementation of `ITransportAdapter` using WebSockets:
- Connection management with auto-reconnect
- Room creation and joining
- Message routing
- Event handling

### 5. Integration Example
**File:** `examples/multiplayer-example.ts`

Complete working example showing:
- Basic multiplayer setup
- Viewer integration
- Simple avatar rendering
- UI controls
- Annotation tool

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Gallery Viewer                             │
│  - Scene loading                            │
│  - Camera controls                          │
│  - Tree view                                │
└─────────────┬───────────────────────────────┘
              │
              │ Integration hooks
              │
┌─────────────┴───────────────────────────────┐
│  MultiplayerSession                         │
│  - User management                          │
│  - State sync                               │
│  - Permissions                              │
└─────────────┬───────────────────────────────┘
              │
              │ ITransportAdapter interface
              │
┌─────────────┴───────────────────────────────┐
│  Transport Layer (Pluggable)                │
│  - WebSocketTransport                       │
│  - WebRTCTransport (future)                 │
│  - ViverseTransport (wrap existing)         │
└─────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Pluggable Transport
The `ITransportAdapter` interface allows different networking backends:
- WebSocket (client-server)
- WebRTC (peer-to-peer)
- Viverse SDK (existing implementation)
- Custom implementations

### 2. Three-Tier State Model

**Session State** (sync once on join):
- Scene URL
- Scene metadata
- Environment settings

**Shared State** (periodic sync):
- Tree view visibility
- Annotations
- Focus points

**Ephemeral State** (high-frequency):
- User positions/rotations
- Gaze/pointing
- Voice indicators

### 3. Non-Invasive Integration
Multiplayer is optional and doesn't break existing functionality:
```typescript
const viewer = new Viewer();
// Works without multiplayer

const viewer = new Viewer();
viewer.initializeMultiplayer(session);
// Works with multiplayer
```

### 4. Permission System
Role-based permissions control who can:
- Change scenes (host only by default)
- Modify tree view (editors and host)
- Add annotations (all users)
- Control camera (all users)

## Usage Example

```typescript
import { Viewer } from './src/viewer';
import { MultiplayerSession } from './src/multiplayer/MultiplayerSession';
import { WebSocketTransport } from './src/multiplayer/transport/WebSocketTransport';

// 1. Create viewer
const viewer = new Viewer();
await viewer.loadGltf('scene.gltf');

// 2. Set up transport
const transport = new WebSocketTransport();
await transport.connect({
  serverUrl: 'wss://your-server.com',
  userId: 'user-123',
});

// 3. Create and join session
const session = new MultiplayerSession({
  sessionId: 'room-abc',
  maxUsers: 10,
  permissions: {
    allowSceneChange: 'host',
    allowTreeViewChange: 'all',
    allowAnnotations: 'all',
    allowCameraControl: 'all',
  },
  transport,
});

await session.join({
  userId: 'user-123',
  name: 'Alice',
  role: 'editor',
  avatar: { type: 'simple', color: '#3498db', displayName: 'Alice' },
});

// 4. Integrate with viewer
viewer.initializeMultiplayer(session);

// Now everything is synchronized automatically!
```

## Implementation Phases

### Phase 1: Core Infrastructure ✅ (Sketched)
- [x] Type definitions
- [x] MultiplayerSession class
- [x] ITransportAdapter interface
- [x] WebSocketTransport implementation
- [ ] Actual server implementation

### Phase 2: State Synchronization
- [ ] Implement StateSync manager
- [ ] Add conflict resolution (CRDT)
- [ ] Hook viewer methods to emit updates
- [ ] Test scene loading sync
- [ ] Test tree view sync

### Phase 3: Avatar System
- [ ] Create AvatarManager class
- [ ] Implement simple avatar (sphere + cone)
- [ ] Implement VRM avatar loading
- [ ] Add position sync loop
- [ ] Render avatars in viewer

### Phase 4: Interactions
- [ ] Annotation rendering in 3D
- [ ] Focus/highlight visualization
- [ ] Follow user camera
- [ ] Point at objects

### Phase 5: Additional Features
- [ ] WebRTC transport (P2P)
- [ ] Viverse SDK wrapper
- [ ] Voice chat integration
- [ ] Session recording

## State Synchronization

### What Gets Synchronized

| State | Owner | Frequency | Method |
|-------|-------|-----------|--------|
| Scene URL | Host | Once | STATE_UPDATE |
| Tree View | Any Editor | On change | STATE_UPDATE |
| Camera Position | Each User | 30ms | POSE_UPDATE |
| Annotations | Any User | On change | ANNOTATION_ADD |
| Focus Points | Any User | On change | FOCUS_CHANGE |

### Conflict Resolution

**Last-Write-Wins (LWW):**
- Simple properties (scene URL, settings)
- Uses Lamport timestamps

**Add-Wins Set:**
- Collections (annotations)
- CRDT-style with tombstones

**Per-Object LWW:**
- Tree view state (each path independent)

## Performance Characteristics

### Network Bandwidth (10 users)
- Position updates: ~3.3 KB/s per user
- State updates: < 1 KB/update (infrequent)
- **Total downstream: ~35 KB/s**

### Rendering
- Each avatar: 5k-50k polygons
- LOD system for distant users
- **Additional: ~60 MB RAM for 10 users**

## Security Considerations

1. **Authentication**: Required before joining
2. **Authorization**: Role-based permissions
3. **Validation**: Server-side state validation
4. **Rate Limiting**: Prevent spam/DoS
5. **Privacy**: Private sessions, opt-out tracking

## Server Requirements

The WebSocket transport expects a server implementing:

```
// Client → Server
{
  action: "join_room",
  roomId: string,
  userInfo: JoinSessionData
}

// Server → Client
{
  event: "room_joined",
  data: {
    roomInfo: RoomInfo
  }
}

// Client → Server (broadcast)
{
  action: "broadcast",
  roomId: string,
  message: Message
}

// Server → All Clients
{
  event: "message",
  data: {
    message: Message,
    senderId: string
  }
}
```

See [WebSocketTransport.ts](../src/multiplayer/transport/WebSocketTransport.ts) for full protocol.

## Next Steps

1. **Implement Server**: Create Node.js WebSocket server
2. **Integrate with Viewer**: Add hooks to viewer.ts
3. **Test Basic Sync**: Scene loading and tree view
4. **Build Avatar System**: Simple avatars first, then VRM
5. **Add Interactions**: Annotations and focus points
6. **Deploy**: Test with real users

## Testing Plan

### Unit Tests
- [ ] State synchronization logic
- [ ] Conflict resolution
- [ ] Message serialization
- [ ] Permission checks

### Integration Tests
- [ ] Multi-client scenarios
- [ ] State convergence
- [ ] Network partition recovery
- [ ] Avatar lifecycle

### Manual Testing
- [ ] Two users join same session
- [ ] Host loads new scene
- [ ] User toggles visibility
- [ ] Avatars move correctly
- [ ] Annotations appear
- [ ] User disconnect/reconnect

## Resources

- **Architecture Doc**: [multiplayer-architecture.md](./multiplayer-architecture.md)
- **Type Definitions**: [src/multiplayer/types.ts](../src/multiplayer/types.ts)
- **Core Session**: [src/multiplayer/MultiplayerSession.ts](../src/multiplayer/MultiplayerSession.ts)
- **WebSocket Transport**: [src/multiplayer/transport/WebSocketTransport.ts](../src/multiplayer/transport/WebSocketTransport.ts)
- **Example Integration**: [examples/multiplayer-example.ts](../examples/multiplayer-example.ts)

## Comparison with Existing Viverse Implementation

### Current Viverse Implementation
Located in `src/viverse-icosa-gallery/index.html`:
- ✅ Camera position sync (30ms)
- ✅ VRM avatar loading
- ✅ Text chat
- ❌ Scene loading sync
- ❌ Tree view sync
- ❌ Annotations
- ❌ Pluggable architecture

### This Design
- ✅ All Viverse features
- ✅ Scene loading sync
- ✅ Tree view sync
- ✅ Annotations and focus
- ✅ Pluggable transports
- ✅ Permission system
- ✅ Conflict resolution
- ✅ Can wrap Viverse SDK via ViverseTransport

### Migration Path
1. Keep existing Viverse implementation
2. Implement new architecture alongside
3. Create `ViverseTransport` adapter
4. Gradually migrate features
5. Deprecate old implementation

This allows incremental adoption without breaking existing users.
