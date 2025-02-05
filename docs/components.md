# Tags

## isMob

Entity is Mobile

## followsPlayer

Entity will follow the player, must be used with isMob

## isPlayer

## isGenerator

## isInvisible

## isSecreted

Entity is hidden from the player, will appear as a Chance (?)

## isPushable

## isPassable
Tile is able to be walked on by the player

## isBombable

Tile is destructible by bombs

# Components

## Renderable

A renderable is a component that can be rendered to the screen.  It contains values for the character, color, and background color.

## Position

A position is a component that contains the x and y coordinates of an entity.  It is used to place mobile entities on the screen.

##  Walkable

Component to store the type of entity that can walk on this tile.

##  Eats

Component to store the type of entity that can be eaten by this entity.

##  DestroyedBy

Component to store the type of entity that can be destroyed by this entity.

##  Attacks

A component that allows an entity to attack the player.  It contains a damage value.

##  Collectible

A component that allows an entity to be collected by the player.  It contains a count for each item to be collected.

##  AnimatedWalking

A component that allows an entity to animate while walking.  It contains a list of character values to be displayed randomly.

##  Trigger

A component that allows an entity to trigger an event when it is interacted with.

##  ChangeLevel

##  Speed

A component that allows an entity to move at different speeds.  It contains a base pace and a hasted pace.

##  Breakable

A component that allows an entity to be broken when whipped.
I contains a hardness value and a sound to play when hit.

##  FoundMessage

A component that displays a message when the entity is first found.
