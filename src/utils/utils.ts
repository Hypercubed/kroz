export function delay(duration: number = 0) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
