import * as world from './world';
import * as sound from './sound';
import * as screen from './screen';
import * as player from './player-system';
import * as tiles from './tiles';
import * as display from './display';
import * as mobs from './mobs-system';
import * as colors from './colors';

import {
  createEntityOfType,
  MOBS,
  ROCK_CLIFFABLES,
  ROCK_CRUSHABLES,
  ROCK_MOVEABLES,
  ROCKABLES,
  SPEAR_BLOCKS,
  SPEAR_IGNORE,
  TRIGGERABLES,
  TUNNELABLES,
  Type,
  VISUAL_TELEPORTABLES
} from './tiles';
import {
  Breakable,
  isBombable,
  isImpervious,
  isInvisible,
  isMob,
  isPlayer,
  isSecreted,
  Position,
  Renderable
} from '../classes/components';
import {
  DEBUG,
  TIME_SCALE,
  XBot,
  XMax,
  XTop,
  YBot,
  YMax,
  YTop
} from '../data/constants';
import { RNG } from 'rot-js';
import { delay } from '../utils/utils';
import { Color, ColorCodes } from './colors';
import { Entity } from '../classes/entity';

export const enum Timer { // TODO: Eliminate this, use type
  SlowTime = 4,
  Invisible = 5,
  SpeedTime = 6,
  FreezeTime = 7,
  StatueGemDrain = 9
}

const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * TIME_SCALE,
  [Timer.Invisible]: 75 * TIME_SCALE,
  [Timer.SpeedTime]: 80 * TIME_SCALE,
  [Timer.FreezeTime]: 55 * TIME_SCALE
};

async function hideType(type: Type) {
  await world.level.map.forEach((_x, _y, e) => {
    if (e?.type === type) {
      e.add(isInvisible);
    }
  });
}

export async function updateTilesByType(
  type: Type,
  update: Partial<Renderable>
) {
  await world.level.map.forEach((_x, _y, e) => {
    if (e?.type === type) {
      if (e.has(Renderable)) {
        const t = e.get(Renderable)!;
        Object.assign(t, update);
      } else {
        e.add(new Renderable(update));
      }
    }
  });
}

async function shoot(x: number, y: number, dx: number) {
  x += dx;
  while (x >= 0 && x <= XMax) {
    const e = world.level.map.get(x, y)!;
    if (
      typeof e.type !== 'number' ||
      SPEAR_BLOCKS.includes(e.type) ||
      e?.has(isImpervious)
    ) {
      // These objects stop the Spear
      break;
    }

    sound.play(x + 30, 10, 100);
    for (let b = 1; b < 6; b++) {
      screen.drawOver(x, y, '─', RNG.getUniformInt(0, 16));
      await delay(1);
    }

    if (!SPEAR_IGNORE.includes(e.type as Type)) {
      // These objects are ignored
      await sound.spearHit();
      if (
        e.type === Type.Slow ||
        e.type === Type.Medium ||
        e.type === Type.Fast
      ) {
        await world.killAt(x, y);
      }
      world.setTypeAt(x, y, Type.Floor);
    }

    screen.drawEntityAt(x, y);
    x += dx;
  }
  screen.renderPlayfield();
}

async function bomb(x: number, y: number) {
  sound.bombFuse();

  let d = 0;
  for (; d <= 4; ++d) {
    sound.play(100 - (d * 10) / 4, 4 * 10, 100);

    const x1 = Math.max(x - d, 0);
    const x2 = Math.min(x + d, XMax);
    const y1 = Math.max(y - d, 0);
    const y2 = Math.min(y + d, YMax);

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        screen.drawOver(x, y, '█', colors.getColor(Color.LightRed, 0.5));
        const e = world.level.map.get(x, y);
        if (e?.has(isBombable)) {
          if (e.has(isMob)) {
            world.addScore(e!.type as Type);
            world.killAt(x, y);
          }
        }
      }
    }
    await sound.bomb();
  }
  await delay(100);

  d = 4;
  const x1 = Math.max(x - d, XBot);
  const x2 = Math.min(x + d, XTop);
  const y1 = Math.max(y - d, YBot);
  const y2 = Math.min(y + d, YTop);

  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      const e = world.level.map.get(x, y);
      if (e?.has(isBombable)) {
        world.setTypeAt(x, y, Type.Floor);
      }
    }
  }
  screen.renderPlayfield();
}

async function quakeTrap() {
  await sound.quakeTrigger();

  await delay(50);
  for (let i = 0; i < 50; i++) {
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (ROCKABLES.includes(block as number)) {
        world.setTypeAt(x, y, Type.Rock);
        screen.drawEntityAt(x, y);
        break;
      }
    } while (Math.random() > 0.01);

    await sound.quakeRockFall();
  }

  await sound.quakeDone();
}

async function zapTrap() {
  let t = 0;
  let k = 0;
  while (t < 500 && k < 40) {
    t++;
    const n = RNG.getUniformInt(0, world.level.entities.length);
    const e = world.level.entities[n];
    if (!e) continue;
    const p = e.get(Position)!;
    if (p.x === -1 || p.y === -1) continue; // dead
    if (e.type !== Type.Slow && e.type !== Type.Medium && e.type !== Type.Fast)
      continue;
    await world.killAt(p.x, p.y);
    await delay(20);
    k++;
  }

  world.stats.score += Math.floor(k / 3 + 2);
  screen.renderPlayfield();
  screen.renderStats();
}

async function createTrap() {
  const SNum = world.level.entities.reduce((acc, e) => {
    if (e.type === Type.Slow) return acc + 1;
    return acc;
  }, 0);
  if (SNum < 945) {
    await world.generateCreatures(45);
  }
}

async function showGemsSpell() {
  for (let i = 0; i < world.game.difficulty * 2 + 5; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (block === Type.Floor) {
        done = true;
        world.setTypeAt(x, y, Type.Gem);
        screen.drawEntityAt(x, y);
        await sound.showGem();
        await delay(90);
      }
    } while (!done && Math.random() > 0.01);
  }
}

async function blockSpell(block: Type | string, spell: Type | string) {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === block) {
        sound.blockSpell();
        for (let i = 20; i > 0; i--) {
          screen.drawAt(
            x,
            y,
            tiles.common.BLOCK_CHAR,
            RNG.getUniformInt(0, 15),
            0
          );
        }
        await delay(1);
        world.setTypeAt(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
      } else if (world.level.map.getType(x, y) === spell) {
        world.setTypeAt(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function krozBonus(block: Type) {
  if (block === Type.K && world.level.bonus === 0) world.level.bonus = 1;
  if (block === Type.R && world.level.bonus === 1) world.level.bonus = 2;
  if (block === Type.O && world.level.bonus === 2) world.level.bonus = 3;
  if (block === Type.Z && world.level.bonus === 3) {
    await sound.bonusSound();
    await screen.flashMessage('Super Kroz Bonus -- 10,000 points!');
    world.addScore(block);
  }
}

async function triggerOSpell(block: Type) {
  let s = Type.OWall1;
  if (block === Type.OSpell2) s = Type.OWall2;
  if (block === Type.OSpell3) s = Type.OWall3;

  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      const block = world.level.map.getType(x, y);
      if (block === s) {
        for (let i = 60; i > 0; i--) {
          screen.drawAt(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
            0
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        world.setTypeAt(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function triggerCSpell(block: Type) {
  const s = block - Type.CSpell1 + Type.CWall1;

  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      const block = world.level.map.getType(x, y);
      if (block === s) {
        for (let i = 60; i > 0; i--) {
          screen.drawAt(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
            0
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        world.setTypeAt(x, y, Type.Wall);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function wallVanish() {
  for (let i = 0; i < 75; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const b = world.level.map.getType(x, y);
      if (b === Type.Block) {
        // TODO: sound
        world.setTypeAt(x, y, Type.IBlock); // Replace with adding isInvisible component?
        screen.drawEntityAt(x, y);
        done = true;
      }
      if (b === Type.Wall) {
        // TODO: sound
        world.setTypeAt(x, y, Type.IWall); // Replace with adding isInvisible component?
        screen.drawEntityAt(x, y);
        done = true;
      }
    } while (!done && RNG.getUniformInt(0, 200) !== 0);
  }
}

export async function teleport(e: Entity) {
  await flashEntity(e);

  const p = e.get(Position)!;

  world.setTypeAt(p.x, p.y, Type.Floor);
  screen.drawEntityAt(p.x, p.y);

  // Animation
  const startTime = Date.now();
  for (let i = 0; i < 700; i++) {
    const x = RNG.getUniformInt(0, XMax);
    const y = RNG.getUniformInt(0, YMax);
    const block = world.level.map.getType(x, y);
    if (VISUAL_TELEPORTABLES.indexOf(block as Type) > -1) {
      screen.drawAt(
        x,
        y,
        '☺',
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 7)
      );
      await sound.teleport();
      screen.drawEntityAt(x, y);
    }
    if (Date.now() - startTime > 1500) break;
  }

  const space = world.level.map.findRandomEmptySpace();
  return moveTo(e, ...space);
}

function moveTo(e: Entity, x: number, y: number) {
  if (e.has(isMob)) {
    mobs.moveTo(e, x, y);
  }
  if (e.has(isPlayer)) {
    player.moveTo(x, y);
  }
}

export async function flashEntity(e: Entity) {
  const p = e.get(Position)!;
  const t = e.get(Renderable)!;

  for (let i = 0; i < 160; i++) {
    if (i % 5 === 0) {
      screen.drawAt(
        p.x,
        p.y,
        t.ch,
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 8)
      );
      await delay();
    }
    sound.play(i / 2, 80, 10);
  }
  screen.renderPlayfield();
}

function change(a: Type | string, b: Type | string) {
  const map = world.level.map;
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      if (map.getType(x, y) === a) {
        map.set(x, y, createEntityOfType(b, x, y));
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function TTrigger(x: number, y: number, block: Type) {
  switch (block) {
    case Type.TBlock:
      block = Type.Block;
      break;
    case Type.TRock:
      block = Type.Rock;
      break;
    case Type.TGem:
      block = Type.Gem;
      break;
    case Type.TBlind:
      block = Type.Invisible;
      break;
    case Type.TWhip:
      block = Type.Whip;
      break;
    case Type.TGold:
      block = Type.Nugget;
      break;
    case Type.TTree:
      block = Type.Tree;
      break;
  }

  for (let b = 0; b < 10; b++) {
    await triggerTrap(false, RNG.getUniformInt(0, 7), RNG.getUniformInt(0, 7));
    await sound.play((b + 25) * b * 2, 20, 10);
  }

  return triggerTrap(true);

  async function triggerTrap(place: boolean, fg?: number, bg?: number) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const b = world.level.map.getType(x + dx, y + dy);
        if (TRIGGERABLES.includes(b as Type)) {
          if (place) {
            world.setTypeAt(x + dx, y + dy, block);
          } else {
            world.setTypeAt(x + dx, y + dy, block);
            const e = world.level.map.get(x + dx, y + dy);
            if (!e) continue;
            const r = e?.get(Renderable);
            if (!r) continue;
            screen.drawAt(x + dx, y + dy, r.ch, fg!, bg!);
          }
        }
        await delay(5);
      }
    }
  }
}

async function disguiseFast() {
  await updateTilesByType(Type.Fast, { ch: '☺' });
  screen.renderPlayfield();
}

async function pitsToRock() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.Pit) {
        await sound.play(x * y, 50, 10);
        world.setTypeAt(x, y, Type.Rock);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function wallsToGold() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.CWall1) {
        await sound.play(x * y, 50, 10);
        world.setTypeAt(x, y, Type.Nugget);
        // ArtColor??
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function riverToBlock() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.River) {
        await sound.play(x * y, 50, 10);
        world.setTypeAt(x, y, Type.Block);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function riverToGold() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.River) {
        await sound.play(x * y, 50, 10);
        world.setTypeAt(x, y, Type.Nugget);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function showIWalls() {
  await world.level.map.forEach(async (x, y, e) => {
    if (e.type === Type.IWall) {
      sound.play(x * y, 1, 10);
      if (y === 0) await delay(1);
      world.setTypeAt(x, y, Type.OWall3);
      screen.drawEntityAt(x, y);
    }
  });
}

function hideLevel() {
  for (let x = 0; x < world.level.map.width; x++) {
    for (let y = 0; y < world.level.map.height; y++) {
      const e = world.level.map.get(x, y)!;
      if (e && !e.has(isPlayer)) {
        e.add(isInvisible);
      }
    }
  }
}

function slowTimeSpell() {
  world.level.T[Timer.SpeedTime] = 0;
  world.level.T[Timer.FreezeTime] = 0;
  world.level.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime];
}

function speedTimeSpell() {
  world.level.T[Timer.SlowTime] = 0;
  world.level.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime];
}

function invisibleSpell(e: Entity) {
  // TODO: Move timer to component
  world.level.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
  e.add(isInvisible);

  const p = e.get(Position)!;
  screen.drawEntityAt(p.x, p.y);
}

function freezeSpell() {
  world.level.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
}

async function pitFall() {
  if (world.game.difficulty > 9) return;

  for (let x = 0; x < world.level.map.width; x++) {
    for (let y = 0; y < world.level.map.height; y++) {
      const c = x >= 31 && x <= 35 ? Color.Black : Color.Brown;
      screen.drawAt(x, y, tiles.common.FLOOR_CHAR, c, c);
    }
  }

  let x = 4000;
  for (let i = 1; i <= 16; i++) {
    if (i === 8) {
      display.drawText(
        38,
        12,
        '<--- HALF WAY!!!',
        Color.HighIntensityWhite,
        Color.Brown
      );
    } else if (i === 9) {
      display.drawText(
        38,
        12,
        tiles.common.FLOOR_CHAR.repeat(16),
        Color.HighIntensityWhite,
        Color.Brown
      );
    }

    for (let y = 0; y <= YMax; y++) {
      screen.drawAt(
        33,
        y,
        tiles.common.PLAYER_CHAR,
        tiles.common.PLAYER_FG,
        tiles.common.PLAYER_BG
      );
      await sound.play((x -= 8), 52 - 3 * i, 30);
      screen.drawAt(
        33,
        y,
        tiles.common.FLOOR_CHAR,
        tiles.common.FLOOR_FG,
        tiles.common.FLOOR_BG
      );
    }
  }

  screen.drawAt(33, YMax, '_', tiles.common.PLAYER_FG, Color.Black);
  await sound.splat();

  display.drawText(XTop / 2 - 3, 0, '* SPLAT!! *', Color.Black, Color.Red);
  await screen.flashMessage('Press any key to continue.');
  world.stats.gems = -1; // dead
  world.game.done = true;
}

function touchLava() {
  world.stats.gems -= 10;
}

function touchEWall() {
  world.stats.gems--;
}

function become(type: Type, x: number, y: number) {
  world.setTypeAt(x, y, type);
  screen.drawEntityAt(x, y);
}

async function tunnel(e: Entity, x: number, y: number) {
  await delay(350);
  await sound.footStep();
  await delay(500);
  world.setTypeAt(x, y, Type.Tunnel);
  screen.drawEntityAt(x, y);

  // Find a random tunnel
  let tx = x;
  let ty = y;
  for (let i = 0; i < 10000; i++) {
    const a = RNG.getUniformInt(0, XMax);
    const b = RNG.getUniformInt(0, YMax);
    const t = world.level.map.getType(a, b) ?? Type.Floor;
    if (t === Type.Tunnel && (a !== tx || b !== ty)) {
      tx = a;
      ty = b;
      moveTo(e, tx, ty);
      break;
    }
  }

  world.setTypeAt(x, y, Type.Tunnel);
  screen.drawEntityAt(x, y);

  // Find a random empty space near exit
  let ex = e.get(Position)!.x;
  let ey = e.get(Position)!.y;
  for (let i = 0; i < 100; i++) {
    const a = RNG.getUniformInt(-1, 1);
    const b = RNG.getUniformInt(-1, 1);
    if (tx + a < 0 || tx + a > XMax || ty + b < 0 || ty + b > YMax) continue;
    const e = world.level.map.getType(tx + a, ty + b) ?? Type.Floor;
    if (TUNNELABLES.includes(e as Type)) {
      ex = tx + a;
      ey = ty + b;
      break;
    }
  }
  moveTo(e, ex, ey);
  world.setTypeAt(tx, ty, Type.Tunnel);
  screen.drawEntityAt(tx, ty);
}

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

  if (typeof message === 'string') {
    const lines = message.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('##')) {
        await triggerEffect(line.slice(2), options);
      } else if (line.startsWith('@@')) {
        await sound.triggerSound(line.slice(2));
      } else {
        await screen.flashMessage(line);
      }
    }
  }
}

/** # Effects */
const EffectMap: Record<string, EffectFn> = {
  /** ## `##BECOME A`
   * Changes the triggered item to the specified type.
   */
  BECOME: ({ x, y, args }) => become(tiles.getType(args[0]) as Type, x, y),
  /** ## `##CHANGE A B`
   * Changes every specified item with type A to type B.
   */
  CHANGE: ({ args }) =>
    change(tiles.getType(args[0]) as Type, tiles.getType(args[1]) as Type),
  /** ## `##HideType A`
   * Hides all tiles of the specified type.
   */
  HideType: ({ args }) => hideType(tiles.getType(args[0]) as Type),
  Bomb: ({ x, y }) => bomb(x, y),
  Quake: quakeTrap,
  Trap: ({ who }) => teleport(who!),
  Zap: zapTrap,
  Create: createTrap,
  ShowGems: showGemsSpell,
  BlockSpell: ({ what, args }) =>
    blockSpell(tiles.getType(args[0]) || Type.ZBlock, what.type),
  WallVanish: wallVanish,
  KROZ: ({ what }) => krozBonus(what.type as Type),
  OSpell: ({ what }) => triggerOSpell(what.type as Type),
  CSpell: ({ what }) => triggerCSpell(what.type as Type),
  // TODO: Replace with ##CHANGE Trap3 Floor?
  FTrap: ({ what }) => change(what.type as Type, Type.Floor),
  TTrigger: ({ x, y, what, args }) =>
    TTrigger(x, y, (tiles.getType(args[0]) as Type) || (what.type as Type)),
  /**
   * ## `##Shoot N`
   * Shoots a spear in the specified direction.
   */
  Shoot: ({ x, y, args }) => shoot(x, y, +args[0]),
  SlowTime: slowTimeSpell,
  SpeedTime: speedTimeSpell,
  Invisible: ({ who }) => invisibleSpell(who),
  Freeze: freezeSpell,
  /** ## `##HideLevel`
   * Hides all tiles except the player.
   */
  HideLevel: hideLevel,
  ShowIWalls: showIWalls,
  RiverToGold: riverToGold,
  RiverToBlock: riverToBlock,
  WallsToGold: wallsToGold,
  PitsToRock: pitsToRock,
  DisguiseFast: disguiseFast,
  FlashEntity: ({ who }) => flashEntity(who),
  PitFall: pitFall,
  TouchLava: touchLava,
  TouchEWall: touchEWall,
  Tunnel: ({ who, x, y }) => tunnel(who, x, y),
  /** `##EvapoRate N`
   * Sets the evaporation rate for the level.
   */
  EvapoRate: ({ args }) => {
    world.level.evapoRate = +args[0];
  },
  /** ## `##LavaRate N`
   * Sets the lava rate for the level.
   */
  LavaRate: ({ args }) => {
    world.level.lavaFlow = true;
    world.level.lavaRate = +args[0];
  },
  /** ## `##TreeRate N`
   * Sets the tree rate for the level.
   */
  TreeRate: ({ args }) => {
    world.level.treeRate = +args[0];
  },
  /** ## `##MagicEWalls`
   * Enables magic walls for the level
   */
  MagicEWalls: () => {
    world.level.magicEWalls = true;
  }
};

// TODO:
// ##GIVE
// ##TAKE
// ##MagicEwalls
// #DIE
// #ENDGAME
// #CHAR

export async function triggerEffect(
  trigger: string,
  options: Partial<EffectsParams> = {}
) {
  options.args = trigger.split(' ');
  trigger = options.args.shift()! as keyof typeof EffectMap;
  const fn = EffectMap[trigger];
  if (fn) {
    options.who ??= world.level.player;
    options.x ??= options.who.get(Position)?.x ?? 0;
    options.y ??= options.who.get(Position)?.y ?? 0;
    await fn(options as EffectsParams);
    return;
  }
  if (DEBUG) {
    throw new Error('Unknown effect: ' + trigger);
  } else {
    console.warn('Unknown effect:', trigger);
  }
}

export async function whip(e: Entity) {
  const p = e.get(Position);
  if (!p) return;

  const PX = p!.x;
  const PY = p!.y;

  sound.whip();
  await hit(PX - 1, PY - 1, '\\');
  await hit(PX - 1, PY, '-');
  await hit(PX - 1, PY + 1, '/');
  await hit(PX, PY + 1, '❘');
  await hit(PX + 1, PY + 1, '\\');
  await hit(PX + 1, PY, '-');
  await hit(PX + 1, PY - 1, '/');
  await hit(PX, PY - 1, '❘');
  screen.renderPlayfield();

  // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
  async function hit(x: number, y: number, ch: string) {
    if (x < 0 || x > XMax || y < 0 || y > YMax) return;

    const entity = world.level.map.get(x, y);
    const thing = entity?.type || Type.Floor;

    screen.drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(1, 15) as Color]);

    if (entity?.has(isSecreted)) {
      entity?.remove(isSecreted);
      screen.drawEntityAt(x, y);
    }

    if (entity?.has(Breakable)) {
      const b = entity.get(Breakable)!;
      const hardness = b.hardness || 0;
      if (hardness * Math.random() < world.stats.whipPower) {
        if (entity.has(isMob)) {
          // Split into killable?
          world.killAt(x, y);
        }
        world.setTypeAt(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
        const hitSound = b.hitSound || 'WhipHit';
        world.addScore(thing as Type);
        if (hitSound) await sound.triggerSound(hitSound);

        switch (thing) {
          case Type.Statue:
            world.level.T[Timer.StatueGemDrain] = -1;
            await screen.flashMessage(
              `You've destroyed the Statue!  Your Gems are now safe.`
            );
            break;
          case Type.Generator:
            world.level.genNum--;
            break;
        }
      } else {
        sound.whipMiss();
      }

      screen.renderStats();
    }

    await delay(10);
  }
}

export async function pushRock(
  pusher: Entity,
  pushable: Entity,
  x: number,
  y: number,
  dx: number,
  dy: number
) {
  let nogo = false;

  const p = pusher.get(Position);
  if (!p) return;

  const tx = p.x + dx * 2;
  const ty = p.y + dy * 2;
  if (tx < 0 || tx > XMax || ty < 0 || ty > YMax) nogo = true;

  if (!nogo) {
    const t = world.level.map.get(tx, ty);
    if (!t) nogo = true;
    const tb = t!.type;

    async function moveRock(kill = false) {
      nogo = false;
      await sound.pushRock();
      if (kill) world.killAt(tx, ty);
      world.level.map.set(tx, ty, pushable);
      moveTo(pusher, x, y);
      screen.renderPlayfield();
    }

    // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST5.MOV#L1366
    if (ROCK_MOVEABLES.includes(tb as number)) {
      await moveRock();
    } else if (ROCK_CRUSHABLES.includes(tb as number)) {
      await moveRock();
      await sound.grab();
    } else if (MOBS.includes(tb as number)) {
      await moveRock(true);
      world.addScore(tb as Type);
      await sound.rockCrushMob();
    } else if (tb === Type.EWall) {
      await moveRock();
      world.setTypeAt(tx, ty, Type.Floor);
      sound.rockVaporized();
      await screen.flashMessage('The Boulder is vaporized!'); // TODO: show once?, change for pushed type
    } else if (ROCK_CLIFFABLES.includes(tb as number)) {
      nogo = false;
      await sound.pushRock();
      moveTo(pusher, x, y);
      screen.drawEntityAt(tx, ty, pushable);
      await sound.rockDropped();
      screen.renderPlayfield();
    }
  }

  if (nogo) {
    await sound.blocked();
  }
}
