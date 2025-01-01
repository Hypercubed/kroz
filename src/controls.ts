// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as gameControl } from 'gamecontroller.js/src/gamecontrol.js';
import { DEBUG } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gamepad: any = null;

export enum Action {
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
}

// Tracks the current state of joystick actions
export const actionState: Partial<Record<Action, boolean>> = {};

// Tracks the current state of keyboard actions
export const actionBuffer: Partial<Record<Action, boolean>> = {};

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
      gamepad.before(key, () => {
        if (!action) return;

        actionState[action] = true;
        // actionBuffer[action] = true;
      });

      gamepad.after(key, () => {
        if (!action) return;
        actionState[action] = false;
      });
    }
  });
}

export function disableGamepadControls() {
  gameControl.off('connect');
}

// Note: when held down, the keydown event will fire repeatedly
function keydownListener(event: KeyboardEvent) {
  const action = KEY_BINDING[event.key];
  if (!action) return;
  event.preventDefault();
  actionBuffer[action] = true;
}

export function start() {
  enableGamepadControls();
  window.addEventListener('keydown', keydownListener);
}

export function stop() {
  disableGamepadControls();
  window.removeEventListener('keydown', keydownListener);
}

export function clearKeys() {
  for (const key in actionBuffer) {
    actionBuffer[key as unknown as Action] = false;
  }
}

export function pollActions() {
  const actions: Partial<Record<Action, boolean>> = {};

  for (const key in Action) {
    if (!isNaN(Number(key))) {
      const action = key as unknown as Action;
      actions[action] = !!actionBuffer[action] || !!actionState[action];
      actionBuffer[action] = false;
    }
  }
  return actions;
}

export function readkey() {
  let key: string = '';
  document.addEventListener(
    'keydown',
    (ev) => {
      ev.preventDefault();
      clearKeys();
      key = ev.key;
    },
    { once: true },
  );
  return () => key;
}
