import * as screen from './screen';
import * as sound from './sound';
import * as effects from './effects';
import * as world from './world';
import * as tiles from './tiles';
import * as levels from './levels';
import * as events from './events';
import * as maps from './maps';

import type { Entity } from '../classes/entity';
import { Position } from '../classes/components';
import { DEBUG } from '../constants/constants';
import { Type } from '../constants/types';

interface EffectsParams {
  who: Entity;
  what: Entity;
  x: number;
  y: number;
  args: string[];
}

type EffectFn = (o: EffectsParams) => Promise<void> | void;

export async function processEffect(
  message: string | undefined,
  options: Partial<EffectsParams> = {}
) {
  if (!message) return;
  if (typeof message !== 'string') return;

  const lines = message.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('##')) {
      await triggerEffect(line.slice(2), options);
    } else if (line.startsWith('@@')) {
      await triggerSound(line.slice(2));
    } else if (!line.startsWith(`''`)) {
      await screen.flashMessage(line);
    }
  }
}

export function validateScript(message: string | undefined) {
  if (!message) return;
  if (typeof message !== 'string')
    throw new Error('Invalid script: ' + message);

  const lines = message.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('##')) {
      const argv = line.slice(2).split(' ');
      const trigger = argv.shift()!;
      if (!EffectMap[trigger as keyof typeof EffectMap]) {
        throw new Error('Unknown effect: ' + trigger);
      }
    } else if (line.startsWith('@@')) {
      const trigger = line.slice(2);
      if (!soundMap[trigger as keyof typeof soundMap]) {
        throw new Error('Unknown sound: ' + trigger);
      }
    }
  }
}

/** # Effects */
const EffectMap: Record<string, EffectFn> = {
  /** ## `##BECOME A`
   * Changes the triggered item to the specified type.
   */
  BECOME: ({ x, y, args }) => effects.become(tiles.getType(args[0])!, x, y),
  /** ## `##CHANGE A B`
   * Changes every specified item with type A to type B.
   */
  CHANGE: ({ args }) =>
    effects.change(tiles.getType(args[0])!, tiles.getType(args[1])!),
  /**
   * ## `##SHUFFLE A B`
   * Randomly shuffles all tiles of type A to type B.
   */
  SHUFFLE: ({ args }) =>
    effects.shuffle(tiles.getType(args[0])!, tiles.getType(args[1])!),
  /** ## `##HIDE A`
   * Hides all tiles of the specified type.
   */
  HIDE: ({ args }) => effects.hideType(tiles.getType(args[0])!),
  /** ## `##SHOW A`
   * Shows all tiles of the specified type.
   */
  SHOW: ({ args }) => effects.showType(tiles.getType(args[0])!),
  /** ## `GIVE A N`
   * Gives the player N of the specified item.
   */
  GIVE: ({ args }) => effects.give(tiles.getType(args[0])!, +args[1]),
  /** ## `TAKE A N`
   * Takes N of the specified item from the player.
   */
  TAKE: ({ args }) => effects.give(tiles.getType(args[0])!, -args[1]),
  CHAR: ({ args }) =>
    effects.updateTilesByType(tiles.getType(args[0])!, { ch: args[1] }),
  FG: ({ args }) =>
    effects.updateTilesByType(tiles.getType(args[0])!, { fg: args[1] }),
  BG: ({ args }) =>
    effects.updateTilesByType(tiles.getType(args[0])!, { bg: args[1] }),
  setTile: async ({ args }) => {
    await effects.updateTilesByType(tiles.getType(args[0])!, {
      ch: args[1],
      fg: +args[2],
      bg: +args[3]
    });
    screen.renderPlayfield();
  },

  /** ## `##GEMS`
   * Gives the player 50 gems.
   */
  GEMS: () => effects.give(Type.Gem, 50),

  /**
   * ## `##KEYS`
   * Gives the player 5 keys.
   */
  KEYS: () => effects.give(Type.Key, 5),

  /**
   * ## `##ZAP`
   * Replaces the tiles directly north, south, east, and west of the player with empties.
   */
  ZAP: ({ x, y }) => {
    effects.become(Type.Floor, x + 1, y);
    effects.become(Type.Floor, x - 1, y);
    effects.become(Type.Floor, x, y + 1);
    effects.become(Type.Floor, x, y - 1);
  },

  RNDGEN: ({ args }) =>
    effects.generate(tiles.getType(args[0]) || Type.Floor, +(args[1] ?? 1)),

  Bomb: ({ x, y }) => effects.bomb(x, y),
  Quake: effects.quakeTrap,
  TeleportTrap: ({ who }) => effects.teleport(who!), // Rename
  ZapTrap: effects.zapTrap,
  CreateTrap: effects.createTrap,
  ShowGems: effects.showGemsSpell,
  BlockSpell: ({ what, args }) =>
    effects.blockSpell(tiles.getType(args[0]) || Type.ZBlock, what.type),
  WallVanish: effects.wallVanish,
  KROZ: ({ what }) => effects.krozBonus(what.type as Type),
  OSpell: ({ what }) => effects.triggerOSpell(what.type as Type),
  CSpell: ({ what }) => effects.triggerCSpell(what.type as Type),
  TTrigger: ({ x, y, what, args }) =>
    effects.tTrigger(x, y, tiles.getType(args[0]) || what.type),
  /**
   * ## `##Shoot N`
   * Shoots a spear in the specified direction.
   */
  Shoot: ({ x, y, args }) => effects.shoot(x, y, +args[0]),
  SlowTime: effects.slowTimeSpell,
  SpeedTime: effects.speedTimeSpell,
  Invisible: ({ who }) => effects.invisibleSpell(who),
  Freeze: effects.freezeSpell,
  /** ## `##HideLevel`
   * Hides all tiles except the player.
   */
  HideLevel: effects.hideLevel,
  ShowIWalls: effects.showIWalls,
  MagicSwap: ({ args }) =>
    effects.magicSwap(tiles.getType(args[0])!, tiles.getType(args[1])!),
  DisguiseFast: effects.disguiseFast,
  FlashEntity: ({ who }) => effects.flashEntity(who),
  PitFall: effects.pitFall,
  Tunnel: ({ who, x, y }) => effects.tunnel(who, x, y),
  /** `##EvapoRate N`
   * Sets the evaporation rate for the level.
   */
  EvapoRate: ({ args }) => {
    world.levelState.evapoRate = +args[0];
  },
  /** ## `##LavaRate N`
   * Sets the lava rate for the level.
   */
  LavaRate: ({ args }) => {
    world.levelState.lavaFlow = true;
    world.levelState.lavaRate = +args[0];
  },
  /** ## `##TreeRate N`
   * Sets the tree rate for the level.
   */
  TreeRate: ({ args }) => {
    world.levelState.treeRate = +args[0];
  },
  /** ## `##MagicEWalls`
   * Enables magic walls for the level
   */
  MagicEWalls: () => {
    world.levelState.magicEWalls = true;
  },
  BridgeCaster: ({ x, y, args }) =>
    effects.bridgeCaster(x, y, +args[0], +args[1]),
  NEXTLEVEL: async () => {
    await levels.nextLevel();
  },
  CHANGELEVEL: async ({ args }) => {
    await levels.loadLevel(+args[0] - 1); // Levels are 1-indexed
  },
  CHANGEGAME: async ({ args }) => {
    events.gameStart.dispatch(args[0]);
  },
  openSourceScreen: async () => await screen.openSourceScreen(),
  REFRESH: async () => screen.fullRender(),
  DIE: async ({ who }) => await world.kill(who),
  TEST: addRandom,
  ellerMaze: async ({ args }) =>
    maps.ellerMaze(tiles.getType(args[0]) || Type.Wall),
  cellular: async ({ args }) =>
    maps.cellular(tiles.getType(args[0]) || Type.Wall),
  rogue: async ({ args }) => maps.rogue(tiles.getType(args[0]) || Type.Wall),
  bsp: async ({ args }) => maps.bsp(tiles.getType(args[0]) || Type.Wall),
  brogue: async ({ args }) => maps.brogue(tiles.getType(args[0]) || Type.Wall)
};

async function addRandom() {
  const x0 = 7;
  const y0 = 3;

  for (let i = 0; i < 6; i++) {
    const y = 4 * i + y0;

    for (let j = 0; j < 8; j++) {
      const x = 8 * j + x0 + 4 * (i % 2) - 4;

      for (let d = -2; d <= 2; d++) {
        replace(x + d, y);
        replace(x, y + d);
      }

      let dx = 0;
      let dy = 0;

      if (Math.random() < 0.5) {
        dx = 1 - 2 * Math.floor(Math.random() * 2);
      } else {
        dy = 1 - 2 * Math.floor(Math.random() * 2);
      }

      for (let k = 0; k < 5; k++) {
        replace(x + k * dx, y + k * dy);
      }
    }
  }

  function replace(x: number, y: number) {
    if (world.levelState.map.getType(x, y) === Type.Floor) {
      effects.become(Type.Wall, x, y);
    }
  }
}

// TODO:
// #ENDGAME
// #CHAR

async function triggerEffect(
  trigger: string,
  options: Partial<EffectsParams> = {}
) {
  options.args = trigger.split(' ');
  trigger = options.args.shift()! as keyof typeof EffectMap;
  const fn = EffectMap[trigger];
  if (fn) {
    options.who ??= world.levelState.player;
    options.x ??= options.who?.get(Position)?.x ?? 0;
    options.y ??= options.who?.get(Position)?.y ?? 0;
    await fn(options as EffectsParams);
    return;
  }
  if (DEBUG) {
    throw new Error('Unknown effect: ' + trigger);
  } else {
    console.warn('Unknown effect:', trigger);
  }
}

const soundMap = {
  Amulet: sound.amulet,
  SecretMessage: sound.secretMessage,
  WhipHit: sound.whipHit,
  WhipBreak: sound.whipBreak,
  WhipBreakRock: sound.whipBreakRock,
  BlockedWall: sound.blockedWall,
  Blocked: sound.blocked,
  StaticNoise: sound.staticNoise
};

export async function triggerSound(t: string) {
  if (soundMap[t as keyof typeof soundMap]) {
    return await soundMap[t as keyof typeof soundMap]();
  }
  console.warn('No sound for trigger:', t);
}
