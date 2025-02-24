// 'Testing Procgen Maps'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Rogue } from 'procedural-layouts';

import dedent from 'ts-dedent';

import { readKrozLevel } from '../../utils/kroz';
import { XMax, YMax } from '../../constants/constants';
import { RNG } from 'rot-js';
import { clamp } from 'rot-js/lib/util';

function linearFn(b0: number, x: number, m: number, max: number) {
  return Math.min(b0 + x * m, max);
}

export const title = 'Testing Procgen Maps';

export async function readLevel(i: number) {
  return readKrozLevel(
    dedent`
    ${randomMap(i)}
    `
  );
  // ${startTrigger(i)}
}

export function findNextLevel(i: number) {
  return ++i;
}

export function findPrevLevel(i: number) {
  return --i;
}

const CHANCE_TO_ADD_KEY = 0.3; // At 1 this is 100% chance to add a key in the next room
const CHANCE_TO_ADD_LOCK = 0.3;

function addKeys(map: RogueMap, maxKeys: number) {
  const roomPool = [map.enter.room_id];

  queueRooms(map.enter.room_id);

  const lockDoors: number[] = [];
  const keyRooms: number[] = [];

  while (lockDoors.length < maxKeys && roomPool.length > 0) {
    const roomId = roomPool.pop();
    if (!roomId) break;

    if (Math.random() < CHANCE_TO_ADD_LOCK) {
      const room = map.rooms[roomId];

      const door = RNG.getItem(room.doors);
      if (!door) continue;
      // console.log(door, lockDoors);
      if (lockDoors.includes(door)) continue;

      let i = roomPool.length;
      while (i--) {
        const keyRoom = roomPool[i];
        if (!keyRoom) break;

        if (Math.random() < CHANCE_TO_ADD_KEY) {
          lockDoors.push(door);
          keyRooms.push(keyRoom);
          break;
        }
      }
    }
  }

  if (lockDoors.length !== keyRooms.length) {
    console.error('Mismatched keys and locks');
    return;
  }

  keyRooms.forEach((i) => {
    const room = map.rooms[i];
    while (true) {
      const x = room.left + RNG.getUniformInt(0, room.width - 1);
      const y = room.top + RNG.getUniformInt(0, room.height - 1);
      if (map.world[y][x] === 1) {
        map.world[y][x] = 7;
        break;
      }
    }
  });

  lockDoors.forEach((i) => {
    const door = map.doors[i];
    map.world[door.y][door.x] = 4;
  });

  return;

  function queueRooms(roomId: number) {
    const room = map.rooms[roomId];
    room.neighbors.forEach((n) => {
      if (roomPool.includes(n)) return;
      roomPool.push(n);
      queueRooms(n);
    });
  }
}

function addFeatures(mapData: string[][], depth: number) {
  const levelGens = levelGeneraters[depth % levelGeneraters.length];

  for (let i = 0; i < levelGens.length; i++) {
    const generator = levelGens[i];
    let n = generator.n(depth);
    console.log('Adding features to map', depth, generator.char, n);
    if (n < 1) continue;
    while (n--) {
      const p = getRandPosition();
      if (!p) break;
      mapData[p[1]][p[0]] = generator.char;
    }
  }

  function getRandPosition(): [number, number] | null {
    let m = 1000;
    while (m--) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      if (mapData[y][x] === ' ') {
        return [x, y];
      }
    }
    return null;
  }
}

function randomMap(i: number) {
  let btl: RogueMap | null = null;

  let ideal = clamp(i * 5, 10, XMax / 3);
  let max_width = XMax / 2;
  let max_height = YMax / 2;

  while (!btl) {
    try {
      const level = new Rogue({
        width: XMax + 4,
        height: YMax + 3,
        retry: 100,
        special: false,
        room: {
          ideal,
          min_width: 2,
          max_width,
          min_height: 2,
          max_height
        }
      });
      btl = level.build();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      ideal = 35;
      max_width = 7;
      max_height = 7;
    }
  }

  const maxKeys = Math.floor(linearFn(1, i, 1, btl.room_count));
  addKeys(btl, maxKeys);

  const { world } = btl;

  const mapData: string[][] = [];
  for (let y = 0; y < world.length; y++) {
    mapData.push([]);
    for (let x = 0; x < world[y].length; x++) {
      mapData[y].push(rogueMapTypeToTile(world[y][x]));
    }
  }

  addFeatures(mapData, i);

  let map = ``;
  for (let y = 1; y < world.length - 1; y++) {
    for (let x = 1; x < world[y].length - 1; x++) {
      map += mapData[y][x];
    }
    map += '\n';
  }

  return dedent`
    [PF]
    ${map}
  `;
}

interface LinearParams {
  b0: number;
  m: number;
  max: number;
}

function createGenerator(char: string, { b0, m, max }: Partial<LinearParams>) {
  return {
    char,
    n(i: number) {
      let sdepth = Math.floor(i / levelGeneraters.length);
      sdepth = sdepth < 1 ? 0 : sdepth;
      return linearFn(b0 ?? 1, sdepth, m ?? 1, max ?? 100);
    }
  };
}

const creatureGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 10, m: 1, max: 100, ...p });
const collectibleGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 10, m: 1, max: 100, ...p });
const chestGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 1, m: 1, max: 5, ...p });
const showGemsGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 1, m: 1, max: 20, ...p });
const wallGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 100, m: 100, max: 900, ...p });

const levelGeneraters = [
  [collectibleGenerator('W'), collectibleGenerator('*')],
  [collectibleGenerator('+'), showGemsGenerator('&'), wallGenerator('X')],
  [creatureGenerator('1'), collectibleGenerator('T'), wallGenerator('X')],
  [
    creatureGenerator('1'),
    collectibleGenerator('W'),
    collectibleGenerator('+'),
    showGemsGenerator('&'),
    showGemsGenerator('.')
  ],
  [
    creatureGenerator('1'),
    collectibleGenerator('W'),
    collectibleGenerator('+'),
    wallGenerator('Y')
  ],

  [
    collectibleGenerator('W'),
    chestGenerator('C'),
    collectibleGenerator('+'),
    collectibleGenerator('B'),
    showGemsGenerator('.'),
    collectibleGenerator('*')
  ],
  [
    creatureGenerator('1'),
    wallGenerator('/'),
    wallGenerator('\\'),
    collectibleGenerator('W'),
    collectibleGenerator('*'),
    chestGenerator('C')
  ],
  [
    creatureGenerator('2'),
    creatureGenerator('3'),
    chestGenerator('C'),
    collectibleGenerator('W'),
    collectibleGenerator('B'),
    collectibleGenerator('T')
  ],
  [
    creatureGenerator('1'),
    collectibleGenerator('+'),
    collectibleGenerator('*'),
    collectibleGenerator('W'),
    collectibleGenerator('S'),
    chestGenerator('G')
  ],
  [
    collectibleGenerator('T'),
    collectibleGenerator('+'),
    collectibleGenerator('*'),
    collectibleGenerator('I'),
    chestGenerator('G'),
    wallGenerator('.')
  ],

  [
    creatureGenerator('3'),
    chestGenerator('C'),
    collectibleGenerator('W'),
    collectibleGenerator('S')
  ],
  [
    wallGenerator('X'),
    creatureGenerator('1'),
    collectibleGenerator('+'),
    collectibleGenerator('W'),
    collectibleGenerator('*'),
    collectibleGenerator('T')
  ],
  [creatureGenerator('1'), wallGenerator('‘'), chestGenerator('G')],
  [wallGenerator('.'), wallGenerator('I'), wallGenerator('X')]
];

function rogueMapTypeToTile(c: number) {
  switch (c) {
    case 0: // Void
      return 'V'; // Stop
    case 4: // SPECIAL DOOR
      return 'D';
    case 2: // Wall
      return '#';
    case 5: // Enter
      return 'P';
    case 6: // Exit
      return 'L';
    case 7: // Key
      return 'K';
    default:
      return ' ';
  }
}
