import * as world from './world';
import * as sound from './sound';
import * as screen from './screen';
import * as player from '../systems/player-system';
import * as tiles from './tiles';
import * as display from './display';
import * as mobs from '../systems/mobs-system';
import * as colors from './colors';
import * as script from './scripts';

import {
  Breakable,
  Energy,
  isBombable,
  isImperviousToSpears,
  isInvisible,
  isMob,
  isPlayer,
  isSecreted,
  Position,
  Pushable,
  Renderable,
  RenderableData
} from '../classes/components';
import {
  TIME_SCALE,
  XBot,
  XMax,
  XTop,
  YBot,
  YMax,
  YTop
} from '../constants/constants';
import { RNG } from 'rot-js';
import { delay } from '../utils/utils';
import { Color, ColorCodes } from './colors';
import { Entity } from '../classes/entity';
import {
  MOBS,
  ROCK_CLIFFABLES,
  ROCK_CRUSHABLES,
  ROCK_MOVEABLES,
  ROCKABLES,
  TRIGGERABLES,
  TUNNELABLES,
  Type
} from '../constants/types';

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

export function hideType(type: Type | string) {
  world.levelState.map.forEach((e, x, y) => {
    if (e?.type === type) {
      e.add(isInvisible);
      screen.drawEntityAt(x, y);
    }
  });
}

export function showType(type: Type | string) {
  world.levelState.map.forEach((e, x, y) => {
    if (e?.type === type) {
      e.remove(isInvisible);
      screen.drawEntityAt(x, y);
    }
  });
}

export async function updateTilesByType(
  type: Type,
  update: Partial<RenderableData>
) {
  world.levelState.map.forEach((e) => {
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

export async function shoot(x: number, y: number, dx: number) {
  x += dx;
  while (x >= 0 && x <= XMax) {
    const e = world.levelState.map.get(x, y)!;
    if (
      typeof e.type !== 'number' ||
      e?.has(isImperviousToSpears) // TODO: OnSpear ??
    ) {
      // These objects stop the Spear
      break;
    }

    sound.play(x + 30, 10, 100);
    for (let b = 1; b < 6; b++) {
      screen.drawOver(x, y, '─', RNG.getUniformInt(0, 16));
      await delay(1);
    }

    if (e.type === Type.Floor || !e.has(Renderable) || e.has(isInvisible)) {
      // Spears ignore these objects
      screen.drawEntityAt(x, y);
    } else {
      await sound.spearHit();
      if (
        e.type === Type.Slow ||
        e.type === Type.Medium ||
        e.type === Type.Fast
      ) {
        await world.killAt(x, y);
      }
      world.setTypeAt(x, y, Type.Floor);
      screen.drawEntityAt(x, y);
    }

    x += dx;
  }
  screen.renderPlayfield();
}

export async function bomb(x: number, y: number) {
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
        const e = world.levelState.map.get(x, y);
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
      const e = world.levelState.map.get(x, y);
      if (e?.has(isBombable)) {
        // TODO: OnBomb: ##DIE ?
        world.setTypeAt(x, y, Type.Floor);
      }
    }
  }
  screen.renderPlayfield();
}

export async function quakeTrap() {
  await sound.quakeTrigger();

  await delay(50);
  for (let i = 0; i < 50; i++) {
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.levelState.map.getType(x, y);
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

export async function zapTrap() {
  let t = 0;
  let k = 0;
  while (t < 500 && k < 40) {
    t++;
    const n = RNG.getUniformInt(0, world.levelState.entities.length);
    const e = world.levelState.entities[n];
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

export async function createTrap() {
  const SNum = world.levelState.entities.reduce((acc, e) => {
    if (e.type === Type.Slow) return acc + 1;
    return acc;
  }, 0);
  if (SNum < 945) {
    await world.generateCreatures(45);
  }
}

export async function showGemsSpell() {
  for (let i = 0; i < world.gameState.difficulty * 2 + 5; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.levelState.map.getType(x, y);
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

export async function blockSpell(block: Type | string, spell: Type | string) {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.levelState.map.getType(x, y) === block) {
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
      } else if (world.levelState.map.getType(x, y) === spell) {
        world.setTypeAt(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

export async function krozBonus(block: Type) {
  if (block === Type.K && world.levelState.bonus === 0)
    world.levelState.bonus = 1;
  if (block === Type.R && world.levelState.bonus === 1)
    world.levelState.bonus = 2;
  if (block === Type.O && world.levelState.bonus === 2)
    world.levelState.bonus = 3;
  if (block === Type.Z && world.levelState.bonus === 3) {
    await sound.bonusSound();
    await screen.flashMessage('Super Kroz Bonus -- 10,000 points!');
    world.addScore(block);
  }
}

export async function triggerOSpell(block: Type) {
  let s = Type.OWall1;
  if (block === Type.OSpell2) s = Type.OWall2;
  if (block === Type.OSpell3) s = Type.OWall3;

  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      const block = world.levelState.map.getType(x, y);
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

export async function triggerCSpell(block: Type) {
  const s = block - Type.CSpell1 + Type.CWall1;

  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      const block = world.levelState.map.getType(x, y);
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

export async function wallVanish() {
  for (let i = 0; i < 75; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const b = world.levelState.map.getType(x, y);
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
    const block = world.levelState.map.get(x, y)!;
    if (
      block.type === Type.Floor ||
      block?.has(isInvisible) ||
      !block?.has(Renderable)
    ) {
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

  const space = world.levelState.map.findRandomEmptySpace();
  if (!space) return;
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

export function change(a: Type | string, b: Type | string) {
  const map = world.levelState.map;
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      if (map.getType(x, y) === a) {
        map.set(x, y, tiles.createEntityOfType(b, x, y));
        screen.drawEntityAt(x, y);
      }
    }
  }
}

export function shuffle(a: Type | string, b: Type | string) {
  const map = world.levelState.map;
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      if (map.getType(x, y) === a && Math.random() > 0.5) {
        map.set(x, y, tiles.createEntityOfType(b, x, y));
        screen.drawEntityAt(x, y);
      }
    }
  }
}

export async function tTrigger(x: number, y: number, block: Type | string) {
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

        const b = world.levelState.map.getType(x + dx, y + dy);
        if (TRIGGERABLES.includes(b as Type)) {
          if (place) {
            world.setTypeAt(x + dx, y + dy, block);
          } else {
            world.setTypeAt(x + dx, y + dy, block);
            const e = world.levelState.map.get(x + dx, y + dy);
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

export async function disguiseFast() {
  await updateTilesByType(Type.Fast, { ch: '☺' });
  screen.renderPlayfield();
}

// TODO: Use global rate
export async function magicSwap(a: Type | string, b: Type | string) {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.levelState.map.getType(x, y) === a) {
        await sound.play(x * y, 50, 10);
        world.setTypeAt(x, y, b);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

export async function showIWalls() {
  await world.levelState.map.forEachAsync(async (e, x, y) => {
    if (e.type === Type.IWall) {
      sound.play(x * y, 1, 10);
      if (y === 0) await delay(1);
      world.setTypeAt(x, y, Type.OWall3);
      screen.drawEntityAt(x, y);
    }
  });
}

export function hideLevel() {
  for (let x = 0; x < world.levelState.map.width; x++) {
    for (let y = 0; y < world.levelState.map.height; y++) {
      const e = world.levelState.map.get(x, y)!;
      if (e && !e.has(isPlayer)) {
        e.add(isInvisible);
      }
    }
  }
}

export function slowTimeSpell() {
  world.levelState.T[Timer.SpeedTime] = 0;
  world.levelState.T[Timer.FreezeTime] = 0;
  world.levelState.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime];
}

export function speedTimeSpell() {
  world.levelState.T[Timer.SlowTime] = 0;
  world.levelState.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime];
}

export function invisibleSpell(e: Entity) {
  // TODO: Move timer to component
  world.levelState.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
  e.add(isInvisible);

  const p = e.get(Position)!;
  screen.drawEntityAt(p.x, p.y);
}

export function freezeSpell() {
  world.levelState.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
}

export async function pitFall() {
  if (world.gameState.difficulty > 9) return;

  for (let x = 0; x < world.levelState.map.width; x++) {
    for (let y = 0; y < world.levelState.map.height; y++) {
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
  world.gameState.done = true;
}

export function give(type: Type, n: number) {
  switch (type) {
    case Type.Gem:
      world.stats.gems += n;
      break;
    case Type.Whip:
      world.stats.whipPower += n;
      break;
    case Type.Key:
      world.stats.keys += n;
      break;
  }
}

export function become(type: Type | string, x: number, y: number) {
  world.setTypeAt(x, y, type);
  screen.drawEntityAt(x, y);
}

export async function tunnel(e: Entity, x: number, y: number) {
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
    const t = world.levelState.map.getType(a, b) ?? Type.Floor;
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
    const e = world.levelState.map.getType(tx + a, ty + b) ?? Type.Floor;
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

    const entity = world.levelState.map.get(x, y);
    const thing = entity?.type || Type.Floor;

    screen.drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(1, 15) as Color]);

    if (entity?.has(isSecreted)) {
      entity?.remove(isSecreted);
      screen.drawEntityAt(x, y);
    }

    if (entity?.has(Breakable)) {
      const b = entity.get(Breakable)!; // TODO: OnWhip: ##DIE ?
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
        if (hitSound) await script.triggerSound(hitSound);

        switch (thing) {
          case Type.Statue:
            world.levelState.T[Timer.StatueGemDrain] = -1;
            await screen.flashMessage(
              `You've destroyed the Statue!  Your Gems are now safe.`
            );
            break;
          case Type.Generator:
            world.levelState.genNum--;
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

export async function tryPushRock(
  pusher: Entity,
  x: number,
  y: number,
  dx: number,
  dy: number
) {
  let nogo = false;

  const p = pusher.get(Position)!;

  const tx = p.x + dx * 2;
  const ty = p.y + dy * 2;
  if (tx < 0 || tx > XMax || ty < 0 || ty > YMax) nogo = true;

  if (!nogo) {
    const t = world.levelState.map.get(tx, ty);
    if (!t) nogo = true;
    const tb = t!.type;

    if (
      ROCK_MOVEABLES.includes(tb as number) ||
      ROCK_CRUSHABLES.includes(tb as number) ||
      MOBS.includes(tb as number) ||
      tb === Type.EWall ||
      ROCK_CLIFFABLES.includes(tb as number)
    ) {
      nogo = false;
      const pushable = world.levelState.map.get(x, y)?.get(Pushable);
      if (!pushable) return;
      await moveRock(pusher, x, y, tx, ty);
      const e = world.levelState.player.get(Energy)!;
      e.current -= pushable.mass;
    }
  }

  if (nogo) {
    await sound.blocked();
  }
}

// export async function pushRock(pusher: Entity) {
//   const pushing = pusher.get(Pushing)!;
//   if (pushing.inertia > 0) {
//     // await sound.pushRock();
//     pushing.inertia--;
//     return;
//   }

//   // await moveRock(pusher, pushing.x, pushing.y, pushing.tx, pushing.ty);
//   pusher.remove(Pushing);
// }

async function moveRock(
  pusher: Entity,
  x: number,
  y: number,
  tx: number,
  ty: number
) {
  const pushable = world.levelState.map.get(x, y)!;
  const t = world.levelState.map.get(tx, ty);
  const tb = t!.type;

  const mass = pushable.get(Pushable)!.mass;
  if (mass > 1) {
    await sound.moveRock();
  }

  if (MOBS.includes(tb as number)) {
    world.killAt(tx, ty);
  }

  world.levelState.map.set(tx, ty, pushable);
  moveTo(pusher, x, y);
  screen.renderPlayfield();

  if (ROCK_CRUSHABLES.includes(tb as number)) {
    await sound.grab();
  } else if (MOBS.includes(tb as number)) {
    world.addScore(tb as Type);
    await sound.rockCrushMob();
  } else if (tb === Type.EWall) {
    world.setTypeAt(tx, ty, Type.Floor);
    sound.rockVaporized();
    await screen.flashMessage('The Boulder is vaporized!'); // TODO: show once?, change for pushed type
  } else if (ROCK_CLIFFABLES.includes(tb as number)) {
    moveTo(pusher, x, y);
    screen.drawEntityAt(tx, ty, pushable);
    await sound.rockDropped();
    world.levelState.map.set(tx, ty, t!);
  }
  screen.renderPlayfield();
}

export async function bridgeCaster(
  x: number,
  y: number,
  dx: number,
  dy: number
) {
  let xx = x;
  let yy = y;
  while (true) {
    xx += dx;
    yy += dy;
    if (xx < 0 || xx > XMax || yy < 0 || yy > YMax) break;
    const t = world.levelState.map.getType(xx, yy);
    if (t === Type.Pit || t === Type.River || t === Type.Lava) {
      // TODO: Animation and sound
      world.setTypeAt(xx, yy, Type.Floor);
      screen.drawEntityAt(xx, yy);
    } else {
      break;
    }
  }
}

export async function generate(type: Type, n: number = 1) {
  for (let i = 0; i < n; i++) {
    const p = world.levelState.map.findRandomEmptySpace();
    if (!p) break;
    world.levelState.map.set(...p, tiles.createEntityOfType(type, ...p));
  }
  await world.reindexMap();
  screen.renderPlayfield();
}
