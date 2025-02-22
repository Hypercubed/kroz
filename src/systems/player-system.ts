import * as controls from '../modules/controls.ts';
import * as display from '../modules/display.ts';
import * as sound from '../modules/sound.ts';
import * as screen from '../modules/screen.ts';
import * as world from '../modules/world.ts';
import * as levels from '../modules/levels.ts';
import * as effects from '../modules/effects.ts';
import * as bot from '../modules/bot.ts';
import * as script from '../modules/scripts.ts';
import * as colors from '../modules/colors.ts';

import { BLINK, DEBUG, XMax, XTop, YMax } from '../constants/constants.ts';
import { Action } from '../modules/controls.ts';

import { Color } from '../modules/colors.ts';
import { clamp, delay } from '../utils/utils.ts';

import {
  Attacks,
  Collectible,
  Position,
  Trigger,
  // ChangeLevel,
  isPassable,
  FoundMessage,
  isInvisible,
  Pushable,
  Energy
} from '../classes/components.ts';
import type { Entity } from '../classes/entity.ts';
import { Difficulty } from '../modules/world.ts';
import { Type } from '../constants/types.ts';
import { RNG } from 'rot-js';

export async function update() {
  const e = world.levelState.player.get(Energy)!;
  e.current = Math.min(0, e.current + 1);

  if (e.current >= 0) {
    await readControls();
    controls.clearActions(); // Clear was pressed actions after player acts
  }
}

async function readControls() {
  if (DEBUG && controls.wasActionDeactivated(Action.SlowerClock)) {
    world.gameState.clockScale = Math.min(20, world.gameState.clockScale + 1);
    console.log('Clock Scale:', world.gameState.clockScale);
    return;
  }

  if (DEBUG && controls.wasActionDeactivated(Action.FasterClock)) {
    world.gameState.clockScale = Math.max(1, world.gameState.clockScale - 1);
    console.log('Clock Scale:', world.gameState.clockScale);
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
    world.gameState.difficulty === Difficulty.Cheat &&
    controls.wasActionDeactivated(Action.NextLevelCheat)
  ) {
    const p = world.levelState.player.get(Position)!;
    world.setTypeAt(p.x + 1, p.y, Type.Stairs);
    await sound.cheat();
    return;
  }

  if (
    world.gameState.difficulty === Difficulty.Cheat &&
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
    world.gameState.foundSet = new Set();
    await screen.flashMessage('Newly found object descriptions are reset.');
    return;
  }
  if (controls.wasActionDeactivated(Action.HideFound)) {
    world.gameState.foundSet = true;
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
      await effects.whip(world.levelState.player);
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (world.stats.teleports < 1) {
      await sound.noneSound();
    } else {
      world.stats.teleports--;
      await effects.teleport(world.levelState.player);
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

  if (world.gameState.bot && !world.gameState.paused && !world.gameState.done) {
    await bot.botPlay();
    return;
  }
}

export async function tryMove(dx: number, dy: number) {
  const p = world.levelState.player.get(Position)!;
  const x = p.x + dx;
  const y = p.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) {
    await sound.staticNoise();
    world.addScore(Type.Border);

    if (world.gameState.foundSet === true || world.gameState.foundSet.has(-1))
      return;
    world.gameState.foundSet.add(-1);
    return await screen.flashMessage('An Electrified Wall blocks your way.');
  }

  const e = world.levelState.map.get(x, y);
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

  if (e.has(Pushable)) {
    await effects.tryPushRock(world.levelState.player, x, y, dx, dy);
    return;
  }

  if (e.has(Trigger)) {
    if (world.gameState.bot && e.has(isInvisible)) {
      e.remove(isInvisible);
      screen.drawEntityAt(x, y);
    }

    // sound.grab(); // Make @@grab
    world.addScore(e.type as Type); // Make ##score
    const message = e.get(Trigger)?.message;
    if (message) {
      await script.processEffect(message, {
        who: world.levelState.player,
        what: e,
        x,
        y
      });
    }
    if (!world.gameState.done && world.stats.gems < 0) dead();
  }

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
  if (world.gameState.foundSet === true || world.gameState.foundSet.has(type))
    return '';

  const message = e.get(FoundMessage)?.message;
  if (!message) return '';

  world.gameState.foundSet.add(type);
  return await script.processEffect(message);
}

export async function dead() {
  await effects.flashEntity(world.levelState.player);
  const p = world.levelState.player.get(Position)!;

  await screen.flashMessage('Press any key to continue.', () => {
    let fg: number | string = BLINK ? RNG.getUniformInt(1, 15) : Color.White;
    screen.drawAt(p.x, p.y, '*', fg, Color.Black);

    fg = Color.Black;
    if (BLINK) {
      const v = 500;
      const f = Date.now() % v < v / 2;
      fg = colors.getColor(fg, f ? 1 : 0);
    }

    // TODO: Flash
    display.drawText(XTop / 2 - 7, 0, 'YOU HAVE DIED!!', fg, Color.Red);
  });
  world.gameState.done = true;
}

export function moveTo(x: number, y: number) {
  sound.footStep();

  const e = world.levelState.player;
  const p = e.get(Position)!;

  world.setTypeAt(p.x, p.y, p.replacement);
  screen.drawEntityAt(p.x, p.y);

  const b = world.levelState.map.getType(x, y) as Type;
  // TODO: Property of Passable?
  p.replacement = [Type.CWall1, Type.CWall2, Type.CWall3, Type.Rope].includes(b)
    ? b
    : Type.Floor;

  world.levelState.map.set(x, y, e);
  p.x = x;
  p.y = y;
  screen.drawEntityAt(p.x, p.y);
}
