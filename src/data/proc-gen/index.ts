// 'Testing Procgen Maps'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Rogue } from 'procedural-layouts';

import dedent from 'ts-dedent';

import { readKrozLevel } from '../../utils/kroz';
import { XMax, YMax } from '../../constants/constants';
import { RNG } from 'rot-js';
import { clamp } from 'rot-js/lib/util';
import { clampLinear, LinearParams } from '../../utils/math';

export const title = 'Testing Procgen Maps';

export async function readLevel(i: number) {
  return readKrozLevel(
    dedent`
    [PF]
    ${randomMap(i)}
    [ST]
    ${startTrigger(i)}
    `
  );
}

export function findNextLevel(i: number) {
  return ++i;
}

export function findPrevLevel(i: number) {
  return Math.max(--i, 0);
}

const CHANCE_TO_ADD_KEY = 0.3; // At 1 this is 100% chance to add a key in the next room
const CHANCE_TO_ADD_LOCK = 0.3;

function addKeys(_depth: number, map: RogueMap, maxKeys: number) {
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

  // TODO: Replace some key/door pairs with OSpell/OWall pairs

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
  const level = levels[depth % levels.length];
  const levelGens = level.generators;

  for (let i = 0; i < levelGens.length; i++) {
    const generator = levelGens[i];
    let n = Math.floor(generator.n(depth));

    if (n < 1) continue;
    while (n--) {
      const p = getRandPosition();
      if (!p) break;
      generator.gen(mapData, p[0], p[1], depth);
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

function randomMap(depth: number) {
  let btl: RogueMap | null = null;

  let ideal = clamp(depth * 5, 10, XMax / 3);
  let max_width = XMax / 2;
  let max_height = YMax / 2;

  while (!btl) {
    try {
      const level = new Rogue({
        width: XMax + 1,
        height: YMax + 1,
        retry: 100,
        special: depth > 5,
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

  const maxKeys = Math.floor(
    clampLinear({ b0: 1, m: 1, min: 0, max: btl.room_count }, depth)
  );
  addKeys(depth, btl, maxKeys);

  const { world } = btl;

  const mapData: string[][] = [];
  for (let y = 0; y < world.length; y++) {
    mapData.push([]);
    for (let x = 0; x < world[y].length; x++) {
      mapData[y].push(rogueMapTypeToTile(world[y][x]));
    }
  }

  addFeatures(mapData, depth);

  let map = ``;
  for (let y = 0; y < world.length; y++) {
    for (let x = 0; x < world[y].length; x++) {
      map += mapData[y][x];
    }
    map += '\n';
  }

  return map;
}

function startTrigger(depth: number) {
  const level = levels[depth % levels.length];
  const levelGens = level.startTrigger || [];

  const st = levelGens.join('\n');
  return dedent`
    ${st}
    ##setBorder # 0 0
    Press any key to begin this level.
  `;
}

interface Generator {
  gen: (map: string[][], x: number, y: number, depth: number) => void;
  n: (depth: number) => number;
}

function createGenerator(char: string, p: Partial<LinearParams>): Generator {
  const linOpts = { b0: 1, m: 1, max: 100, min: 0, ...p };
  return {
    gen: (map: string[][], x: number, y: number) => (map[y][x] = char),
    n(depth: number) {
      // TODO: Difficulty scale
      const x = depth / levels.length;
      return clampLinear(linOpts, x < 1 ? 0 : x);
    }
  };
}

function hordeGenerator(
  char: string,
  p: Partial<LinearParams> = {}
): Generator {
  const linOpts = { b0: 10, m: 1, max: 100, min: 0, ...p };

  return {
    gen: (map: string[][], x: number, y: number) => {
      map[y][x] = char;

      let n = RNG.getUniformInt(1, 8);
      genAt(x, y);

      function genAt(x: number, y: number) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (map[y + dy][x + dx] === ' ' && Math.random() < 0.5) {
              map[y + dy][x + dx] = char;
              if (n-- < 1) return;
            }
          }
        }
      }
    },
    n(depth: number) {
      const x = depth / levels.length;
      return clampLinear(linOpts, x < 1 ? 0 : x);
    }
  };
}

function growthGenerator(
  char: string,
  p: Partial<LinearParams> = {}
): Generator {
  const linOpts = { b0: 10, m: 1, max: 900, min: 0, ...p };
  return {
    gen: (map: string[][], x: number, y: number) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map[y][x] = char;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (map[y + dy][x + dx] === ' ' && Math.random() < 0.5) {
              genAt(x + dx, y + dy);
              if (n-- < 1) return;
            }
          }
        }
      }
    },
    n(depth: number) {
      const x = depth / levels.length;
      return clampLinear(linOpts, x < 1 ? 0 : x);
    }
  };
}

function collectibleGenerator(
  char: string,
  p: Partial<LinearParams> = {}
): Generator {
  const linOpts = { b0: 1, m: 1, max: 100, min: 1, ...p };
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    gen: (map: string[][], x: number, y: number, _depth: number) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map[y][x] = char;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (map[y + dy][x + dx] === ' ' && Math.random() < 0.3) {
              genAt(x + dx, y + dy);
              if (n-- < 1) return;
            }
          }
        }
      }
    },
    n(depth: number) {
      const x = depth / levels.length;
      return clampLinear(linOpts, x < 1 ? 0 : x);
    }
  };
}

function chestGenerator(
  char: string,
  p: Partial<LinearParams> = {}
): Generator {
  const linOpts = { b0: 1, m: 1, max: 5, min: 0, ...p };
  return {
    gen: (map: string[][], x: number, y: number) => {
      map[y][x] = char;

      let n = RNG.getUniformInt(0, 3);
      genAt(x, y);

      function genAt(x: number, y: number) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (map[y + dy][x + dx] === ' ' && Math.random() < 0.3) {
              map[y + dy][x + dx] = char;
              // genAt(x + dx, y + dy);
              if (n-- < 1) return;
            }
          }
        }
      }
    },
    n(depth: number) {
      const x = depth / levels.length;
      return clampLinear(linOpts, x < 1 ? 0 : x);
    }
  };
}

const showGemsGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 1, m: 1, max: 20, ...p });
const bombGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 1, m: 1, max: 20, ...p });
const spellGenerator = (char: string, p: Partial<LinearParams> = {}) =>
  createGenerator(char, { b0: 1, m: 1, max: 20, ...p });

const baseHordeGenerators = [
  hordeGenerator('1', { b0: -1 }),
  hordeGenerator('2', { b0: -2 }),
  hordeGenerator('3', { b0: -3 })
];

interface LevelDef {
  generators: Generator[];
  startTrigger?: string[];
}

const levels = [
  {
    /**
     * Level 1
     *
     * Whips and nuggets
     * Introduces the player to whips and nuggets
     *
     */
    generators: [
      // Whips and nuggets
      collectibleGenerator('W', { b0: 2, m: -1 }),
      collectibleGenerator('*'),
      ...baseHordeGenerators
    ],
    startTrigger: []
  },
  {
    /**
     * Level 2
     *
     * Blocks and gems
     * Introduces the player to blocks, gems and show gem triggers
     */
    generators: [
      // Blocks and gems
      growthGenerator('X', { b0: 2 }),
      collectibleGenerator('+', { b0: 2 }),
      showGemsGenerator('&', { b0: 10 }),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 3
     *
     * Breakable walls, mobs and teleport spells
     * Introduces the player to breakable walls, slow mobs and teleport spells
     */
    generators: [
      // Breakable walls, mobs, and teleport spells
      hordeGenerator('1'),
      growthGenerator('X', { b0: 2 }),
      collectibleGenerator('T'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 4
     *
     * Traps
     *
     * Introduces the player to traps
     */
    generators: [
      growthGenerator('.', { b0: 2 }),
      hordeGenerator('1'),
      collectibleGenerator('W'),
      collectibleGenerator('+'),
      showGemsGenerator('&'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 5
     *
     * GBlocks
     *
     * Introduces the player to GBlocks
     */
    generators: [
      // GBlocks, mobs, whips and gems
      growthGenerator('Y', { b0: 2 }),
      hordeGenerator('1'),
      collectibleGenerator('W'),
      collectibleGenerator('+'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 6
     *
     * Bombs
     * Introduces the player to bombs
     */
    generators: [
      // Bombs and gems, chests
      bombGenerator('B', { b0: 10 }),
      growthGenerator('X', { b0: 4 }),
      collectibleGenerator('W'),
      chestGenerator('C'),
      collectibleGenerator('+'),
      showGemsGenerator('.'),
      collectibleGenerator('*'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 7
     *
     * Forest
     * Introduces the player to forest and trees
     */
    generators: [
      // Forest trees, mobs, and whips
      growthGenerator('/', { b0: 2 }),
      growthGenerator('\\', { b0: 2 }),
      hordeGenerator('1'),
      collectibleGenerator('W', { b0: 2 }),
      collectibleGenerator('*'),
      chestGenerator('C'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 8
     *
     * Tunnels
     * Introduces the player to tunnels
     */
    generators: [
      // Tunnels
      bombGenerator('U', { b0: 5 }),
      hordeGenerator('2', { b0: 2 }),
      hordeGenerator('3', { b0: 2 }),
      chestGenerator('C'),
      collectibleGenerator('W'),
      bombGenerator('B'),
      collectibleGenerator('T'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 9
     *
     * Generators and spells
     * Introduces the player to generators and SlowTime spells
     */
    generators: [
      // Generators and spells
      spellGenerator('G', { b0: 2 }),
      hordeGenerator('1'),
      collectibleGenerator('+'),
      collectibleGenerator('*'),
      collectibleGenerator('W'),
      spellGenerator('S'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 10
     *
     * Traps
     * Introduces the player to Invisible traps
     */
    generators: [
      // Traps
      growthGenerator('.', { b0: 2 }),
      collectibleGenerator('I', { b0: 2 }),
      collectibleGenerator('T'),
      collectibleGenerator('+'),
      collectibleGenerator('*'),
      spellGenerator('G'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 11
     *
     * Mobs
     * Introduces the player to more medium mobs
     */
    generators: [
      // Mobs, Whips and Spells
      hordeGenerator('2'),
      chestGenerator('C', { b0: 2 }),
      collectibleGenerator('W'),
      spellGenerator('S', { b0: 2 }),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 12
     *
     * Gems and spells
     * Introduces the player to gems and SpeedTime spells
     */
    generators: [
      // Blocks and spells
      growthGenerator('X'),
      spellGenerator('F', { b0: 2 }),
      spellGenerator('S', { b0: 2 }),
      hordeGenerator('1'),
      collectibleGenerator('+'),
      collectibleGenerator('W'),
      collectibleGenerator('*'),
      collectibleGenerator('T'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 13
     *
     * MBlocks
     * Introduces the player to MBlocks
     */
    generators: [
      // MBlocks
      growthGenerator('M', { b0: 5 }),
      hordeGenerator('1'),
      collectibleGenerator('T'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 14
     *
     * Traps
     * Introduces the player to TBlocks
     */
    generators: [
      // TBlocks
      growthGenerator('‘'),
      hordeGenerator('1'),
      spellGenerator('G'),
      ...baseHordeGenerators
    ]
  },
  {
    /**
     * Level 15
     *
     * Traps
     */
    generators: [
      // Traps
      growthGenerator('.', { b0: 2 }),
      growthGenerator('I'),
      growthGenerator('X'),
      ...baseHordeGenerators
    ]
  },
  // TODO: Intro CWalls
  {
    /**
     * Level 16
     *
     * Doors
     */
    generators: [
      // Gems and stairs and traps
      growthGenerator('L', { b0: 2 }),
      collectibleGenerator('*'),
      growthGenerator('.', { b0: 2 }),
      collectibleGenerator('I', { b0: 3 }),
      ...baseHordeGenerators
    ]
  },
  // TODO: Forest and growth
  // TODO: Lava and Flow
  // TODO: Mobs, Ewalls and IWalls
  // TODO: Gblocks, whips and gems
  {
    /**
     * Level 17
     *
     * Gblocks, whips and gems
     */
    generators: [
      // Gblocks, whips and gems
      growthGenerator('Y', { b0: 2 }),
      collectibleGenerator('+'),
      collectibleGenerator('W'),
      ...baseHordeGenerators
    ]
  }
  // TODO: Doors and Tunnels, mobs and nuggets, statues
  // TODO: Gems and Mobs
  // TODO: Lava, nuggets and Flow
  // TODO: Invisible crushable walls
  // TODO: Creature creater traps
  // TODO: Creature creater traps + Walls
  // TODO: Blocks and GBlocks
  // TODO: Invisible MBlocks
  // TODO: Blocks and bombs
] satisfies LevelDef[];

function rogueMapTypeToTile(c: number) {
  switch (c) {
    case 0: // Void
      return '-'; // Stop
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
