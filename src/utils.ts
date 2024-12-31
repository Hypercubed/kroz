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
