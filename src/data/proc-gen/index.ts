// 'Testing Procgen Maps'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Rogue } from 'procedural-layouts';
import { RNG, Path, Noise, Color, Map } from 'rot-js';
// import { clamp } from 'rot-js/lib/util';
import dedent from 'ts-dedent';

import * as tiles from '../../modules/tiles';

import { XMax, YMax } from '../../constants/constants';
import { clampLinear, type LinearParams } from '../../utils/math';
import { Matrix } from '../../classes/map';
import type { Level } from '../../modules/levels';
import type { Entity } from '../../classes/entity';
import { Type } from '../../constants/types';
import { Renderable } from '../../classes/components';
import { ColorCodes } from '../../modules/colors';

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

const DIRS4 = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
  // [-1, -1],
  // [1, -1],
  // [-1, 1],
  // [1, 1]
];

const DIRS8 = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1]
];

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

function getLevelDef(depth: number): LevelDef {
  return { ...common, ...levels[depth % levels.length] };
}

function addKeys(mapData: Matrix<Entity>, depth: number, btl: RogueMap) {
  const maxKeys = ~~clampLinear(
    { b0: 1, m: 1, min: 0, max: btl.room_count },
    depth
  );
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
  const level = getLevelDef(depth);
  const levelGens = [...level.generators, ...common.generators];

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

function addLakes(mapData: Matrix<Entity>, depth: number, btl: RogueMap) {
  const level = getLevelDef(depth);

  const testMap = mapData.clone();

  const passableCallback = (x: number, y: number) => {
    const t = testMap.get(x, y)?.type || Type.Floor;
    return (
      t === Type.Floor ||
      t === Type.Door ||
      t === Type.Stop ||
      t === Type.Stairs ||
      t === Type.Player
    );
  };
  const astar = new Path.AStar(btl.exit.x, btl.exit.y, passableCallback);

  let M = 10; // Max tries
  while (M-- > 0) {
    if (tryLake()) {
      break;
    }
  }

  function tryLake() {
    const map = new Map.Cellular(XMax + 1, YMax + 1);

    let M = 10;
    while (M-- > 0) {
      map.randomize(0.5);
      mapData.forEach((x, y, e) => {
        if (e.type === level.lakeType) {
          map.set(x, y, 1);
        }
      });

      for (let i = 0; i < 4; i++) {
        map.create();
      }

      testMap.copyFrom(mapData);

      map.connect((x: number, y: number, contents: number) => {
        if (contents === 0) return;
        const e = tiles.createEntityOfType(level.lakeType);
        testMap.set(x, y, e);
      }, 0);

      if (checkPath()) {
        mapData.copyFrom(testMap);
        return true;
      }
    }
    return false;
  }

  function checkPath() {
    let pathExists = false;
    astar.compute(btl.enter.x, btl.enter.y, () => (pathExists = true));
    return pathExists;
  }
}

function randomMap(depth: number) {
  const level = { ...common, ...levels[depth % levels.length] };
  let btl: RogueMap | null = null;

  let ideal = 35;
  let max_width = XMax / 2;
  let max_height = YMax / 2;

  while (!btl) {
    try {
      const rogue = new Rogue({
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
      btl = rogue.build();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      ideal = 35;
      max_width--;
      max_height--;
    }
  }

  const mapData = Matrix.fromArrays(btl.world).map<Entity>((s, x, y) =>
    tiles.createEntityOfType(rogueMapTypeToType(s), x, y)
  );

  addKeys(mapData, depth, btl);
  addLakes(mapData, depth, btl);
  addFeatures(mapData, depth);

  const noise = new Noise.Simplex();
  const mixColor = Color.fromString(ColorCodes[0]);

  // Add some noise to the map
  mapData.forEach((x, y, e) => {
    if (e.type === level.lakeType) {
      const o = 0.1 * noise.get(x / 5, y / 5) + 0.2;
      const fg = Color.fromString(e.get(Renderable)!.fg || 'black');
      const bg = Color.fromString(e.get(Renderable)!.bg || 'white');
      e.get(Renderable)!.bg = Color.toRGB(Color.interpolate(bg, mixColor, o));
      e.get(Renderable)!.fg = Color.toRGB(Color.interpolate(fg, mixColor, o));
    }
  });

  return mapData;

  function rogueMapTypeToType(c: number | null): Type {
    switch (c) {
      case 0: // Void
        return level.voidType;
      case 1:
        return Type.Floor;
      case 2: // Wall
        return level.wallType;
      case 3: // Door
        return Type.Floor;
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
function hordeGenerator(
  type: Type,
  p: Partial<LinearParams> = {},
  { minDepth }: { minDepth: number }
): Generator {
  const linOpts = { b0: -40, m: 2, min: 10, max: 999, ...p };
  const μ = 5; // Mean (TBR)

  return {
    gen: (map, x, y) => {
      map.set(x, y, tiles.createEntityOfType(type, x, y));

      let n = RNG.getUniformInt(1, 8);
      genAt(x, y);

      function genAt(x: number, y: number) {
        const [dx, dy] = RNG.getItem(DIRS4)!;
        const [xx, yy] = [x + dx, y + dy];
        if (map.get(xx, yy)!.type === Type.Floor && Math.random() < 0.5) {
          map.set(xx, yy, tiles.createEntityOfType(type, xx, yy));
          if (n-- < 1) return;
        }
      }
    },
    n(depth: number) {
      if (depth < minDepth) return 0;
      return clampLinear(linOpts, depth) / μ;
    }
  } satisfies Generator;
}

/**
 * Grows a feature
 */
function growthGenerator(type: Type, p: Partial<LinearParams> = {}): Generator {
  const linOpts = { b0: 400, m: 1, max: 1200, min: 0, ...p };
  const μ = 4; // Mean (TBR)

  return {
    gen: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));
        const [dx, dy] = RNG.getItem(DIRS8)!;
        const [xx, yy] = [x + dx, y + dy];
        if (map.get(xx, yy)!.type === Type.Floor && Math.random() < 0.8) {
          genAt(xx, yy);
          if (n-- < 1) return;
        }
      }
    },
    n(depth: number) {
      return clampLinear(linOpts, depth) / μ;
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
  const linOpts = { b0: 12, m: 0.5, max: 500, min: 1, ...p };
  const μ = 4; // Mean (TBR)

  return {
    gen: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));
        const [dx, dy] = RNG.getItem(DIRS4)!;
        const [xx, yy] = [x + dx, y + dy];
        if (map.get(xx, yy)!.type === Type.Floor && Math.random() < 0.5) {
          genAt(xx, yy);
          if (n-- < 1) return;
        }
      }
    },
    n(depth: number) {
      return clampLinear(linOpts, depth) / μ;
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
  const μ = 2; // Mean (TBR)

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
              if (n-- < 1) return;
            }
          }
        }
      }
    },
    n(depth: number) {
      return clampLinear(linOpts, depth) / μ;
    }
  } satisfies Generator;
}

const spellGenerator = (type: Type, p: Partial<LinearParams> = {}) =>
  createGenerator(type, { b0: 1, m: 1, max: 20, ...p });

const teleportGenerator = clusterGenerator(Type.Teleport, {
  b0: 3.5,
  m: 0.025,
  min: 1,
  max: 10
});
const whipGenerator = collectibleGenerator(Type.Whip, {
  b0: 30,
  m: 0.056,
  min: 2,
  max: 200
});
const nuggetGenerator = collectibleGenerator(Type.Nugget, {
  b0: 6.3,
  m: 2.3,
  min: 1,
  max: 500
});
const gemGenerator = collectibleGenerator(Type.Gem, {
  b0: 20,
  m: 0.37,
  min: 1,
  max: 300
});
const chestGenerator = clusterGenerator(Type.Chest, {
  b0: 2,
  m: 0.0089,
  min: 1,
  max: 5
});

const showGemsGenerator = createGenerator(Type.ShowGems, {
  b0: 10,
  m: -1,
  min: 5
});
const trapGenerator = growthGenerator(Type.Trap, { b0: 10, m: 0.1, max: 20 });
const bombGenerator = createGenerator(Type.Bomb, { b0: 10, m: 0 });
const tunnelGenerator = createGenerator(Type.Tunnel, { b0: 10, m: -1, min: 2 });

interface LevelDef {
  generators: Generator[];
  startTrigger?: string[];
  lakeType: Type;
  voidType: Type;
  wallType: Type;
}

const common: LevelDef = {
  generators: [
    hordeGenerator(Type.Slow, { m: 0.8, b0: 150, min: 0 }, { minDepth: 2 }),
    hordeGenerator(Type.Medium, { m: 1.2, b0: 71, min: 0 }, { minDepth: 10 }),
    hordeGenerator(Type.Fast, { m: 3.2, b0: -40, min: 0 }, { minDepth: 10 })
  ],
  voidType: Type.Stop,
  lakeType: Type.Pit,
  wallType: Type.Wall,
  startTrigger: []
};

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
      nuggetGenerator
    ],
    startTrigger: [],
    voidType: Type.Wall
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
      growthGenerator(Type.Block),
      gemGenerator,
      showGemsGenerator
    ],
    startTrigger: [],
    voidType: Type.Block
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
      growthGenerator(Type.Block),
      teleportGenerator
    ],
    startTrigger: [],
    voidType: Type.Block
  },
  {
    /**
     * Level 4
     *
     * Traps
     *
     * Introduces the player to traps
     */
    generators: [trapGenerator, whipGenerator, gemGenerator, showGemsGenerator],
    startTrigger: [],
    voidType: Type.Wall
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
      growthGenerator(Type.GBlock),
      whipGenerator,
      gemGenerator
    ],
    startTrigger: [],
    voidType: Type.GBlock
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
      growthGenerator(Type.Block),
      bombGenerator,
      whipGenerator,
      chestGenerator,
      gemGenerator,
      trapGenerator,
      nuggetGenerator
    ],
    startTrigger: [],
    voidType: Type.Block
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
      growthGenerator(Type.Forest),
      growthGenerator(Type.Tree),
      whipGenerator,
      nuggetGenerator,
      chestGenerator
    ],
    startTrigger: [],
    voidType: Type.Forest
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
      chestGenerator,
      whipGenerator,
      bombGenerator,
      teleportGenerator
    ],
    startTrigger: [],
    voidType: Type.Wall
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
      spellGenerator(Type.Generator, { b0: 20 }),
      gemGenerator,
      nuggetGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime)
    ],
    startTrigger: [],
    voidType: Type.Wall
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
      growthGenerator(Type.Trap),
      collectibleGenerator(Type.Invisible, { b0: 20 }),
      teleportGenerator,
      gemGenerator,
      nuggetGenerator,
      spellGenerator(Type.Generator)
    ],
    startTrigger: [],
    voidType: Type.Trap
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
      chestGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime, { b0: 20 })
    ],
    startTrigger: [],
    voidType: Type.Wall
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
      gemGenerator,
      whipGenerator,
      nuggetGenerator,
      teleportGenerator
    ],
    startTrigger: [],
    voidType: Type.Block
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
      growthGenerator(Type.MBlock),
      teleportGenerator
    ],
    startTrigger: [],
    voidType: Type.MBlock
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
      spellGenerator(Type.Generator)
    ],
    startTrigger: [],
    voidType: Type.Block
  },
  {
    /**
     * Level 15
     *
     * Traps
     */
    generators: [
      // Traps
      growthGenerator(Type.Trap),
      growthGenerator(Type.Invisible),
      growthGenerator(Type.Block)
    ],
    startTrigger: [],
    voidType: Type.Trap
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
      growthGenerator(Type.Trap),
      collectibleGenerator(Type.Invisible, { b0: 30 }),
      collectibleGenerator(Type.Stairs, { b0: 20 }),
      nuggetGenerator
    ],
    startTrigger: [],
    voidType: Type.Trap
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
      growthGenerator(Type.GBlock),
      gemGenerator,
      whipGenerator
    ],
    startTrigger: [],
    voidType: Type.GBlock
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
] satisfies Partial<LevelDef>[];
