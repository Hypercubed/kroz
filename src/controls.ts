// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as gameControl } from 'gamecontroller.js/src/gamecontrol.js';

let anyKeyPressed = false;

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
  Teleport
}

// Tracks the current state of joystick actions
export const actionState = {
  [Action.North]: false,
  [Action.South]: false,
  [Action.East]: false,
  [Action.West]: false,
  [Action.Northwest]: false,
  [Action.Northeast]: false,
  [Action.Southwest]: false,
  [Action.Southeast]: false,
  [Action.Whip]: false,
  [Action.FreeItems]: false,
  [Action.NextLevel]: false,
  [Action.PrevLevel]: false,
  [Action.Teleport]: false,
};

// Tracks the current state of keyboard actions
export const actionBuffer = {
  [Action.North]: false,
  [Action.South]: false,
  [Action.East]: false,
  [Action.West]: false,
  [Action.Northwest]: false,
  [Action.Northeast]: false,
  [Action.Southwest]: false,
  [Action.Southeast]: false,
  [Action.Whip]: false,
  [Action.FreeItems]: false,
  [Action.NextLevel]: false,
  [Action.PrevLevel]: false,
  [Action.Teleport]: false,
};

const KEY_BINDING: Record<string, Action> = {
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
  // '(': Action.NextLevel,
  PageDown: Action.PrevLevel,
  PageUp: Action.NextLevel,
};

const GAMEPAD_BINDING: Record<string, Action> = {
  button0: Action.Whip,
  button1: Action.Teleport,
  button4: Action.PrevLevel,
  button5: Action.NextLevel,
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
        anyKeyPressed = true;
        actionState[action] = true;
        // actionBuffer[action] = true;
      });

      gamepad.after(key, () => {
        actionState[action] = false;
        // actionBuffer[action] = true;
      });
    }
  });
}

export function disableGamepadControls() {
  gameControl.off('connect');
}

// Note: when held down, the keydown event will fire repeatedly
function keydownListener(event: KeyboardEvent) {
  anyKeyPressed = true;

  const action = KEY_BINDING[event.key];
  if (action) {
    event.preventDefault();
    actionBuffer[action] = true;
  }
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
  anyKeyPressed = false;
  for (const key in actionBuffer) {
    actionBuffer[key as unknown as Action] = false;
  }
}

export function anyKey() {
  return anyKeyPressed;
}

export function readKey() {
  return new Promise(resolve => {
    window.addEventListener('keypress', resolve, {once:true});
  });
}

export function pollActions() {
  const actions: Partial<Record<Action, boolean>> = { };
  for (const action in actionBuffer) {
    const key = action as unknown as Action;
    actions[key] = actionBuffer[key] || actionState[key];
    actionBuffer[key] = false;
  }
  return actions;
}