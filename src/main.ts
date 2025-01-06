import * as engine from './modules/engine';

function go() {
  engine.init();
  engine.start();
}

try {
  document.fonts.ready.then(go);
} catch {
  window.addEventListener('DOMContentLoaded', go);
}
