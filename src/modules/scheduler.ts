import { Scheduler, SpeedActor } from 'rot-js';
import Speed from 'rot-js/lib/scheduler/speed';
import { Entity } from '../classes/entities';
import { Tile } from '../data/tiles';

let scheduler: Speed<SpeedActor>;

// Dummy entities used for the scheduler
const playerActor = new Entity(Tile.Player, 0, 0);
const slowActor = new Entity(Tile.Slow, 0, 0);
const mediumActor = new Entity(Tile.Medium, 0, 0);
const fastActor = new Entity(Tile.Fast, 0, 0);
// TODO: MBlocks

export function createScheduler() {
  scheduler = new Scheduler.Speed();
  scheduler.add(playerActor, true);
  scheduler.add(slowActor, true);
  scheduler.add(mediumActor, true);
  scheduler.add(fastActor, true);
  return scheduler;
}

export function next() {
  return scheduler.next();
}
