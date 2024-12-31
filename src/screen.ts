import * as display from './display';
import * as world from './world';
import * as controls from './controls';
import * as sound from './sound';

import { FLOOR_CHAR, TITLE, WIDTH, XBot, XTop, YBot, YTop } from './constants';
import { TileMessage } from './tiles';
import { RNG } from 'rot-js';
import { Color } from './colors';
import { delay } from './utils';

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
    world.state.whipPower > 2
      ? `${world.state.whips}+${world.state.whipPower - 2}`
      : world.state.whips.toString();

  const width = 4;
  const size = 7;

  const gc =
    !world.state.paused && world.state.gems < 10 ? Color.Red | 16 : Color.Red;

  const x = 69;

  display.drawText(
    x,
    1,
    pad((world.state.score * 10).toString(), width + 1, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    4,
    pad(world.state.level.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    7,
    pad(world.state.gems.toString(), width + 1, size),
    gc,
    Color.Grey,
  );
  display.drawText(x, 10, pad(whipStr, width, size), Color.Red, Color.Grey);
  display.drawText(
    x,
    13,
    pad(world.state.teleports.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    16,
    pad(world.state.keys.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
}

export function fullRender() {
  display.clear();
  renderBorder();
  renderScreen();
  world.renderPlayfield();
  renderStats();
}

export function fastRender() {
  world.renderPlayfield();
  renderStats();
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

export async function flash(msg: string | number, once = false) {
  if (once) {
    if (world.state.foundSet.has(msg)) return;
    world.state.foundSet.add(msg);
  }

  if (typeof msg === 'number') {
    msg = TileMessage[msg];
  }

  if (!msg) return;

  world.state.paused = true;

  controls.clearKeys();
  while (!controls.anyKey()) {
    message(msg, RNG.getUniformInt(1, 15));
    await delay(50);
  }
  renderBorder();
  controls.clearKeys();
  world.state.paused = false;
}

export function message(
  msg: string | number,
  fg?: string | Color,
  bg?: string | Color,
) {
  if (typeof msg === 'number') {
    msg = TileMessage[msg];
  }
  if (!msg) return;

  const x = (XTop - msg.length) / 2;
  const y = YTop + 1;

  bg = bg ?? Color.Black;
  fg = fg ?? Color.HighIntensityWhite;

  display.drawText(x, y, msg, fg, bg);
}

function pad(s: string, n: number, r: number) {
  return s.padStart(n, FLOOR_CHAR).padEnd(r, FLOOR_CHAR);
}

export async function renderTitle() {
  // display.col(RNG.getUniformInt(1, 16));
  // display.gotoxy(1, 5);
  // display.writeln('     ÛÛÛ     ÛÛÛ     ÛÛÛÛÛÛÛÛÛÛ         ÛÛÛÛÛÛÛÛÛÛÛ        ÛÛÛÛÛÛÛÛÛÛÛÛÛ  (R)');
  // display.writeln('     ÛÛÛ±±  ÛÛÛ±±±   ÛÛÛ±±±±±ÛÛÛ±      ÛÛÛ±±±±±±±ÛÛÛ±        ±±±±±±ÛÛÛÛ±±±');
  // display.writeln('     ÛÛÛ±± ÛÛÛ±±±    ÛÛÛ±±   ÛÛÛ±±     ÛÛÛ±±     ÛÛÛ±±            ÛÛÛ±±±±');
  // display.writeln('     ÛÛÛ±±ÛÛÛ±±±     ÛÛÛ±±   ÛÛÛ±±    ÛÛÛ±±±      ÛÛÛ±           ÛÛÛ±±±');
  // display.writeln('     ÛÛÛ±ÛÛÛ±±±      ÛÛÛÛÛÛÛÛÛÛ±±±    ÛÛÛ±±       ÛÛÛ±±         ÛÛÛ±±±');
  // display.writeln('     ÛÛÛÛÛÛ±±±       ÛÛÛ±±ÛÛÛ±±±±     ÛÛÛ±±       ÛÛÛ±±        ÛÛÛ±±±');
  // display.writeln('     ÛÛÛ±ÛÛÛ±        ÛÛÛ±± ÛÛÛ±        ÛÛÛ±      ÛÛÛ±±±       ÛÛÛ±±±');
  // display.writeln('     ÛÛÛ±±ÛÛÛ±       ÛÛÛ±±  ÛÛÛ±       ÛÛÛ±±     ÛÛÛ±±      ÛÛÛÛ±±±');
  // display.writeln('     ÛÛÛ±± ÛÛÛ±      ÛÛÛ±±   ÛÛÛ±       ÛÛÛÛÛÛÛÛÛÛÛ±±±     ÛÛÛÛÛÛÛÛÛÛÛÛÛ');
  // display.writeln('     ÛÛÛ±±  ÛÛÛ±       ±±±     ±±±        ±±±±±±±±±±±        ±±±±±±±±±±±±±');
  // display.writeln('     ÛÛÛ±±   ÛÛÛ±');
  // display.writeln('     ÛÛÛ±±    ÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛÛ');
  // display.writeln('       ±±±      ±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±');

  display.bak(Color.Blue);
  display.col(Color.LightCyan);

  display.gotoxy(1, 9);
  display.writeln(
    '  Revitalized from the Fountain of Youth you uncovered in your last adventure',
  );
  display.writeln(
    "  through Kroz,  you decide it's time once again to explore the vast mystical",
  );
  display.writeln(
    '  kingdom.  From your last journey through the underground world of Kroz, you',
  );
  display.writeln(
    '  noticed a new tunnel that requires further investigation.  What new mystery',
  );
  display.writeln(
    '  awaits below?  Your adrenaline level rises as you decend the secret tunnels',
  );
  display.writeln(
    '               that lead into the heart of Kroz.  One more time...',
  );

  // display.gotoxy(23);
  // display.writeln('But only if you can reach it alive!');

  display.drawText(27, 25, 'Press any key to continue.', Color.LightGreen);

  const x = WIDTH / 2 - TITLE.length / 2;

  controls.clearKeys();
  while (!controls.anyKey()) {
    display.drawText(x, 3, TITLE, RNG.getUniformInt(0, 16), Color.Red);
    await delay(50);

    // await sound.play(300, 100);
    await delay(100);
  }
  controls.clearKeys();
}

export async function endRoutine() {
  await sound.footStep();
  await delay(200);
  await sound.footStep();
  await delay(200);
  await sound.footStep();

  await flash('Oh no, something strange is happening!');
  await flash('You are magically transported from Kroz!');

  // Check for infinite items
  const gems = (world.state.gems = isFinite(world.state.gems)
    ? world.state.gems
    : 150);
  const whips = (world.state.whips = isFinite(world.state.whips)
    ? world.state.whips
    : 20);
  const teleports = (world.state.teleports = isFinite(world.state.teleports)
    ? world.state.teleports
    : 10);
  const keys = (world.state.keys = isFinite(world.state.keys)
    ? world.state.keys
    : 5);

  await flash('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    world.state.gems--;
    world.state.score += 10;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await flash('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    world.state.whips--;
    world.state.score += 10;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await flash('Your Teleport Scrolls are worth 200 points each...');
  for (let i = 0; i < teleports; i++) {
    world.state.teleports--;
    world.state.score += 20;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await flash('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    world.state.keys--;
    world.state.score += 1000;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  display.clear();

  display.gotoxy(25, 3);
  display.bak(Color.Blue);

  display.writeln('ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ');

  display.gotoxy(15, 5);
  display.writeln(
    '   Carefully, you place the ancient tome on your table and open',
  );
  display.writeln(' to the first page.  You read the book intently, quickly');
  display.writeln(' deciphering the archaic writings.');
  display.writeln(
    '   You learn of Lord Dullwit, the once powerful and benevolent',
  );
  display.writeln(
    ' ruler of Kroz, who sought wealth and education for his people.',
  );
  display.writeln(
    ' The magnificent kingdom of Kroz was once a great empire, until',
  );
  display.writeln(
    ' it was overthrown by an evil Wizard, who wanted the riches of',
  );
  display.writeln(' Kroz for himself.');
  display.writeln(
    '   Using magic beyond understanding, the Wizard trapped Lord',
  );
  display.writeln(
    ' Dullwit and his people in a chamber so deep in Kroz that any',
  );
  display.writeln(' hope of escape was fruitless.');
  display.writeln(
    '   The Wizard then built hundreds of deadly chambers that would',
  );
  display.writeln(' stop anyone from ever rescuing the good people of Kroz.');
  display.writeln(
    '   Once again your thoughts becomes clear:  To venture into the',
  );
  display.writeln(' depths once more and set free the people of Kroz, in:');
  display.writeln('');

  await flash('Press any key, Adventurer.');
  world.state.done = true;
}
