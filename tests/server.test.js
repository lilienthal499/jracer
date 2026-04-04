import { test, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';

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

test('HTTP config endpoint returns assembled config', async () => {
  const response = await fetch('http://localhost:1999/party/main/config');

  expect(response.ok).toBe(true);
  expect(response.headers.get('content-type')).toContain('application/json');

  const data = await response.json();

  expect(data.config).toBeDefined();
  expect(data.config.track).toBeDefined();
  expect(data.config.track.number).toBe(2);
  expect(data.trackData).toBeDefined();
  expect(data.trackData.name).toBe('Technical Circuit');
});

test('server loads recordings for players', async () => {
  const response = await fetch('http://localhost:1999/party/main/config');
  const data = await response.json();

  const recordedPlayer = data.config.players.find((p) => p.name === 'Recorded');
  expect(recordedPlayer).toBeDefined();
  expect(recordedPlayer.recording).toBeDefined();
  expect(typeof recordedPlayer.recording).toBe('object');
  expect(Object.keys(recordedPlayer.recording).length).toBeGreaterThan(0);
});

test('server dynamically assembles config from multiple sources', async () => {
  const response = await fetch('http://localhost:1999/party/main/config');
  const data = await response.json();

  // Verify all recordings are loaded
  const recordedPlayers = data.config.players.filter((p) => p.recording !== undefined);
  expect(recordedPlayers.length).toBeGreaterThan(0);

  // Each recorded player should have recording data (not just a number)
  recordedPlayers.forEach((player) => {
    expect(typeof player.recording).toBe('object');
    expect(player.recording).not.toBe(null);
  });
});
