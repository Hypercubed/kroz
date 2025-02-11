import { RNG } from 'rot-js';
import type { ExternalTileset } from '@kayahr/tiled';

import * as world from './world';

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
  isPushable,
  ChangeLevel,
  Trigger,
  isPassable,
  Speed,
  Breakable,
  isBombable,
  FoundMessage,
  Glitch,
  isImperviousToSpears
} from '../classes/components';
import { Entity } from '../classes/entity';
import { Color } from './colors';

import { ensureObject, tileIdToChar } from '../utils/utils';

export enum Type {
  Border = -1,
  Floor = 0,
  Slow = 1,
  Medium = 2,
  Fast = 3,
  Block = 4,
  Whip = 5,
  Stairs = 6,
  Chest = 7,
  SlowTime = 8,
  Gem = 9,
  Invisible = 10,
  Teleport = 11,
  Key = 12,
  Door = 13,
  Wall = 14,
  SpeedTime = 15,
  Trap = 16,
  River = 17,
  Power = 18,
  Forest = 19,
  Tree = 20,
  Bomb = 21,
  Lava = 22,
  Pit = 23,
  Tome = 24,
  Tunnel = 25,
  Freeze = 26,
  Nugget = 27,
  Quake = 28,
  IBlock = 29,
  IWall = 30,
  IDoor = 31,
  Stop = 32,
  Trap2 = 33,
  Zap = 34,
  Create = 35,
  Generator = 36,
  Trap3 = 37,
  MBlock = 38,
  Trap4 = 39,
  Player = 40,
  ShowGems = 41,
  Tablet = 42,
  ZBlock = 43,
  BlockSpell = 44,
  Chance = 45,
  Statue = 46,
  WallVanish = 47,
  K = 48,
  R = 49,
  O = 50,
  Z = 51,
  OWall1 = 52,
  OWall2 = 53,
  OWall3 = 54,
  CWall1 = 55,
  CWall2 = 56,
  CWall3 = 57,
  OSpell1 = 58,
  OSpell2 = 59,
  OSpell3 = 60,
  CSpell1 = 61,
  CSpell2 = 62,
  CSpell3 = 63,
  GBlock = 64,
  Rock = 65,
  EWall = 66,
  Trap5 = 67,
  TBlock = 68,
  TRock = 69,
  TGem = 70,
  TBlind = 71,
  TWhip = 72,
  TGold = 73,
  TTree = 74,
  Rope = 75,
  DropRope = 76,
  DropRope2 = 77,
  DropRope3 = 78,
  DropRope4 = 79,
  DropRope5 = 80,
  Amulet = 81,
  ShootRight = 82,
  ShootLeft = 83,

  Trap6 = 224,
  Trap7 = 225,
  Trap8 = 226,
  Trap9 = 227,
  Trap10 = 228,
  Trap11 = 229,
  Trap12 = 230,
  Trap13 = 231,

  Message = 252
}

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

export const MOBS = [Type.Fast, Type.Medium, Type.Slow]; // 1..3
export const COLLECTABLES = [Type.Whip, Type.Gem, Type.Teleport, Type.Chest]; // 5, 9, 11
export const SPELLS = [
  Type.SlowTime,
  Type.Invisible,
  Type.SpeedTime,
  Type.Freeze
]; // 8, 10, 15, 26

export const ITRAPS = [
  // 33, 37, 39, 67, 224..231
  Type.Trap2,
  Type.Trap3,
  Type.Trap4,
  Type.Trap5,
  Type.Trap6,
  Type.Trap7,
  Type.Trap8,
  Type.Trap9,
  Type.Trap10,
  Type.Trap11,
  Type.Trap12,
  Type.Trap13
];

export const TRAPS = [
  // 16, 33, 37, 39, 67, 224..231
  Type.Trap,
  ...ITRAPS
];

export const KROZ = [
  // 48..51
  Type.K,
  Type.R,
  Type.O,
  Type.Z
];

export const OWALLS = [Type.OWall1, Type.OWall2, Type.OWall3]; // 52..54
export const CWALLS = [Type.CWall1, Type.CWall2, Type.CWall3]; // 55..57
export const OSPELLS = [Type.OSpell1, Type.OSpell2, Type.OSpell3]; // 58..60
export const CSPELLS = [Type.CSpell1, Type.CSpell2, Type.CSpell3]; // 61..63

export const TBLOCKS = [
  // 68..74
  Type.TBlock,
  Type.TRock,
  Type.TGem,
  Type.TBlind,
  Type.TWhip,
  Type.TGold,
  Type.TTree
];

export const ROCKABLES = [
  Type.Floor,
  ...MOBS,
  ...COLLECTABLES,
  ...SPELLS,
  ...TRAPS,
  Type.Stop
];

// Types that can be replaced when a TBlock is triggered
export const TRIGGERABLES = [
  Type.Floor,
  Type.Stop,
  ...ITRAPS,
  Type.ShowGems,
  Type.WallVanish,
  ...TBLOCKS
];

export const ROCK_MOVEABLES = [
  Type.Floor,
  Type.Stop,
  Type.ShowGems,
  Type.BlockSpell,
  Type.WallVanish,
  ...CWALLS,
  ...CSPELLS,
  ...TBLOCKS,
  ...ITRAPS
];

export const ROCK_CRUSHABLES = [
  ...COLLECTABLES,
  Type.SlowTime,
  Type.Invisible,
  Type.Key,
  Type.Trap,
  Type.Power,
  Type.Bomb,
  Type.Freeze,
  Type.Nugget,
  Type.Zap,
  Type.Create,
  Type.Tablet,
  Type.Chance,
  ...KROZ,
  ...OSPELLS,
  Type.ShootRight,
  Type.ShootLeft
];

export const ROCK_CLIFFABLES = [Type.Stairs, Type.Pit];

export const TUNNELABLES = [Type.Floor, Type.Stop, ...ITRAPS, ...CWALLS];

const MOB_WALKABLE = [
  Type.Floor,
  Type.TBlock,
  Type.TRock,
  Type.TGem,
  Type.TBlind,
  Type.TGold,
  Type.TWhip,
  Type.TTree
];

const MOB_EATS = [
  Type.Whip,
  Type.Chest,
  Type.SlowTime,
  Type.Gem,
  Type.Invisible,
  Type.Teleport,
  Type.Key,
  Type.SpeedTime,
  Type.Trap,
  Type.Power,
  Type.Freeze,
  Type.Nugget,
  ...KROZ,
  Type.ShootRight,
  Type.ShootLeft
];

export const LAVA_FLOW = [
  Type.Floor,
  ...MOBS,
  Type.Block,
  ...COLLECTABLES,
  ...SPELLS,
  Type.Trap,
  Type.Power,
  Type.Forest,
  Type.Tree,
  Type.Bomb,
  Type.Nugget,
  Type.Quake,
  Type.Stop,
  Type.Trap2,
  Type.Zap,
  Type.Create,
  Type.Trap3,
  Type.MBlock,
  Type.Trap4,
  Type.ShowGems,
  Type.Tablet,
  Type.ZBlock,
  Type.BlockSpell,
  Type.Chance,
  Type.WallVanish,
  ...KROZ,
  Type.CWall3,
  Type.OSpell3,
  Type.GBlock,
  Type.Trap5,
  ...TBLOCKS,
  Type.DropRope2,
  Type.DropRope3,
  Type.DropRope4,
  Type.DropRope5,
  Type.Amulet,
  Type.ShootRight,
  Type.ShootLeft
];

export const TREE_GROW = [
  Type.Floor,
  Type.Trap,
  Type.Nugget,
  Type.Quake,
  Type.Stop,
  Type.Trap2,
  Type.Trap3,
  Type.Trap4
];

export function getTileDefinition(tileId: number) {
  for (const tile of tileset.tiles!) {
    if (tile.id === tileId) {
      return tile;
    }
  }
}

export function createEntityOfType(type: Type | string, x: number, y: number) {
  const tileId = TypeToTileID[type as Type] ?? 0;
  return createEntityFromTileId(tileId, x, y);
}

// Creates an entity from a tile ID
export function createEntityFromTileId(
  tileId: number,
  x: number,
  y: number,
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
  isPushable,
  isPassable,
  followsPlayer,
  isBombable,
  isImperviousToSpears
};

const SIMPLE_COMPONENTS = {
  Collectible,
  Trigger,
  AnimatedWalking,
  Attacks,
  ChangeLevel,
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
          gems: RNG.getUniformInt(5, world.game.difficulty + 2)
        })
      );
      break;
    case Type.Chance: {
      const gems = RNG.getUniformInt(0, world.game.difficulty) + 13;
      entity.add(new Collectible({ gems }));
      break;
    }
  }

  if ('Tile' in properties) {
    const tile = properties[
      'Tile' as keyof typeof properties
    ] as Partial<Renderable>;
    const fg = Color[tile.fg as unknown as keyof typeof Color] ?? null; // TODO: alow explict color strings
    const bg = Color[tile.bg as unknown as keyof typeof Color] ?? null;
    const ch = tile.ch ?? common.FLOOR_CHAR;
    const blink = tile.blink ?? false;
    entity.add(new Renderable({ fg, bg, ch, blink }));
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
