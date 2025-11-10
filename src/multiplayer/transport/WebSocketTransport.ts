/**
 * WebSocketTransport - WebSocket-based transport adapter
 *
 * Implements ITransportAdapter using standard WebSocket protocol.
 * Suitable for client-server architectures with a dedicated multiplayer server.
 */

import {
  ITransportAdapter,
  ConnectionConfig,
  ConnectionState,
  RoomConfig,
  RoomInfo,
  Message,
  User,
  JoinSessionData,
} from '../types';

interface ServerMessage {
  event: 'user_joined' | 'user_left' | 'message' | 'room_created' | 'room_joined' | 'error';
  data: any;
}

export class WebSocketTransport implements ITransportAdapter {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private currentRoomId: string | null = null;
  private config: ConnectionConfig | null = null;

  // Event handlers
  private messageHandlers: Set<(message: Message, senderId: string) => void> = new Set();
  private userJoinedHandlers: Set<(user: User) => void> = new Set();
  private userLeftHandlers: Set<(userId: string) => void> = new Set();
  private connectionStateHandlers: Set<(state: ConnectionState) => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();

  // Reconnection
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  // ============================================================================
  // Connection Lifecycle
  // ============================================================================

  async connect(config: ConnectionConfig): Promise<void> {
    this.config = config;
    this.setConnectionState('connecting');

    return new Promise((resolve, reject) => {
      try {
        // Add userId as query param for authentication
        const url = new URL(config.serverUrl);
        url.searchParams.set('userId', config.userId);
        if (config.apiKey) {
          url.searchParams.set('apiKey', config.apiKey);
        }

        this.ws = new WebSocket(url.toString());

        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
          this.ws?.close();
        }, config.timeout || 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.setConnectionState('connected');
          this.reconnectAttempts = 0;
          console.log('[WebSocketTransport] Connected to', config.serverUrl);
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.setConnectionState('error');
          const err = new Error('WebSocket connection error');
          this.errorHandlers.forEach(handler => handler(err));
          reject(err);
        };

        this.ws.onclose = () => {
          this.setConnectionState('disconnected');
          this.handleDisconnect();
        };

        this.ws.onmessage = (event) => {
          this.handleServerMessage(event.data);
        };

      } catch (error) {
        this.setConnectionState('error');
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.setConnectionState('disconnected');
      console.log('[WebSocketTransport] Disconnected');
    }
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // ============================================================================
  // Messaging
  // ============================================================================

  send(message: Message, targetUserId?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketTransport] Cannot send - not connected');
      return;
    }

    const envelope = {
      action: 'send_message',
      targetUserId,
      message,
    };

    this.ws.send(JSON.stringify(envelope));
  }

  broadcast(message: Message): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketTransport] Cannot broadcast - not connected');
      return;
    }

    const envelope = {
      action: 'broadcast',
      roomId: this.currentRoomId,
      message,
    };

    this.ws.send(JSON.stringify(envelope));
  }

  onMessage(callback: (message: Message, senderId: string) => void): void {
    this.messageHandlers.add(callback);
  }

  // ============================================================================
  // Room Management
  // ============================================================================

  async createRoom(config: RoomConfig): Promise<string> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();

      const handler = (event: MessageEvent) => {
        try {
          const response: ServerMessage = JSON.parse(event.data);

          if (response.event === 'room_created' && response.data.requestId === requestId) {
            this.ws?.removeEventListener('message', handler);
            this.currentRoomId = response.data.roomId;
            resolve(response.data.roomId);
          } else if (response.event === 'error' && response.data.requestId === requestId) {
            this.ws?.removeEventListener('message', handler);
            reject(new Error(response.data.message));
          }
        } catch (error) {
          // Ignore parse errors
        }
      };

      this.ws.addEventListener('message', handler);

      this.ws.send(JSON.stringify({
        action: 'create_room',
        requestId,
        config,
      }));

      // Timeout after 10s
      setTimeout(() => {
        this.ws?.removeEventListener('message', handler);
        reject(new Error('Create room timeout'));
      }, 10000);
    });
  }

  async joinRoom(roomId: string, userInfo: JoinSessionData): Promise<RoomInfo> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();

      const handler = (event: MessageEvent) => {
        try {
          const response: ServerMessage = JSON.parse(event.data);

          if (response.event === 'room_joined' && response.data.requestId === requestId) {
            this.ws?.removeEventListener('message', handler);
            this.currentRoomId = roomId;
            resolve(response.data.roomInfo);
          } else if (response.event === 'error' && response.data.requestId === requestId) {
            this.ws?.removeEventListener('message', handler);
            reject(new Error(response.data.message));
          }
        } catch (error) {
          // Ignore parse errors
        }
      };

      this.ws.addEventListener('message', handler);

      this.ws.send(JSON.stringify({
        action: 'join_room',
        requestId,
        roomId,
        userInfo,
      }));

      setTimeout(() => {
        this.ws?.removeEventListener('message', handler);
        reject(new Error('Join room timeout'));
      }, 10000);
    });
  }

  async leaveRoom(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({
      action: 'leave_room',
      roomId: this.currentRoomId,
    }));

    this.currentRoomId = null;
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  onUserJoined(callback: (user: User) => void): void {
    this.userJoinedHandlers.add(callback);
  }

  onUserLeft(callback: (userId: string) => void): void {
    this.userLeftHandlers.add(callback);
  }

  onConnectionStateChanged(callback: (state: ConnectionState) => void): void {
    this.connectionStateHandlers.add(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorHandlers.add(callback);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionStateHandlers.forEach(handler => handler(state));
    }
  }

  private handleServerMessage(data: string): void {
    try {
      const serverMessage: ServerMessage = JSON.parse(data);

      switch (serverMessage.event) {
        case 'message':
          const { message, senderId } = serverMessage.data;
          this.messageHandlers.forEach(handler => handler(message, senderId));
          break;

        case 'user_joined':
          const joinedUser: User = serverMessage.data.user;
          this.userJoinedHandlers.forEach(handler => handler(joinedUser));
          break;

        case 'user_left':
          const leftUserId: string = serverMessage.data.userId;
          this.userLeftHandlers.forEach(handler => handler(leftUserId));
          break;

        case 'error':
          const error = new Error(serverMessage.data.message);
          this.errorHandlers.forEach(handler => handler(error));
          break;

        default:
          console.warn('[WebSocketTransport] Unknown server message:', serverMessage);
      }
    } catch (error) {
      console.error('[WebSocketTransport] Failed to parse server message:', error);
    }
  }

  private handleDisconnect(): void {
    console.log('[WebSocketTransport] Disconnected, attempting to reconnect...');

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.config) {
      this.reconnectAttempts++;
      this.setConnectionState('reconnecting');

      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        if (this.config) {
          this.connect(this.config).catch(error => {
            console.error('[WebSocketTransport] Reconnect failed:', error);
          });
        }
      }, delay);
    } else {
      this.setConnectionState('error');
      this.errorHandlers.forEach(handler =>
        handler(new Error('Max reconnection attempts reached'))
      );
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
