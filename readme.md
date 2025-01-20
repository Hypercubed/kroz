# The Forgotton Adventures of Kroz

## Introduction

This is a text adventure game that is a tribute to the original Kroz series of games. The original Kroz games were created by Scott Miller and published by Apogee Software. The original Kroz games were released in the late 1980s and early 1990s. This is an unofficial rewrite/remix of the original Kroz games in JavaScript (TypeScript).

The goal is mimic the original Kroz games, while proving a framework for new features and improvements. This version of Kroz is written in JavaScript (TypeScript) and uses the ROT.js library for the game engine using the [original Kroz source code](https://github.com/tangentforks/kroz) as a reference.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/hypercubed)

## How to Play

The game is played in the browser. You can play the game by visiting the following URL: https://hypercubed.github.io/kroz/ or https://hypercubed.itch.io/the-forgotton-adventures-of-kroz.

## Screenshots

### Title Screen

![Title Screen](./screenshots/title-screen.png)

### Game Screen

![Game Screen](./screenshots/game-screen.png)

## How to create your own version of Kroz

I encourage you to fork this project and create your own version of Kroz. You can modify the levels, add new features, or even create a whole new game. The game is written in TypeScript and uses [Tiled](https://www.mapeditor.org/) to define the tileset and levels. Here is a quick overview:

### Creating Your Own Levels

The levels are defined using Tiled and can be read directly into the game. To get started:

- **Open an Existing Level**: Open an existing `*.map.json` file in Tiled and modify it to your liking.
- **Create a New Level**: You can also create a new level from scratch. Be sure to use the `kroz.tileset.json` tileset.
- **Layer Management**: Use Tiled's layers to define the level. Note that the "top-most" layer takes precedence.
- **Tile Properties**: If you'd like to change properties of tiles in a particular level, you can add an Object Layer and define the properties there. Only "Insert Tile" objects are supported. Use the properties panel to modify the properties of the tile.

### Adding New Features

You can extend the game by adding new features. The game is built with modularity in mind, so you can easily add new mechanics, enemies, or items. Refer to the source code to understand the existing structure and how new features can be integrated.

### Documentation and Support

I realize documentation is lacking, but I hope to improve this in the future. If you have any questions, please ask using GitHub's discussions: [GitHub Discussions](https://github.com/Hypercubed/kroz/discussions/).

Feel free to submit pull requests with your changes. I would love to see what you come up with and collaborate on improving this project.

## Q&A

**Q: Is this an Kroz emulator?**

*A*: No. This is a rewrite of the original Kroz games in JavaScript (TypeScript). The original Kroz games were written in PASCAL.

**Q: Why does X not work like the original Kroz?**

*A*: This is a work in progress. The goal is to mimic the original Kroz games closely, but there may be differences.  Timing will be particularly hard to get right.

**Q: Can I contribute to this project?**

*A*: Yes! Please feel free to fork this project and submit a pull request.  I would love to have help with this project.

**Q: Can I add a level?**

*A*: Sure! The levels are defined in the `levels.ts` file.  You can add a new level by adding a new object to the `levels` array.

## License

The original "Kroz" copyright 1987 - 2022 Apogee Entertainment Inc. All trademarks and copyrights reserved.  This project is a tribute to the original Kroz games and is not affiliated with Apogee Entertainment Inc. in any way.

This project is licensed under the MIT License. See the LICENSE file for details.

