import { RNG } from "rot-js";
import { type Display } from "./display";
import { Action } from "./controls";
import { type World } from "./world";
import { delay, sound } from "./sound";
import { XBot, YBot } from "./constants";
import { BlockChar, Tile } from "./blocks";
import * as controls from "./controls";

export class Engine {
  constructor(
    private readonly display: Display,
    private readonly world: World,
  ) {
    world.triggerRender.add(() => this.render());
  }

  async start() {
    controls.start();

    await this.renderTitle();

    this.world.nextLevel();

    for (let i = 0; i < 80; i++) {
      this.display.gotoxy(
        this.world.player.x + XBot,
        this.world.player.y + YBot,
      );
      this.display.col(RNG.getUniformInt(0, 15));
      this.display.bak(RNG.getUniformInt(0, 8));
      this.display.write(BlockChar[Tile.Player]);
      await delay(1);
      sound(i / 2, 1000, 30);
    }

    controls.controlUp.add((action: Action) => {
      this.update(action);
    });

    this.render();
  }

  async update(action: Action) {
    if (await this.world.playerAction(action)) {
      await this.world.moveAll();
      // await this.world.moveMedium();
      // await this.world.moveFast();
    }
    this.render();
  }

  render() {
    this.display.clear();
    this.world.renderBorder();
    this.world.renderScreen();
    this.world.renderPlayfield();
    this.world.renderStats();
  }

  async renderTitle() {
    this.display.bak(1);

    this.display.gotoxy(1, 9);
    this.display.col(11);
    this.display.writeln(
      `  In your search for the priceless Amulet within the ancient Caverns of Kroz,`,
    );
    this.display.writeln(
      `  you have stumbled upon a secret passage leading deep into the Earth.   With`,
    );
    this.display.writeln(
      `  your worn lantern you descend into the misty depths,  sweat beading on your`,
    );
    this.display.writeln(
      `  forehead as you realize the peril that awaits.   If this is really the path`,
    );
    this.display.writeln(
      `  leading into the great underground caverns you'll find unimaginable wealth.`,
    );

    this.display.gotoxy(23);
    this.display.writeln("But only if you can reach it alive!");

    this.display.gotoxy(27, 25);
    this.display.col(12);
    this.display.write("Press any key to continue.");

    while (!controls.isAnyActionActive()) {
      this.display.gotoxy(34, 3);
      this.display.col(RNG.getUniformInt(0, 16));
      this.display.write("CAVERNS OF KROZ");
      await delay(50);

      // await sound(300, 100);
      await delay(100);
    }
  }
}
