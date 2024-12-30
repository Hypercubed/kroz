import './style.css';

import * as display from './display';
import * as engine from './engine';

window.addEventListener('DOMContentLoaded', () => {
  const container = display.getContainer()!;
  const app = document.getElementById('app')!;
  app.appendChild(container);
  engine.start();
});
