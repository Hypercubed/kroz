import { Scheduler, SpeedActor } from 'rot-js';
import Speed from 'rot-js/lib/scheduler/speed';

import * as world from './world';
import * as sound from './sound';

import { Type, TypeChar, TypeColor } from '../data/tiles';
import { TIME_SCALE, XMax, YMax } from '../data/constants';
import { Timer } from './world';
import type { Entity } from '../classes/entity';
import {
  Attacks,
  Eats,
  FollowsPlayer,
  KilledBy,
  Position,
  Renderable,
  Walkable,
} from '../classes/components';

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
  if (!current) return;
  const type = current.type;
  if (type === Type.Player) return;
  if (world.level.T[Timer.FreezeTime] > 0) return;

  for (const e of world.level.entities) {
    if (e.type === type) await act(e);
  }
}

async function act(e: Entity) {
  const ep = e.get(Position)!;
  if (ep.isDead()) return;

  if (world.level.map.getType(ep.x, ep.y) !== (e.type as unknown as Type)) {
    world.kill(e);
    return;
  } // dead

  if (e.has(FollowsPlayer)) {
    let dx = 0;
    let dy = 0;

    const pp = world.level.player.get(Position)!;

    if (pp.x < ep.x) dx = -1;
    if (pp.x > ep.x) dx = 1;
    if (pp.y < ep.y) dy = -1;
    if (pp.y > ep.y) dy = 1;

    tryMove(e, dx, dy);
  }
}

function tryMove(e: Entity, dx: number, dy: number) {
  const ep = e.get(Position)!;

  const x = ep.x + dx;
  const y = ep.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) return;

  const block = world.level.map.get(x, y);
  if (!block) return;

  if (e.get(Eats)?.has(block.type)) {
    sound.grab();
    moveTo(e, x, y);
    return;
  }

  if (block.get(Walkable)?.has(e.type)) {
    moveTo(e, x, y);

    if (e.type === Type.MBlock) {
      const t = e.get(Renderable)!;
      t.ch = TypeChar[Type.Block]; // MBlocks become visible afer moving
      t.fg = TypeColor[Type.Block][0] ?? TypeColor[Type.Floor][0];
      t.bg = TypeColor[Type.Block][1] ?? TypeColor[Type.Floor][1];
    }

    return;
  }

  if (e.get(KilledBy)?.has(block.type)) {
    world.level.map.setType(ep.x, ep.y, Type.Floor);
    world.level.map.setType(x, y, Type.Floor);
    world.kill(e);
    world.addScore(block.type as Type);
    sound.play(800, 18);
    sound.play(400, 20);
    return;
  }

  if (e.get(Attacks)?.has(block.type)) {
    world.stats.gems--;
    world.level.map.setType(ep.x, ep.y, Type.Floor);
    world.kill(e);
    world.addScore(block.type as Type);
    return;
  }

  // Stay in place
  moveTo(e, ep.x, ep.y);
}

function moveTo(e: Entity, x: number, y: number) {
  if (e.type === Type.Slow) {
    e.get(Renderable)!.ch = Math.random() > 0.5 ? 'A' : 'Ä';
  } else if (e.type === Type.Medium) {
    e.get(Renderable)!.ch = Math.random() > 0.5 ? 'ö' : 'Ö';
  }

  const p = e.get(Position)!;

  world.level.map.setType(p.x, p.y, Type.Floor);
  world.level.map.set(x, y, e);
  p.moveTo(x, y);
}
