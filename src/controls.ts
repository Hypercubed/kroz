// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as gameControl } from 'gamecontroller.js/src/gamecontrol.js';
import { DEBUG } from './constants';
import { MiniSignal } from 'mini-signals';
import { delay } from './utils';

const keyPressed = new MiniSignal<[string]>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gamepad: any = null;

export enum Action { // cannot be const enum
  North = 1,
  South,
  East,
  West,
  Northwest,
  Northeast,
  Southwest,
  Southeast,
  Whip,
  FreeItems,
  NextLevel,
  PrevLevel,
  Teleport,
  ResetFound,
  HideFound,
  Pause,
  Quit,
  Save,
  Restore,
}

export const keyState: Partial<Record<string, number>> = {};
export const actionState: Partial<Record<Action, number>> = {};

// Bitfields
// 0b1111|
//   ||||
//   |||+-> active
//   ||+--> activated this frame
//   |+---> deactivated this frame
//   +----> activated last frame

const KEY_BINDING: Record<string, Action | null> = {
  ArrowUp: Action.North,
  ArrowDown: Action.South,
  ArrowLeft: Action.West,
  ArrowRight: Action.East,
  U: Action.Northwest,
  I: Action.North,
  O: Action.Northeast,
  J: Action.West,
  K: Action.East,
  N: Action.Southwest,
  M: Action.South,
  ',': Action.Southeast,
  1: Action.Southwest,
  2: Action.South,
  3: Action.Southeast,
  4: Action.West,
  6: Action.East,
  7: Action.Northwest,
  8: Action.North,
  9: Action.Northeast,
  5: Action.Whip,
  w: Action.Whip,
  W: Action.Whip,
  t: Action.Teleport,
  T: Action.Teleport,
  ')': Action.FreeItems,
  '+': Action.ResetFound,
  '-': Action.HideFound,
  '(': Action.NextLevel,
  PageDown: DEBUG ? Action.PrevLevel : null,
  PageUp: DEBUG ? Action.NextLevel : null,
  p: Action.Pause,
  P: Action.Pause,
  Escape: Action.Quit,
  s: Action.Save,
  S: Action.Save,
  r: Action.Restore,
  R: Action.Restore,
};

const GAMEPAD_BINDING: Record<string, Action | null> = {
  button0: Action.Whip,
  button1: Action.Teleport,
  button4: DEBUG ? Action.PrevLevel : null,
  button5: DEBUG ? Action.NextLevel : null,
  up: Action.North,
  down: Action.South,
  left: Action.West,
  right: Action.East,
  button12: Action.North,
  button13: Action.South,
  button14: Action.West,
  button15: Action.East,
};

function enableGamepadControls() {
  if (gamepad) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameControl.on('connect', (_gamepad: any) => {
    if (gamepad) return;

    gamepad = _gamepad;

    gamepad!.axeThreshold = [0.5, 0.5];

    for (const [key, action] of Object.entries(GAMEPAD_BINDING)) {
      if (!action) continue;

      gamepad.before(key, () => {
        keyState[key] = actionState[action] = 0b011;
      });

      gamepad.after(key, () => {
        // Dispatch keyPressed event if key was pressed since last clearKeys
        if ((keyState[key] || 0) & 0b11) keyPressed.dispatch(key);

        keyState[key]! &= ~0b001;
        keyState[key]! |= 0b100;

        actionState[action]! &= ~0b001;
        actionState[action]! |= 0b100;
      });
    }
  });
}

export function disableGamepadControls() {
  gameControl.off('connect');
}

function keydownListener(event: KeyboardEvent) {
  if (event.repeat) return; // Ignore repeated keydown events, repeat is handled by keyup

  const action = KEY_BINDING[event.key];
  keyState[event.key] = 0b011;

  if (!action) return;
  event.preventDefault();
  actionState[action] = 0b011;
}

function keyupListener(event: KeyboardEvent) {
  // Dispatch keyPressed event if key was pressed since last clearKeys
  if ((keyState[event.key] || 0) & 0b11) keyPressed.dispatch(event.key);

  keyState[event.key]! &= ~0b001;
  keyState[event.key]! |= 0b100;

  const action = KEY_BINDING[event.key];
  if (!action) return;
  event.preventDefault();
  actionState[action]! &= ~0b001;
  actionState[action]! |= 0b100;
}

export function start() {
  enableGamepadControls();
  window.addEventListener('keydown', keydownListener);
  window.addEventListener('keyup', keyupListener);
}

export function stop() {
  disableGamepadControls();
  window.removeEventListener('keydown', keydownListener);
  window.removeEventListener('keyup', keydownListener);
}

export function clearKeys() {
  for (const key in keyState) {
    if (!keyState[key]) continue;
    keyState[key]! = 0;
  }
}

export function flushAll() {
  for (const prop in actionState) {
    if (Object.prototype.hasOwnProperty.call(actionState, prop)) {
      delete actionState[prop as unknown as Action];
    }
  }
  for (const prop in keyState) {
    if (Object.prototype.hasOwnProperty.call(keyState, prop)) {
      delete keyState[prop];
    }
  }
}

export function clearActions() {
  for (const key in actionState) {
    const action = key as unknown as Action;
    if (!actionState[action]) continue;
    const wasPressed = !!(actionState[action]! & 0b010);
    actionState[action]! &= ~0b1110;
    if (wasPressed) actionState[action]! |= 0b1000;
  }
}

// true if action key is active
export function isActionActive(action: Action) {
  return !!(actionState[action]! & 0b001);
}

// true if action key was activated frame
export function wasActionActivated(action: Action) {
  return !!(actionState[action]! & 0b010);
}

// true if action key was active this frame
export function wasActionActive(action: Action) {
  return !!(actionState[action]! & 0b011) && !(actionState[action]! & 0b1000);
}

// true if action key was inactivated this frame
export function wasActionDeactivated(action: Action) {
  return !!(actionState[action]! & 0b100);
}

export async function waitForKeypress() {
  flushAll(); // clear any keys that were pressed before

  return new Promise<string>((resolve) => {
    const ref = keyPressed.add((key: string) => {
      keyPressed.detach(ref);
      resolve(key);
    });
  });
}

export async function repeatUntilKeyPressed(
  cb: () => void | Promise<void>,
  d = 50,
) {
  const waitFor = waitForKeypress();
  do {
    await cb?.();
  } while (!(await Promise.race([waitFor, delay(d)])));
  return waitFor;
}
