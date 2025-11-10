# Multiplayer Architecture Design for Gallery Viewer

## Overview

This document outlines a proposed architecture for adding multiplayer support to the gallery-viewer, enabling multiple users to view and interact with 3D scenes together in real-time.

## Current State Analysis

### Existing Multiplayer Foundation
The viewer already has basic multiplayer support via Viverse SDK in `src/viverse-icosa-gallery/index.html`:
- Camera position/rotation sync (30ms updates)
- VRM avatar loading and rendering
- Text chat system
- Room creation/joining with matchmaking

### Current Limitations
- Only syncs camera position, not scene state
- No object visibility synchronization
- No collaborative scene loading
- No interaction/annotation sync
- Tightly coupled to Viverse SDK (vendor lock-in)

---

## Proposed Architecture

### 1. Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│  Viewer Application (src/viewer.ts)                 │
│  - Scene loading & rendering                        │
│  - Camera & controls                                │
│  - UI interactions                                  │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────┐
│  Multiplayer Layer (NEW)                            │
│  - State synchronization                            │
│  - Conflict resolution                              │
│  - User presence management                         │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────┐
│  Network Transport Layer (Pluggable)                │
│  - WebSocket / WebRTC / Viverse SDK                 │
│  - Connection management                            │
│  - Message routing                                  │
└─────────────────────────────────────────────────────┘
```

### 2. Core Components

#### A. MultiplayerSession Manager
Central coordinator for multiplayer functionality.

**Responsibilities:**
- Session lifecycle (create, join, leave)
- User roster management
- State synchronization orchestration
- Permission/role management (host, viewer, editor)

**Location:** `src/multiplayer/MultiplayerSession.ts`

```typescript
interface SessionConfig {
  sessionId: string;
  maxUsers: number;
  permissions: PermissionConfig;
  transport: ITransportAdapter;
}

interface User {
  id: string;
  name: string;
  role: 'host' | 'editor' | 'viewer';
  avatar?: AvatarConfig;
  connected: boolean;
  lastSeen: number;
}

class MultiplayerSession {
  private users: Map<string, User>;
  private state: SharedState;
  private transport: ITransportAdapter;

  async join(sessionId: string, userInfo: UserInfo): Promise<void>
  async leave(): Promise<void>

  // User management
  getUsers(): User[]
  getUser(id: string): User | undefined

  // State sync
  updateState(update: StateUpdate): void
  onStateUpdate(callback: (update: StateUpdate) => void): void
}
```

#### B. State Synchronization System

**Three-tier state model:**

1. **Session State** (synchronized once on join)
   - Current scene URL
   - Scene metadata
   - Environment settings
   - Initial camera position

2. **Shared State** (synchronized periodically)
   - Object visibility (tree view state)
   - Scene annotations
   - Shared camera focus points
   - Session settings

3. **Ephemeral State** (high-frequency sync)
   - User positions/rotations
   - User gaze/pointing
   - Temporary highlights
   - Voice activity indicators

**Location:** `src/multiplayer/StateSync.ts`

```typescript
interface SharedState {
  version: number;
  sceneUrl: string;
  sceneLoaded: boolean;
  treeViewState: Record<string, boolean>; // existing format from viewer.ts:2856
  annotations: Annotation[];
  focusPoints: FocusPoint[];
  sessionSettings: SessionSettings;
}

interface StateUpdate {
  type: 'full' | 'patch';
  userId: string;
  timestamp: number;
  data: Partial<SharedState>;
  // For conflict resolution
  version: number;
  dependencies?: number[];
}

class StateSyncManager {
  private currentState: SharedState;
  private pendingUpdates: StateUpdate[];
  private version: number = 0;

  // Apply local changes
  updateLocal(update: Partial<SharedState>): void {
    this.version++;
    const stateUpdate = {
      type: 'patch',
      userId: this.localUserId,
      timestamp: Date.now(),
      data: update,
      version: this.version
    };
    this.applyUpdate(stateUpdate);
    this.transport.send(stateUpdate);
  }

  // Receive remote changes
  handleRemoteUpdate(update: StateUpdate): void {
    if (this.hasConflict(update)) {
      this.resolveConflict(update);
    } else {
      this.applyUpdate(update);
    }
  }

  // Operational Transform for conflict resolution
  private resolveConflict(update: StateUpdate): void {
    // CRDT-style last-write-wins for simple properties
    // Merge strategy for collections (annotations, etc.)
  }
}
```

#### C. Avatar System

Extends existing Viverse avatar system to be transport-agnostic.

**Location:** `src/multiplayer/AvatarManager.ts`

```typescript
interface AvatarConfig {
  type: 'vrm' | 'simple' | 'custom';
  url?: string; // For VRM models
  color?: string; // For simple avatars
  displayName: string;
}

interface AvatarPose {
  position: [number, number, number];
  rotation: [number, number, number, number]; // quaternion
  headRotation?: [number, number, number, number];
  leftHand?: HandPose;
  rightHand?: HandPose;
}

class AvatarManager {
  private avatars: Map<string, THREE.Object3D>;
  private animationMixers: Map<string, THREE.AnimationMixer>;

  async loadAvatar(userId: string, config: AvatarConfig): Promise<void>
  updatePose(userId: string, pose: AvatarPose): void
  removeAvatar(userId: string): void

  // Gaze/pointing visualization
  showGazeRay(userId: string, origin: Vector3, direction: Vector3): void
  showPointing(userId: string, targetObject: THREE.Object3D): void
}
```

#### D. Transport Adapter Interface

Pluggable architecture to support multiple networking backends.

**Location:** `src/multiplayer/transport/ITransportAdapter.ts`

```typescript
interface ITransportAdapter {
  // Connection lifecycle
  connect(config: ConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;

  // Messaging
  send(message: Message): void;
  broadcast(message: Message): void;
  onMessage(callback: (message: Message, senderId: string) => void): void;

  // Room management
  createRoom(config: RoomConfig): Promise<string>;
  joinRoom(roomId: string): Promise<RoomInfo>;
  leaveRoom(): Promise<void>;

  // Events
  onUserJoined(callback: (user: User) => void): void;
  onUserLeft(callback: (userId: string) => void): void;
  onConnectionStateChanged(callback: (state: ConnectionState) => void): void;
}

// Implementations:
// - WebSocketTransport (src/multiplayer/transport/WebSocketTransport.ts)
// - WebRTCTransport (src/multiplayer/transport/WebRTCTransport.ts)
// - ViverseTransport (src/multiplayer/transport/ViverseTransport.ts) - wrapper around existing SDK
```

#### E. Interaction Synchronization

**Location:** `src/multiplayer/InteractionSync.ts`

```typescript
interface Annotation {
  id: string;
  userId: string;
  position: [number, number, number];
  text: string;
  color: string;
  timestamp: number;
}

interface FocusPoint {
  userId: string;
  targetObjectPath: string; // from getObjectPath() in viewer.ts:2837
  position: [number, number, number];
  timestamp: number;
}

class InteractionSyncManager {
  // Annotations
  addAnnotation(annotation: Annotation): void
  removeAnnotation(id: string): void

  // Focus/highlighting
  setUserFocus(objectPath: string): void
  highlightObjectForAll(objectPath: string, duration: number): void

  // Camera control
  requestCameraFocus(targetPosition: Vector3, targetLookAt: Vector3): void
  followUser(userId: string): void
  stopFollowing(): void
}
```

---

## 3. Integration with Existing Viewer

### Modifications to `src/viewer.ts`

#### A. Add multiplayer capability flag
```typescript
interface ViewerConfig {
  // ... existing config
  multiplayer?: {
    enabled: boolean;
    session?: MultiplayerSession;
    avatarConfig?: AvatarConfig;
    permissions?: PermissionConfig;
  };
}
```

#### B. Hook into state changes

Add event emission for state changes:
```typescript
class Viewer {
  private multiplayerSession?: MultiplayerSession;

  // Existing method at line 2881
  setTreeViewState(state: Record<string, boolean>): void {
    // ... existing code

    // Add multiplayer sync
    if (this.multiplayerSession?.isHost()) {
      this.multiplayerSession.updateState({ treeViewState: state });
    }
  }

  // Existing method at line 2703
  frameScene(objects?: THREE.Object3D[]): void {
    // ... existing code

    // Broadcast camera position to others
    if (this.multiplayerSession) {
      this.multiplayerSession.broadcastCameraFrame(this.activeCamera.position);
    }
  }

  // New method
  initializeMultiplayer(session: MultiplayerSession): void {
    this.multiplayerSession = session;

    // Subscribe to remote state updates
    session.onStateUpdate((update) => {
      if (update.data.treeViewState) {
        this.setTreeViewState(update.data.treeViewState);
      }
      if (update.data.sceneUrl && update.data.sceneUrl !== this.currentSceneUrl) {
        this.loadGltf(update.data.sceneUrl);
      }
    });

    // Subscribe to user events
    session.onUserJoined((user) => {
      this.avatarManager.loadAvatar(user.id, user.avatar);
    });

    session.onUserLeft((userId) => {
      this.avatarManager.removeAvatar(userId);
    });

    // Start position sync loop
    this.startPositionSync();
  }

  private startPositionSync(): void {
    setInterval(() => {
      if (!this.multiplayerSession) return;

      const pose: AvatarPose = {
        position: this.activeCamera.position.toArray(),
        rotation: this.activeCamera.quaternion.toArray(),
      };

      this.multiplayerSession.updateUserPose(pose);
    }, 30); // 30ms interval (same as current Viverse implementation)
  }
}
```

#### C. Add avatar rendering to render loop

Modify render loop at line 402-492:
```typescript
private render = (time: number, xrFrame?: XRFrame) => {
  // ... existing rendering code

  // Update avatars
  if (this.avatarManager) {
    const delta = this.clock.getDelta();
    this.avatarManager.update(delta);
  }

  // ... rest of render loop
}
```

---

## 4. Network Protocol Design

### Message Types

```typescript
enum MessageType {
  // Session management
  JOIN_SESSION = 'join_session',
  LEAVE_SESSION = 'leave_session',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',

  // State sync
  STATE_UPDATE = 'state_update',
  STATE_REQUEST = 'state_request',
  STATE_FULL = 'state_full',

  // Ephemeral updates
  POSE_UPDATE = 'pose_update',
  GAZE_UPDATE = 'gaze_update',

  // Interactions
  ANNOTATION_ADD = 'annotation_add',
  ANNOTATION_REMOVE = 'annotation_remove',
  FOCUS_CHANGE = 'focus_change',
  CAMERA_FRAME = 'camera_frame',

  // Chat
  CHAT_MESSAGE = 'chat_message',
}

interface Message {
  type: MessageType;
  senderId: string;
  timestamp: number;
  data: any;
}
```

### Message Flow Examples

#### Scene Load Synchronization
```
Host:
1. Host loads new scene via loadGltf()
2. Viewer emits STATE_UPDATE with sceneUrl
3. MultiplayerSession broadcasts to all users

Participants:
1. Receive STATE_UPDATE
2. Check if sceneUrl differs from current
3. Call loadGltf() with new URL
4. Send confirmation when loaded
```

#### Tree View Toggle
```
User A:
1. Clicks checkbox to hide object
2. setTreeViewState() called
3. Emits STATE_UPDATE with treeViewState patch

User B:
1. Receives STATE_UPDATE
2. Applies treeViewState via setTreeViewState()
3. refreshTreeView() updates UI
```

#### Position Updates (High-frequency)
```
Every 30ms:
1. Read activeCamera position/rotation
2. Pack into binary format (Float32Array)
3. Send via unreliable channel (WebRTC) or throttled WebSocket
4. Other clients update avatar positions
```

---

## 5. Synchronization Strategies

### A. State Partitioning

| State Type | Update Frequency | Reliability | Sync Strategy |
|------------|------------------|-------------|---------------|
| Scene URL | Once per scene | High | Full state broadcast |
| Tree View State | On change | High | Patch with version |
| Annotations | On change | High | CRDT with tombstones |
| Camera Position | 30ms | Low | Latest value wins |
| Gaze/Pointing | 100ms | Low | Latest value wins |

### B. Conflict Resolution

**Simple Properties (Last-Write-Wins):**
- Use Lamport timestamps
- Higher timestamp wins
- Tie-breaker: lexicographically higher user ID

**Collections (CRDT):**
- Annotations: Add-wins set with tombstones
- Visibility state: Per-object last-write-wins with path-based merging

**Example:**
```typescript
function mergeTreeViewState(
  local: Record<string, boolean>,
  remote: Record<string, boolean>,
  localVersion: number,
  remoteVersion: number
): Record<string, boolean> {
  const merged = { ...local };

  for (const [path, visible] of Object.entries(remote)) {
    // If we don't have this path, or remote is newer, take remote value
    if (!(path in merged) || remoteVersion > localVersion) {
      merged[path] = visible;
    }
  }

  return merged;
}
```

### C. Bandwidth Optimization

**Position Updates:**
- Use binary protocol (Float32Array) instead of JSON
- Quantize rotation to 16-bit precision (sufficient for visualization)
- Dead-reckoning: only send when change exceeds threshold

**State Updates:**
- Only send patches, not full state
- Batch multiple updates within 100ms window
- Compress with MessagePack or similar

---

## 6. Implementation Phases

### Phase 1: Core Infrastructure (Foundation)
**Files to create:**
- `src/multiplayer/types.ts` - TypeScript interfaces
- `src/multiplayer/MultiplayerSession.ts` - Session manager
- `src/multiplayer/transport/ITransportAdapter.ts` - Transport interface
- `src/multiplayer/transport/WebSocketTransport.ts` - Basic WebSocket impl

**Viewer modifications:**
- Add multiplayer config to ViewerConfig
- Add initializeMultiplayer() method
- Add event emitters for state changes

**Deliverable:** Basic session join/leave, user roster display

### Phase 2: State Synchronization
**Files to create:**
- `src/multiplayer/StateSync.ts` - State synchronization manager
- `src/multiplayer/ConflictResolver.ts` - Conflict resolution logic

**Viewer integration:**
- Hook setTreeViewState() to emit updates
- Hook loadGltf() to sync scene loading
- Listen for remote state updates

**Deliverable:** Synchronized scene loading and tree view state

### Phase 3: Avatar System
**Files to create:**
- `src/multiplayer/AvatarManager.ts` - Avatar lifecycle
- `src/multiplayer/SimpleAvatar.ts` - Fallback simple avatar (colored sphere + cone)

**Viewer integration:**
- Position sync loop (30ms)
- Avatar rendering in render loop
- User nameplate UI

**Deliverable:** See other users' positions with avatars

### Phase 4: Interactions
**Files to create:**
- `src/multiplayer/InteractionSync.ts` - Annotation/focus sync
- `src/multiplayer/AnnotationRenderer.ts` - 3D annotation display

**Features:**
- Point and highlight objects
- Add text annotations
- Follow other users' cameras

**Deliverable:** Collaborative interaction tools

### Phase 5: Additional Transports
**Files to create:**
- `src/multiplayer/transport/WebRTCTransport.ts` - Peer-to-peer option
- `src/multiplayer/transport/ViverseTransport.ts` - Viverse SDK wrapper

**Deliverable:** Multiple backend options for different use cases

---

## 7. Example Usage

### Basic Multiplayer Session

```typescript
import { Viewer } from './viewer';
import { MultiplayerSession } from './multiplayer/MultiplayerSession';
import { WebSocketTransport } from './multiplayer/transport/WebSocketTransport';

// Create viewer
const viewer = new Viewer();
await viewer.loadGltf('https://example.com/scene.gltf');

// Initialize multiplayer
const transport = new WebSocketTransport({
  serverUrl: 'wss://multiplayer.example.com'
});

const session = new MultiplayerSession({
  sessionId: 'room-123',
  maxUsers: 10,
  permissions: {
    allowSceneChange: 'host',
    allowAnnotations: 'all',
    allowTreeViewChange: 'editor'
  },
  transport
});

await session.join({
  userId: 'user-456',
  name: 'Alice',
  role: 'editor',
  avatar: {
    type: 'vrm',
    url: 'https://example.com/avatar.vrm',
    displayName: 'Alice'
  }
});

// Integrate with viewer
viewer.initializeMultiplayer(session);

// Now all interactions are automatically synchronized!
```

### Custom Transport Example

```typescript
// Wrap existing Viverse SDK
class ViverseTransport implements ITransportAdapter {
  private multi: any; // Viverse Multi instance

  async connect(config: ConnectionConfig): Promise<void> {
    const auth = await Client.auth();
    this.multi = await Play.connect({
      account: auth,
      appInfo: config.appInfo
    });
  }

  send(message: Message): void {
    // Use Viverse's actor properties or custom events
    this.multi.networksync.updateMyPosition({
      customData: JSON.stringify(message)
    });
  }

  // ... implement other methods
}
```

---

## 8. UI Components

### A. User Roster Panel
**Location:** `src/multiplayer/ui/UserRoster.ts`

Display connected users with:
- Avatar thumbnail
- Name
- Role badge
- Connection quality indicator
- Actions: Follow camera, kick (if host), mute

### B. Multiplayer Controls
**Location:** `src/multiplayer/ui/MultiplayerControls.ts`

Toolbar with:
- Toggle position sync on/off
- Toggle avatar visibility
- Annotation mode toggle
- "Follow mode" dropdown (user selector)
- Session info (room ID, copy invite link)

### C. Annotation UI
**Location:** `src/multiplayer/ui/AnnotationUI.ts`

- Click object to place annotation
- Text input with color picker
- List of all annotations (filterable by user)
- Delete own annotations

---

## 9. Testing Strategy

### Unit Tests
- State synchronization logic
- Conflict resolution algorithms
- Message serialization/deserialization

### Integration Tests
- Multi-client scenarios with mock transport
- State convergence tests
- Network partition recovery

### Manual Testing Checklist
- [ ] Two users join same session
- [ ] Host loads new scene → others see it
- [ ] User toggles object visibility → others see it
- [ ] Users see each other's avatars moving
- [ ] Annotations appear for all users
- [ ] User disconnects → avatar disappears
- [ ] Reconnect → state is re-synchronized
- [ ] Network delay simulation (50-500ms)

---

## 10. Performance Considerations

### Network Bandwidth
- Position updates: ~100 bytes/user × 33 fps = 3.3 KB/s per user
- State updates: Variable, typically < 1 KB/update, infrequent
- **Total for 10 users:** ~35 KB/s downstream

### CPU/Rendering
- Each avatar: 1 VRM model (~5k-50k polygons)
- Animation: THREE.AnimationMixer per avatar
- **Optimization:** LOD system for distant avatars

### Memory
- Each user: ~5-10 MB (avatar model + textures)
- Shared state: < 1 MB
- **Total for 10 users:** ~60 MB additional

---

## 11. Security Considerations

### Authentication
- Require user authentication before joining
- Generate session tokens with expiration
- Implement rate limiting on state updates

### Authorization
- Role-based permissions (host, editor, viewer)
- Validate actions server-side (if using server)
- Prevent unauthorized scene changes

### Data Validation
- Sanitize all user input (annotations, names)
- Validate state updates (check version numbers)
- Limit message size and frequency

### Privacy
- Option for private sessions (invite-only)
- Option to hide user positions
- Don't leak session IDs in URLs (use query params or hash)

---

## 12. Backwards Compatibility

### Non-Multiplayer Mode
Viewer must work without multiplayer:
```typescript
if (!config.multiplayer?.enabled) {
  // All multiplayer code is no-op
}
```

### Graceful Degradation
- If transport fails, show error but keep viewer functional
- If avatar model fails to load, show simple sphere avatar
- If state sync fails, show notification but allow local interaction

---

## 13. Future Enhancements

### Advanced Features
- **Voice chat:** Integrate WebRTC audio
- **Screen sharing:** Share desktop view of scene
- **Recording:** Record multiplayer session for playback
- **Persistence:** Save session state to database
- **Spectator mode:** Join as invisible observer
- **Laser pointer:** Ray from VR controller visible to all

### Scalability
- Server-side spatial hashing for large scenes
- Interest management (only sync nearby users)
- Dedicated relay servers for WebRTC
- CDN for avatar/scene assets

### Analytics
- Session duration tracking
- User engagement metrics
- Performance monitoring (FPS, latency)
- Error tracking and reporting

---

## Conclusion

This architecture provides:
- ✅ **Pluggable transports** - Support multiple networking backends
- ✅ **Minimal coupling** - Multiplayer is optional, doesn't break existing code
- ✅ **Extensible** - Easy to add new synchronized state
- ✅ **Performant** - Efficient binary protocols for high-frequency updates
- ✅ **Robust** - Conflict resolution and graceful degradation

The phased implementation allows for incremental development and testing, with each phase delivering usable functionality.
