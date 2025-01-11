import { Scheduler, SpeedActor } from 'rot-js';
import Speed from 'rot-js/lib/scheduler/speed';
import { Actor } from '../classes/actors';
import { Type } from '../data/tiles';

let scheduler: Speed<SpeedActor>;

// Dummy entities used for the scheduler
const playerActor = new Actor(Type.Player, 0, 0);
const slowActor = new Actor(Type.Slow, 0, 0);
const mediumActor = new Actor(Type.Medium, 0, 0);
const fastActor = new Actor(Type.Fast, 0, 0);
const mBlocks = new Actor(Type.MBlock, 0, 0);

export function createScheduler() {
  scheduler = new Scheduler.Speed();
  scheduler.add(playerActor, true);
  scheduler.add(slowActor, true);
  scheduler.add(mediumActor, true);
  scheduler.add(fastActor, true);
  scheduler.add(mBlocks, true);
  return scheduler;
}

export function next() {
  return scheduler.next();
}
