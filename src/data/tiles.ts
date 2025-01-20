import { RNG } from 'rot-js';

import * as world from '../modules/world';

import {
  AttacksPlayer,
  Eats,
  doesFollowsPlayer,
  isGenerator,
  isMobile,
  isPlayer,
  DestroyedBy,
  Renderable,
  Walkable,
  Collectible,
  AnimatedWalking,
  MagicTrigger,
  isSecreted,
  Position,
  isPushable,
} from '../classes/components';
import { Entity } from '../classes/entity';
import { Color } from './colors';
import { FLOOR_CHAR } from './constants';

// TODO: Load this dynamically
import tileset from './kroz.tileset.json';
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

  Message = 252,
}

const _TypeChar: Partial<Record<Type, string>> = {
  [Type.Border]: '▒',
  [Type.Floor]: FLOOR_CHAR,
};

const TileIDToType: Record<number, Type> = {}; // TileID to type lookup
const TypeToTileID: Record<number, Type> = {}; // TileID to type lookup

const _TypeColor: Partial<Record<Type, [Color | null, Color | null]>> = {
  [Type.Border]: [Color.LightBlue, Color.Black],
  [Type.Floor]: [Color.Black, Color.Black],
};
const _TypeMessage: Partial<Record<Type, string>> = {
  [Type.Border]: 'An Electrified Wall blocks your way.',
};

export function readTileset() {
  if (!tileset.tiles) throw new Error('No tiles found in tileset');

  for (const tile of tileset.tiles!) {
    const tileId = tile.id!;
    const type = +tile.type! as Type;
    TileIDToType[+tileId] = type;
    TypeToTileID[type] = +tileId;

    if (!tile.properties) continue;

    const props = ensureObject(tile.properties);
    if (props.name !== Type[type]) throw new Error('Tile ID mismatch');

    // TODO: remove this, use when creating entities
    if ('Tile' in props) {
      const tile = props['Tile' as keyof typeof props];
      _TypeColor[type] = [
        Color[tile.fg as keyof typeof Color] ?? tile.fg ?? null,
        Color[tile.bg as keyof typeof Color] ?? tile.bg ?? null,
      ]; // Allow explicit color?
      _TypeChar[type] = tile.ch ?? FLOOR_CHAR;
    }

    if ('Message' in props) {
      _TypeMessage[type] = props['Message' as keyof typeof props];
    }
  }
}

readTileset();

// export const MapLookup = _MapLookup as Record<string, Type>;
export const TypeColor = _TypeColor as Record<
  Type,
  [Color | null, Color | null]
>;

// TODO: Remove thesem use entity data
export const TypeChar = _TypeChar as Record<Type, string>;
export const TypeMessage = _TypeMessage as Record<Type, string>;

export const MOBS = [Type.Fast, Type.Medium, Type.Slow]; // 1..3
export const COLLECTABLES = [Type.Whip, Type.Gem, Type.Teleport, Type.Chest]; // 5, 9, 11
export const SPELLS = [
  Type.SlowTime,
  Type.Invisible,
  Type.SpeedTime,
  Type.Freeze,
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
  Type.Trap13,
];

export const TRAPS = [
  // 16, 33, 37, 39, 67, 224..231
  Type.Trap,
  ...ITRAPS,
];

const IBLOCKS = [Type.IBlock, Type.IWall, Type.IDoor]; // 29..31

export const KROZ = [
  // 48..51
  Type.K,
  Type.R,
  Type.O,
  Type.Z,
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
  Type.TTree,
];

export const ROPE_DROP = [
  Type.DropRope,
  Type.DropRope2,
  Type.DropRope3,
  Type.DropRope4,
  Type.DropRope5,
]; // 76..80

export const BOMBABLES = [
  ...MOBS,
  Type.Block,
  ...IBLOCKS,
  Type.ZBlock,
  Type.GBlock,
  Type.MBlock,
  ...TBLOCKS,
  Type.Door,
  ...TRAPS,
  Type.Forest,
  Type.Quake,
  Type.Stop,
  Type.Create,
  Type.Generator,
  Type.Chance,
  ...KROZ,
];

export const ROCKABLES = [
  Type.Floor,
  ...MOBS,
  ...COLLECTABLES,
  ...SPELLS,
  ...TRAPS,
  Type.Stop,
];

export const VISUAL_TELEPORTABLES = [
  Type.Floor,
  Type.Stop,
  ...ITRAPS,
  Type.ShowGems,
  Type.BlockSpell,
  Type.WallVanish,
  ...CWALLS,
  ...CSPELLS,
  ...TBLOCKS,
];

export const TRIGGERABLES = [
  Type.Floor,
  Type.Stop,
  ...ITRAPS,
  Type.ShowGems,
  Type.WallVanish,
  ...TBLOCKS,
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
  ...ITRAPS,
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
  ...ROPE_DROP,
  Type.ShootRight,
  Type.ShootLeft,
];

export const ROCK_CLIFFABLES = [Type.Stairs, Type.Pit];

export const TUNNELABLES = [Type.Floor, Type.Stop, ...ITRAPS, ...CWALLS];

export const SPEAR_BLOCKS = [
  Type.Block,
  Type.Stairs,
  Type.Door,
  Type.Wall,
  Type.Lava,
  Type.Tunnel,
  Type.IDoor,
  Type.Generator,
  Type.MBlock,
  Type.Tablet,
  Type.ZBlock,
  Type.Statue,
  ...OWALLS,
  Type.GBlock,
  Type.Rock,
  Type.EWall,
  Type.Amulet,
];

export const SPEAR_IGNORE = [
  Type.Floor,
  Type.River,
  Type.Pit,
  Type.Quake,
  Type.IBlock,
  Type.IWall,
  Type.Stop,
  Type.Trap2,
  Type.Trap3,
  Type.Trap4,
  Type.Trap5,
  Type.ShowGems,
  Type.BlockSpell,
  Type.WallVanish,
  ...CWALLS,
  ...CSPELLS,
  ...TBLOCKS,
  Type.Rope,
];

// TODO: Remove this, use entity data
function createTileDataForType(type: Type | string) {
  let fg = TypeColor[Type.Floor][0]!;
  let bg = TypeColor[Type.Floor][1]!;
  let ch = FLOOR_CHAR;

  if (typeof type === 'string') {
    // TODO: remove these, add to tileset data
    ch = type.toLocaleUpperCase();
    fg = Color.HighIntensityWhite;
    bg = Color.Brown;
  } else {
    ch = TypeChar[type];
    fg = TypeColor[type]?.[0] ?? TypeColor[Type.Floor][0]!;
    bg = TypeColor[type]?.[1] ?? TypeColor[Type.Floor][1]!;
  }

  fg ??= TypeColor[Type.Floor][0]!;
  bg ??= TypeColor[Type.Floor][1]!;
  ch ??= FLOOR_CHAR;

  return { ch, fg, bg };
}

const MOB_WALKABLE = [
  Type.Floor,
  Type.TBlock,
  Type.TRock,
  Type.TGem,
  Type.TBlind,
  Type.TGold,
  Type.TWhip,
  Type.TTree,
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
  Type.K,
  Type.R,
  Type.O,
  Type.Z,
  Type.ShootRight,
  Type.ShootLeft,
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
  Type.K,
  Type.R,
  Type.O,
  Type.Z,
  Type.ShootRight,
  Type.ShootLeft,
];

const MAGIC_TRIGGERS = [
  Type.SlowTime,
  Type.Invisible,
  Type.SpeedTime,
  Type.Trap,
  Type.Bomb,
  Type.Freeze,
  Type.Quake,
  Type.Trap2,
  Type.Zap,
  Type.Create,
  Type.ShowGems,
  Type.BlockSpell,
  Type.WallVanish,
  Type.K,
  Type.R,
  Type.O,
  Type.Z,
  Type.OSpell1,
  Type.OSpell2,
  Type.OSpell3,
  Type.CSpell1,
  Type.CSpell2,
  Type.CSpell3,
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
  Type.Trap13,
  Type.TBlock,
  Type.TRock,
  Type.TGem,
  Type.TBlind,
  Type.TWhip,
  Type.TGold,
  Type.TTree,
  Type.ShootRight,
  Type.ShootLeft,
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
) {
  const type = TileIDToType[tileId] ?? tileIdToChar(tileId) ?? 0;
  const entity = new Entity(type);

  const tileDefinition = getTileDefinition(tileId);
  if (tileDefinition && tileDefinition.properties) {
    addComponentsToEntity(entity, ensureObject(tileDefinition.properties));
  } else {
    addComponentsToEntity(entity, properties || {});
  }

  if (entity.has(isPlayer) || entity.has(isMobile)) {
    entity.add(new Position({ x, y }));
  }

  return entity;
}

function addComponentsToEntity(
  entity: Entity,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>,
) {
  const type = entity.type as Type;

  // TODO: Shoudlo be able to remove this by adding to tiles set
  if (typeof type === 'string') {
    entity.add(new Renderable(createTileDataForType(type)));
  }

  if (properties.isPlayer) {
    entity.add(isPlayer);
  }

  if (properties.isMobile) {
    entity.add(isMobile);

    if (type === Type.Fast || type === Type.Medium || type === Type.Slow) {
      entity
        .add(new Eats(MOB_EATS))
        .add(
          new DestroyedBy([Type.Block, Type.MBlock, Type.ZBlock, Type.GBlock]),
        );

      if (type === Type.Slow) {
        entity.add(new AnimatedWalking('AÄ'));
      } else if (type === Type.Medium) {
        entity.add(new AnimatedWalking('öÖ'));
      }
    }
  }

  if (properties.doesFollowsPlayer) {
    entity.add(doesFollowsPlayer);
  }

  if (properties.isGenerator) {
    entity.add(isGenerator);
  }

  if (properties.isSecreted) {
    entity.add(isSecreted);
  }

  if (MOB_WALKABLE.includes(type as Type)) {
    entity.add(new Walkable([Type.Fast, Type.Medium, Type.Slow, Type.Player]));
  }
  if (CWALLS.includes(type as Type)) {
    entity.add(new Walkable([Type.Player]));
  }
  if (MAGIC_TRIGGERS.includes(type as Type)) {
    entity.add(new MagicTrigger(type as Type));
  }

  if ('ChanceOdds' in properties) {
    const odds = properties['ChanceOdds' as keyof typeof properties] ?? 0;
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
        new Walkable([
          Type.Fast,
          Type.Medium,
          Type.Slow,
          Type.MBlock,
          Type.Player,
        ]),
      );
      break;
    case Type.Stop:
      entity.add(new Walkable([Type.Player]));
      break;
    case Type.Chest:
      entity.add(
        new Collectible({
          whips: RNG.getUniformInt(2, 5),
          gems: RNG.getUniformInt(5, world.game.difficulty + 2),
        }),
      );
      break;
    case Type.Chance:
      entity.add(new Collectible({ gems: RNG.getUniformInt(14, 18) }));
      break;
  }

  if ('Attacks' in properties) {
    entity.add(
      new AttacksPlayer(properties['Attacks' as keyof typeof properties]),
    );
  }

  if ('Tile' in properties) {
    const tile = properties['Tile' as keyof typeof properties];
    const fg = Color[tile.fg as keyof typeof Color] ?? null; // TODO: alow explict color strings
    const bg = Color[tile.bg as keyof typeof Color] ?? null;
    const ch = tile.ch ?? FLOOR_CHAR;
    entity.add(new Renderable({ fg, bg, ch }));
  }

  if ('Collectible' in properties) {
    entity.add(
      new Collectible(properties['Collectible' as keyof typeof properties]),
    );
  }

  if (properties.isPushable) {
    entity.add(isPushable);
  }

  // TODO:
  // isPushable
  // Message
}

export function getTileIdFromGID(gid: number): number {
  if (!gid) return 0;
  return (+gid % 256) - 1;
}
