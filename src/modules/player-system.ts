import { RNG } from 'rot-js';

import * as controls from './controls.ts';
import * as display from './display.ts';
import * as sound from './sound.ts';
import * as screen from './screen.ts';
import * as world from './world.ts';
import * as levels from './levels.ts';
import * as effects from './effects.ts';
import * as bot from './bot.ts';
import * as tiles from '../data/tiles.ts';

import {
  MOBS,
  ROCK_CLIFFABLES,
  ROCK_CRUSHABLES,
  ROCK_MOVEABLES,
  TUNNELABLES,
  Type,
} from '../data/tiles.ts';
import { DEBUG, XMax, XTop, YMax } from '../data/constants.ts';
import { Action } from './controls.ts';

import { Color } from '../data/colors.ts';
import { clamp, delay } from '../utils/utils.ts';
import { LEVELS } from './levels.ts';

import {
  Attacks,
  Collectible,
  Position,
  isPushable,
  Trigger,
  ChangeLevel,
  isPassable,
  FoundMessage,
} from '../classes/components.ts';
import type { Entity } from '../classes/entity.ts';
import { Difficulty } from './world.ts';

export async function update() {
  await readControls();
  controls.clearActions(); // Clear was pressed actions after player acts
}

async function readControls() {
  if (DEBUG && controls.wasActionDeactivated(Action.SlowerClock)) {
    world.game.clockScale = Math.min(20, world.game.clockScale + 1);
    console.log('Clock Scale:', world.game.clockScale);
    return;
  }

  if (DEBUG && controls.wasActionDeactivated(Action.FasterClock)) {
    world.game.clockScale = Math.max(1, world.game.clockScale - 1);
    console.log('Clock Scale:', world.game.clockScale);
    return;
  }

  // Game Actions
  if (controls.wasActionDeactivated(Action.Pause)) return world.pause();
  if (controls.wasActionDeactivated(Action.Quit)) return world.quit();
  if (controls.wasActionDeactivated(Action.Save)) return world.save();
  if (controls.wasActionDeactivated(Action.Restore)) return world.restore();

  // Debug Actions
  if (controls.wasActionDeactivated(Action.NextLevel))
    return await levels.nextLevel();
  if (controls.wasActionDeactivated(Action.PrevLevel))
    return await levels.prevLevel();

  if (
    world.game.difficulty === Difficulty.Cheat &&
    controls.wasActionDeactivated(Action.NextLevelCheat)
  ) {
    const p = world.level.player.get(Position)!;
    world.level.map.setType(p.x + 1, p.y, Type.Stairs);
    await sound.cheat();
    return;
  }

  if (
    world.game.difficulty === Difficulty.Cheat &&
    controls.wasActionDeactivated(Action.FreeItems)
  ) {
    world.stats.gems = 150;
    world.stats.whips = 99;
    world.stats.teleports = 99;
    world.stats.keys = 9;
    screen.renderStats();
    return;
  }

  // Player Actions
  if (controls.wasActionDeactivated(Action.ResetFound)) {
    world.game.foundSet = new Set();
    await screen.flashMessage('Newly found object descriptions are reset.');
    return;
  }
  if (controls.wasActionDeactivated(Action.HideFound)) {
    world.game.foundSet = true;
    await screen.flashMessage(
      'References to new objects will not be displayed.',
    );
    return;
  }

  // Whip can happen at any time (no return)
  if (controls.wasActionActive(Action.Whip)) {
    if (world.stats.whips < 1) {
      sound.noneSound();
    } else {
      world.stats.whips--;
      await effects.whip();
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (world.stats.teleports < 1) {
      await sound.noneSound();
    } else {
      world.stats.teleports--;
      await effects.teleport();
    }
  }

  // Player Movement
  let dx = 0;
  let dy = 0;

  if (controls.wasActionActive(Action.North)) dy--;
  if (controls.wasActionActive(Action.South)) dy++;
  if (controls.wasActionActive(Action.West)) dx--;
  if (controls.wasActionActive(Action.East)) dx++;

  if (controls.wasActionActive(Action.Southeast)) {
    dx++;
    dy++;
  }
  if (controls.wasActionActive(Action.Southwest)) {
    dx--;
    dy++;
  }
  if (controls.wasActionActive(Action.Northeast)) {
    dx++;
    dy--;
  }
  if (controls.wasActionActive(Action.Northwest)) {
    dx--;
    dy--;
  }

  dx = clamp(dx, -1, 1);
  dy = clamp(dy, -1, 1);

  if (dx !== 0 || dy !== 0) {
    await tryMove(dx, dy);
  }

  if (world.game.bot && !world.game.paused && !world.game.done) {
    await bot.botPlay();
    return;
  }
}

export async function tryMove(dx: number, dy: number) {
  const p = world.level.player.get(Position)!;
  const x = p.x + dx;
  const y = p.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) {
    await sound.staticNoise();
    world.addScore(Type.Border);

    if (world.game.foundSet === true || world.game.foundSet.has(-1)) return;
    world.game.foundSet.add(-1);
    return await screen.flashMessage('An Electrified Wall blocks your way.');
  }

  const e = world.level.map.get(x, y);
  if (!e) return;

  if (e.has(isPassable)) {
    move(x, y);
  }

  if (e.has(FoundMessage)) {
    await foundMessage(e);
  }

  if (e.has(Attacks)) {
    const damage = e.get(Attacks)!.damage;
    world.stats.gems -= damage;
    world.killAt(x, y);
    world.addScore(e.type as Type);
    move(x, y);

    if (world.stats.gems < 0) await dead();
  }

  if (e.has(Collectible)) {
    sound.grab(); // TODO: Chest sound
    const collect = e.get(Collectible)!;

    world.stats.whips += collect.whips;
    world.stats.gems += collect.gems;
    world.stats.teleports += collect.teleports;
    world.stats.keys += collect.keys;
    world.stats.whipPower += collect.whipPower;

    world.addScore(e.type as Type);

    switch (e.type) {
      case Type.Chest:
        await screen.flashMessage(
          `You found ${collect.gems} gems and ${collect.whips} whips inside the chest!`,
        );
        break;
      case Type.Chance:
        await screen.flashMessage(
          `You found a Pouch containing ${collect.gems} Gems!`,
        );
        break;
    }
  }

  if (e.has(isPushable)) {
    await pushRock(e, x, y, dx, dy);
    return;
  }

  if (e.has(Trigger)) {
    sound.grab(); // Make @@grab
    world.addScore(e.type as Type); // Make ##score
    const message = e.get(Trigger)?.message;
    if (message) {
      await effects.processEffect(message, world.level.player);
    }
  }

  if (e.has(ChangeLevel)) {
    const c = e.get(ChangeLevel)!;
    if (c.deltaLevel > 0) {
      if (world.stats.levelIndex === LEVELS.length - 1) {
        await screen.endRoutine();
        return;
      }
      world.addScore(e.type as Type);
      sound.footStep();
      await levels.nextLevel(c.deltaLevel);
    } else if (c.deltaLevel < 0) {
      sound.footStep();
      await levels.prevLevel(-c.deltaLevel);
    } else if (c.exactLevel !== null) {
      sound.footStep();
      world.stats.levelIndex = c.exactLevel - 1;
      await levels.nextLevel(1);
    }
  }

  switch (e.type) {
    case Type.Wall: // Blocked -> isBlock Component
    case Type.River:
    case Type.Block:
    case Type.ZBlock:
    case Type.GBlock:
      sound.blockedWall();
      world.addScore(e.type);
      break;
    case Type.Tree: // Blocked -> isBlock Component?
    case Type.Forest:
    case Type.Generator:
    case Type.MBlock:
      world.addScore(e.type);
      await sound.blocked(); // TODO: replace this sound
      break;
    case Type.Door: // Opens door (if has key) -> isDoor Component?
      if (world.stats.keys < 1) {
        sound.locked();
        await delay(100);
        await screen.flashMessage('To pass the Door you need a Key.');
      } else {
        world.stats.keys--;
        world.addScore(e.type);
        await sound.openDoor();
        move(x, y);
        screen.renderPlayfield();
      }
      // TODO: LOST 75 special case
      break;
    case Type.Lava: // Moves + Damage -> Damage Component?
      world.stats.gems -= 10;
      world.addScore(e.type);

      if (world.stats.gems < 0) dead();
      break;
    case Type.Pit: // Moves + Kills -> Kills Component?
      await pitAnimation();
      break;
    case Type.Tome:
      // TODO: Make a Trigger effect
      effects.replaceEntities(Type.Tome, Type.Stairs);
      screen.drawEntityAt(x, y);
      break;
    case Type.Tunnel: {
      // -> isTunnel Component?
      // Goes through tunnel

      const p = world.level.player.get(Position)!;
      await tunnel(x, y, p.px!, p.py!);
      break;
    }
    case Type.IBlock: // IBlock is replaced by Block -> SwapOnTouch Component?
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Block);
      screen.drawEntityAt(x, y);
      break;
    case Type.IWall: // IBlock is replaced by Wall -> SwapOnTouch Component?
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Wall);
      screen.drawEntityAt(x, y);
      break;
    case Type.IDoor: // IDoor is replaced by Door -> SwapOnTouch Component?
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Door);
      screen.drawEntityAt(x, y);
      break;
    case Type.Statue: // Blocked
      sound.blocked();
      break;
    case Type.OWall1: // Blocked
    case Type.OWall2:
    case Type.OWall3:
      sound.blockedWall();
      world.addScore(Type.Wall);
      break;
    case Type.EWall: // Damage -> Damage Component?
      world.addScore(e.type);
      world.stats.gems--;
      sound.staticNoise();
      break;
    default:
      // TODO: Only if nothing else happened
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isNaN(e.type as any) || typeof e.type === 'string') {
        sound.blockedWall();
      }
      break;
  }
}

async function foundMessage(e: Entity) {
  const type = e.type as Type;
  if (world.game.foundSet === true || world.game.foundSet.has(type)) return '';

  const message = e.get(FoundMessage)?.message;
  if (!message) return '';

  world.game.foundSet.add(type);
  return await effects.processEffect(message, world.level.player);
}

export async function dead() {
  await effects.flashPlayer();
  const p = world.level.player.get(Position)!;
  screen.drawOver(p.x, p.y, '*', Color.White);
  display.drawText(
    XTop / 2 - 7,
    0,
    ' YOU HAVE DIED!! ',
    Color.Black | 16,
    Color.Red,
  );
  await screen.flashMessage('Press any key to continue.');
  world.game.done = true;
}

export function move(x: number, y: number) {
  sound.footStep();

  const e = world.level.player;
  const p = e.get(Position)!;

  world.level.map.setType(p.x, p.y, p.replacement);
  screen.drawEntityAt(p.x, p.y);

  const b = world.level.map.getType(x, y) as Type;
  p.replacement = [Type.CWall1, Type.CWall2, Type.CWall3, Type.Rope].includes(b)
    ? b
    : Type.Floor;

  world.level.map.set(x, y, e);
  p.x = x;
  p.y = y;
  screen.drawEntityAt(p.x, p.y);
}

export async function tunnel(x: number, y: number, sx: number, sy: number) {
  await delay(350);
  await sound.footStep();
  await delay(500);
  world.level.map.setType(x, y, Type.Tunnel);
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
      move(tx, ty);
      break;
    }
  }

  world.level.map.setType(x, y, Type.Tunnel);
  screen.drawEntityAt(x, y);

  // Find a random empty space near exit
  let ex = sx;
  let ey = sy;
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
  move(ex, ey);
  world.level.map.setType(tx, ty, Type.Tunnel);
  screen.drawEntityAt(tx, ty);
}

export async function pushRock(
  r: Entity,
  x: number,
  y: number,
  dx: number,
  dy: number,
) {
  let nogo = false;

  const p = world.level.player.get(Position)!;
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
      world.level.map.set(tx, ty, r);
      move(x, y);
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
      world.level.map.setType(tx, ty, Type.Floor);
      sound.rockVaporized();
      await screen.flashMessage('The Boulder is vaporized!'); // TODO: show once?, change for pushed type
    } else if (ROCK_CLIFFABLES.includes(tb as number)) {
      nogo = false;
      await sound.pushRock();
      move(x, y);
      screen.drawEntityAt(tx, ty, r);
      await sound.rockDropped();
      screen.renderPlayfield();
    }
  }

  if (nogo) {
    await sound.blocked();
  }
}

async function pitAnimation() {
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
        Color.Brown,
      );
    } else if (i === 9) {
      display.drawText(
        38,
        12,
        tiles.common.FLOOR_CHAR.repeat(16),
        Color.HighIntensityWhite,
        Color.Brown,
      );
    }

    for (let y = 0; y <= YMax; y++) {
      screen.drawAt(
        33,
        y,
        tiles.common.PLAYER_CHAR,
        tiles.common.PLAYER_FG,
        tiles.common.PLAYER_BG,
      );
      await sound.play((x -= 8), 52 - 3 * i, 30);
      screen.drawAt(
        33,
        y,
        tiles.common.FLOOR_CHAR,
        tiles.common.FLOOR_FG,
        tiles.common.FLOOR_BG,
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
