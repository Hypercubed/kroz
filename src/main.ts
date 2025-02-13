import * as engine from './modules/engine';

async function go() {
  engine.init();
  await engine.start();
}

try {
  document.fonts.ready.then(go);
} catch {
  window.addEventListener('DOMContentLoaded', go);
}
