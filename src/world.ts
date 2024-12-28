import { RNG } from "rot-js";
import { BlockChar, BlockColor, BlockMessage, MapLookup, Tile } from "./blocks";
import { XBot, XTop, YBot, YTop } from "./constants";
import { Entity } from "./entities";
import { Action } from "./controls";
import * as controls from "./controls";
import { ColorCodes, Colors, type Display } from "./display";
import {
  blockSound,
  delay,
  footStep,
  grabSound,
  noneSound,
  openDoor,
  sound,
} from "./sound";
import { MiniSignal } from "mini-signals";
import {
  LostLevel1,
  LostLevel2,
  CavernsLevel2,
  LostLevel4,
  CavernsLevel4,
  KingdomLevel1,
} from "./levels";

const LEVELS = 6;

export class World {
  player = new Entity(Tile.Player, 0, 0);
  entities: Entity[] = [];

  PF: Tile[][] = [];
  foundSet = new Set();

  level = 0;
  score = 0;
  gems = 20;
  whips = 0;
  teleports = 0;
  keys = 0;

  CF = Colors.Black; // Floor color
  CB = Colors.Black; // Background color

  GemColor = RNG.getUniformInt(1, 16);

  actionActive = false;

  readonly triggerRender = new MiniSignal();

  constructor(private readonly display: Display) {}

  loadLevel() {
    switch (this.level) {
      case 1:
        this.readLevel(LostLevel1);
        break;
      case 2:
        this.readLevel(LostLevel2);
        break;
      case 3:
        this.readLevel(CavernsLevel2);
        break;
      case 4:
        this.readLevel(LostLevel4);
        break;
      case 5:
        this.readLevel(CavernsLevel4);
        break;
      case 6:
        this.readLevel(KingdomLevel1);
        break;
    }
  }

  nextLevel() {
    this.level = this.level === LEVELS ? 1 : this.level + 1;
    this.loadLevel();
    this.triggerRender.dispatch();
  }

  prevLevel() {
    this.level = this.level === 0 ? LEVELS : this.level - 1;
    this.loadLevel();
    this.triggerRender.dispatch();
  }

  async moveAll() {
    for (let i = 0; i < this.entities.length; i++) {
      const e = this.entities[i];
      if (e.x === -1 || e.y === -1) continue; // dead
      await this.enemyMove(e);
    }
  }

  // async moveSlow() {
  //   for (let i = 0; i < this.entities.length; i++) {
  //     const e = this.entities[i];
  //     if (e.type === EntityTypes.Slow) {
  //       if (e.x === -1 || e.y === -1) continue; // dead
  //       await this.enemyMove(e);
  //     }
  //   }
  // }

  // async moveMedium() {
  //   for (let i = 0; i < this.entities.length; i++) {
  //     const e = this.entities[i];
  //     if (e.type === EntityTypes.Medium) {
  //       if (e.x === -1 || e.y === -1) continue; // dead
  //       await this.enemyMove(e);
  //     }
  //   }
  // }

  // async moveFast() {
  //   for (let i = 0; i < this.entities.length; i++) {
  //     const e = this.entities[i];
  //     if (e.type === EntityTypes.Fast) {
  //       if (e.x === -1 || e.y === -1) continue; // dead
  //       await this.enemyMove(e);
  //     }
  //   }
  // }

  private async enemyMove(e: Entity) {
    if (
      e.x === -1 ||
      e.y === -1 ||
      this.PF[e.x][e.y] !== (e.type as unknown as Tile)
    ) {
      e.kill();
      return;
    } // dead

    let dx = 0;
    let dy = 0;
    if (this.player.x < e.x) dx = -1;
    if (this.player.x > e.x) dx = 1;
    if (this.player.y < e.y) dy = -1;
    if (this.player.y > e.y) dy = 1;

    const x = e.x + dx;
    const y = e.y + dy;

    if (x < 0 || x >= XTop - XBot || y < 0 || y >= YTop - YBot) return;

    const block = this.PF?.[x]?.[y] ?? Tile.Floor;
    // console.log('move', e, x, y, block);

    switch (block) {
      case Tile.Block:
      case Tile.MBlock:
      case Tile.ZBlock:
      case Tile.GBlock: // Kills
        this.PF[e.x][e.y] = Tile.Floor;
        this.PF[x][y] = Tile.Floor;
        e.kill();
        this.score += block;
        sound(800, 18);
        sound(400, 20);
        break;
      case Tile.Floor: // Eats
      case Tile.TBlock:
      case Tile.TRock:
      case Tile.TGem:
      case Tile.TBlind:
      case Tile.TGold:
      case Tile.TWhip:
      case Tile.TTree:
        this.PF[e.x][e.y] = Tile.Floor;
        this.PF[(e.x = x)][(e.y = y)] = e.type as unknown as Tile;
        break;
      case Tile.Player:
        this.gems--;
        this.PF[e.x][e.y] = Tile.Floor;
        e.kill();
        break;
      default: // Blocked
        break;
    }
  }

  async playerAction(action: Action) {
    if (this.actionActive) return;
    this.actionActive = true;

    let playerMove = false;

    switch (action) {
      case Action.FreeItems:
        this.gems += 100;
        this.whips += 100;
        this.teleports += 100;
        this.keys += 100;
        this.renderStats();
        break;
      case Action.NextLevel:
        this.nextLevel();
        break;
      case Action.PrevLevel:
        this.prevLevel();
        break;
      case Action.North:
        await this.playerMove(0, -1);
        playerMove = true;
        break;
      case Action.South:
        await this.playerMove(0, +1);
        playerMove = true;
        break;
      case Action.West:
        await this.playerMove(-1, 0);
        playerMove = true;
        break;
      case Action.East:
        await this.playerMove(+1, 0);
        playerMove = true;
        break;
      case Action.Southeast:
        await this.playerMove(+1, +1);
        playerMove = true;
        break;
      case Action.Southwest:
        await this.playerMove(-1, +1);
        playerMove = true;
        break;
      case Action.Northeast:
        await this.playerMove(+1, -1);
        playerMove = true;
        break;
      case Action.Northwest:
        await this.playerMove(-1, -1);
        playerMove = true;
        break;
      case Action.Whip:
        await this.playerWhip();
        playerMove = true;
        break;
    }
    this.actionActive = false;

    return playerMove;
  }

  readLevel(level: string) {
    this.entities = [];

    const lines = level.split("\n").filter((line) => line.length > 0);
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];
      for (let x = 0; x < line.length; x++) {
        const char = line.charAt(x) ?? " ";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const block = (MapLookup as any)[char];

        this.PF[x] = this.PF[x] || [];
        this.PF[x][y] = block ?? char;

        switch (block) {
          case Tile.Player:
            this.player.x = x;
            this.player.y = y;
            break;
          case Tile.Slow:
          case Tile.Medium:
          case Tile.Fast:
            this.entities.push(new Entity(block, x, y));
            break;
        }
      }
    }
  }

  private async playerMove(dx: number, dy: number) {
    const x = this.player.x + dx;
    const y = this.player.y + dy;

    if (x < 0 || x >= XTop - XBot || y < 0 || y >= YTop - YBot) return;
    // Flash(16,25,'An Electrified Wall blocks your way.');

    const block = this.PF?.[x]?.[y] || Tile.Floor;

    switch (block) {
      case Tile.Floor:
      case Tile.Stop:
        this.go(this.player, x, y);
        break;
      case Tile.Slow:
      case Tile.Medium:
      case Tile.Fast:
        this.gems -= block;
        this.addScore(block);
        this.go(this.player, x, y);
        await sound(200 + 200 * block, 25, 100);
        break;
      case Tile.Block:
        this.addScore(block);
        await this.flash(Tile.Block, true);
        break;
      case Tile.Whip:
        grabSound();
        this.whips++;
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(Tile.Whip, true);
        break;
      case Tile.Stairs:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(Tile.Stairs, true);
        this.nextLevel();
        break;
      case Tile.Chest:
        if (this.keys > 0) {
          this.keys--;
          const whips = RNG.getUniformInt(2, 5);
          const gems = RNG.getUniformInt(2, 5);
          this.whips += whips;
          this.gems += gems;
          this.addScore(block);
          this.go(this.player, x, y);
          await this.flash(
            `You found ${gems} gems and ${whips} whips inside the chest!`,
          );
        }
        break;
      case Tile.SlowTime:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Gem:
        this.gems++;
        this.addScore(block);
        this.go(this.player, x, y);
        this.flash(block, true);
        break;
      case Tile.Invisible:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Teleport:
        this.teleports++;
        this.addScore(block);
        this.go(this.player, x, y);
        this.flash(block, true);
        break;
      case Tile.Key:
        grabSound();
        this.keys++;
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Door:
        if (this.keys < 1) {
          sound(Math.random() * 129 + 30, 150, 100);
          await this.flash(block);
        } else {
          openDoor();
          this.keys--;
          this.addScore(block);
          this.go(this.player, x, y);
          await this.flash("The Door opens!  (One of your Keys is used.)");
        }
        break;
      case Tile.Wall:
        for (let x = 1; x <= 2000; x++) {
          sound(RNG.getUniformInt(0, x * 2 + 200) + x, 50);
        }
        this.addScore(block);
        await this.flash(block, true);
        break;
      case Tile.River:
        this.addScore(block);
        await this.flash(block, true);
        break;
      case Tile.SpeedTime:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Trap:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Power:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Tree:
      case Tile.Forest:
        this.addScore(block);
        await blockSound();
        await this.flash(block, true);
        break;
      case Tile.Bomb:
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Lava:
        this.gems -= 10;
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Pit:
        this.go(this.player, x, y);
        this.gems = 0; // dead
        await this.flash(block);
        break;
      case Tile.Tome:
        // Tome_Message;
        this.addScore(block);
        await this.flash(block);
        await this.flash("Congratualtions, Adventurer, you finally did it!!!");
        break;
      case Tile.Nugget:
        grabSound();
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Tunnel:
      case Tile.Freeze:
      case Tile.Quake:
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.IBlock:
      case Tile.IDoor:
        await this.flash(block, true);
        break;
      case Tile.Zap:
      // Score:=Score+(Killed div 3)+2;
      // eslint-disable-next-line no-fallthrough
      case Tile.Create:
      case Tile.Generator:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.MBlock:
        this.addScore(block);
        await this.flash(block, true);
        break;
      case Tile.ShowGems:
        this.go(this.player, x, y);
        await this.flash(block);
        break;
      case Tile.Tablet:
      case Tile.BlockSpell:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(block, true);
        break;
      case Tile.Chance: {
        this.addScore(block);
        const g = RNG.getUniformInt(14, 18);
        this.gems += g;
        this.go(this.player, x, y);
        await this.flash(`You found a Pouch containing ${g} Gems!`);
        break;
      }
      case Tile.Statue:
        this.go(this.player, x, y);
        await this.flash(block);
        break;
      case Tile.WallVanish:
        this.go(this.player, x, y);
        await this.flash(block);
        break;
      case Tile.K:
      case Tile.R:
      case Tile.O:
      case Tile.Z:
        this.go(this.player, x, y);
        break;
      case Tile.OWall1:
      case Tile.OWall2:
      case Tile.OWall3:
        this.addScore(block);
        this.go(this.player, x, y);
        await this.flash(Tile.OWall1, true);
        break;
      case Tile.OSpell1:
      case Tile.OSpell2:
      case Tile.OSpell3:
        this.go(this.player, x, y);
        await this.flash(Tile.OSpell1, true);
        break;
      case Tile.CSpell1:
      case Tile.CSpell2:
      case Tile.CSpell3:
        this.go(this.player, x, y);
        await this.flash(Tile.CSpell1, true);
        break;
      case Tile.Rock:
        this.go(this.player, x, y);
        await this.flash(Tile.Rock, true);
        break;
      case Tile.EWall:
        this.addScore(block);
        this.gems--;
        await this.flash(Tile.EWall, true);
        break;
      case Tile.CWall1:
      case Tile.CWall2:
      case Tile.CWall3:
      case Tile.Trap2:
      case Tile.Trap3:
      case Tile.Trap4:
      case Tile.Trap5:
      case Tile.Trap6:
      case Tile.Trap7:
      case Tile.Trap8:
      case Tile.Trap9:
      case Tile.Trap10:
      case Tile.Trap11:
      case Tile.Trap12:
      case Tile.Trap13:
        this.go(this.player, x, y);
        break;
      case Tile.TBlind:
      case Tile.TBlock:
      case Tile.TGem:
      case Tile.TGold:
      case Tile.TRock:
      case Tile.TTree:
      case Tile.TWhip:
        this.go(this.player, x, y);
        break;
      case Tile.Rope:
        this.go(this.player, x, y);
        await this.flash(Tile.Rope, true);
        break;
      case Tile.Message:
        // Secret_Message;
        break;
      case Tile.ShootRight:
        // Shoot_Right;
        break;
      case Tile.ShootLeft:
        // Shoot_Left;
        break;
      case Tile.DropRope:
      case Tile.DropRope2:
      case Tile.DropRope3:
      case Tile.DropRope4:
      case Tile.DropRope5:
        this.go(this.player, x, y);
        break;
      case Tile.Amulet:
        // Got_Amulet
        this.go(this.player, x, y);
        break;
      default:
        break;
    }
  }

  private go(e: Entity, x: number, y: number) {
    footStep();
    this.PF[e.x][e.y] = Tile.Floor;
    this.PF[(e.x = x)][(e.y = y)] = e.type as unknown as Tile;
    this.triggerRender.dispatch();
  }

  private async playerWhip() {
    if (this.whips < 1) {
      noneSound();
      return;
    }

    this.whips--;

    const PX = this.player.x;
    const PY = this.player.y;

    sound(70, 50 * 8, 100);
    if (PY > YBot && PX > XBot) await this.hit(PX - 1, PY - 1, "\\");
    if (PX > XBot) await this.hit(PX - 1, PY, "-");
    if (PY < YTop && PX > XBot) await this.hit(PX - 1, PY + 1, "/");
    if (PY < YTop) await this.hit(PX, PY + 1, "|");
    if (PY < YTop && PX < XTop) await this.hit(PX + 1, PY + 1, "\\");
    if (PX < XTop) await this.hit(PX + 1, PY, "-");
    if (PY > YBot && PX < XTop) await this.hit(PX + 1, PY - 1, "/");
    if (PY > YBot) await this.hit(PX, PY - 1, "|");
  }

  // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
  async hit(x: number, y: number, ch: string) {
    const thing = this.PF?.[x]?.[y] ?? Tile.Floor;

    this.display.draw(
      x + XBot,
      y + YBot,
      ch,
      ColorCodes[Colors.HighIntensityWhite],
      ColorCodes[Colors.Black],
    );

    switch (thing) {
      case Tile.Slow:
      case Tile.Medium:
      case Tile.Fast: // Kill
        await sound(130, 50);
        this.PF[x][y] = Tile.Floor;
        break;
      case Tile.Block:
      case Tile.Forest:
      case Tile.Tree:
      case Tile.Message: // Destroy
        await sound(130, 50);
        this.PF[x][y] = Tile.Floor;
        break;
      case Tile.Invisible:
      case Tile.SpeedTime:
      case Tile.Trap:
      case Tile.Power:
      case Tile.Generator:
      case Tile.K:
      case Tile.R:
      case Tile.O:
      case Tile.Z: // Break
        await sound(400, 50);
        this.PF[x][y] = Tile.Floor;
        break;
      case Tile.Quake:
      case Tile.IBlock:
      case Tile.IWall:
      case Tile.IDoor:
      case Tile.Trap2:
      case Tile.Trap3:
      case Tile.Trap4:
      case Tile.ShowGems:
      case Tile.BlockSpell:
      case Tile.Trap5:
      case Tile.Trap6:
      case Tile.Trap7:
      case Tile.Trap8:
      case Tile.Trap9:
      case Tile.Trap10:
      case Tile.Trap11:
      case Tile.Trap12:
      case Tile.Trap13: // Break
      case Tile.Stop:
        this.PF[x][y] = Tile.Floor;
        break;
      case Tile.Wall:
      case Tile.Statue:
      case Tile.Rock:
      case Tile.ZBlock:
      case Tile.GBlock:
      case Tile.MBlock:
      // TBD
      // eslint-disable-next-line no-fallthrough
      default:
        await delay(50);
        break;
    }
  }

  renderBorder() {
    this.display.col(7);
    this.display.bak(0);

    for (let x = XBot - 1; x <= XTop; x++) {
      this.display.draw(x, 0, "▒");
      this.display.draw(x, YTop, "▒");
    }
    for (let y = YBot - 1; y <= YTop; y++) {
      this.display.draw(0, y, "▒");
      this.display.draw(XTop, y, "▒");
    }
  }

  private async flash(message: string | number, once = false) {
    if (once) {
      if (this.foundSet.has(message)) return;
      this.foundSet.add(message);
    }

    if (typeof message === "number") {
      message = BlockMessage[message];
    }

    if (!message) return;

    const x = (XTop - message.length) / 2;
    const y = YTop;
    const bg = Colors.Black;

    while (!controls.isAnyActionActive()) {
      const fg = RNG.getUniformInt(1, 16) as Colors;
      this.display.drawText(x, y, message, ColorCodes[fg], ColorCodes[bg]);
      await delay(50);
    }
  }

  renderPlayfield() {
    this.display.col(7);
    this.display.bak(0);

    for (let x = 0; x < this.PF.length; x++) {
      for (let y = 0; y < this.PF[x].length; y++) {
        const block: Tile = this.PF[x][y] || Tile.Floor;
        const blockChar =
          BlockChar[block] ?? block?.toString().toUpperCase() ?? " ";

        let fg = BlockColor[block]?.[0] ?? Colors.White;
        let bg = BlockColor[block]?.[1] ?? Colors.Black;

        switch (block) {
          case Tile.Floor:
          case Tile.Stop:
            fg = this.CF;
            bg = this.CB;
            break;
          case Tile.Gem:
            fg = this.GemColor;
            break;
          default:
            if (blockChar >= "A" && blockChar <= "Z") {
              fg = Colors.HighIntensityWhite;
              bg = Colors.Brown;
            }
            break;
        }

        this.display.draw(
          x + XBot,
          y + YBot,
          blockChar,
          ColorCodes[fg as Colors],
          ColorCodes[bg],
        );
        this.display.bak(0);
      }
    }
  }

  renderStats() {
    this.display.col(Colors.Red);
    this.display.bak(Colors.Grey);
    this.display.print(70, 2, pad(this.score.toString(), 5, 7));
    this.display.print(70, 5, pad(this.level.toString(), 4, 7));
    this.display.print(70, 8, pad(this.gems.toString(), 4, 7));
    this.display.print(70, 11, pad(this.whips.toString(), 4, 7));
    this.display.print(70, 14, pad(this.teleports.toString(), 4, 7));
    this.display.print(70, 17, pad(this.keys.toString(), 4, 7));
  }

  renderScreen() {
    this.display.col(14);
    this.display.bak(Colors.Blue);
    this.display.print(71, 1, "Score");
    this.display.print(71, 4, "Level");
    this.display.print(71, 7, "Gems");
    this.display.print(71, 10, "Whips");
    this.display.print(69, 13, "Teleports");
    this.display.print(71, 16, "Keys");
  }

  addScore(block: Tile) {
    switch (block) {
      case Tile.Slow:
      case Tile.Medium:
      case Tile.Fast:
        this.score += block;
        break;
      case Tile.Block:
      case Tile.Wall:
      case Tile.River:
      case Tile.Tree:
      case Tile.Forest:
      case Tile.MBlock:
      case Tile.OWall1:
      case Tile.OWall2:
      case Tile.OWall3:
      case Tile.EWall:
        if (this.score > 2) this.score -= 2;
        break;
      case Tile.Whip:
      case Tile.SlowTime:
      case Tile.Bomb:
        this.score++;
        break;
      case Tile.Stairs:
        this.score += this.level * 5;
        break;
      case Tile.Chest:
        this.score += 10 + Math.floor(this.level / 2);
        break;
      case Tile.Gem:
        this.score += Math.floor(this.level / 2) + 1;
        break;
      case Tile.Invisible:
        this.score += 25;
        break;
      case Tile.Teleport:
      case Tile.Freeze:
      case Tile.Door:
        this.score += 2;
        break;
      case Tile.SpeedTime:
      case Tile.Power:
        this.score += 5;
        break;
      case Tile.Trap:
        if (this.score > 5) this.score -= 5;
        break;
      case Tile.Lava:
        if (this.score > 100) this.score += 100;
        break;
      case Tile.Tome:
        this.score += 5000;
        break;
      case Tile.Tablet:
        this.score += this.level + 2500;
        break;
      case Tile.Chance:
        this.score += 100;
        break;
      // case Tile.Border:
      //   if (this.score > this.level) this.score -= Math.floor(this.level / 2);
      //   break;
    }
  }

  // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST1.LEV#L1270
  // endRoutine
}

function pad(s: string, n: number, r: number) {
  return s.padStart(n, " ").padEnd(r, " ");
}
