/* eslint-disable no-sparse-arrays */
import { default as RNG } from 'rot-js/lib/rng';
import { delay } from '../utils/utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ZZFX } from 'zzfx';
import { VOLUME } from '../data/constants';

const SILENT = false;

ZZFX.volume = VOLUME;

export function play(frequency: number, duration: number, volume: number = 1) {
  if (SILENT) return delay(duration);

  ZZFX.play(
    ...[
      volume, // volume
      0, // randomness
      frequency, // frequency
      0, // attack
      duration / 1000, // sustain
      0 //duration / 1000, // release
    ]
  );

  return delay(duration);
}

export async function grab() {
  // TODO: Replace with square wave?
  for (let x = 1; x <= 65; x++) {
    play(RNG.getUniformInt(1000, 2000), 1);
  }
  await delay(0);
}

export async function blocked() {
  // TODO: Replace with square wave?
  for (let x = 150; x >= 35; x--) {
    await play(x, 1);
  }
}

export async function noneSound() {
  await play(400, 120, 5);
  await delay(10);
  await play(700, 120, 5);
  await delay(10);
}

export async function footStep() {
  for (let x = 1; x <= 23; x++) {
    play(RNG.getUniformInt(350, 900), 120);
  }
  await delay(120);
  for (let x = 1; x <= 30; x++) {
    play(RNG.getUniformInt(150, 200), 50);
  }
}

export async function openDoor() {
  for (let x = 10; x <= 90; x++) {
    await play(x, 15, 100);
  }
}

// Moving a rock sound
// const movingSound = ZZFX.buildSamples(...[40,0,60,,.1,.5,,0,1,,,,,3,,,,,.1]);
// export async function pushRock() {
//   ZZFX.playSamples(movingSound);
//   // for (let i = 150; i > 35; i--) {
//   //   play(i, 16, 50);
//   // }
//   // await delay(16);
// }

export async function moveRock() {
  for (let i = 150; i > 35; i--) {
    await play(i, 16, 50);
  }
}

const blockedWallSample = ZZFX.buildSamples(
  ...[10, 0, 40, , 0.1, 0, , 0, , , , , , 1]
);
export async function blockedWall() {
  ZZFX.playSamples(blockedWallSample);
}

export async function staticNoise() {
  for (let x = 1; x <= 25; x++) {
    if (Math.random() > 0.5) {
      const r = RNG.getUniformInt(0, 59) + 10;
      for (let y = 1; y <= r; y++) {
        play(RNG.getUniformInt(0, 4000) + 3000, 16, 10);
      }
    } else {
      await delay(RNG.getUniformInt(0, 29));
    }
  }
}

export async function splat() {
  for (let i = 8000; i >= 20; i--) {
    play(RNG.getUniformInt(0, i), 1, 30);
  }
  await delay(300);
}

export async function bonusSound() {
  for (let i = 10; i < 45; i++) {
    for (let j = 1; j < 13; j++) {
      await play(i * i * j, j + 1, 100);
    }
  }
}

export async function kill(type: number) {
  await play(200 + 200 * type, 25, 100);
}

export async function cheat() {
  await play(2000, 40, 10);
}

export async function locked() {
  await play(Math.random() * 129 + 30, 150, 100);
}

export async function whip() {
  await play(70, 50 * 8, 100);
}

export async function whipHit() {
  for (let i = 330; i > 20; i--) {
    // TODO: This sound sucks
    // sound.play(RNG.getUniformInt(0, i), 10);
    play(90, 10, 0.5);
  }
}

export async function whipBreak() {
  await play(400, 50);
}

export async function whipBreakRock() {
  await play(130, 50);
}

export async function whipMiss() {
  play(130, 25);
  await play(90, 50);
}

export async function teleport() {
  await play(20, 10, 100);
}

export async function spearHit() {
  await play(300, 10, 10);
}

export async function amulet() {
  for (let x = 45; x >= 11; x--) {
    for (let y = 13; y >= 1; y--) {
      await play(x * x * y, y + 1, 100);
    }
  }
}

export async function bombFuse() {
  for (let i = 70; i <= 600; i++) {
    play(i * 2, 3, 10);
    if (i % 10 === 0) await delay(1);
  }
}

export async function bomb() {
  await play(30, 10, 10);
  await delay(20);
}

export async function quakeTrigger() {
  for (let i = 0; i < 2500; i++) {
    play(RNG.getUniformInt(0, i), 5, 100);
    if (i % 25 === 0) await delay();
  }
}

export async function quakeDone() {
  for (let i = 2500; i > 50; i--) {
    play(RNG.getUniformInt(0, i), 5, 100);
    if (i % 25 === 0) await delay();
  }
}

export async function quakeRockFall() {
  for (let i = 0; i < 50; i++) {
    play(RNG.getUniformInt(0, 200), 50, 100);
  }
  await delay(50);
}

export async function showGem() {
  await play(RNG.getUniformInt(110, 1310), 7, 100);
}

export async function blockSpell() {
  await play(200, 60, 100);
}

export async function rockCrushMob() {
  await play(600, 20);
}

export async function rockVaporized() {
  await play(90, 10, 10);
}

export async function rockDropped() {
  for (let i = 130; i > 5; i--) {
    await play(i * 8, 16, 100);
  }
}

export async function secretMessage() {
  for (let i = 20; i < 8000; i++) {
    play(i, 1, 100);
  }
  await delay(100);
}

export async function generateCreature() {
  for (let i = 5; i < 70; i++) {
    play(i * 8, 1);
  }
  await delay(50);
}

const soundMap = {
  Amulet: amulet,
  SecretMessage: secretMessage,
  WhipHit: whipHit,
  WhipBreak: whipBreak,
  WhipBreakRock: whipBreakRock,
  BlockedWall: blockedWall,
  Blocked: blocked,
  StaticNoise: staticNoise
};

export async function triggerSound(t: string) {
  if (soundMap[t as keyof typeof soundMap]) {
    return await soundMap[t as keyof typeof soundMap]();
  }
  console.warn('No sound for trigger:', t);
}
