const SILENT = false;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const VOLUME = 0.005;
// const VOLUME_CURVE = [1.0, 0.61, 0.37, 0.22, 0.14, 0.08, 0.05, 0.0];

export function sound(frequency: number, duration: number, volume: number = 1) {
  if (SILENT) return delay(duration);

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
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

export function delay(duration: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function instant() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

// procedure GrabSound;
//   var x:integer;
//  begin
//   for x:=1 to 65 do sound(random(1000)+1000);nosound
//  end;

export function grabSound() {
  for (let x = 1; x <= 65; x++) {
    sound(Math.random() * 1000 + 1000, 1000);
  }
}

export async function blockSound() {
  for (let x = 150; x >= 35; x--) {
    await sound(x, 1);
  }
}

export async function noneSound() {
  await sound(400, 120, 5);
  await delay(10);
  await sound(700, 120, 5);
  await delay(10);
}

export async function footStep() {
  for (let x = 1; x <= 23; x++) {
    sound(Math.random() * 550 + 350, 120);
  }
  await delay(120);
  for (let x = 1; x <= 30; x++) {
    sound(Math.random() * 50 + 150, 50);
  }
}

export async function openDoor() {
  for (let x = 10; x <= 90; x++) {
    await sound(x, 15, 100);
  }
}
