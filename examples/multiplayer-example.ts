/**
 * Multiplayer Integration Example
 *
 * Demonstrates how to integrate multiplayer support with the gallery-viewer.
 */

import { Viewer } from '../src/viewer';
import { MultiplayerSession } from '../src/multiplayer/MultiplayerSession';
import { WebSocketTransport } from '../src/multiplayer/transport/WebSocketTransport';
import type { AvatarPose, Annotation } from '../src/multiplayer/types';
import * as THREE from 'three';

// ============================================================================
// Example 1: Basic Multiplayer Setup
// ============================================================================

async function basicMultiplayerExample() {
  // Create the viewer instance
  const viewer = new Viewer();

  // Load initial scene
  await viewer.loadGltf('https://example.com/scene.gltf');

  // Set up multiplayer transport
  const transport = new WebSocketTransport();
  await transport.connect({
    serverUrl: 'wss://multiplayer-server.example.com',
    userId: 'user-123',
    apiKey: 'optional-api-key',
  });

  // Create multiplayer session
  const session = new MultiplayerSession({
    sessionId: 'room-abc',
    maxUsers: 10,
    permissions: {
      allowSceneChange: 'host',
      allowTreeViewChange: 'editor',
      allowAnnotations: 'all',
      allowCameraControl: 'all',
    },
    transport,
  });

  // Join the session
  await session.join({
    userId: 'user-123',
    name: 'Alice',
    role: 'editor',
    avatar: {
      type: 'simple',
      color: '#3498db',
      displayName: 'Alice',
    },
  });

  // Integrate with viewer
  integrateMultiplayerWithViewer(viewer, session);

  console.log('Multiplayer session active!');
}

// ============================================================================
// Example 2: Viewer Integration
// ============================================================================

function integrateMultiplayerWithViewer(viewer: Viewer, session: MultiplayerSession) {
  // Avatar manager for rendering other users
  const avatarManager = new SimpleAvatarManager(viewer.scene);

  // -------------------------------------------------------------------------
  // 1. Sync Scene Loading
  // -------------------------------------------------------------------------

  session.onStateUpdate((update) => {
    if (update.data.sceneUrl) {
      console.log('Loading scene requested by', update.userId);
      viewer.loadGltf(update.data.sceneUrl);
    }

    if (update.data.treeViewState) {
      console.log('Tree view state updated by', update.userId);
      viewer.setTreeViewState(update.data.treeViewState);
    }
  });

  // Hook into viewer's scene loading to broadcast to others
  const originalLoadGltf = viewer.loadGltf.bind(viewer);
  viewer.loadGltf = async function(url: string, loadEnvironment?: boolean, overrides?: any) {
    // Load locally
    const result = await originalLoadGltf(url, loadEnvironment, overrides);

    // Broadcast to others if we have permission
    if (session.hasPermission('allowSceneChange')) {
      session.updateState({ sceneUrl: url, sceneLoaded: true });
    }

    return result;
  };

  // -------------------------------------------------------------------------
  // 2. Sync Tree View Changes
  // -------------------------------------------------------------------------

  const originalSetTreeViewState = viewer.setTreeViewState.bind(viewer);
  viewer.setTreeViewState = function(state: Record<string, boolean>) {
    // Apply locally
    originalSetTreeViewState(state);

    // Broadcast to others if we have permission
    if (session.hasPermission('allowTreeViewChange')) {
      session.updateState({ treeViewState: state });
    }
  };

  // -------------------------------------------------------------------------
  // 3. Sync Camera Positions (Avatars)
  // -------------------------------------------------------------------------

  // Send our position every 30ms
  setInterval(() => {
    const camera = viewer.activeCamera;
    const pose: AvatarPose = {
      position: camera.position.toArray() as [number, number, number],
      rotation: camera.quaternion.toArray() as [number, number, number, number],
    };
    session.updateUserPose(pose);
  }, 30);

  // Receive other users' positions
  session.onPoseUpdate((userId, pose) => {
    avatarManager.updateAvatar(userId, pose);
  });

  // -------------------------------------------------------------------------
  // 4. Handle User Join/Leave
  // -------------------------------------------------------------------------

  session.onUserJoined((user) => {
    console.log(`${user.name} joined the session`);
    avatarManager.createAvatar(user.id, user.name, user.avatar?.color || '#888888');
  });

  session.onUserLeft((userId) => {
    console.log(`User ${userId} left the session`);
    avatarManager.removeAvatar(userId);
  });

  // -------------------------------------------------------------------------
  // 5. Annotations
  // -------------------------------------------------------------------------

  session.onAnnotationAdd((annotation) => {
    console.log(`Annotation added by ${annotation.userName}:`, annotation.text);
    // Render annotation in 3D scene (implementation would go here)
  });

  session.onAnnotationRemove((annotationId) => {
    console.log('Annotation removed:', annotationId);
    // Remove annotation from 3D scene
  });

  // -------------------------------------------------------------------------
  // 6. Connection State Monitoring
  // -------------------------------------------------------------------------

  session.onConnectionStateChanged((state) => {
    console.log('Connection state:', state);

    // Update UI to show connection status
    const statusElement = document.getElementById('multiplayer-status');
    if (statusElement) {
      statusElement.textContent = state;
      statusElement.className = `status-${state}`;
    }
  });

  return session;
}

// ============================================================================
// Example 3: Simple Avatar Manager
// ============================================================================

/**
 * Simple avatar rendering using colored spheres and cones
 * For production, this would load VRM models like the existing Viverse example
 */
class SimpleAvatarManager {
  private scene: THREE.Scene;
  private avatars: Map<string, THREE.Group> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createAvatar(userId: string, name: string, color: string): void {
    const avatarGroup = new THREE.Group();
    avatarGroup.name = `avatar-${userId}`;

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.7; // Approximate head height
    avatarGroup.add(head);

    // Gaze direction (cone)
    const coneGeometry = new THREE.ConeGeometry(0.05, 0.3, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({ color, opacity: 0.7, transparent: true });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.rotation.x = Math.PI / 2; // Point forward
    cone.position.set(0, 1.7, -0.2);
    avatarGroup.add(cone);

    // Name label (sprite with canvas texture)
    const label = this.createNameLabel(name);
    label.position.y = 2.0;
    avatarGroup.add(label);

    this.avatars.set(userId, avatarGroup);
    this.scene.add(avatarGroup);
  }

  updateAvatar(userId: string, pose: AvatarPose): void {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;

    // Update position
    avatar.position.fromArray(pose.position);

    // Update rotation
    const quaternion = new THREE.Quaternion();
    quaternion.fromArray(pose.rotation);
    avatar.quaternion.copy(quaternion);
  }

  removeAvatar(userId: string): void {
    const avatar = this.avatars.get(userId);
    if (avatar) {
      this.scene.remove(avatar);
      this.avatars.delete(userId);

      // Clean up geometry and materials
      avatar.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
  }

  private createNameLabel(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;

    const context = canvas.getContext('2d')!;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'Bold 32px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.fillText(name, canvas.width / 2, canvas.height / 2 + 10);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.5, 0.125, 1);

    return sprite;
  }
}

// ============================================================================
// Example 4: UI Controls
// ============================================================================

function createMultiplayerUI(session: MultiplayerSession) {
  const container = document.createElement('div');
  container.id = 'multiplayer-ui';
  container.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    max-width: 300px;
  `;

  // Session info
  const sessionInfo = document.createElement('div');
  sessionInfo.innerHTML = `
    <h3 style="margin: 0 0 10px 0;">Multiplayer Session</h3>
    <div><strong>Room:</strong> ${session.getStats().sessionId}</div>
    <div id="user-count"><strong>Users:</strong> ${session.getStats().userCount}</div>
    <div id="connection-status"><strong>Status:</strong> Connected</div>
  `;
  container.appendChild(sessionInfo);

  // User list
  const userList = document.createElement('div');
  userList.id = 'user-list';
  userList.style.cssText = 'margin-top: 10px; max-height: 200px; overflow-y: auto;';
  container.appendChild(userList);

  function updateUserList() {
    const users = session.getUsers();
    userList.innerHTML = '<h4 style="margin: 5px 0;">Connected Users:</h4>';

    users.forEach(user => {
      const userItem = document.createElement('div');
      userItem.style.cssText = `
        padding: 5px;
        margin: 3px 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      `;
      userItem.innerHTML = `
        <div style="display: flex; align-items: center;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${user.avatar?.color || '#888'}; margin-right: 8px;"></div>
          <div>
            <strong>${user.name}</strong>
            <span style="font-size: 0.8em; color: #aaa;">(${user.role})</span>
          </div>
        </div>
      `;
      userList.appendChild(userItem);
    });
  }

  // Update user list when users join/leave
  session.onUserJoined(() => updateUserList());
  session.onUserLeft(() => updateUserList());

  // Initial render
  updateUserList();

  document.body.appendChild(container);
  return container;
}

// ============================================================================
// Example 5: Annotation Tool
// ============================================================================

function setupAnnotationTool(viewer: Viewer, session: MultiplayerSession) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  viewer.canvas.addEventListener('dblclick', (event) => {
    if (!session.hasPermission('allowAnnotations')) {
      console.warn('No permission to add annotations');
      return;
    }

    // Calculate mouse position in normalized device coordinates
    const rect = viewer.canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, viewer.activeCamera);
    const intersects = raycaster.intersectObjects(viewer.scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const objectPath = getObjectPath(intersects[0].object);

      // Prompt for annotation text
      const text = prompt('Enter annotation text:');
      if (text) {
        session.addAnnotation({
          position: point.toArray() as [number, number, number],
          objectPath,
          text,
          color: '#ffeb3b', // Yellow
        });
      }
    }
  });

  // Helper to get object path (similar to viewer.ts:2837)
  function getObjectPath(object: THREE.Object3D): string {
    const path: string[] = [];
    let current: THREE.Object3D | null = object;

    while (current && current !== viewer.scene) {
      path.unshift(current.name || 'unnamed');
      current = current.parent;
    }

    return path.join('/');
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  try {
    // Initialize viewer
    const viewer = new Viewer();
    await viewer.loadGltf('https://example.com/initial-scene.gltf');

    // Set up multiplayer
    const transport = new WebSocketTransport();
    await transport.connect({
      serverUrl: 'wss://multiplayer-server.example.com',
      userId: `user-${Date.now()}`,
    });

    const session = new MultiplayerSession({
      sessionId: new URLSearchParams(window.location.search).get('room') || 'default-room',
      maxUsers: 20,
      permissions: {
        allowSceneChange: 'host',
        allowTreeViewChange: 'all',
        allowAnnotations: 'all',
        allowCameraControl: 'all',
      },
      transport,
    });

    await session.join({
      userId: `user-${Date.now()}`,
      name: prompt('Enter your name:') || 'Anonymous',
      role: 'viewer',
      avatar: {
        type: 'simple',
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        displayName: 'User',
      },
    });

    // Integrate everything
    integrateMultiplayerWithViewer(viewer, session);
    createMultiplayerUI(session);
    setupAnnotationTool(viewer, session);

    console.log('Multiplayer gallery viewer ready!');
    console.log('Stats:', session.getStats());

  } catch (error) {
    console.error('Failed to initialize multiplayer:', error);
  }
}

// Run if this is the main module
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', main);
}

export {
  basicMultiplayerExample,
  integrateMultiplayerWithViewer,
  SimpleAvatarManager,
  createMultiplayerUI,
  setupAnnotationTool,
};
