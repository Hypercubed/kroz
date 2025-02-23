import * as world from './world';
import * as levels from './levels';
import * as scripts from './scripts';

import { Position } from '../classes/components';
import { Timer } from './effects';
import { ENABLE_DEBUG_INTERFACE } from '../constants/constants';

const _timers = {
  get SlowTime() {
    return world.levelState.T[Timer.SlowTime];
  },
  set SlowTime(v: number) {
    world.levelState.T[Timer.SlowTime] = v;
  },
  get Invisible() {
    return world.levelState.T[Timer.Invisible];
  },
  set Invisible(v: number) {
    world.levelState.T[Timer.Invisible] = v;
  },
  get SpeedTime() {
    return world.levelState.T[Timer.SpeedTime];
  },
  set SpeedTime(v: number) {
    world.levelState.T[Timer.SpeedTime] = v;
  },
  get FreezeTime() {
    return world.levelState.T[Timer.FreezeTime];
  },
  set FreezeTime(v: number) {
    world.levelState.T[Timer.FreezeTime] = v;
  }
};

const _player = {
  get x(): number | undefined {
    return world.levelState.player?.get(Position)?.x ?? 0;
  },
  set x(v: number) {
    world.levelState.player.get(Position)!.x = v;
  },
  get y(): number | undefined {
    return world.levelState.player?.get(Position)?.y ?? 0;
  },
  set y(v: number) {
    world.levelState.player.get(Position)!.y = v;
  },
  get bot(): boolean {
    return world.gameState.bot;
  },
  set bot(v: boolean) {
    world.gameState.bot = v;
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
    levels.loadLevel(v);
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

if (ENABLE_DEBUG_INTERFACE) {
  const input = document.getElementById('console-input')! as HTMLInputElement;
  const logDiv = document.getElementById('log')!;

  document.addEventListener('keyup', (e) => {
    if (e.key === '?') {
      const consoleDiv = document.getElementById('debug-console');
      consoleDiv!.style.display =
        consoleDiv!.style.display === 'none' ? 'block' : 'none';
      if (consoleDiv!.style.display === 'block') {
        input.focus();
        input.value = ''; // Clear input
      }
    }
  });

  input.addEventListener('keyup', (e: KeyboardEvent) => e.stopPropagation());

  input.addEventListener('keydown', async (e: KeyboardEvent) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.key === 'Enter') {
      const command = input.value;
      input.value = ''; // Clear input
      await processCommand(command);
    }
  });

  async function processCommand(command: string) {
    command = command.trim();
    if (!command.startsWith('##') && !command.startsWith('@@')) {
      command = `##${command}`;
    }

    try {
      world.gameState.paused = true;
      const result = await scripts.processEffect(command);
      if (result !== undefined) {
        logDiv.innerHTML += `<p>> ${command}</p><p>${result}</p>`;
      }
      world.gameState.paused = false;
    } catch (err: unknown) {
      logDiv.innerHTML += `<p>Error: ${err}</p>`;
    }
  }
}
