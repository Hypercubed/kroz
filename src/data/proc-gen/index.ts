// 'Testing Procgen Maps'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Rogue } from 'procedural-layouts';
import { RNG } from 'rot-js';
import { clamp } from 'rot-js/lib/util';
import dedent from 'ts-dedent';

import * as tiles from '../../modules/tiles';

import { XMax, YMax } from '../../constants/constants';
import { clampLinear, type LinearParams } from '../../utils/math';
import { Matrix } from '../../classes/map';
import type { Level } from '../../modules/levels';
import type { Entity } from '../../classes/entity';
import { Type } from '../../constants/types';

export const title = 'Testing Procgen Maps';

export function readLevel(i: number): Level {
  return {
    id: '' + i,
    data: randomMap(i).toArray(),
    startTrigger: startTrigger(i),
    properties: {}
  };
}

export function findNextLevel(i: number) {
  return ++i;
}

export function findPrevLevel(i: number) {
  return Math.max(--i, 0);
}

const CHANCE_TO_ADD_KEY = 0.3; // At 1 this is 100% chance to add a key in the next room
const CHANCE_TO_ADD_LOCK = 0.3;

const KeyDoorPairs = [
  [Type.Key, Type.Door],
  [Type.OSpell1, Type.OWall1],
  [Type.OSpell2, Type.OWall2],
  [Type.OSpell3, Type.OWall3]
];

const KeyDoorWeights = {
  0: 6, // [Type.Key, Type.Door]
  1: 2, // [Type.OSpell1, Type.OWall1]
  2: 1, // [Type.OSpell2, Type.OWall2]
  3: 1 // [Type.OSpell3, Type.OWall3]
};

function addKeys(
  mapData: Matrix<Entity>,
  _depth: number,
  btl: RogueMap,
  maxKeys: number
) {
  const roomPool = [btl.enter.room_id];

  queueRooms(btl.enter.room_id);

  const lockDoors: number[] = [];
  const keyRooms: number[] = [];

  while (lockDoors.length < maxKeys && roomPool.length > 0) {
    const roomId = roomPool.pop();
    if (!roomId) break;

    if (Math.random() < CHANCE_TO_ADD_LOCK) {
      const room = btl.rooms[roomId];

      const door = RNG.getItem(room.doors);
      if (!door) continue;
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

  for (let i = 0; i < keyRooms.length; i++) {
    const doorId = lockDoors[i];
    const door = btl.doors[doorId];

    const roomId = keyRooms[i];
    const room = btl.rooms[roomId];
    while (true) {
      const x = room.left + RNG.getUniformInt(0, room.width - 1);
      const y = room.top + RNG.getUniformInt(0, room.height - 1);
      if (mapData.get(x, y)!.type === Type.Floor) {
        setDoorKey(x, y, door.x, door.y);
        break;
      }
    }
  }

  return;

  function setDoorKey(kx: number, ky: number, dx: number, dy: number) {
    const i = +RNG.getWeightedValue(KeyDoorWeights)!;
    const [keyType, doorType] = KeyDoorPairs[i];
    mapData.set(kx, ky, tiles.createEntityOfType(keyType));
    mapData.set(dx, dy, tiles.createEntityOfType(doorType));
  }

  function queueRooms(roomId: number) {
    const room = btl.rooms[roomId];
    room.neighbors.forEach((n) => {
      if (roomPool.includes(n)) return;
      roomPool.push(n);
      queueRooms(n);
    });
  }
}

function addFeatures(mapData: Matrix<Entity>, depth: number) {
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
      if (mapData.get(x, y)!.type === Type.Floor) {
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

  const mapData = Matrix.fromArrays(btl.world).map<Entity>((s, x, y) =>
    tiles.createEntityOfType(rogueMapTypeToType(s), x, y)
  );

  addKeys(
    mapData,
    depth,
    btl,
    ~~clampLinear({ b0: 1, m: 1, min: 0, max: btl.room_count }, depth)
  );
  addFeatures(mapData, depth);
  return mapData;

  function rogueMapTypeToType(c: number | null): Type {
    switch (c) {
      case 0: // Void
        return Type.River;
      case 1:
        return Type.Floor;
      case 2: // Wall
        return Type.Wall;
      case 3: // Door
        return Type.Stop;
      case 4: // SPECIAL DOOR
        return Type.Door;
      case 5: // Enter
        return Type.Player;
      case 6: // Exit
        return Type.Stairs;
      case 7: // Key
        return Type.Key;
      default:
        return Type.Floor;
    }
  }
}

function startTrigger(depth: number) {
  const level = levels[depth % levels.length];
  const levelGens = level.startTrigger || [];

  const st = levelGens.join('\n');
  return dedent`
    ${st}
    ##CHANGE Stop Floor
    Press any key to begin this level.
  `;
}

interface Generator {
  gen: (map: Matrix<Entity>, x: number, y: number, depth: number) => void;
  n: (depth: number) => number;
}

function createGenerator(type: Type, p: Partial<LinearParams>): Generator {
  const linOpts: LinearParams = { b0: 1, m: 1, max: 100, min: 0, ...p };
  return {
    gen: (map, x, y) => map.set(x, y, tiles.createEntityOfType(type, x, y)),
    n(depth: number) {
      // TODO: Difficulty scale?
      // Randomness?
      const x = depth / levels.length;
      return clampLinear(linOpts, x < 1 ? 0 : x);
    }
  } satisfies Generator;
}

/**
 * Genreates a horde of mobs
 *
 *
 */
function hordeGenerator(type: Type, p: Partial<LinearParams> = {}): Generator {
  const linOpts = { b0: 10, m: 1, max: 100, min: 0, ...p };

  return {
    gen: (map, x, y) => {
      map.set(x, y, tiles.createEntityOfType(type, x, y));

      let n = RNG.getUniformInt(1, 8);
      genAt(x, y);

      function genAt(x: number, y: number) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (
              map.get(x + dx, y + dy)!.type === Type.Floor &&
              Math.random() < 0.5
            ) {
              map.set(x + dx, y + dy, tiles.createEntityOfType(type, x, y));
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
  } satisfies Generator;
}

/**
 * Grows a feature
 */
function growthGenerator(type: Type, p: Partial<LinearParams> = {}): Generator {
  const linOpts = { b0: 10, m: 1, max: 900, min: 0, ...p };
  return {
    gen: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (
              map.get(x + dx, y + dy)!.type === Type.Floor &&
              Math.random() < 0.5
            ) {
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
  } satisfies Generator;
}

/**
 * Places a vane of collectibles
 */
function collectibleGenerator(
  type: Type,
  p: Partial<LinearParams> = {}
): Generator {
  const linOpts = { b0: 1, m: 1, max: 100, min: 1, ...p };
  return {
    gen: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (
              map.get(x + dx, y + dy)!.type === Type.Floor &&
              Math.random() < 0.3
            ) {
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
  } satisfies Generator;
}

/**
 * Places a small cluster of features
 */
function clusterGenerator(
  type: Type,
  p: Partial<LinearParams> = {}
): Generator {
  const linOpts = { b0: 1, m: 1, max: 5, min: 0, ...p };
  return {
    gen: (map, x, y) => {
      map.set(x, y, tiles.createEntityOfType(type, x, y));

      let n = RNG.getUniformInt(0, 3);
      genAt(x, y);

      function genAt(x: number, y: number) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            if (
              map.get(x + dx, y + dy)!.type === Type.Floor &&
              Math.random() < 0.3
            ) {
              map.set(x + dx, y + dy, tiles.createEntityOfType(type, x, y));
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
  } satisfies Generator;
}

const spellGenerator = (type: Type, p: Partial<LinearParams> = {}) =>
  createGenerator(type, { b0: 1, m: 1, max: 20, ...p });

const baseHordeGenerators = [
  hordeGenerator(Type.Slow, { b0: -1 }),
  hordeGenerator(Type.Medium, { b0: -2 }),
  hordeGenerator(Type.Fast, { b0: -3 })
];

const teleportGenerator = clusterGenerator(Type.Teleport, {
  b0: 5,
  m: -1,
  min: 1
});
const whipGenerator = collectibleGenerator(Type.Whip, { b0: 5, m: -1, min: 1 });
const nuggetGenerator = collectibleGenerator(Type.Nugget);
const gemGenerator = collectibleGenerator(Type.Gem, { b0: 5, m: -1, min: 1 });
const showGemsGenerator = createGenerator(Type.ShowGems, {
  b0: 10,
  m: -1,
  min: 5
});
const trapGenerator = growthGenerator(Type.Trap, { b0: 10, m: 0.1, max: 20 });
const chestGenerator = clusterGenerator(Type.Chest, { b0: 5, m: -1, min: 1 });
const bombGenerator = createGenerator(Type.Bomb, { b0: 10, m: 0 });
const tunnelGenerator = createGenerator(Type.Tunnel, { b0: 10, m: -1, min: 2 });

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
      whipGenerator,
      nuggetGenerator,
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
      growthGenerator(Type.Block, { b0: 2 }),
      gemGenerator,
      showGemsGenerator,
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
      hordeGenerator(Type.Slow),
      growthGenerator(Type.Block, { b0: 2 }),
      teleportGenerator,
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
      trapGenerator,
      hordeGenerator(Type.Slow),
      whipGenerator,
      gemGenerator,
      showGemsGenerator,
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
      growthGenerator(Type.GBlock, { b0: 2 }),
      hordeGenerator(Type.Slow),
      whipGenerator,
      gemGenerator,
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
      bombGenerator,
      growthGenerator(Type.Block, { b0: 4 }),
      whipGenerator,
      chestGenerator,
      gemGenerator,
      trapGenerator,
      nuggetGenerator,
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
      growthGenerator(Type.Forest, { b0: 2 }),
      growthGenerator(Type.Tree, { b0: 2 }),
      hordeGenerator(Type.Slow),
      collectibleGenerator(Type.Whip, { b0: 2 }),
      nuggetGenerator,
      chestGenerator,
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
      tunnelGenerator,
      hordeGenerator(Type.Medium, { b0: 2 }),
      hordeGenerator(Type.Fast, { b0: 2 }),
      chestGenerator,
      whipGenerator,
      bombGenerator,
      teleportGenerator,
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
      spellGenerator(Type.Generator, { b0: 2 }),
      hordeGenerator(Type.Slow),
      gemGenerator,
      nuggetGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime),
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
      growthGenerator(Type.Trap, { b0: 2 }),
      collectibleGenerator(Type.Invisible, { b0: 2 }),
      teleportGenerator,
      gemGenerator,
      nuggetGenerator,
      spellGenerator(Type.Generator),
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
      hordeGenerator(Type.Medium),
      chestGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime, { b0: 2 }),
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
      growthGenerator(Type.Block),
      spellGenerator(Type.SpeedTime, { b0: 2 }),
      spellGenerator(Type.SlowTime, { b0: 2 }),
      hordeGenerator(Type.Slow),
      gemGenerator,
      whipGenerator,
      nuggetGenerator,
      teleportGenerator,
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
      growthGenerator(Type.MBlock, { b0: 5 }),
      hordeGenerator(Type.Slow),
      teleportGenerator,
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
      growthGenerator(Type.TBlock),
      hordeGenerator(Type.Slow),
      spellGenerator(Type.Generator),
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
      growthGenerator(Type.Trap, { b0: 2 }),
      growthGenerator(Type.Invisible),
      growthGenerator(Type.Block),
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
      growthGenerator(Type.Trap, { b0: 2 }),
      collectibleGenerator(Type.Invisible, { b0: 30 }),
      collectibleGenerator(Type.Stairs, { b0: 20 }),
      nuggetGenerator,
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
      growthGenerator(Type.GBlock, { b0: 2 }),
      gemGenerator,
      whipGenerator,
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
