/**
 * Gallery Viewer Multiplayer Server
 *
 * Self-contained WebSocket server for multiplayer support.
 * No third-party dependencies beyond ws library.
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// ============================================================================
// Configuration
// ============================================================================

const PORT = process.env.PORT || 8080;
const MAX_ROOMS = 1000;
const MAX_USERS_PER_ROOM = 50;
const ROOM_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// ============================================================================
// Data Structures
// ============================================================================

class Room {
  constructor(roomId, config = {}) {
    this.roomId = roomId;
    this.users = new Map(); // userId -> User
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
    this.config = {
      maxUsers: config.maxUsers || MAX_USERS_PER_ROOM,
      persistent: config.persistent || false,
      password: config.password || null,
      name: config.name || roomId,
    };
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  addUser(user) {
    if (this.users.size >= this.config.maxUsers) {
      throw new Error('Room is full');
    }
    this.users.set(user.id, user);
    this.lastActivity = Date.now();
  }

  removeUser(userId) {
    this.users.delete(userId);
    this.lastActivity = Date.now();
  }

  isEmpty() {
    return this.users.size === 0;
  }

  toJSON() {
    return {
      roomId: this.roomId,
      users: Array.from(this.users.values()).map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        connected: true,
        lastSeen: Date.now(),
      })),
      state: this.state,
      createdAt: this.createdAt,
    };
  }
}

class User {
  constructor(userId, ws, userInfo) {
    this.id = userId;
    this.ws = ws;
    this.name = userInfo.name || 'Anonymous';
    this.role = userInfo.role || 'viewer';
    this.avatar = userInfo.avatar;
    this.roomId = null;
    this.isAlive = true;
  }
}

// ============================================================================
// Server State
// ============================================================================

const rooms = new Map(); // roomId -> Room
const users = new Map(); // ws -> User

// ============================================================================
// HTTP Server (for health checks)
// ============================================================================

const httpServer = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      rooms: rooms.size,
      users: users.size,
      uptime: process.uptime(),
    }));
  } else if (pathname === '/stats') {
    const stats = {
      rooms: Array.from(rooms.values()).map(room => ({
        roomId: room.roomId,
        userCount: room.users.size,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity,
      })),
      totalUsers: users.size,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats, null, 2));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// ============================================================================
// WebSocket Server
// ============================================================================

const wss = new WebSocket.Server({
  server: httpServer,
  clientTracking: true,
});

wss.on('connection', (ws, req) => {
  const params = url.parse(req.url, true).query;
  const userId = params.userId || generateUserId();
  const apiKey = params.apiKey;

  console.log(`[Connection] User ${userId} connected`);

  // Optional API key validation
  if (process.env.REQUIRE_API_KEY && apiKey !== process.env.API_KEY) {
    ws.close(1008, 'Invalid API key');
    return;
  }

  // Create user object (will be fully initialized on join_room)
  const user = new User(userId, ws, { name: userId });
  users.set(ws, user);

  // Set up heartbeat
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Handle messages
  ws.on('message', (data) => {
    try {
      const envelope = JSON.parse(data);
      handleClientMessage(ws, envelope);
    } catch (error) {
      console.error('[Error] Failed to parse message:', error);
      sendError(ws, 'Invalid message format', null);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('[Error] WebSocket error:', error);
  });

  // Send welcome message
  send(ws, {
    event: 'connected',
    data: { userId },
  });
});

// ============================================================================
// Message Handlers
// ============================================================================

function handleClientMessage(ws, envelope) {
  const user = users.get(ws);
  if (!user) return;

  console.log(`[Message] ${user.id}: ${envelope.action}`);

  switch (envelope.action) {
    case 'create_room':
      handleCreateRoom(ws, envelope);
      break;

    case 'join_room':
      handleJoinRoom(ws, envelope);
      break;

    case 'leave_room':
      handleLeaveRoom(ws, envelope);
      break;

    case 'broadcast':
      handleBroadcast(ws, envelope);
      break;

    case 'send_message':
      handleSendMessage(ws, envelope);
      break;

    default:
      sendError(ws, `Unknown action: ${envelope.action}`, envelope.requestId);
  }
}

function handleCreateRoom(ws, envelope) {
  const user = users.get(ws);
  if (!user) return;

  if (rooms.size >= MAX_ROOMS) {
    return sendError(ws, 'Server at capacity', envelope.requestId);
  }

  const roomId = envelope.roomId || generateRoomId();

  if (rooms.has(roomId)) {
    return sendError(ws, 'Room already exists', envelope.requestId);
  }

  const room = new Room(roomId, envelope.config);
  rooms.set(roomId, room);

  console.log(`[Room] Created room ${roomId}`);

  send(ws, {
    event: 'room_created',
    data: {
      requestId: envelope.requestId,
      roomId: roomId,
    },
  });
}

function handleJoinRoom(ws, envelope) {
  const user = users.get(ws);
  if (!user) return;

  const roomId = envelope.roomId;
  let room = rooms.get(roomId);

  // Auto-create room if it doesn't exist
  if (!room) {
    room = new Room(roomId);
    rooms.set(roomId, room);
    console.log(`[Room] Auto-created room ${roomId}`);
  }

  // Check room capacity
  if (room.users.size >= room.config.maxUsers) {
    return sendError(ws, 'Room is full', envelope.requestId);
  }

  // Check password
  if (room.config.password && envelope.password !== room.config.password) {
    return sendError(ws, 'Invalid password', envelope.requestId);
  }

  // Update user info
  const userInfo = envelope.userInfo || {};
  user.name = userInfo.name || user.name;
  user.role = userInfo.role || user.role;
  user.avatar = userInfo.avatar;
  user.roomId = roomId;

  // Add user to room
  try {
    room.addUser(user);
  } catch (error) {
    return sendError(ws, error.message, envelope.requestId);
  }

  console.log(`[Room] User ${user.id} (${user.name}) joined room ${roomId}`);

  // Send room info to the joining user
  send(ws, {
    event: 'room_joined',
    data: {
      requestId: envelope.requestId,
      roomInfo: room.toJSON(),
    },
  });

  // Notify other users in the room
  broadcastToRoom(roomId, {
    event: 'user_joined',
    data: {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        connected: true,
        lastSeen: Date.now(),
      },
    },
  }, user.id);
}

function handleLeaveRoom(ws, envelope) {
  const user = users.get(ws);
  if (!user || !user.roomId) return;

  const roomId = user.roomId;
  const room = rooms.get(roomId);

  if (room) {
    room.removeUser(user.id);

    console.log(`[Room] User ${user.id} left room ${roomId}`);

    // Notify other users
    broadcastToRoom(roomId, {
      event: 'user_left',
      data: { userId: user.id },
    });

    // Clean up empty non-persistent rooms
    if (room.isEmpty() && !room.config.persistent) {
      rooms.delete(roomId);
      console.log(`[Room] Deleted empty room ${roomId}`);
    }
  }

  user.roomId = null;
}

function handleBroadcast(ws, envelope) {
  const user = users.get(ws);
  if (!user || !user.roomId) return;

  const message = envelope.message;
  const room = rooms.get(user.roomId);

  if (!room) return;

  // Update room state for certain message types
  if (message.type === 'state_update' && message.data) {
    Object.assign(room.state, message.data.data);
    room.state.version = message.data.version;
  }

  // Broadcast to all users in the room except sender
  broadcastToRoom(user.roomId, {
    event: 'message',
    data: {
      message,
      senderId: user.id,
    },
  }, user.id);
}

function handleSendMessage(ws, envelope) {
  const user = users.get(ws);
  if (!user) return;

  const targetUserId = envelope.targetUserId;
  const message = envelope.message;

  // Find target user's websocket
  let targetWs = null;
  for (const [ws, u] of users.entries()) {
    if (u.id === targetUserId) {
      targetWs = ws;
      break;
    }
  }

  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    send(targetWs, {
      event: 'message',
      data: {
        message,
        senderId: user.id,
      },
    });
  }
}

function handleDisconnect(ws) {
  const user = users.get(ws);
  if (!user) return;

  console.log(`[Disconnect] User ${user.id} disconnected`);

  // Leave room if in one
  if (user.roomId) {
    handleLeaveRoom(ws, {});
  }

  users.delete(ws);
}

// ============================================================================
// Utility Functions
// ============================================================================

function send(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws, message, requestId) {
  send(ws, {
    event: 'error',
    data: {
      message,
      requestId,
    },
  });
}

function broadcastToRoom(roomId, message, excludeUserId = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const user of room.users.values()) {
    if (user.id !== excludeUserId && user.ws.readyState === WebSocket.OPEN) {
      send(user.ws, message);
    }
  }
}

function generateRoomId() {
  return 'room-' + Math.random().toString(36).substr(2, 9);
}

function generateUserId() {
  return 'user-' + Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// Heartbeat & Cleanup
// ============================================================================

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('[Heartbeat] Terminating inactive connection');
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

// Clean up old rooms
const cleanupInterval = setInterval(() => {
  const now = Date.now();

  for (const [roomId, room] of rooms.entries()) {
    if (!room.config.persistent &&
        room.isEmpty() &&
        (now - room.lastActivity) > ROOM_TIMEOUT) {
      rooms.delete(roomId);
      console.log(`[Cleanup] Deleted inactive room ${roomId}`);
    }
  }
}, 60000); // Check every minute

wss.on('close', () => {
  clearInterval(heartbeatInterval);
  clearInterval(cleanupInterval);
});

// ============================================================================
// Start Server
// ============================================================================

httpServer.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Gallery Viewer Multiplayer Server');
  console.log('='.repeat(60));
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`HTTP server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  Statistics:   http://localhost:${PORT}/stats`);
  console.log('');
  console.log('Configuration:');
  console.log(`  Max rooms: ${MAX_ROOMS}`);
  console.log(`  Max users per room: ${MAX_USERS_PER_ROOM}`);
  console.log(`  Room timeout: ${ROOM_TIMEOUT / 1000 / 60} minutes`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Shutdown] Received SIGTERM, closing server...');

  wss.clients.forEach((ws) => {
    ws.close(1001, 'Server shutting down');
  });

  httpServer.close(() => {
    console.log('[Shutdown] Server closed');
    process.exit(0);
  });
});
