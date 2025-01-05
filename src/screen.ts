import * as display from './display';
import * as state from './state';
import * as controls from './controls';

import { FLOOR_CHAR, HEIGHT, TITLE, XBot, XTop, YBot, YTop } from './constants';
import { RNG } from 'rot-js';
import { Color } from './colors';
import { delay } from './utils';
import dedent from 'ts-dedent';

export function renderScreen() {
  const x = 70;
  display.drawText(x, 0, 'Score', Color.Yellow, Color.Blue);
  display.drawText(x, 3, 'Level', Color.Yellow, Color.Blue);
  display.drawText(x, 6, 'Gems', Color.Yellow, Color.Blue);
  display.drawText(x, 9, 'Whips', Color.Yellow, Color.Blue);
  display.drawText(x - 2, 12, 'Teleports', Color.Yellow, Color.Blue);
  display.drawText(x, 15, 'Keys', Color.Yellow, Color.Blue);
}

// https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST1.LEV#L328
export function renderStats() {
  const whipStr =
    state.state.whipPower > 2
      ? `${state.state.whips}+${state.state.whipPower - 2}`
      : state.state.whips.toString();

  const width = 4;
  const size = 7;

  const gc =
    !state.state.paused && state.state.gems < 10 ? Color.Red | 16 : Color.Red;

  const x = 69;

  display.drawText(
    x,
    1,
    pad((state.state.score * 10).toString(), width + 1, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    4,
    pad(state.state.levelIndex.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    7,
    pad(state.state.gems.toString(), width + 1, size),
    gc,
    Color.Grey,
  );
  display.drawText(x, 10, pad(whipStr, width, size), Color.Red, Color.Grey);
  display.drawText(
    x,
    13,
    pad(state.state.teleports.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    16,
    pad(state.state.keys.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
}

// TODO: Border colors change per level
export function renderBorder() {
  for (let x = XBot - 1; x <= XTop + 1; x++) {
    display.draw(x, 0, '▒', Color.LightBlue, Color.Black);
    display.draw(x, YTop + 1, '▒', Color.LightBlue, Color.Black);
  }
  for (let y = YBot - 1; y <= YTop + 1; y++) {
    display.draw(0, y, '▒', Color.LightBlue, Color.Black);
    display.draw(XTop + 1, y, '▒', Color.LightBlue, Color.Black);
  }
}

export async function flashMessage(msg: string): Promise<string> {
  if (!msg) return '';

  const x = (XTop - msg.length) / 2;
  const y = YTop + 1;

  state.state.paused = true;

  const key = await controls.repeatUntilKeyPressed(() => {
    display.drawText(x, y, msg, RNG.getUniformInt(1, 15), Color.Black);
  });
  renderBorder();
  state.state.paused = false;
  return key;
}

export async function introScreen() {
  display.clear(Color.Black);

  display.writeCenter(20, TITLE, Color.Yellow);

  display.writeCenter(
    21,
    'Original Level Design (C) 1990 Scott Miller',
    Color.Yellow,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
  );

  return controls.repeatUntilKeyPressed(async () => {
    display.drawText(
      5,
      5,
      dedent`
      ███     ███     ██████████         ███████████        █████████████  (R)
      ███░░  ███░░░   ███░░░░░███░      ███░░░░░░░███░        ░░░░░░████░░░
      ███░░ ███░░░    ███░░   ███░░     ███░░     ███░░            ███░░░░
      ███░░███░░░     ███░░   ███░░    ███░░░      ███░           ███░░░
      ███░███░░░      ██████████░░░    ███░░       ███░░         ███░░░
      ██████░░░       ███░░███░░░░     ███░░       ███░░        ███░░░
      ███░███░        ███░░ ███░        ███░      ███░░░       ███░░░
      ███░░███░       ███░░  ███░       ███░░     ███░░      ████░░░
      ███░░ ███░      ███░░   ███░       ███████████░░░     █████████████
      ███░░  ███░       ░░░     ░░░        ░░░░░░░░░░░        ░░░░░░░░░░░░░
      ███░░   ███░
      ███░░    ███████████████████████████████████████████████████████████
      ░░░      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    `,
      RNG.getUniformInt(1, 15),
    );

    await delay(500);
  });
}

export async function instructionsScreen() {
  display.clear(Color.Black);

  display.writeCenter(0, TITLE, Color.Yellow, Color.Black);
  display.writeCenter(1, 'INSTRUCTIONS', Color.HighIntensityWhite, Color.Black);
  display.writeCenter(2, '------------', Color.HighIntensityWhite, Color.Black);

  display.drawText(
    0,
    5,
    dedent`
    The dungeons contain dozens of treasures,  spells,  traps and other mysteries.
  Touching an object for the first time will reveal a little of its identity,  but
  it will be left to you to decide how best to use it or avoid it.                
    When a creature touches you it will vanish,  taking with it a few of your gems
  that you have collected. If you have no gems then the creature will instead take
  your life!  Whips can be used to kill nearby creatures, but they are better used
  to smash through crumbled walls and forest terrain.`,
    Color.LightBlue,
    Color.Black,
  );

  display.drawText(
    3,
    13,
    dedent`
    You can use these        u i o    7 8 9
    cursor keys to            \\|/      \\|/     w or 5: Whip
    move your man,           j- -k    4- -6         T: Teleport
    and the four              /|\\      /|\\
    normal cursor keys       n m ,    1 2 3`,
    Color.LightBlue,
    Color.Black,
  );

  display.drawText(
    0,
    19,
    dedent`
    It's a good idea to save (S) your game at every new level,  therefore,  if you
    die you can easily restore (R) the game at that level and try again.`,
    Color.LightBlue,
    Color.Black,
  );

  display.writeCenter(
    22,
    'Have fun and good-luck...',
    Color.HighIntensityWhite,
    Color.Black,
  );
  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black,
  );

  await controls.waitForKeypress();
}

function pad(s: string, n: number, r: number) {
  return s.padStart(n, FLOOR_CHAR).padEnd(r, FLOOR_CHAR);
}
