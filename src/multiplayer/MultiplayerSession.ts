/**
 * MultiplayerSession - Central coordinator for multiplayer functionality
 *
 * Manages session lifecycle, user roster, and orchestrates state synchronization.
 */

import {
  SessionConfig,
  User,
  SharedState,
  StateUpdate,
  AvatarPose,
  Annotation,
  FocusPoint,
  Message,
  MessageType,
  JoinSessionData,
  ITransportAdapter,
  ConnectionState,
} from './types';

type StateUpdateCallback = (update: StateUpdate) => void;
type UserEventCallback = (user: User) => void;
type UserIdCallback = (userId: string) => void;
type PoseUpdateCallback = (userId: string, pose: AvatarPose) => void;
type AnnotationCallback = (annotation: Annotation) => void;
type FocusCallback = (focus: FocusPoint) => void;
type ConnectionCallback = (state: ConnectionState) => void;

export class MultiplayerSession {
  private config: SessionConfig;
  private transport: ITransportAdapter;
  private users: Map<string, User> = new Map();
  private localUserId: string = '';
  private state: SharedState;
  private version: number = 0;

  // Event callbacks
  private stateUpdateCallbacks: Set<StateUpdateCallback> = new Set();
  private userJoinedCallbacks: Set<UserEventCallback> = new Set();
  private userLeftCallbacks: Set<UserIdCallback> = new Set();
  private poseUpdateCallbacks: Set<PoseUpdateCallback> = new Set();
  private annotationAddCallbacks: Set<AnnotationCallback> = new Set();
  private annotationRemoveCallbacks: Set<UserIdCallback> = new Set();
  private focusChangeCallbacks: Set<FocusCallback> = new Set();
  private connectionStateCallbacks: Set<ConnectionCallback> = new Set();

  constructor(config: SessionConfig) {
    this.config = config;
    this.transport = config.transport;

    // Initialize empty state
    this.state = {
      version: 0,
      sceneUrl: '',
      sceneLoaded: false,
      treeViewState: {},
      annotations: [],
      focusPoints: [],
      sessionSettings: {
        avatarsVisible: true,
        syncCameraFraming: false,
        allowAnnotations: true,
      },
    };

    this.setupTransportHandlers();
  }

  // ============================================================================
  // Session Lifecycle
  // ============================================================================

  async join(userInfo: JoinSessionData): Promise<void> {
    this.localUserId = userInfo.userId;

    try {
      // Join room via transport
      const roomInfo = await this.transport.joinRoom(this.config.sessionId, userInfo);

      // Initialize user roster
      roomInfo.users.forEach(user => {
        this.users.set(user.id, user);
      });

      // Initialize state from room
      this.state = roomInfo.state;
      this.version = roomInfo.state.version;

      console.log(`[MultiplayerSession] Joined session ${this.config.sessionId} with ${roomInfo.users.length} users`);
    } catch (error) {
      console.error('[MultiplayerSession] Failed to join session:', error);
      throw error;
    }
  }

  async leave(): Promise<void> {
    await this.transport.leaveRoom();
    this.users.clear();
    console.log('[MultiplayerSession] Left session');
  }

  // ============================================================================
  // User Management
  // ============================================================================

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getLocalUser(): User | undefined {
    return this.users.get(this.localUserId);
  }

  isHost(): boolean {
    const localUser = this.getLocalUser();
    return localUser?.role === 'host';
  }

  hasPermission(action: keyof SessionConfig['permissions']): boolean {
    const localUser = this.getLocalUser();
    if (!localUser) return false;

    const permissionLevel = this.config.permissions[action];

    if (permissionLevel === 'all') return true;
    if (permissionLevel === 'editor') return localUser.role === 'editor' || localUser.role === 'host';
    if (permissionLevel === 'host') return localUser.role === 'host';

    return false;
  }

  // ============================================================================
  // State Synchronization
  // ============================================================================

  getState(): SharedState {
    return { ...this.state };
  }

  updateState(update: Partial<SharedState>): void {
    if (!this.hasPermission('allowSceneChange') && update.sceneUrl) {
      console.warn('[MultiplayerSession] No permission to change scene');
      return;
    }

    if (!this.hasPermission('allowTreeViewChange') && update.treeViewState) {
      console.warn('[MultiplayerSession] No permission to change tree view');
      return;
    }

    this.version++;
    const stateUpdate: StateUpdate = {
      type: 'patch',
      userId: this.localUserId,
      timestamp: Date.now(),
      data: update,
      version: this.version,
    };

    // Apply locally first
    this.applyStateUpdate(stateUpdate);

    // Broadcast to others
    this.transport.broadcast({
      type: MessageType.STATE_UPDATE,
      senderId: this.localUserId,
      timestamp: Date.now(),
      data: stateUpdate,
    });
  }

  private applyStateUpdate(update: StateUpdate): void {
    // Simple merge strategy - can be enhanced with CRDTs for better conflict resolution
    Object.assign(this.state, update.data);
    this.state.version = update.version;

    // Notify listeners
    this.stateUpdateCallbacks.forEach(callback => callback(update));
  }

  // ============================================================================
  // Avatar/Position Updates
  // ============================================================================

  updateUserPose(pose: AvatarPose): void {
    // High-frequency update - send directly without state management
    this.transport.broadcast({
      type: MessageType.POSE_UPDATE,
      senderId: this.localUserId,
      timestamp: Date.now(),
      data: pose,
    });
  }

  // ============================================================================
  // Interactions
  // ============================================================================

  addAnnotation(annotation: Omit<Annotation, 'id' | 'userId' | 'userName' | 'timestamp'>): void {
    if (!this.hasPermission('allowAnnotations')) {
      console.warn('[MultiplayerSession] No permission to add annotations');
      return;
    }

    const localUser = this.getLocalUser();
    if (!localUser) return;

    const fullAnnotation: Annotation = {
      id: `${this.localUserId}-${Date.now()}`,
      userId: this.localUserId,
      userName: localUser.name,
      timestamp: Date.now(),
      ...annotation,
    };

    // Add to local state
    this.state.annotations.push(fullAnnotation);

    // Broadcast
    this.transport.broadcast({
      type: MessageType.ANNOTATION_ADD,
      senderId: this.localUserId,
      timestamp: Date.now(),
      data: fullAnnotation,
    });

    // Notify local listeners
    this.annotationAddCallbacks.forEach(callback => callback(fullAnnotation));
  }

  removeAnnotation(annotationId: string): void {
    const annotation = this.state.annotations.find(a => a.id === annotationId);

    // Only allow removing own annotations or if host
    if (annotation && (annotation.userId === this.localUserId || this.isHost())) {
      this.state.annotations = this.state.annotations.filter(a => a.id !== annotationId);

      this.transport.broadcast({
        type: MessageType.ANNOTATION_REMOVE,
        senderId: this.localUserId,
        timestamp: Date.now(),
        data: annotationId,
      });

      this.annotationRemoveCallbacks.forEach(callback => callback(annotationId));
    }
  }

  setFocus(objectPath: string, position: [number, number, number], duration?: number): void {
    const focus: FocusPoint = {
      userId: this.localUserId,
      targetObjectPath: objectPath,
      position,
      timestamp: Date.now(),
      duration,
    };

    // Update local state
    this.state.focusPoints = this.state.focusPoints.filter(f => f.userId !== this.localUserId);
    this.state.focusPoints.push(focus);

    // Broadcast
    this.transport.broadcast({
      type: MessageType.FOCUS_CHANGE,
      senderId: this.localUserId,
      timestamp: Date.now(),
      data: focus,
    });

    // Auto-clear after duration
    if (duration) {
      setTimeout(() => {
        this.state.focusPoints = this.state.focusPoints.filter(f => f.userId !== this.localUserId);
      }, duration);
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  onStateUpdate(callback: StateUpdateCallback): void {
    this.stateUpdateCallbacks.add(callback);
  }

  onUserJoined(callback: UserEventCallback): void {
    this.userJoinedCallbacks.add(callback);
  }

  onUserLeft(callback: UserIdCallback): void {
    this.userLeftCallbacks.add(callback);
  }

  onPoseUpdate(callback: PoseUpdateCallback): void {
    this.poseUpdateCallbacks.add(callback);
  }

  onAnnotationAdd(callback: AnnotationCallback): void {
    this.annotationAddCallbacks.add(callback);
  }

  onAnnotationRemove(callback: UserIdCallback): void {
    this.annotationRemoveCallbacks.add(callback);
  }

  onFocusChange(callback: FocusCallback): void {
    this.focusChangeCallbacks.add(callback);
  }

  onConnectionStateChanged(callback: ConnectionCallback): void {
    this.connectionStateCallbacks.add(callback);
  }

  // ============================================================================
  // Transport Message Handlers
  // ============================================================================

  private setupTransportHandlers(): void {
    this.transport.onMessage((message, senderId) => {
      this.handleMessage(message, senderId);
    });

    this.transport.onUserJoined(user => {
      this.users.set(user.id, user);
      this.userJoinedCallbacks.forEach(callback => callback(user));
    });

    this.transport.onUserLeft(userId => {
      this.users.delete(userId);

      // Clean up user-specific state
      this.state.focusPoints = this.state.focusPoints.filter(f => f.userId !== userId);

      this.userLeftCallbacks.forEach(callback => callback(userId));
    });

    this.transport.onConnectionStateChanged(state => {
      this.connectionStateCallbacks.forEach(callback => callback(state));
    });

    this.transport.onError(error => {
      console.error('[MultiplayerSession] Transport error:', error);
    });
  }

  private handleMessage(message: Message, senderId: string): void {
    // Ignore own messages
    if (senderId === this.localUserId) return;

    switch (message.type) {
      case MessageType.STATE_UPDATE:
        this.applyStateUpdate(message.data as StateUpdate);
        break;

      case MessageType.STATE_REQUEST:
        // Send full state to requester
        if (this.isHost()) {
          this.transport.send({
            type: MessageType.STATE_FULL,
            senderId: this.localUserId,
            timestamp: Date.now(),
            data: this.state,
          }, senderId);
        }
        break;

      case MessageType.STATE_FULL:
        // Replace local state with received full state
        this.state = message.data as SharedState;
        this.version = this.state.version;
        break;

      case MessageType.POSE_UPDATE:
        this.poseUpdateCallbacks.forEach(callback =>
          callback(senderId, message.data as AvatarPose)
        );
        break;

      case MessageType.ANNOTATION_ADD:
        const annotation = message.data as Annotation;
        if (!this.state.annotations.find(a => a.id === annotation.id)) {
          this.state.annotations.push(annotation);
          this.annotationAddCallbacks.forEach(callback => callback(annotation));
        }
        break;

      case MessageType.ANNOTATION_REMOVE:
        const annotationId = message.data as string;
        this.state.annotations = this.state.annotations.filter(a => a.id !== annotationId);
        this.annotationRemoveCallbacks.forEach(callback => callback(annotationId));
        break;

      case MessageType.FOCUS_CHANGE:
        const focus = message.data as FocusPoint;
        this.state.focusPoints = this.state.focusPoints.filter(f => f.userId !== senderId);
        this.state.focusPoints.push(focus);
        this.focusChangeCallbacks.forEach(callback => callback(focus));
        break;

      default:
        console.warn('[MultiplayerSession] Unknown message type:', message.type);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  requestFullState(): void {
    this.transport.broadcast({
      type: MessageType.STATE_REQUEST,
      senderId: this.localUserId,
      timestamp: Date.now(),
      data: {},
    });
  }

  getStats() {
    return {
      sessionId: this.config.sessionId,
      userCount: this.users.size,
      stateVersion: this.version,
      annotationCount: this.state.annotations.length,
      connectionState: this.transport.getConnectionState(),
    };
  }
}
