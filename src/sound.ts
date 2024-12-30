import { RNG } from 'rot-js';

const SILENT = false;

const audioContext = new (window.AudioContext ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).webkitAudioContext)();

const VOLUME = 0.005;
// const VOLUME_CURVE = [1.0, 0.61, 0.37, 0.22, 0.14, 0.08, 0.05, 0.0];

export function play(frequency: number, duration: number, volume: number = 1) {
  if (SILENT) return delay(duration);

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  gainNode.gain.setValueAtTime(volume * VOLUME, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration / 1000,
  );
  // gainNode.gain.setValueCurveAtTime(VOLUME_CURVE.map((v) => v * VOLUME * volume), audioContext.currentTime, duration / 1000);

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      oscillator.stop();
      // audioContext.close();
      resolve();
    }, duration);
  });
}

export function delay(duration: number = 0) {
  if (duration <= 0) {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export async function grab() {
  for (let x = 1; x <= 65; x++) {
    play(Math.random() * 1000 + 1000, 1000);
  }
  await delay(59);
}

export async function blocked() {
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
    play(Math.random() * 550 + 350, 120);
  }
  await delay(120);
  for (let x = 1; x <= 30; x++) {
    play(Math.random() * 50 + 150, 50);
  }
}

export async function openDoor() {
  for (let x = 10; x <= 90; x++) {
    await play(x, 15, 100);
  }
}

export async function blockMove() {
  for (let x = 1; x < 65; x++) {
    play(RNG.getUniformInt(0, 1000) + 1000, 16, 10);
  }
  await delay(50);
}

export async function blockedWall() {
  for (let x = 1; x <= 2000; x++) {
    play(RNG.getUniformInt(0, x * 2 + 200) + x, 50);
  }
}

export async function noise() {
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
