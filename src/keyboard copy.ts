// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as gameControl } from "gamecontroller.js/src/gamecontrol.js";

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

export class Keyboard {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gamepad: any;

  lastkey: string = "";
  listener?: (action: Action) => void;

  constructor() {
    this.enableGamepadControls();

    window.addEventListener("keydown", (event) => {
      this.update(event);
    });
  }

  private update(event: KeyboardEvent) {
    const key = event.key;
    this.lastkey = key;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const action: Action = (KEY_BINDING as any)[key];
    if (action !== null && action !== undefined) {
      this.listener?.(action);
    }
  }

  setListerner(listener: (action: Action) => void) {
    this.listener = listener;
  }

  enableGamepadControls() {
    if (this.gamepad) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gameControl.on("connect", (_gamepad: any) => {
      if (this.gamepad) return;

      this.gamepad = _gamepad;

      this.gamepad!.axeThreshold = [0.5, 0.5];

      for (const [key, action] of Object.entries(GAMEPAD_BINDING)) {
        this.gamepad.after(key, () => {
          this.lastkey = key;
          this.listener?.(action);
        });
      }
    });
  }
}
