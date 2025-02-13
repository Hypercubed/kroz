import * as controls from './controls.ts';
import * as display from './display.ts';
import * as sound from './sound.ts';
import * as screen from './screen.ts';
import * as world from './world.ts';
import * as levels from './levels.ts';
import * as effects from './effects.ts';
import * as bot from './bot.ts';

import { Type } from './tiles.ts';
import { DEBUG, XMax, XTop, YMax } from '../data/constants.ts';
import { Action } from './controls.ts';

import { Color } from './colors.ts';
import { clamp, delay } from '../utils/utils.ts';

import {
  Attacks,
  Collectible,
  Position,
  isPushable,
  Trigger,
  // ChangeLevel,
  isPassable,
  FoundMessage,
  isInvisible
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
    world.setTypeAt(p.x + 1, p.y, Type.Stairs);
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
      'References to new objects will not be displayed.'
    );
    return;
  }

  // Whip can happen at any time (no return)
  if (controls.wasActionActive(Action.Whip)) {
    if (world.stats.whips < 1) {
      sound.noneSound();
    } else {
      world.stats.whips--;
      await effects.whip(world.level.player);
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (world.stats.teleports < 1) {
      await sound.noneSound();
    } else {
      world.stats.teleports--;
      await effects.teleport(world.level.player);
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
    moveTo(x, y);
  }

  if (e.has(FoundMessage)) {
    await foundMessage(e);
  }

  if (e.has(Attacks)) {
    const damage = e.get(Attacks)!.damage;
    world.stats.gems -= damage;
    world.killAt(x, y);
    world.addScore(e.type as Type);
    moveTo(x, y);

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
          `You found ${collect.gems} gems and ${collect.whips} whips inside the chest!`
        );
        break;
      case Type.Chance:
        await screen.flashMessage(
          `You found a Pouch containing ${collect.gems} Gems!`
        );
        break;
    }
  }

  if (e.has(isPushable)) {
    await effects.pushRock(world.level.player, e, x, y, dx, dy);
    return;
  }

  if (e.has(Trigger)) {
    if (world.game.bot && e.has(isInvisible)) {
      e.remove(isInvisible);
      screen.drawEntityAt(x, y);
    }

    // sound.grab(); // Make @@grab
    world.addScore(e.type as Type); // Make ##score
    const message = e.get(Trigger)?.message;
    if (message) {
      await effects.processEffect(message, {
        who: world.level.player,
        what: e,
        x,
        y
      });
    }
    if (!world.game.done && world.stats.gems < 0) dead();
  }

  // if (e.has(ChangeLevel)) {
  //   const c = e.get(ChangeLevel)!;
  //   if (c.deltaLevel > 0) {
  //     if (world.stats.levelIndex === levels.getLevelsCount() - 1) {
  //       await screen.endRoutine();
  //       return;
  //     }
  //     world.addScore(e.type as Type);
  //     sound.footStep();
  //     await levels.nextLevel(c.deltaLevel);
  //   } else if (c.deltaLevel < 0) {
  //     sound.footStep();
  //     await levels.prevLevel(-c.deltaLevel);
  //   } else if (c.exactLevel !== null) {
  //     sound.footStep();
  //     world.stats.levelIndex = c.exactLevel - 1;
  //     await levels.nextLevel(1);
  //   }
  // }

  switch (e.type) {
    case Type.Door: // Opens door (if has key) -> isDoor Component?
      if (world.stats.keys < 1) {
        sound.locked();
        await delay(100);
        await screen.flashMessage('To pass the Door you need a Key.');
      } else {
        world.stats.keys--;
        world.addScore(e.type); // Make ##score in
        await sound.openDoor();
        moveTo(x, y);
        screen.renderPlayfield();
      }
      // TODO: LOST 75 special case
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
  return await effects.processEffect(message);
}

export async function dead() {
  await effects.flashEntity(world.level.player);
  const p = world.level.player.get(Position)!;
  screen.drawOver(p.x, p.y, '*', Color.White);
  display.drawText(
    XTop / 2 - 7,
    0,
    ' YOU HAVE DIED!! ',
    Color.Black | 16,
    Color.Red
  );
  await screen.flashMessage('Press any key to continue.');
  world.game.done = true;
}

export function moveTo(x: number, y: number) {
  sound.footStep();

  const e = world.level.player;
  const p = e.get(Position)!;

  world.setTypeAt(p.x, p.y, p.replacement);
  screen.drawEntityAt(p.x, p.y);

  const b = world.level.map.getType(x, y) as Type;
  // TODO: Property of Passable?
  p.replacement = [Type.CWall1, Type.CWall2, Type.CWall3, Type.Rope].includes(b)
    ? b
    : Type.Floor;

  world.level.map.set(x, y, e);
  p.x = x;
  p.y = y;
  screen.drawEntityAt(p.x, p.y);
}
