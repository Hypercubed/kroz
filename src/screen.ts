import * as display from './display';
import * as state from './state';
import * as controls from './controls';

import { FLOOR_CHAR, HEIGHT, TITLE, XBot, XTop, YBot, YTop } from './constants';
import { RNG } from 'rot-js';
import { Color } from './colors';
import { delay } from './utils';
import dedent from 'ts-dedent';

export function renderScreen() {
  display.col(14);
  display.bak(Color.Blue);
  const x = 70;
  display.print(x, 0, 'Score');
  display.print(x, 3, 'Level');
  display.print(x, 6, 'Gems');
  display.print(x, 9, 'Whips');
  display.print(x - 2, 12, 'Teleports');
  display.print(x, 15, 'Keys');
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

export function renderBorder() {
  display.col(Color.LightBlue);
  display.bak(Color.Black);

  for (let x = XBot - 1; x <= XTop + 1; x++) {
    display.draw(x, 0, '▒');
    display.draw(x, YTop + 1, '▒');
  }
  for (let y = YBot - 1; y <= YTop + 1; y++) {
    display.draw(0, y, '▒');
    display.draw(XTop + 1, y, '▒');
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
  return controls.repeatUntilKeyPressed(async () => {
    display.col(RNG.getUniformInt(1, 15));

    display.clear(Color.Black);

    display.gotoxy(5, 5);
    display.writeln(dedent`
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
    `);
    display.writeln('');
    display.writeCenter(TITLE, Color.Yellow);
    display.writeln('');
    display.writeCenter(
      'Original Level Design (C) 1990 Scott Miller',
      Color.Yellow,
    );

    display.gotoxy(0, HEIGHT - 1);
    display.writeCenter('Press any key to continue.', Color.HighIntensityWhite);
    await delay(500);
  });
}

export async function instructionsScreen() {
  display.clear(Color.Black);


  display.gotoxy(0, 0);
  display.writeCenter(TITLE, Color.Yellow);
  display.writeCenter('INSTRUCTIONS', Color.HighIntensityWhite);
  display.writeCenter('------------', Color.HighIntensityWhite);
  display.writeln('');

  display.col(Color.LightBlue);
  display.writeln(dedent`
    The dungeons contain dozens of treasures,  spells,  traps and other mysteries.
  Touching an object for the first time will reveal a little of its identity,  but
  it will be left to you to decide how best to use it or avoid it.                
    When a creature touches you it will vanish,  taking with it a few of your gems
  that you have collected. If you have no gems then the creature will instead take
  your life!  Whips can be used to kill nearby creatures, but they are better used
  to smash through crumbled walls and forest terrain.`);
  display.writeln('');

  display.gotoxy(3);
  display.writeln(dedent`
    You can use these        u i o    7 8 9
    cursor keys to            \\|/      \\|/     w or 5: Whip
    move your man,           j- -k    4- -6         T: Teleport
    and the four              /|\\      /|\\
    normal cursor keys       n m ,    1 2 3`);

  display.gotoxy(0);
  display.writeln('');
  display.writeln(dedent`
    It's a good idea to save (S) your game at every new level,  therefore,  if you
    die you can easily restore (R) the game at that level and try again.`);

  display.gotoxy(2);
  display.writeln('');
  display.writeln('Have fun and good-luck...');

  display.gotoxy(0, HEIGHT - 1);
  display.writeCenter('Press any key to continue.', Color.HighIntensityWhite);

  await controls.waitForKeypress();
}

function pad(s: string, n: number, r: number) {
  return s.padStart(n, FLOOR_CHAR).padEnd(r, FLOOR_CHAR);
}
