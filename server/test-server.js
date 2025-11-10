/**
 * Simple test client for the multiplayer server
 */

const WebSocket = require('ws');

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:8080';

async function testConnection() {
  console.log('Testing connection to', SERVER_URL);

  const ws = new WebSocket(`${SERVER_URL}?userId=test-user-1`);

  ws.on('open', () => {
    console.log('✓ Connected to server');

    // Test: Join room
    console.log('\nTest 1: Joining room...');
    ws.send(JSON.stringify({
      action: 'join_room',
      roomId: 'test-room',
      requestId: 'test-join-1',
      userInfo: {
        userId: 'test-user-1',
        name: 'Test User 1',
        role: 'host',
        avatar: {
          type: 'simple',
          color: '#ff0000',
          displayName: 'Tester 1',
        },
      },
    }));
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('← Received:', message.event);

    if (message.event === 'room_joined') {
      console.log('✓ Joined room successfully');
      console.log('  Room info:', JSON.stringify(message.data.roomInfo, null, 2));

      // Test: Broadcast a message
      console.log('\nTest 2: Broadcasting message...');
      ws.send(JSON.stringify({
        action: 'broadcast',
        roomId: 'test-room',
        message: {
          type: 'state_update',
          senderId: 'test-user-1',
          timestamp: Date.now(),
          data: {
            type: 'patch',
            userId: 'test-user-1',
            timestamp: Date.now(),
            data: {
              sceneUrl: 'https://example.com/test.gltf',
              sceneLoaded: true,
            },
            version: 1,
          },
        },
      }));

      console.log('✓ Broadcast sent');

      // Test: Create second client
      setTimeout(() => {
        console.log('\nTest 3: Connecting second user...');
        testSecondUser();
      }, 1000);
    }

    if (message.event === 'user_joined') {
      console.log('✓ Received user_joined event');
      console.log('  User:', message.data.user.name);
    }

    if (message.event === 'message') {
      console.log('✓ Received broadcast message');
      console.log('  From:', message.data.senderId);
      console.log('  Type:', message.data.message.type);
    }
  });

  ws.on('error', (error) => {
    console.error('✗ WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('Connection closed');
  });

  return ws;
}

async function testSecondUser() {
  const ws2 = new WebSocket(`${SERVER_URL}?userId=test-user-2`);

  ws2.on('open', () => {
    console.log('✓ Second user connected');

    ws2.send(JSON.stringify({
      action: 'join_room',
      roomId: 'test-room',
      requestId: 'test-join-2',
      userInfo: {
        userId: 'test-user-2',
        name: 'Test User 2',
        role: 'viewer',
        avatar: {
          type: 'simple',
          color: '#00ff00',
          displayName: 'Tester 2',
        },
      },
    }));
  });

  ws2.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('← User 2 received:', message.event);

    if (message.event === 'room_joined') {
      console.log('✓ Second user joined room successfully');
      console.log('  Other users in room:', message.data.roomInfo.users.length);

      // Clean up after successful test
      setTimeout(() => {
        console.log('\n=== All tests passed! ===\n');
        ws2.close();
        process.exit(0);
      }, 1000);
    }
  });

  ws2.on('error', (error) => {
    console.error('✗ User 2 error:', error);
  });
}

async function testHealthEndpoint() {
  const http = require('http');
  const url = new URL(SERVER_URL.replace('ws', 'http') + '/health');

  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✓ Health check passed');
          console.log('  Response:', data);
          resolve();
        } else {
          reject(new Error(`Health check failed: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Multiplayer Server Test Suite');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('Test 0: Health check...');
    await testHealthEndpoint();
    console.log('');

    await testConnection();
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

runTests();
