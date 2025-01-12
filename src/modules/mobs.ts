import { Scheduler, SpeedActor } from 'rot-js';
import Speed from 'rot-js/lib/scheduler/speed';

import * as world from './world';
import * as sound from './sound';

import { Type, TypeChar, TypeColor } from '../data/tiles';
import { TIME_SCALE, XMax, YMax } from '../data/constants';
import { Timer } from './world';
import type { Entity } from '../classes/entity';

function getBaseSpeed(t: Type) {
  switch (t) {
    case Type.Player:
      return TIME_SCALE;
    case Type.Slow:
      return TIME_SCALE / 4;
    case Type.Medium:
      return TIME_SCALE / 3;
    case Type.Fast:
      return TIME_SCALE / 2;
    case Type.MBlock:
      return TIME_SCALE / 2;
  }
}

export class SchedulerActor implements SpeedActor {
  speed: number;

  constructor(public readonly type: Type) {
    this.speed = getBaseSpeed(this.type)!;
  }

  getSpeed() {
    if (this.type === Type.Player)
      return world.level.T[Timer.SlowTime] > 0 ? 10 : 1;
    return world.level.T[Timer.SpeedTime] > 0 ? TIME_SCALE : this.speed;
  }
}

let scheduler: Speed<SpeedActor>;

// Dummy entities used for the scheduler
const playerActor = new SchedulerActor(Type.Player);
const slowActor = new SchedulerActor(Type.Slow);
const mediumActor = new SchedulerActor(Type.Medium);
const fastActor = new SchedulerActor(Type.Fast);
const mBlocks = new SchedulerActor(Type.MBlock);

export function init() {
  scheduler = new Scheduler.Speed();
  scheduler.add(playerActor, true);
  scheduler.add(slowActor, true);
  scheduler.add(mediumActor, true);
  scheduler.add(fastActor, true);
  scheduler.add(mBlocks, true);
  return scheduler;
}

export async function update() {
  const current = scheduler.next();
  await entitiesAction(current.type);
}

async function mobAction(e: Entity) {
  if (
    e.x === -1 ||
    e.y === -1 ||
    world.level.map.getType(e.x, e.y) !== (e.type as unknown as Type) // Killed
  ) {
    world.kill(e);
    return;
  } // dead

  let dx = 0;
  let dy = 0;
  if (world.level.player.x < e.x) dx = -1;
  if (world.level.player.x > e.x) dx = 1;
  if (world.level.player.y < e.y) dy = -1;
  if (world.level.player.y > e.y) dy = 1;

  const x = e.x + dx;
  const y = e.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) return;

  const block = world.level.map.getType(x, y);

  // TODO: use lists?
  switch (block) {
    case Type.Floor: // Breaks
    case Type.TBlock:
    case Type.TRock:
    case Type.TGem:
    case Type.TBlind:
    case Type.TGold:
    case Type.TWhip:
    case Type.TTree:
      move(e, x, y);
      break;
    case Type.Block: // Breaks + Kills
    case Type.MBlock:
    case Type.ZBlock:
    case Type.GBlock:
      world.level.map.setType(e.x, e.y, Type.Floor);
      world.level.map.setType(x, y, Type.Floor);
      world.kill(e);
      world.addScore(block);
      sound.play(800, 18);
      sound.play(400, 20);
      break;
    case Type.Player: // Damage + Kills
      world.stats.gems--;
      world.level.map.setType(e.x, e.y, Type.Floor);
      world.kill(e);
      world.addScore(block);
      break;
    case Type.Whip: // Grabs
    case Type.Chest:
    case Type.SlowTime:
    case Type.Gem:
    case Type.Invisible:
    case Type.Teleport:
    case Type.Key:
    case Type.SpeedTime:
    case Type.Trap:
    case Type.Power:
    case Type.Freeze:
    case Type.Nugget:
    case Type.K:
    case Type.R:
    case Type.O:
    case Type.Z:
    case Type.ShootRight:
    case Type.ShootLeft:
      sound.grab();
      move(e, x, y);
      break;
    default: // Blocked
      move(e, e.x, e.y);
      break;
  }
}

async function mBlockAction(e: Entity) {
  if (
    e.x === -1 ||
    e.y === -1 ||
    world.level.map.getType(e.x, e.y) !== (e.type as unknown as Type) // Killed
  ) {
    world.kill(e);
    return;
  } // dead

  let dx = 0;
  let dy = 0;
  if (world.level.player.x < e.x) dx = -1;
  if (world.level.player.x > e.x) dx = 1;
  if (world.level.player.y < e.y) dy = -1;
  if (world.level.player.y > e.y) dy = 1;

  const x = e.x + dx;
  const y = e.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) return;

  const block = world.level.map.getType(x, y);

  switch (block) {
    case Type.Floor: // Moves
      move(e, x, y);
      e.ch = TypeChar[Type.Block]; // MBlocks become visible afer moving
      e.fg = TypeColor[Type.Block][0] ?? TypeColor[Type.Floor][0];
      e.bg = TypeColor[Type.Block][1] ?? TypeColor[Type.Floor][1];
      break;
    default: // Blocked
      move(e, e.x, e.y);
      break;
  }
}

async function entitiesAction(t: Type) {
  if (t === Type.Player) return;
  if (world.level.T[Timer.FreezeTime] > 0) return;

  for (let i = 0; i < world.level.entities.length; i++) {
    const e = world.level.entities[i];
    if (t && e.type !== t) continue;

    if (e.x === -1 || e.y === -1) continue; // dead

    if (e.type === Type.MBlock) {
      await mBlockAction(e);
    } else {
      await mobAction(e);
    }
  }
}

function move(e: Entity, x: number, y: number) {
  if (e.type === Type.Slow) {
    e.ch = Math.random() > 0.5 ? 'A' : 'Ä';
  } else if (e.type === Type.Medium) {
    e.ch = Math.random() > 0.5 ? 'ö' : 'Ö';
  }

  world.level.map.setType(e.x, e.y, Type.Floor);
  world.level.map.set(x, y, e);
  e.x = x;
  e.y = y;
}
