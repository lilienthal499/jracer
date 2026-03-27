import type * as Party from 'partykit/server';
// @ts-ignore
import config from '../public/backend/config.json';

export default class JRacerServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection) {
    const trackData = await import(`../public/backend/tracks/${config.track.number}.json`);

    // Load recordings dynamically like tracks
    const configWithRecordings = {
      ...config,
      players: await Promise.all(
        config.players.map(async (player: any) => {
          if (typeof player.recording === 'number') {
            const recordingData = await import(
              `../public/backend/recordings/${config.track.number}/${player.recording}.json`
            );
            return { ...player, recording: recordingData };
          }
          return player;
        })
      ),
    };

    conn.send(
      JSON.stringify({
        type: 'init',
        config: configWithRecordings,
        trackData: trackData,
      })
    );
  }

  onMessage(message: string, sender: Party.Connection) {}
}

JRacerServer satisfies Party.Worker;
