// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as gameControl } from "gamecontroller.js/src/gamecontrol.js";

import { MiniSignal } from "mini-signals";

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
}

const actionState = {
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
  ",": Action.Southeast,
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
  "(": Action.FreeItems,
  ")": Action.NextLevel,
  PageDown: Action.PrevLevel,
  PageUp: Action.NextLevel,
};

const GAMEPAD_BINDING: Record<string, Action> = {
  button0: Action.Whip,
  up: Action.North,
  down: Action.South,
  left: Action.West,
  right: Action.East,
  button12: Action.NextLevel,
  button13: Action.PrevLevel,
};

export function isAnyActionActive() {
  for (const action in actionState) {
    if (actionState[action as unknown as Action]) {
      return true;
    }
  }
  return false;
}

export function isActionActive(code: Action) {
  return actionState[code];
}

export function setActionActive(code: Action, state: boolean) {
  actionState[code] = state;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gamepad: any = null;

function enableGamepadControls() {
  if (gamepad) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameControl.on("connect", (_gamepad: any) => {
    if (gamepad) return;

    gamepad = _gamepad;

    gamepad!.axeThreshold = [0.5, 0.5];

    for (const [key, action] of Object.entries(GAMEPAD_BINDING)) {
      gamepad.before(key, () => {
        onAction(action, true);
      });

      gamepad.after(key, () => {
        onAction(action, false);
      });
    }
  });
}

export function disableGamepadControls() {
  gameControl.off("connect");
}

function keydownListener(event: KeyboardEvent) {
  const action = KEY_BINDING[event.key];
  if (action) {
    event.preventDefault();
    onAction(action, event.type === "keydown");
  }
}

function onAction(action: Action, isDown: boolean) {
  actionState[action] = isDown;
  if (isDown) {
    controlDown.dispatch(action);
  } else {
    controlUp.dispatch(action);
  }
}

export function start() {
  enableGamepadControls();
  window.addEventListener("keydown", keydownListener);
  window.addEventListener("keyup", keydownListener);
}

export function stop() {
  disableGamepadControls();
  window.removeEventListener("keydown", keydownListener);
  window.removeEventListener("keyup", keydownListener);
}

// EVENTS
export const controlDown = new MiniSignal<[Action]>();
export const controlUp = new MiniSignal<[Action]>();
