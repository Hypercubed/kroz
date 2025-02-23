import { RNG } from 'rot-js';
import type { ExternalTileset } from '@kayahr/tiled';

import * as world from './world';
import * as scripts from './scripts';

import {
  Attacks,
  Eats,
  followsPlayer,
  isGenerator,
  isMob,
  isPlayer,
  DestroyedBy,
  Renderable,
  Walkable,
  Collectible,
  AnimatedWalking,
  isSecreted,
  Position,
  Trigger,
  isPassable,
  Speed,
  Breakable,
  isBombable,
  FoundMessage,
  Glitch,
  isImperviousToSpears,
  Pushable,
  Energy,
  RenderableData,
  isInvisible
} from '../classes/components';
import { Entity } from '../classes/entity';
import { Color } from './colors';

import { ensureObject, tileIdToChar } from '../utils/utils';
import { MOB_EATS, MOB_WALKABLE, Type } from '../constants/types';
import { DEBUG } from '../constants/constants';

let nextTypeId = 255;

let TileIDToType: Record<number, Type> = {}; // TileID to type lookup
let TypeToTileID: Record<number, Type> = {}; // Type to TileID lookup
let TypeNameToType: Record<string, Type> = {}; // Type name to Type lookup

let tileset: ExternalTileset;

export const common = {
  PLAYER_CHAR: '☻',
  PLAYER_FG: 14,
  PLAYER_BG: 0,

  FLOOR_CHAR: ' ',
  FLOOR_FG: 0,
  FLOOR_BG: 0,

  BORDER_CHAR: '▒',
  BORDER_FG: 9,
  BORDER_BG: 0,

  CHANCE_CHAR: '?',
  CHANCE_FG: 15,
  CHANCE_BG: 0,

  BLOCK_CHAR: '█'
};

export async function setTileset(_tileset: ExternalTileset) {
  TileIDToType = {};
  TypeToTileID = {};
  TypeNameToType = {};

  tileset = _tileset;
  if (!tileset.tiles) throw new Error('No tiles found in tileset');

  for (const tile of tileset.tiles!) {
    const tileId = +tile.id;
    const type = tile.type ? (+tile.type! as Type) : nextTypeId++;
    TileIDToType[tileId] = type;
    TypeToTileID[type] = tileId;

    const props = ensureObject(tile?.properties ?? {});
    if (DEBUG) {
      if ('FoundMessage' in props) {
        scripts.validateScript(props.FoundMessage);
      }
      if ('Trigger' in props) {
        scripts.validateScript(props.Trigger);
      }
    }

    if (Type[type] && props.name !== Type[type])
      throw new Error('Tile ID mismatch');
    const name = Type[type] ?? props.name ?? '' + type;
    if (TypeNameToType[name]) throw new Error('Duplicate type name: ' + name);

    TypeNameToType[name] = type;

    switch (type) {
      case Type.Floor:
        common.FLOOR_CHAR = props.Tile?.ch ?? common.FLOOR_CHAR;
        common.FLOOR_FG = props.Tile?.fg
          ? Color[props.Tile?.fg as keyof typeof Color]
          : common.FLOOR_FG;
        common.FLOOR_BG = props.Tile?.bg
          ? Color[props.Tile?.bg as keyof typeof Color]
          : common.FLOOR_BG;
        break;
      case Type.Block:
        common.BLOCK_CHAR = props.Tile?.ch ?? common.BLOCK_CHAR;
        break;
      case Type.Border:
        common.BORDER_CHAR = props.Tile?.ch ?? common.BORDER_CHAR;
        common.BORDER_FG = props.Tile?.fg
          ? Color[props.Tile?.fg as keyof typeof Color]
          : common.BORDER_FG;
        common.BORDER_BG = props.Tile?.bg
          ? Color[props.Tile?.bg as keyof typeof Color]
          : common.BORDER_BG;
        break;
      case Type.Chance:
        common.CHANCE_CHAR = props.Tile?.ch ?? common.CHANCE_CHAR;
        common.CHANCE_FG = props.Tile?.fg
          ? Color[props.Tile?.fg as keyof typeof Color]
          : common.CHANCE_FG;
        common.CHANCE_BG = props.Tile?.bg
          ? Color[props.Tile?.bg as keyof typeof Color]
          : common.CHANCE_BG;
        break;
      case Type.Player:
        common.PLAYER_CHAR = props.Tile?.ch ?? common.PLAYER_CHAR;
        common.PLAYER_FG = props.Tile?.fg
          ? Color[props.Tile?.fg as keyof typeof Color]
          : common.PLAYER_FG;
        common.PLAYER_BG = props.Tile?.bg
          ? Color[props.Tile?.bg as keyof typeof Color]
          : common.PLAYER_BG;
        break;
    }
  }
}

export function getTileDefinition(tileId: number) {
  for (const tile of tileset.tiles!) {
    if (tile.id === tileId) return tile;
  }
}

export function createEntityOfType(
  type: Type | string,
  x?: number,
  y?: number
) {
  const tileId = TypeToTileID[type as Type] ?? 0;
  return createEntityFromTileId(tileId, x, y);
}

// Creates an entity from a tile ID
export function createEntityFromTileId(
  tileId: number,
  x?: number,
  y?: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>,
  type?: Type | string
) {
  const tileDefinition = getTileDefinition(tileId);
  type =
    getType(type) ?? TileIDToType[tileId] ?? tileIdToChar(tileId) ?? Type.Floor;
  const entity = new Entity(type);

  if (tileDefinition && tileDefinition.properties) {
    addComponentsToEntity(entity, ensureObject(tileDefinition.properties));
  }
  addComponentsToEntity(entity, properties || {});

  if (entity.has(isPlayer) || entity.has(isMob)) {
    entity.add(new Position({ x, y }));
  }

  if (entity.has(isPlayer)) {
    entity.add(new Energy(0));
  }

  return entity;
}

export function getType(
  type: Type | string | undefined
): Type | number | undefined {
  if (typeof type === 'number') return type as Type;
  if (typeof type === 'undefined' || type === '') return undefined;
  if (typeof type === 'string' && !isNaN(+type)) return +type as Type;
  if (type in Type) return Type[type as keyof typeof Type];
  return TypeNameToType[type] ?? type;
}

const SIMPLE_TAGS = {
  isPlayer,
  isMob,
  isGenerator,
  isSecreted,
  isPassable,
  followsPlayer,
  isBombable,
  isImperviousToSpears,
  isInvisible
};

const SIMPLE_COMPONENTS = {
  Collectible,
  Trigger,
  AnimatedWalking,
  Attacks,
  Pushable,
  Speed,
  Breakable,
  FoundMessage,
  Glitch
};

function addComponentsToEntity(
  entity: Entity,
  properties: Record<string, unknown>
) {
  const type = entity.type as Type;

  for (const tag in SIMPLE_TAGS) {
    if (properties[tag]) {
      entity.add(SIMPLE_TAGS[tag as keyof typeof SIMPLE_TAGS]);
    }
  }

  if (entity.has(isMob)) {
    if (type === Type.Fast || type === Type.Medium || type === Type.Slow) {
      entity
        .add(new Eats(MOB_EATS))
        .add(
          new DestroyedBy([Type.Block, Type.MBlock, Type.ZBlock, Type.GBlock])
        );
    }
  }

  if (MOB_WALKABLE.includes(type as Type) || MOB_EATS.includes(type as Type)) {
    entity.add(new Walkable([Type.Fast, Type.Medium, Type.Slow]));
  }

  if ('ChanceOdds' in properties) {
    const odds =
      (properties['ChanceOdds' as keyof typeof properties] as number) ?? 0;
    if (odds > 0) {
      const p = 1 / odds;
      if (Math.random() < p) {
        entity.add(isSecreted);
      }
    }
  }

  switch (type) {
    case Type.Floor:
      entity.add(
        new Walkable([Type.Fast, Type.Medium, Type.Slow, Type.MBlock])
      );
      break;
    case Type.Chest:
      entity.add(
        new Collectible({
          whips: RNG.getUniformInt(2, 5),
          gems: RNG.getUniformInt(5, world.gameState.difficulty + 2)
        })
      );
      break;
    case Type.Chance: {
      const gems = RNG.getUniformInt(0, world.gameState.difficulty) + 13;
      entity.add(new Collectible({ gems }));
      break;
    }
  }

  if ('Tile' in properties) {
    const tile = properties[
      'Tile' as keyof typeof properties
    ] as Partial<RenderableData>;
    let fg: string | Color = tile.fg as string;
    let bg: string | Color = tile.bg as string;
    if (typeof fg === 'string')
      fg = Color[fg as keyof typeof Color] ?? (fg === 'None' ? null : fg);
    if (typeof bg === 'string')
      bg = Color[bg as keyof typeof Color] ?? (bg === 'None' ? null : bg);
    entity.add(new Renderable({ ...tile, fg, bg }));
  }

  for (const key in SIMPLE_COMPONENTS) {
    if (key in properties) {
      const Ctor = SIMPLE_COMPONENTS[key as keyof typeof SIMPLE_COMPONENTS];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entity.add(new Ctor(properties[key] as any));
    }
  }
}

// Replace with Components
// Findable component (message, score, etc)
// Breakable (score, etc)
export function getScoreDelta(block: Type) {
  switch (block) {
    case Type.Border:
      if (world.stats.score > world.stats.levelIndex)
        return -world.stats.levelIndex / 2;
      return 0;
    case Type.Slow:
    case Type.Medium:
    case Type.Fast:
      return block;
    case Type.Block:
    case Type.Wall:
    case Type.ZBlock:
    case Type.GBlock:
    case Type.River:
    case Type.Tree:
    case Type.Forest:
    case Type.MBlock:
    case Type.OWall1:
    case Type.OWall2:
    case Type.OWall3:
    case Type.EWall:
      if (world.stats.score > 2) return -2;
      return 0;
    case Type.Whip:
    case Type.SlowTime:
      return 1;
    case Type.Stairs:
      return world.stats.levelIndex;
    case Type.Chest:
      return 5;
    case Type.Gem:
      return 1;
    case Type.Invisible:
      return 10;
    case Type.Nugget:
      return 50;
    case Type.Door:
    case Type.Teleport:
    case Type.Freeze:
      return 1;
    case Type.SpeedTime:
      return 2;
    case Type.Power:
      return 5;
    case Type.Trap:
      if (world.stats.score > 5) return -5;
      return 0;
    case Type.Lava:
      return 25;
    case Type.Tome:
      return 5000;
    case Type.Tablet:
      return world.stats.levelIndex + 250;
    case Type.Chance:
      return 100;
    case Type.Statue:
      return 10;
    case Type.Amulet:
      return 2500;
    case Type.Z:
      return 1000;
    case Type.Create:
      return world.stats.levelIndex * 2;
    case Type.Generator:
      return 50; // When destroyed
  }
  return 0;
}
