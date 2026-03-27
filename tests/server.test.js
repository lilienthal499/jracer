import { test, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import WebSocket from 'ws';

let serverProcess;
let serverReady = false;

beforeAll(async () => {
  // Start PartyKit dev server
  serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
  });

  // Wait for server to be ready
  await new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('Ready on')) {
        serverReady = true;
        resolve();
      }
    });

    // Timeout after 10 seconds
    setTimeout(resolve, 10000);
  });
}, 15000);

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test('server starts and is reachable', () => {
  expect(serverReady).toBe(true);
});

test('WebSocket connection works', async () => {
  const ws = new WebSocket('ws://localhost:1999/party/main');

  await new Promise((resolve, reject) => {
    ws.on('open', () => {
      expect(true).toBe(true); // Connection successful
      ws.close();
      resolve();
    });

    ws.on('error', reject);

    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });
});

test('server sends config and track data', async () => {
  const ws = new WebSocket('ws://localhost:1999/party/main');

  const message = await new Promise((resolve, reject) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      ws.close();
      resolve(msg);
    });

    ws.on('error', reject);

    setTimeout(() => reject(new Error('Message timeout')), 5000);
  });

  expect(message.type).toBe('init');
  expect(message.config).toBeDefined();
  expect(message.config.track).toBeDefined();
  expect(message.config.track.number).toBe(2);
  expect(message.trackData).toBeDefined();
  expect(message.trackData.name).toBe('Technical Circuit');
});

test('server loads recordings for players', async () => {
  const ws = new WebSocket('ws://localhost:1999/party/main');

  const message = await new Promise((resolve, reject) => {
    ws.on('message', (data) => {
      ws.close();
      resolve(JSON.parse(data.toString()));
    });

    ws.on('error', reject);
    setTimeout(() => reject(new Error('Timeout')), 5000);
  });

  const recordedPlayer = message.config.players.find(p => p.name === 'Recorded');
  expect(recordedPlayer).toBeDefined();
  expect(recordedPlayer.recording).toBeDefined();
  expect(typeof recordedPlayer.recording).toBe('object');
  expect(Object.keys(recordedPlayer.recording).length).toBeGreaterThan(0);
});
