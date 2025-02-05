import * as world from './world';
import * as levels from './levels';

import { Position } from '../classes/components';
import { Timer } from './effects';

const _timers = {
  get SlowTime() {
    return world.level.T[Timer.SlowTime];
  },
  set SlowTime(v: number) {
    world.level.T[Timer.SlowTime] = v;
  },
  get Invisible() {
    return world.level.T[Timer.Invisible];
  },
  set Invisible(v: number) {
    world.level.T[Timer.Invisible] = v;
  },
  get SpeedTime() {
    return world.level.T[Timer.SpeedTime];
  },
  set SpeedTime(v: number) {
    world.level.T[Timer.SpeedTime] = v;
  },
  get FreezeTime() {
    return world.level.T[Timer.FreezeTime];
  },
  set FreezeTime(v: number) {
    world.level.T[Timer.FreezeTime] = v;
  }
};

const _player = {
  get x(): number | undefined {
    return world.level.player.get(Position)?.x;
  },
  set x(v: number) {
    world.level.player.get(Position)!.x = v;
  },
  get y(): number | undefined {
    return world.level.player.get(Position)?.y;
  },
  set y(v: number) {
    world.level.player.get(Position)!.y = v;
  },
  get bot(): boolean {
    return world.game.bot;
  },
  set bot(v: boolean) {
    world.game.bot = v;
  }
};

const _stats = {
  get gems(): number | undefined {
    return world.stats.gems;
  },
  set gems(v: number) {
    world.stats.gems = v;
  },
  get whips(): number | undefined {
    return world.stats.whips;
  },
  set whips(v: number) {
    world.stats.whips = v;
  },
  get keys(): number | undefined {
    return world.stats.keys;
  },
  set keys(v: number) {
    world.stats.keys = v;
  },
  get teleports(): number | undefined {
    return world.stats.teleports;
  },
  set teleports(v: number) {
    world.stats.teleports = v;
  },
  get whipPower(): number | undefined {
    return world.stats.whipPower;
  },
  set whipPower(v: number) {
    world.stats.whipPower = v;
  }
};

const _levels = {
  get level() {
    return world.stats.levelIndex;
  },
  set level(v: number) {
    levels.setLevel(v);
  }
};

export {
  _timers as timers,
  _player as player,
  _stats as stats,
  _levels as levels
};

const api = {
  timers: _timers,
  player: _player,
  stats: _stats,
  levels: _levels
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any)['krozDebugAPI'] = api;
