import type * as Party from 'partykit/server';
// @ts-ignore
import config from '../public/backend/config.json';

export default class JRacerServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // HTTP endpoint for fetching dynamically assembled config
  async onRequest(req: Party.Request) {
    const url = new URL(req.url);

    // GET /party/main/config - return assembled config
    if (url.pathname.endsWith('/config') && req.method === 'GET') {
      const assembledConfig = await this.assembleConfig();
      return new Response(JSON.stringify(assembledConfig), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  // Assemble config from multiple sources (base config, storage, database, etc.)
  async assembleConfig() {
    const trackData = await import(`../public/backend/tracks/${config.track.number}.json`);

    // Load recordings dynamically from storage/database
    const configWithRecordings = {
      ...config,
      players: await Promise.all(
        config.players.map(async (player: any) => {
          if (typeof player.recording === 'number') {
            // In the future, this could fetch from PartyKit storage, database, etc.
            const recordingData = await import(
              `../public/backend/recordings/${config.track.number}/${player.recording}.json`
            );
            return { ...player, recording: recordingData };
          }
          return player;
        })
      ),
    };

    return {
      config: configWithRecordings,
      trackData: trackData,
    };
  }

  // WebSocket handlers (for future multiplayer features)
  async onConnect(conn: Party.Connection) {
    console.log('[Server] Client connected:', conn.id);
  }

  onMessage(message: string, sender: Party.Connection) {
    // Future: handle multiplayer messages
  }
}

JRacerServer satisfies Party.Worker;
