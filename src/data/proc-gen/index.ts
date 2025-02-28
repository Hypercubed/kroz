// 'Testing Procgen Maps'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Rogue } from 'procedural-layouts';
import { RNG } from 'rot-js';
import * as tiled from '@kayahr/tiled';
import Cellular from 'rot-js/lib/map/cellular';
import AStar from 'rot-js/lib/path/astar';

import * as tiles from '../../modules/tiles';

import { XMax, YMax } from '../../constants/constants';
import { clampLinear, type LinearParams } from '../../utils/math';
import { Matrix } from '../../classes/map';
import type { Level } from '../../modules/levels';
import type { Entity } from '../../classes/entity';
import { Type } from '../../constants/types';
import { PlayField } from '../../classes/play-field';
import { readTileMapLayers } from '../../utils/tiled';

// ********************

type Vec = [number, number];

enum LayerType {
  Fill,
  Prefab,
  CA,
  Generator,
  Brogue
}

type WeightedType = { [key in Type]?: number };

interface FillLayer {
  type: LayerType.Fill;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  tiles: Type | WeightedType;
}

interface PrefabLayer {
  type: LayerType.Prefab;
  readMap: () => Promise<tiled.Map> | tiled.Map;
}

interface CALayer {
  type: LayerType.CA;
  tileType: Type;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  interations?: number;
  randomize?: number;
  checkPath?: boolean;
  retry?: number;
}

interface GeneratorLayer {
  type: LayerType.Generator;
  gen: (map: Matrix<Entity>, x: number, y: number, depth: number) => void;
  n: (depth: number) => number;
}

interface BrogueLayer {
  type: LayerType.Brogue;
  maxKeys?: number;
  wallType?: Type | WeightedType;
  voidType?: Type | WeightedType;
  special?: boolean;
  width?: number;
  height?: number;
  max_width?: number;
  max_height?: number;
  min_width?: number;
  min_height?: number;
  ideal?: number;
  // TODO: Key/Door Pairs
  // Number of Keys
  // Rogue inputs
}

type Layer = FillLayer | PrefabLayer | CALayer | GeneratorLayer | BrogueLayer;

interface LevelDefinition {
  layers: Layer[];
  properties?: Record<string, unknown>;
}

// ********************

export const title = 'Testing Procgen Maps';

export async function readLevel(i: number): Promise<Level> {
  const level = Levels[i % Levels.length] as LevelDefinition;

  const mapData = new PlayField();
  mapData.fill(() => tiles.createEntityOfType(Type.Floor));

  for (const layer of level.layers) {
    switch (layer.type) {
      case LayerType.Fill:
        addFillLayer(layer, mapData);
        break;
      case LayerType.Prefab:
        await addPrefabLayer(layer, mapData);
        break;
      case LayerType.CA:
        addCALayer(layer, mapData);
        break;
      case LayerType.Generator:
        addGeneratorLayer(layer, mapData, i);
        break;
      case LayerType.Brogue:
        addBrogueLayer(layer, mapData);
        break;
    }
  }

  // mapData.set(0, 0, tiles.createEntityOfType(Type.Player, 0, 0));

  return {
    id: '' + i,
    data: mapData.toArray(), // randomMap(i).toArray(),
    startTrigger:
      (level.properties?.startTrigger as string) ||
      `Press any key to begin this level.`,
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

function createGenerator(type: Type, p: Partial<LinearParams>): GeneratorLayer {
  const linOpts: LinearParams = { b0: 1, m: 1, max: 100, min: 0, ...p };
  return {
    type: LayerType.Generator,
    gen: (map, x, y) => map.set(x, y, tiles.createEntityOfType(type, x, y)),
    n: (depth: number) => clampLinear(linOpts, depth)
  } satisfies GeneratorLayer;
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
): GeneratorLayer {
  const linOpts = { b0: -40, m: 2, min: 10, max: 999, ...p };
  const μ = 5; // Mean (TBR)

  return {
    type: LayerType.Generator,
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
  } satisfies GeneratorLayer;
}

/**
 * Grows a feature
 */
function growthGenerator(
  type: Type,
  p: Partial<LinearParams> = {}
): GeneratorLayer {
  const linOpts = { b0: 200, m: 1, max: 1200, min: 0, ...p };
  const μ = 8; // Mean (TBR)

  return {
    type: LayerType.Generator,
    gen: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));
        const [dx, dy] = RNG.getItem(DIRS8)!;
        const [xx, yy] = [x + dx, y + dy];
        if (map.get(xx, yy)?.type === Type.Floor && Math.random() < 0.8) {
          genAt(xx, yy);
          if (n-- < 1) return;
        }
      }
    },
    n(depth: number) {
      return clampLinear(linOpts, depth) / μ;
    }
  } satisfies GeneratorLayer;
}

/**
 * Places a vane of collectibles
 */
function collectibleGenerator(
  type: Type,
  p: Partial<LinearParams> = {}
): GeneratorLayer {
  const linOpts = { b0: 12, m: 0.5, max: 500, min: 1, ...p };
  const μ = 4; // Mean (TBR)

  return {
    type: LayerType.Generator,
    gen: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));
        const [dx, dy] = RNG.getItem(DIRS4)!;
        const [xx, yy] = [x + dx, y + dy];
        if (map.get(xx, yy)?.type === Type.Floor && Math.random() < 0.5) {
          genAt(xx, yy);
          if (n-- < 1) return;
        }
      }
    },
    n(depth: number) {
      return clampLinear(linOpts, depth) / μ;
    }
  } satisfies GeneratorLayer;
}

/**
 * Places a small cluster of features
 */
function clusterGenerator(
  type: Type,
  p: Partial<LinearParams> = {}
): GeneratorLayer {
  const linOpts = { b0: 1, m: 1, max: 5, min: 0, ...p };
  const μ = 2; // Mean (TBR)

  return {
    type: LayerType.Generator,
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
    n: (depth: number) => clampLinear(linOpts, depth) / μ
  } satisfies GeneratorLayer;
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

const mobGenerators = [
  hordeGenerator(Type.Slow, { m: 0.8, b0: 15, min: 0 }, { minDepth: 2 }),
  hordeGenerator(Type.Medium, { m: 1.2, b0: 7, min: 0 }, { minDepth: 10 }),
  hordeGenerator(Type.Fast, { m: 3.2, b0: -4, min: 0 }, { minDepth: 10 })
];

const forestTiles = {
  [Type.Tree]: 348,
  [Type.Forest]: 764
};

const ruinTiles = {
  [Type.Block]: 2,
  [Type.Wall]: 10
};

const Levels = [
  { layers: [{ type: LayerType.Brogue }] },
  {
    layers: [
      {
        type: LayerType.Brogue,
        wallType: forestTiles,
        voidType: forestTiles,
        special: true
      },
      {
        type: LayerType.CA,
        tileType: Type.River,
        checkPath: true, // Need to be able to check paths
        width: 10,
        height: 15
      },
      whipGenerator,
      nuggetGenerator,
      ...mobGenerators
    ]
  },

  {
    layers: [
      {
        type: LayerType.Brogue,
        wallType: ruinTiles,
        voidType: ruinTiles,
        special: true
      },
      growthGenerator(Type.Block),
      {
        type: LayerType.CA,
        tileType: Type.Pit,
        checkPath: true,
        width: 30,
        height: 10
      },
      gemGenerator,
      showGemsGenerator,
      ...mobGenerators
    ]
  },

  /**
   * Level 1
   *
   * Whips and nuggets
   * Introduces the player to whips and nuggets
   *
   */
  {
    layers: [
      { type: LayerType.Brogue },
      whipGenerator,
      nuggetGenerator,
      ...mobGenerators
    ],
    properties: {
      startTrigger: `##FlashEntity\nPress any key to begin this level.`
    }
  },
  {
    /**
     * Level 2
     *
     * Blocks and gems
     * Introduces the player to blocks, gems and show gem triggers
     */
    layers: [
      { type: LayerType.Brogue, wallType: ruinTiles, voidType: ruinTiles },
      growthGenerator(Type.Block),
      gemGenerator,
      showGemsGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 3
     *
     * Breakable walls, mobs and teleport spells
     * Introduces the player to breakable walls, slow mobs and teleport spells
     */
    layers: [
      { type: LayerType.Brogue, wallType: ruinTiles, voidType: ruinTiles },
      growthGenerator(Type.Block),
      teleportGenerator,
      ...mobGenerators
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
    layers: [
      { type: LayerType.Brogue },
      trapGenerator,
      whipGenerator,
      gemGenerator,
      showGemsGenerator
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
    layers: [
      { type: LayerType.Brogue, wallType: Type.GBlock, voidType: Type.GBlock },
      growthGenerator(Type.GBlock),
      whipGenerator,
      gemGenerator
    ]
  },
  {
    /**
     * Level 6
     *
     * Bombs
     * Introduces the player to bombs
     */
    layers: [
      { type: LayerType.Brogue, wallType: ruinTiles, voidType: ruinTiles },
      growthGenerator(Type.Block),
      bombGenerator,
      whipGenerator,
      chestGenerator,
      gemGenerator,
      trapGenerator,
      nuggetGenerator
    ]
  },
  {
    /**
     * Level 7
     *
     * Forest
     * Introduces the player to forest and trees
     */
    layers: [
      { type: LayerType.Brogue, wallType: forestTiles, voidType: forestTiles },
      growthGenerator(Type.Forest),
      growthGenerator(Type.Tree),
      whipGenerator,
      nuggetGenerator,
      chestGenerator
    ]
  },
  {
    /**
     * Level 8
     *
     * Tunnels
     * Introduces the player to tunnels
     */
    layers: [
      { type: LayerType.Brogue },
      tunnelGenerator,
      chestGenerator,
      whipGenerator,
      bombGenerator,
      teleportGenerator
    ]
  },
  {
    /**
     * Level 9
     *
     * Generators and spells
     * Introduces the player to generators and SlowTime spells
     */
    layers: [
      { type: LayerType.Brogue },
      spellGenerator(Type.Generator, { b0: 20 }),
      gemGenerator,
      nuggetGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime)
    ]
  },
  {
    /**
     * Level 10
     *
     * Traps
     * Introduces the player to Invisible traps
     */
    layers: [
      { type: LayerType.Brogue },
      growthGenerator(Type.Trap),
      collectibleGenerator(Type.Invisible, { b0: 20 }),
      teleportGenerator,
      gemGenerator,
      nuggetGenerator,
      spellGenerator(Type.Generator)
    ]
  },
  {
    /**
     * Level 11
     *
     * Mobs
     * Introduces the player to more medium mobs
     */
    layers: [
      { type: LayerType.Brogue },
      chestGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime, { b0: 20 })
    ]
  },
  {
    /**
     * Level 12
     *
     * Gems and spells
     * Introduces the player to gems and SpeedTime spells
     */
    layers: [
      { type: LayerType.Brogue },
      growthGenerator(Type.Block),
      spellGenerator(Type.SpeedTime, { b0: 2 }),
      spellGenerator(Type.SlowTime, { b0: 2 }),
      gemGenerator,
      whipGenerator,
      nuggetGenerator,
      teleportGenerator
    ]
  },
  {
    /**
     * Level 13
     *
     * MBlocks
     * Introduces the player to MBlocks
     */
    layers: [
      { type: LayerType.Brogue, wallType: Type.MBlock, voidType: Type.MBlock },
      growthGenerator(Type.MBlock),
      teleportGenerator
    ]
  },
  {
    /**
     * Level 14
     *
     * Traps
     * Introduces the player to TBlocks
     */
    layers: [
      { type: LayerType.Brogue },
      growthGenerator(Type.TBlock),
      spellGenerator(Type.Generator)
    ]
  },
  {
    /**
     * Level 15
     *
     * Traps
     */
    layers: [
      { type: LayerType.Brogue },
      growthGenerator(Type.Trap),
      growthGenerator(Type.Invisible),
      growthGenerator(Type.Block)
    ]
  },
  // TODO: Intro CWalls
  {
    /**
     * Level 16
     *
     * Doors
     */
    layers: [
      { type: LayerType.Brogue },
      growthGenerator(Type.Trap),
      collectibleGenerator(Type.Invisible, { b0: 30 }),
      collectibleGenerator(Type.Stairs, { b0: 20 }),
      nuggetGenerator
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
    layers: [
      { type: LayerType.Brogue, wallType: Type.GBlock, voidType: Type.GBlock },
      growthGenerator(Type.GBlock),
      gemGenerator,
      whipGenerator
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
] satisfies LevelDefinition[];

// **********************

function addFillLayer(layerData: FillLayer, mapData: PlayField) {
  const x0 = layerData.x ?? 0;
  const y0 = layerData.y ?? 0;
  const x1 = x0 + (layerData.width ?? mapData.width);
  const y1 = y0 + (layerData.height ?? mapData.height);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let t = layerData.tiles;
      if (typeof layerData.tiles === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t = RNG.getWeightedValue(t as any) as unknown as Type;
      }
      mapData.set(x, y, tiles.createEntityOfType(t as Type, x, y));
    }
  }
}

async function addPrefabLayer(layerData: PrefabLayer, mapData: PlayField) {
  const tilemap = await layerData.readMap();
  const data = readTileMapLayers(tilemap);

  const m = new Matrix<Entity>(mapData.width, mapData.height);
  m.fromArray(data);

  m.forEach((x, y, e) => {
    if (e) mapData.set(x, y, e);
  });
}

// TODO: Optimize
// - Generate a passable map from mapData once
function addCALayer(layerData: CALayer, mapData: Matrix<Entity>) {
  let x0 = 0;
  let y0 = 0;

  const w = layerData.width ?? mapData.width;
  const h = layerData.height ?? mapData.height;
  const interations = layerData.interations ?? 4;
  const randomize = layerData.randomize ?? 0.5;

  let retry = layerData.retry ?? 20;

  let enter: Vec | null = [0, 0];
  let exit: Vec | null = [0, 0];

  mapData.forEach((x, y, e) => {
    if (e?.type === Type.Player) {
      enter = [x, y];
    }
    if (e?.type === Type.Stairs) {
      exit = [x, y];
    }
  });

  while (retry-- > 0) {
    const map = buildMap();

    if (layerData.checkPath && enter && exit) {
      console.log('HERE');
      if (!findPostion(map)) continue;
    }

    map._serviceCallback((x: number, y: number, contents: number) => {
      if (contents === 0) return;
      const e = tiles.createEntityOfType(layerData.tileType, x + x0, y + y0);
      mapData.set(x + x0, y + y0, e);
    });
    console.log('Map Built');

    return;
  }

  function findPostion(map: Cellular) {
    const dx = mapData.width - w;
    const dy = mapData.height - h;

    let r = layerData.retry ?? Math.max(dx, dy, 20);

    while (r-- > 0) {
      x0 = RNG.getUniformInt(0, dx);
      y0 = RNG.getUniformInt(0, dy);
      if (checkPaths(map, enter!, exit!)) {
        return true;
      }
    }
    return false;
  }

  function buildMap(): Cellular {
    const map = new Cellular(w, h);
    map.randomize(randomize);
    for (let i = 0; i < interations; i++) {
      map.create();
    }
    return map;
  }

  function checkPaths(map: Cellular, start: Vec, end: Vec) {
    console.log('Checking Paths');
    const tempMapData = mapData.clone();

    map._serviceCallback((x: number, y: number, contents: number) => {
      if (contents === 0) return;
      const e = tiles.createEntityOfType(layerData.tileType, x + y0, y + y0);
      tempMapData.set(x + x0, y + y0, e);
    });

    const astar = new AStar(start[0], start[1], isPassable, { topology: 8 });
    let _hasPath = false;
    console.log('Running AStar:');
    astar.compute(end[0], end[1], () => (_hasPath = true));
    console.log('Has Path:', _hasPath);
    return _hasPath;

    function isPassable(x: number, y: number) {
      const e = tempMapData.get(x, y);
      return isTilePassable(e?.type || null);
    }
  }
}

function addGeneratorLayer(
  layerData: GeneratorLayer,
  mapData: Matrix<Entity>,
  depth: number
) {
  let n = ~~layerData.n(depth);

  if (n < 1) return;
  while (n--) {
    const p = getRandPosition();
    if (!p) break;
    layerData.gen(mapData, p[0], p[1], depth);
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

function addBrogueLayer(layerData: BrogueLayer, mapData: Matrix<Entity>) {
  const maxKeys = layerData.maxKeys ?? 5;
  const width = layerData.width ?? mapData.width;
  const height = layerData.height ?? mapData.height;
  let max_width = layerData.max_width ?? 25;
  let max_height = layerData.max_height ?? 25;
  const min_width = layerData.min_width ?? 2;
  const min_height = layerData.min_height ?? 2;
  let ideal = layerData.ideal ?? 70;

  const btl = buildMap();

  mapData.fill((x, y) => {
    const t = btl.world[y][x];
    return tiles.createEntityOfType(rogueMapTypeToType(t), x, y);
  });

  addKeys();

  function rogueMapTypeToType(c: number | null): Type {
    switch (c) {
      case 0: // Void
        return getType(layerData.voidType ?? Type.Stop);
      case 1:
        return Type.Floor;
      case 2: // Wall
        return getType(layerData.wallType ?? Type.Wall);
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

  function buildMap(): RogueMap {
    let btl: RogueMap | null = null;

    while (!btl) {
      try {
        const rogue = new Rogue({
          width,
          height,
          retry: 100,
          special: layerData.special ?? false,
          room: {
            ideal,
            min_width,
            max_width,
            min_height,
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

    return btl!;
  }

  function addKeys() {
    const roomPool = [btl!.enter.room_id];

    queueRooms(btl!.enter.room_id);

    const lockDoors: number[] = [];
    const keyRooms: number[] = [];

    while (lockDoors.length < maxKeys && roomPool.length > 0) {
      const roomId = roomPool.pop();
      if (!roomId) break;

      if (Math.random() < CHANCE_TO_ADD_LOCK) {
        const room = btl!.rooms[roomId];

        const door = RNG.getItem(room.doors);
        if (!door) continue;
        if (lockDoors.includes(door)) continue; // Already has a lock

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
}

// ************************

function getType(x: Type | WeightedType): Type {
  if (typeof x === 'object') {
    return RNG.getWeightedValue(
      x as { [key: number]: number }
    ) as unknown as Type;
  }
  return x;
}

function isTilePassable(t: Type | null) {
  if (t === null) return true;
  return (
    t === Type.Floor ||
    t === Type.Stairs ||
    t === Type.Player ||
    t === Type.Stop
  );
}
