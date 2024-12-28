import "./style.css";

import { Display } from "./display";
import { World } from "./world";
import { Engine } from "./engine";

window.addEventListener("DOMContentLoaded", () => {
  const display = new Display();
  const world = new World(display);

  const engine = new Engine(display, world);

  const container = display.getContainer()!;
  const app = document.getElementById("app")!;
  app.appendChild(container);
  engine.start();
});
