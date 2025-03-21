// 'Testing Procgen Maps'

import { DIRS, RNG } from 'rot-js';

import * as tiles from '../../modules/tiles';
import * as display from '../../modules/display';
import * as controls from '../../modules/controls';
import * as screen from '../../modules/screen';

import { clampLinear, type LinearParams } from '../../utils/math';
import type { Level } from '../../modules/levels';
import { Type } from '../../constants/types';
import {
  BrogueLayer,
  CALayer,
  generateMap,
  GeneratorLayer,
  LayerType,
  LevelDefinition,
  RogueMapType
} from '../../utils/procgen';
import { HEIGHT, REDUCED } from '../../constants/constants';
import { Color } from '../../modules/colors';
import dedent from 'ts-dedent';
import { delay } from '../../utils/utils';

export const title = 'BROG';

export async function readLevel(i: number): Promise<Level> {
  const level = Levels[i % Levels.length] as LevelDefinition;
  const { mapData } = await generateMap(level, i);

  const startTrigger =
    (level.properties?.startTrigger as string) || i === 0
      ? '##FlashEntity\nPress any key to begin this level.'
      : 'Press any key to begin this level.';

  return {
    id: '' + i,
    data: mapData.toArray(), // randomMap(i).toArray(),
    startTrigger,
    properties: {}
  };
}

export function findNextLevel(i: number) {
  return ++i;
}

export function findPrevLevel(i: number) {
  return Math.max(--i, 0);
}

function createGenerator(type: Type, p: Partial<LinearParams>): GeneratorLayer {
  const linOpts: LinearParams = { b0: 1, m: 1, max: 100, min: 0, ...p };
  return {
    type: LayerType.Generator,
    generator: (map, x, y) =>
      map.set(x, y, tiles.createEntityOfType(type, x, y)),
    count: ({ depth }) => clampLinear(linOpts, depth)
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
    generator: (map, x, y) => {
      map.set(x, y, tiles.createEntityOfType(type, x, y));

      let n = RNG.getUniformInt(1, 8);
      genAt(x, y);

      function genAt(x: number, y: number) {
        const [dx, dy] = RNG.getItem(DIRS[4])!;
        const [xx, yy] = [x + dx, y + dy];
        const e = map.get(xx, yy);
        if (!e) return;

        if (e.type === Type.Floor && Math.random() < 0.5) {
          map.set(xx, yy, tiles.createEntityOfType(type, xx, yy));
          if (n-- < 1) return;
        }
      }
    },
    count({ depth }) {
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
    generator: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));
        const [dx, dy] = RNG.getItem(DIRS[8])!;
        const [xx, yy] = [x + dx, y + dy];
        const e = map.get(xx, yy);
        if (!e) return;
        if (e.type === Type.Floor && Math.random() < 0.8) {
          genAt(xx, yy);
          if (n-- < 1) return;
        }
      }
    },
    count({ depth }) {
      return clampLinear(linOpts, depth) / μ;
    }
  } satisfies GeneratorLayer;
}

/**
 * Places a vane of collectibles
 */
function collectibleGenerator(
  type: Type,
  p: Partial<LinearParams> = {},
  opts: Partial<GeneratorLayer> = {}
): GeneratorLayer {
  const linOpts = { b0: 12, m: 0.5, max: 500, min: 1, ...p };
  const μ = 4; // Mean (TBR)

  return {
    type: LayerType.Generator,
    generator: (map, x, y) => {
      let n = RNG.getUniformInt(1, 5);
      genAt(x, y);

      function genAt(x: number, y: number) {
        map.set(x, y, tiles.createEntityOfType(type, x, y));
        const [dx, dy] = RNG.getItem(DIRS[4])!;
        const [xx, yy] = [x + dx, y + dy];
        const e = map.get(xx, yy);
        if (!e) return;
        if (e.type === Type.Floor && Math.random() < 0.5) {
          genAt(xx, yy);
          if (n-- < 1) return;
        }
      }
    },
    count({ depth }) {
      return clampLinear(linOpts, depth) / μ;
    },
    ...opts
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
    generator: (map, x, y) => {
      map.set(x, y, tiles.createEntityOfType(type, x, y));

      let n = RNG.getUniformInt(0, 3);
      genAt(x, y);

      function genAt(x: number, y: number) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const e = map.get(x + dx, y + dy);
            if (!e) return;

            if (!e || (e!.type === Type.Floor && Math.random() < 0.3)) {
              map.set(x + dx, y + dy, tiles.createEntityOfType(type, x, y));
              if (n-- < 1) return;
            }
          }
        }
      }
    },
    count: ({ depth }) => clampLinear(linOpts, depth) / μ
  } satisfies GeneratorLayer;
}

const spellGenerator = (type: Type, p: Partial<LinearParams> = {}) =>
  createGenerator(type, { b0: 1, m: 1, max: 20, ...p });

const creatureGeneratorGenerator = createGenerator(Type.Generator, {
  b0: 1,
  m: 0.1,
  max: 20
});

const teleportGenerator = clusterGenerator(Type.Teleport, {
  b0: 7,
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
const trapGenerator = growthGenerator(Type.Trap, { b0: 30, m: 0.1, max: 20 });
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

const lakeFeature = {
  type: LayerType.CA,
  tileType: Type.River,
  checkPath: true,
  width: 10,
  height: 20,
  maxPlacement: 2
} satisfies CALayer;

const pitFeature = {
  type: LayerType.CA,
  tileType: Type.Pit,
  checkPath: true,
  width: 30,
  height: 10
} satisfies CALayer;

const ruinsMap = {
  type: LayerType.Brogue,
  tileTypes: {
    [RogueMapType.Wall]: ruinTiles,
    [RogueMapType.Void]: ruinTiles
  }
} satisfies BrogueLayer;

const randomPlayer = {
  type: LayerType.Generator,
  count: 1,
  generator: (map, x, y) =>
    map.set(x, y, tiles.createEntityOfType(Type.Player, x, y))
} satisfies GeneratorLayer;

const randomStairs = {
  type: LayerType.Generator,
  count: 1,
  generator: (map, x, y) =>
    map.set(x, y, tiles.createEntityOfType(Type.Stairs, x, y))
} satisfies GeneratorLayer;

const Levels = [
  /**
   * Level 1
   *
   * Base map: Paths (Brogue)
   * Features: Lake (CA)
   * Collectables: Whips and nuggets
   *
   * Introduces the player to whips and nuggets
   *
   */
  {
    layers: [
      {
        type: LayerType.Brogue,
        special: true,
        max_height: 3,
        max_width: 20,
        tileTypes: {
          [RogueMapType.Wall]: forestTiles,
          [RogueMapType.Void]: forestTiles,
          [RogueMapType.SpecialDoor]: Type.Floor // TODO: Way to add a key for special doors
        },
        keys: 1,
        doorTypes: Type.Door,
        ideal: 3
      },
      lakeFeature,
      collectibleGenerator(
        Type.Whip,
        {
          b0: 30,
          m: 0.056,
          min: 20,
          max: 200
        },
        { special: true }
      ),
      collectibleGenerator(
        Type.Nugget,
        {
          b0: 6.3,
          m: 2.3,
          min: 1,
          max: 500
        },
        { special: true }
      ),
      ...mobGenerators
    ]
  },

  {
    /**
     * Level 2
     *
     * Base map: Block and Walls Cave (CA)
     * Features: Pit (CA)
     * Collectibles gems
     *
     * Introduces the player to blocks, gems and show gem triggers
     */
    layers: [
      {
        type: LayerType.CA,
        tileType: ruinTiles,
        checkPath: true
      },
      pitFeature,
      randomPlayer,
      randomStairs,
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
     * Base map: Ruins (Brogue)
     * Features: Pit (CA)
     * Collectibles: Teleport spells
     *
     * Introduces the player to slow mobs and teleport spells
     */
    layers: [
      {
        type: LayerType.Brogue,
        tileTypes: {
          [RogueMapType.Wall]: ruinTiles,
          [RogueMapType.Void]: ruinTiles
        }
      },
      pitFeature,
      growthGenerator(Type.Block),
      teleportGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 4
     *
     * Base map: Maze (BSP)
     * Features: Traps (CA & Growth)
     *
     * Introduces the player to traps and OSpell/OWalls
     */
    layers: [
      {
        type: LayerType.BSP,
        doorTypes: {
          [Type.OWall1]: 15,
          [Type.OWall2]: 10
        }
      },
      {
        type: LayerType.CA,
        tileType: Type.Trap,
        checkPath: false,
        width: 30,
        height: 10,
        maxPlacement: 3
      },
      trapGenerator,
      whipGenerator,
      gemGenerator,
      showGemsGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 5
     *
     * Base map: GBlock Maze (Brogue)
     * Features: Pit (CA)
     * Collectibles: Whips and gems
     *
     * Introduces the player to GBlocks
     */
    layers: [
      {
        type: LayerType.Brogue,
        keys: 0,
        tileTypes: {
          [RogueMapType.Void]: Type.GBlock,
          [RogueMapType.Wall]: Type.GBlock
        }
      },
      pitFeature,
      growthGenerator(Type.GBlock),
      whipGenerator,
      gemGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 6
     *
     * Base map: Ruins (Brogue)
     * Features: Pit (CA)
     *
     * Introduces the player to bombs
     */
    layers: [
      ruinsMap,
      pitFeature,
      growthGenerator(Type.Block),
      bombGenerator,
      whipGenerator,
      chestGenerator,
      gemGenerator,
      trapGenerator,
      nuggetGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 7
     *
     * Base map: Forest Maze (Brogue)
     * Features: Lake (CA)
     * Collectibles: Whips and nuggets
     *
     * Introduces the player to forest and trees??
     */
    layers: [
      {
        type: LayerType.Brogue,
        tileTypes: {
          [RogueMapType.Void]: forestTiles,
          [RogueMapType.Wall]: forestTiles
        }
      },
      lakeFeature,
      growthGenerator(Type.Forest),
      growthGenerator(Type.Tree),
      whipGenerator,
      nuggetGenerator,
      chestGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 8
     *
     * Base: Rooms
     * Features: Tunnels (BSP)
     * Collectibles: Chests, whips and teleports
     *
     * Introduces the player to tunnels
     */
    layers: [
      {
        type: LayerType.BSP,
        keys: 0, // TODO: Make sure every room has a tunnel
        tileTypes: {
          [RogueMapType.Door]: Type.Tunnel
          // [RogueMapType.Floor]: Type.Stop  // TODO: add stops to rooms, allow generators
        }
      },
      tunnelGenerator,
      pitFeature,
      chestGenerator,
      whipGenerator,
      teleportGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 9
     *
     * Base: Cave (CA)
     * Features: Pit (CA)
     * Collectibles: Gems, nuggets, whips and SlowTime spells
     *
     * Introduces the player to generators and SlowTime spells
     */
    layers: [
      {
        type: LayerType.CA,
        tileType: ruinTiles,
        checkPath: true
      },
      pitFeature,
      randomPlayer,
      randomStairs,
      creatureGeneratorGenerator,
      gemGenerator,
      nuggetGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime),
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 10
     *
     * Base: Rooms
     * Features:
     * Collectibles: Invisible gems, nuggets and whips
     *
     * Introduces the player to Invisible traps
     */
    layers: [
      {
        type: LayerType.BSP
      },
      growthGenerator(Type.Trap),
      collectibleGenerator(Type.Invisible, { b0: 20 }),
      teleportGenerator,
      gemGenerator,
      nuggetGenerator,
      creatureGeneratorGenerator,
      ...mobGenerators,
      whipGenerator
    ]
  },
  // TODO: Lava and Flow here
  {
    /**
     * Level 11
     *
     * Base: Rooms
     * Features:
     * Collectibles: Chests, whips and SlowTime spells
     *
     * Introduces the player to medium mobs
     */
    layers: [
      ruinsMap,
      chestGenerator,
      whipGenerator,
      spellGenerator(Type.SlowTime, { b0: 20 }),
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 12
     *
     * Base: Rooms
     * Features:
     * Collectibles: Gems, whips and nuggets
     *
     * Introduces the player to gems and SpeedTime spells
     */
    layers: [
      {
        type: LayerType.CA,
        tileType: ruinTiles,
        checkPath: true
      },
      pitFeature,
      randomPlayer,
      randomStairs,
      growthGenerator(Type.Block),
      spellGenerator(Type.SpeedTime, { b0: 2 }),
      spellGenerator(Type.SlowTime, { b0: 2 }),
      gemGenerator,
      whipGenerator,
      nuggetGenerator,
      teleportGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 13
     *
     * Base: MBlock Maze (Brogue)
     * Features:
     * Collectibles: Gems, whips and nuggets
     *
     * Introduces the player to MBlocks
     */
    layers: [
      {
        type: LayerType.Brogue,
        tileTypes: {
          [RogueMapType.Void]: Type.MBlock,
          [RogueMapType.Wall]: Type.MBlock
        },
        keys: 0
      },
      growthGenerator(Type.MBlock),
      teleportGenerator,
      whipGenerator,
      gemGenerator,
      ...mobGenerators
    ]
  },
  {
    /**
     * Level 14
     *
     * Base: Rooms
     * Features:
     * Collectibles: Invisible traps, gems, whips and nuggets
     *
     * Introduces the player to TBlocks
     */
    layers: [
      {
        type: LayerType.BSP
      },
      pitFeature,
      growthGenerator(Type.TBlock),
      ...mobGenerators,
      teleportGenerator,
      whipGenerator,
      gemGenerator
    ]
  },
  {
    /**
     * Level 15
     *
     * Base: Rooms
     * Features: Pit (CA)
     *
     */
    layers: [
      {
        type: LayerType.CA,
        tileType: ruinTiles,
        checkPath: true
      },
      pitFeature,
      randomPlayer,
      randomStairs,
      growthGenerator(Type.Trap),
      growthGenerator(Type.Invisible),
      growthGenerator(Type.Block),
      ...mobGenerators
    ]
  },
  // TODO: Intro CWalls
  {
    /**
     * Level 16
     *
     * Base: Rooms
     * Features: Pit (CA)
     * Collectibles: Gems, whips and nuggets
     */
    layers: [
      {
        type: LayerType.BSP
      },
      pitFeature,
      growthGenerator(Type.Trap),
      collectibleGenerator(Type.Invisible, { b0: 30 }),
      collectibleGenerator(Type.Stairs, { b0: 20 }),
      whipGenerator,
      gemGenerator,
      nuggetGenerator,
      ...mobGenerators
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
     * Base: GBlock Maze (Brogue)
     * Features: Pit (CA)
     * Collectibles: Gems and whips
     *
     * Gblocks, whips and gems
     */
    layers: [
      {
        type: LayerType.Brogue,
        tileTypes: {
          [RogueMapType.Void]: Type.GBlock,
          [RogueMapType.Wall]: Type.GBlock
        }
      },
      pitFeature,
      growthGenerator(Type.GBlock),
      gemGenerator,
      whipGenerator,
      ...mobGenerators
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

export async function start() {
  await introScreen();
  await screen.renderTitle();
}

export async function introScreen() {
  display.clear(Color.Black);

  display.writeCenter(
    HEIGHT - 1,
    'Choose a game to start',
    Color.HighIntensityWhite
  );

  display.writeCenter(HEIGHT - 1, 'Press any key to continue', Color.White);

  await controls.repeatUntilKeyPressed(async () => {
    display.drawText(
      5,
      5,
      dedent`
          ██████░ ██████░  ██████░  ██████░ 
          ██░░░██░██░░░██░██░░░░██░██░░░░░░ 
          ██████░░██████░░██░   ██░██░  ███░
          ██░░░██░██░░░██░██░   ██░██░   ██░
          ██████░░██░  ██░░██████░░ ██████░░
          ░░░░░░░ ░░░  ░░░ ░░░░░░░  ░░░░░░░ 
    `,
      REDUCED ? Color.Red : RNG.getUniformInt(1, 15)
    );

    await delay(500);
  });
}
