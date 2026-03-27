import type * as Party from 'partykit/server';
// @ts-ignore
import config from '../public/backend/config-with-recordings.json';

export default class JRacerServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection) {
    const trackData = await import(`../public/backend/tracks/${config.track.number}.json`);

    conn.send(
      JSON.stringify({
        type: 'init',
        config: config,
        trackData: trackData
      })
    );
  }

  onMessage(message: string, sender: Party.Connection) {}
}

JRacerServer satisfies Party.Worker;
