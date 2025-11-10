/**
 * Core type definitions for multiplayer support
 */

import * as THREE from 'three';

// ============================================================================
// User & Session Types
// ============================================================================

export type UserRole = 'host' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: AvatarConfig;
  connected: boolean;
  lastSeen: number;
}

export interface SessionConfig {
  sessionId: string;
  maxUsers: number;
  permissions: PermissionConfig;
  transport: ITransportAdapter;
}

export interface PermissionConfig {
  allowSceneChange: 'host' | 'editor' | 'all';
  allowTreeViewChange: 'host' | 'editor' | 'all';
  allowAnnotations: 'host' | 'editor' | 'all';
  allowCameraControl: 'host' | 'editor' | 'all';
}

// ============================================================================
// State Types
// ============================================================================

export interface SharedState {
  version: number;
  sceneUrl: string;
  sceneLoaded: boolean;
  treeViewState: Record<string, boolean>; // path -> visibility
  annotations: Annotation[];
  focusPoints: FocusPoint[];
  sessionSettings: SessionSettings;
}

export interface StateUpdate {
  type: 'full' | 'patch';
  userId: string;
  timestamp: number;
  data: Partial<SharedState>;
  version: number;
  dependencies?: number[];
}

export interface SessionSettings {
  avatarsVisible: boolean;
  syncCameraFraming: boolean;
  allowAnnotations: boolean;
}

// ============================================================================
// Avatar Types
// ============================================================================

export type AvatarType = 'vrm' | 'simple' | 'custom';

export interface AvatarConfig {
  type: AvatarType;
  url?: string; // For VRM models
  color?: string; // For simple avatars (hex color)
  displayName: string;
}

export interface AvatarPose {
  position: [number, number, number];
  rotation: [number, number, number, number]; // quaternion [x, y, z, w]
  headRotation?: [number, number, number, number];
  leftHand?: HandPose;
  rightHand?: HandPose;
}

export interface HandPose {
  position: [number, number, number];
  rotation: [number, number, number, number];
  pointing: boolean;
  targetObject?: string; // Object path if pointing at something
}

// ============================================================================
// Interaction Types
// ============================================================================

export interface Annotation {
  id: string;
  userId: string;
  userName: string;
  position: [number, number, number];
  objectPath?: string; // Optional: attached to specific object
  text: string;
  color: string;
  timestamp: number;
}

export interface FocusPoint {
  userId: string;
  targetObjectPath: string;
  position: [number, number, number];
  timestamp: number;
  duration?: number; // Optional: auto-clear after duration (ms)
}

// ============================================================================
// Network Protocol Types
// ============================================================================

export enum MessageType {
  // Session management
  JOIN_SESSION = 'join_session',
  LEAVE_SESSION = 'leave_session',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',

  // State sync
  STATE_UPDATE = 'state_update',
  STATE_REQUEST = 'state_request',
  STATE_FULL = 'state_full',

  // Ephemeral updates (high frequency)
  POSE_UPDATE = 'pose_update',
  GAZE_UPDATE = 'gaze_update',

  // Interactions
  ANNOTATION_ADD = 'annotation_add',
  ANNOTATION_REMOVE = 'annotation_remove',
  FOCUS_CHANGE = 'focus_change',
  CAMERA_FRAME = 'camera_frame',

  // Chat
  CHAT_MESSAGE = 'chat_message',

  // Control
  REQUEST_CONTROL = 'request_control',
  GRANT_CONTROL = 'grant_control',
}

export interface Message {
  type: MessageType;
  senderId: string;
  timestamp: number;
  data: any;
}

export interface JoinSessionData {
  userId: string;
  name: string;
  role: UserRole;
  avatar?: AvatarConfig;
}

export interface RoomInfo {
  roomId: string;
  users: User[];
  state: SharedState;
  createdAt: number;
}

// ============================================================================
// Transport Interface
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface ConnectionConfig {
  serverUrl: string;
  apiKey?: string;
  userId: string;
  timeout?: number;
}

export interface RoomConfig {
  name?: string;
  maxUsers?: number;
  password?: string;
  persistent?: boolean;
}

export interface ITransportAdapter {
  // Connection lifecycle
  connect(config: ConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  getConnectionState(): ConnectionState;

  // Messaging
  send(message: Message, targetUserId?: string): void;
  broadcast(message: Message): void;
  onMessage(callback: (message: Message, senderId: string) => void): void;

  // Room management
  createRoom(config: RoomConfig): Promise<string>;
  joinRoom(roomId: string, userInfo: JoinSessionData): Promise<RoomInfo>;
  leaveRoom(): Promise<void>;

  // Events
  onUserJoined(callback: (user: User) => void): void;
  onUserLeft(callback: (userId: string) => void): void;
  onConnectionStateChanged(callback: (state: ConnectionState) => void): void;
  onError(callback: (error: Error) => void): void;
}

// ============================================================================
// Viewer Integration Types
// ============================================================================

export interface MultiplayerConfig {
  enabled: boolean;
  sessionId?: string;
  transport: ITransportAdapter;
  userInfo: JoinSessionData;
  avatarConfig?: AvatarConfig;
  permissions?: PermissionConfig;
  autoSync?: {
    sceneLoading?: boolean;
    treeView?: boolean;
    cameraFraming?: boolean;
  };
}

export interface ViewerMultiplayerCallbacks {
  onSceneLoadRequest?: (url: string) => Promise<void>;
  onTreeViewChange?: (state: Record<string, boolean>) => void;
  onCameraFrame?: (position: THREE.Vector3, target: THREE.Vector3) => void;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationRemove?: (annotationId: string) => void;
}
