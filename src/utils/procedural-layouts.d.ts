interface RogueRoom {
  id: number;
  doors: number[];
  neighbors: number[];
  left: number;
  top: number;
  width: number;
  height: number;
  enter?: boolean;
  exit?: boolean;
  special?: boolean;
  deadend?: boolean;
}

interface RogueDoor {
  id: number;
  x: number;
  y: number;
}

interface RogueMap {
  world: number[][];
  room_count: number;
  exit: { room_id: number; x: number; y: number };
  enter: { room_id: number; x: number; y: number };
  special: { room_id: number };
  rooms: Record<number, RogueRoom>;
  doors: Record<number, RogueDoor>;
}

interface RogueOptions {
  width: number;
  height: number;
  retry: number;
  special: boolean;
  room: {
    ideal: number;
    min_width: number;
    max_width: number;
    min_height: number;
    max_height: number;
  };
}

declare module 'procedural-layouts' {
  class Rogue {
    constructor(options: RogueOptions);
    build(): RogueMap;
  }
}
