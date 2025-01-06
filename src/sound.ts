/* eslint-disable no-sparse-arrays */
import { RNG } from 'rot-js';
import { delay } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ZZFX } from 'zzfx';

const SILENT = false;

ZZFX.volume = 0.005;

export function play(frequency: number, duration: number, volume: number = 1) {
  if (SILENT) return delay(duration);

  ZZFX.play(
    ...[
      volume, // volume
      0, // randomness
      frequency, // frequency
      0, // attack
      duration / 1000, // sustain
      0, //duration / 1000, // release
    ],
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
export async function moveRock() {
  for (let i = 150; i > 35; i--) {
    await play(i, 16, 50);
  }
}

const blockedWallSample = ZZFX.buildSamples(
  ...[10, 0, 40, , 0.1, 0, , 0, , , , , , 1],
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
