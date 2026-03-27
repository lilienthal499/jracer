import type * as Party from "partykit/server";
// @ts-ignore - JSON imports work in PartyKit
import config from "../public/backend/config.json";
// @ts-ignore
import track1 from "../public/backend/tracks/1.json";
// @ts-ignore
import track2 from "../public/backend/tracks/2.json";
// @ts-ignore
import track3 from "../public/backend/tracks/3.json";
// @ts-ignore
import track4 from "../public/backend/tracks/4.json";

interface GameConfig {
  track: {
    number: number;
    showGrid: boolean;
  };
  players: Array<{
    name: string;
    controls?: any;
    view: any;
    maxSteeringAngle: number;
    record?: boolean;
    recording?: any;
  }>;
}

interface TrackData {
  name: string;
  description: string;
  sections: string[];
  gridSize: number;
  trackWidth: number;
}

const tracks: Record<number, TrackData> = {
  1: track1,
  2: track2,
  3: track3,
  4: track4,
};

export default class JRacerServer implements Party.Server {
  constructor(readonly room: Party.Room) {
    console.log(`[JRacer] Server initialized for room: ${room.id}`);
  }

  onConnect(conn: Party.Connection) {
    const gameConfig = config as GameConfig;
    const trackData = tracks[gameConfig.track.number];

    if (!trackData) {
      console.error(`[JRacer] Track ${gameConfig.track.number} not found`);
      return;
    }

    console.log(`[JRacer] Client connected`);
    console.log(`[JRacer] Sending track: ${trackData.name} (${trackData.sections.length} sections)`);

    // Send config and track data to new client
    conn.send(
      JSON.stringify({
        type: "init",
        config: gameConfig,
        trackData: trackData,
      })
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    // Future: Handle multiplayer game messages (key events, etc.)
  }
}

JRacerServer satisfies Party.Worker;
