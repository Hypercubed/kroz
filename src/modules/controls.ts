// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as gameControl } from 'gamecontroller.js/src/gamecontrol.js';

import nipplejs, { JoystickManagerEventTypes } from 'nipplejs';

import { DEBUG } from '../data/constants';
import { MiniSignal } from 'mini-signals';
import { delay } from '../utils/utils';

const keyPressed = new MiniSignal<[string]>();
const keyDown = new MiniSignal<[string]>();
const keyUp = new MiniSignal<[string]>();

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
  NextLevelCheat,
  PrevLevel,
  Teleport,
  ResetFound,
  HideFound,
  Pause,
  Quit,
  Save,
  Restore,
  SlowerClock,
  FasterClock
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
  '(': Action.NextLevelCheat,
  PageDown: DEBUG ? Action.PrevLevel : null,
  PageUp: DEBUG ? Action.NextLevel : null,
  p: Action.Pause,
  P: Action.Pause,
  q: Action.Quit,
  Q: Action.Quit,
  s: Action.Save,
  S: Action.Save,
  r: Action.Restore,
  R: Action.Restore,
  F11: Action.SlowerClock,
  F12: Action.FasterClock
};

const GAMEPAD_BINDING: Record<string, string | null> = {
  button0: 'w',
  button1: 't',
  button2: 's',
  button3: 'r',
  button4: DEBUG ? 'PageDown' : null,
  button5: DEBUG ? 'PageUp' : null,
  button6: 'F11',
  button7: 'F12',
  button8: 's',
  button9: 'p',
  button16: 'Escape',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  button12: 'ArrowUp',
  button13: 'ArrowDown',
  button14: 'ArrowLeft',
  button15: 'ArrowRight'
};

// const TOUCH_BINDING = {
//   'plain:up': Action.North,
//   'plain:down': Action.South,
//   'plain:left': Action.West,
//   'plain:right': Action.East,
// }

function enableGamepadControls() {
  if (gamepad) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameControl.on('connect', (_gamepad: any) => {
    if (gamepad) return;
    gamepad = _gamepad;
    gamepad!.axeThreshold = [0.5, 0.5];

    for (const [evt, key] of Object.entries(GAMEPAD_BINDING)) {
      if (!key) continue;
      gamepad.before(evt, () => keyDown.dispatch(key));
      gamepad.after(evt, () => keyUp.dispatch(key));
    }
  });
}

export function disableGamepadControls() {
  gameControl.off('connect');
}

let touch_manager: nipplejs.JoystickManager | null = null;
let button0: nipplejs.JoystickManager | null = null;
let button1: nipplejs.JoystickManager | null = null;

const isTouchCapable =
  'ontouchstart' in window ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((window as any)['DocumentTouch'] &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document instanceof (window as any).DocumentTouch) ||
  navigator.maxTouchPoints > 0 ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).navigator.msMaxTouchPoints > 0;

export function enableTouchControls() {
  if (touch_manager || !isTouchCapable) return;

  document.querySelectorAll('.touch_zone').forEach((zone) => {
    (zone as HTMLDivElement).style.display = 'block';
  });

  touch_manager = nipplejs.create({
    zone: document.querySelector('.touch_zone--axis')! as HTMLElement,
    mode: 'dynamic',
    threshold: 0.5,
    dynamicPage: true,
    position: { left: '50px', bottom: '50px' },
    restOpacity: 0.3
  });

  touch_manager.on('move end' as JoystickManagerEventTypes, (_, output) => {
    if (output.force < 0.5) return;

    const threshold = 0.3;

    const { x, y } = output.vector || { x: 0, y: 0 };

    if (x > threshold && !isActionActive(Action.East)) {
      keyDown.dispatch(GAMEPAD_BINDING['right']!);
    } else if (x < -threshold && !isActionActive(Action.West)) {
      keyDown.dispatch(GAMEPAD_BINDING['left']!);
    } else if (Math.abs(x) <= threshold) {
      keyUp.dispatch(GAMEPAD_BINDING['right']!);
      keyUp.dispatch(GAMEPAD_BINDING['left']!);
    }

    if (y > threshold && !isActionActive(Action.North)) {
      keyDown.dispatch(GAMEPAD_BINDING['up']!);
    } else if (y < -threshold && !isActionActive(Action.South)) {
      keyDown.dispatch(GAMEPAD_BINDING['down']!);
    } else if (Math.abs(y) <= threshold) {
      keyUp.dispatch(GAMEPAD_BINDING['up']!);
      keyUp.dispatch(GAMEPAD_BINDING['down']!);
    }
  });

  button0 = nipplejs.create({
    zone: document.querySelector('.touch_zone--button-0')! as HTMLElement,
    threshold: 0,
    mode: 'dynamic',
    lockX: true,
    lockY: true,
    dynamicPage: true,
    restOpacity: 0.3,
    position: { left: '50px', bottom: '50px' }
  });

  button0.on('start', () => keyDown.dispatch(GAMEPAD_BINDING['button0']!));
  button0.on('end', () => keyUp.dispatch(GAMEPAD_BINDING['button0']!));

  button1 = nipplejs.create({
    zone: document.querySelector('.touch_zone--button-1')! as HTMLElement,
    threshold: 0,
    mode: 'dynamic',
    lockX: true,
    lockY: true,
    dynamicPage: true,
    restOpacity: 0.3,
    position: { right: '50px', top: '50px' }
  });

  button1.on('start', () => keyDown.dispatch(GAMEPAD_BINDING['button1']!));
  button1.on('end', () => keyUp.dispatch(GAMEPAD_BINDING['button1']!));
}

export function disableTouchControls() {
  document.querySelectorAll('.touch_zone').forEach((zone) => {
    (zone as HTMLDivElement).style.display = 'none';
  });

  // touch_manager?.destroy();
  // buttonA?.destroy();
  // buttonB?.destroy();
}

function keydownListener(event: KeyboardEvent) {
  if (event.repeat) return; // Ignore repeated keydown events, repeat is handled by keyup
  if (KEY_BINDING[event.key]) event.preventDefault();
  keyDown.dispatch(event.key);
}

function keyupListener(event: KeyboardEvent) {
  if (KEY_BINDING[event.key]) event.preventDefault();
  keyUp.dispatch(event.key);
}

keyDown.add((key) => {
  keyState[key] = 0b011;
  const action = KEY_BINDING[key];
  if (!action) return;
  actionState[action] = 0b011;
});

keyUp.add((key) => {
  if ((keyState[key] || 0) & 0b11) keyPressed.dispatch(key);

  keyState[key]! &= ~0b001;
  keyState[key]! |= 0b100;

  const action = KEY_BINDING[key];
  if (!action) return;
  actionState[action]! &= ~0b001;
  actionState[action]! |= 0b100;
});

export function start() {
  enableGamepadControls();
  enableTouchControls();
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
  cb?: () => void | Promise<void>,
  d = 50
) {
  const waitFor = waitForKeypress();
  do {
    await cb?.();
  } while (!(await Promise.race([waitFor, delay(d)])));
  return waitFor;
}
