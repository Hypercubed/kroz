<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.11" tiledversion="1.11.1" name="Curses_1920x900" tilewidth="24" tileheight="36" tilecount="256" columns="16">
 <editorsettings>
  <export target="../src/data/kroz.lua" format="lua"/>
 </editorsettings>
 <image source="ASCII.png" width="384" height="576"/>
 <tile id="32" type="0">
  <properties>
   <property name="Tile.bg" value="Black"/>
   <property name="Tile.ch" value=" "/>
   <property name="Tile.fg" value="Black"/>
   <property name="name" value="Floor"/>
  </properties>
 </tile>
 <tile id="33" type="42">
  <properties>
   <property name="Tile.ch" value="■"/>
   <property name="Tile.fg" value="LightBlue"/>
   <property name="message" value="You found an Ancient Tablet of Wisdom...2,500 points!"/>
   <property name="name" value="Tablet"/>
  </properties>
 </tile>
 <tile id="34" type="51">
  <properties>
   <property name="Tile.ch" value="Z"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="message" value="Super Kroz Bonus -- 10,000 points!"/>
   <property name="name" value="Z"/>
  </properties>
 </tile>
 <tile id="35" type="14">
  <properties>
   <property name="Tile.bg" value="Brown"/>
   <property name="Tile.ch" value="█"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="message" value="A Solid Wall blocks your way."/>
   <property name="name" value="Wall"/>
  </properties>
 </tile>
 <tile id="36" type="67">
  <properties>
   <property name="name" value="Trap5"/>
  </properties>
 </tile>
 <tile id="37" type="34">
  <properties>
   <property name="Tile.ch" value="▲"/>
   <property name="Tile.fg" value="LightRed"/>
   <property name="description" value="Creature zap spell"/>
   <property name="message" value="A Creature Zap Spell!"/>
   <property name="name" value="Zap"/>
  </properties>
 </tile>
 <tile id="38" type="41">
  <properties>
   <property name="message" value="Yah Hoo! You discovered a Reveal Gems Scroll!"/>
   <property name="name" value="ShowGems"/>
  </properties>
 </tile>
 <tile id="40" type="39">
  <properties>
   <property name="name" value="Trap4"/>
  </properties>
 </tile>
 <tile id="41" type="37">
  <properties>
   <property name="name" value="Trap3"/>
  </properties>
 </tile>
 <tile id="42" type="27">
  <properties>
   <property name="Tile.ch" value="☼"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="message" value="You found a Gold Nugget...500 points!"/>
   <property name="name" value="Nugget"/>
  </properties>
 </tile>
 <tile id="43" type="9">
  <properties>
   <property name="Tile.ch" value="♦"/>
   <property name="Tile.fg" value="Blue"/>
   <property name="message" value="Gems give you both points and strength."/>
   <property name="name" value="Gem"/>
  </properties>
 </tile>
 <tile id="45" type="32">
  <properties>
   <property name="description" value="Stop space"/>
   <property name="name" value="Stop"/>
  </properties>
 </tile>
 <tile id="46" type="16">
  <properties>
   <property name="Tile.ch" value="∙"/>
   <property name="Tile.fg" value="White"/>
   <property name="message" value="You activated a Teleport trap!"/>
   <property name="name" value="Trap"/>
  </properties>
 </tile>
 <tile id="47" type="19">
  <properties>
   <property name="Tile.bg" value="Green"/>
   <property name="Tile.ch" value="█"/>
   <property name="Tile.fg" value="Green"/>
   <property name="message" value="You cannot travel through forest terrain."/>
   <property name="name" value="Forest"/>
  </properties>
 </tile>
 <tile id="48" type="65">
  <properties>
   <property name="Tile.ch" value="O"/>
   <property name="Tile.fg" value="White"/>
   <property name="message" value="You pushed a big Boulder!"/>
   <property name="name" value="Rock"/>
  </properties>
 </tile>
 <tile id="49" type="1">
  <properties>
   <property name="Attacks.damage" type="int" value="1"/>
   <property name="Movement.pace" type="int" value="4"/>
   <property name="Tile.ch" value="Ä"/>
   <property name="Tile.fg" value="LightRed"/>
   <property name="description" value="Red enemy"/>
   <property name="name" value="Slow"/>
  </properties>
 </tile>
 <tile id="50" type="2">
  <properties>
   <property name="Attacks.damage" type="int" value="2"/>
   <property name="Movement.pace" type="int" value="3"/>
   <property name="Tile.ch" value="Ö"/>
   <property name="Tile.fg" value="Green"/>
   <property name="description" value="Green enemy"/>
   <property name="name" value="Medium"/>
  </properties>
 </tile>
 <tile id="51" type="3">
  <properties>
   <property name="Attacks.damage" type="int" value="3"/>
   <property name="Movement.pace" type="int" value="2"/>
   <property name="Tile.ch" value="Ω"/>
   <property name="Tile.fg" value="LightBlue"/>
   <property name="description" value="Blue enemy"/>
   <property name="name" value="Fast"/>
  </properties>
 </tile>
 <tile id="52" type="52">
  <properties>
   <property name="Tile.bg" value="Brown"/>
   <property name="Tile.ch" value="█"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="message" value="A Solid Wall blocks your way."/>
   <property name="name" value="OWall1"/>
  </properties>
 </tile>
 <tile id="53" type="53">
  <properties>
   <property name="Tile.bg" value="Brown"/>
   <property name="Tile.ch" value="█"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="name" value="OWall2"/>
  </properties>
 </tile>
 <tile id="54" type="54">
  <properties>
   <property name="Tile.bg" value="White"/>
   <property name="Tile.ch" value="█"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="OWall3"/>
  </properties>
 </tile>
 <tile id="55" type="55">
  <properties>
   <property name="name" value="CWall1"/>
  </properties>
 </tile>
 <tile id="56" type="56">
  <properties>
   <property name="name" value="CWall2"/>
  </properties>
 </tile>
 <tile id="57" type="57">
  <properties>
   <property name="name" value="CWall3"/>
  </properties>
 </tile>
 <tile id="58" type="30">
  <properties>
   <property name="name" value="IWall"/>
  </properties>
 </tile>
 <tile id="59" type="29">
  <properties>
   <property name="message" value="An Invisible Crumbled Wall blocks your way."/>
   <property name="name" value="IBlock"/>
  </properties>
 </tile>
 <tile id="60" type="48">
  <properties>
   <property name="Tile.ch" value="K"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="name" value="K"/>
  </properties>
 </tile>
 <tile id="61" type="23">
  <properties>
   <property name="Tile.ch" value="░"/>
   <property name="Tile.fg" value="White"/>
   <property name="message" value="* SPLAT!! *"/>
   <property name="name" value="Pit"/>
  </properties>
 </tile>
 <tile id="62" type="46">
  <properties>
   <property name="Tile.ch" value="☺"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="message" value="Statues are very dangerous...they drain your Gems!"/>
   <property name="name" value="Statue"/>
  </properties>
 </tile>
 <tile id="63" type="45">
  <properties>
   <property name="Tile.ch" value="?"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="message" value="You found a Pouch containing Gems!"/>
   <property name="name" value="Chance"/>
  </properties>
 </tile>
 <tile id="64" type="33">
  <properties>
   <property name="name" value="Trap2"/>
  </properties>
 </tile>
 <tile id="65" type="24">
  <properties>
   <property name="Tile.bg" value="Magenta"/>
   <property name="Tile.ch" value="■"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="message" value="The Sacred Tome of Kroz is finally yours--50,000 points!"/>
   <property name="name" value="Tome"/>
  </properties>
 </tile>
 <tile id="66" type="21">
  <properties>
   <property name="Tile.ch" value="¥"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="message" value="You activated a Magic Bomb!"/>
   <property name="name" value="Bomb"/>
  </properties>
 </tile>
 <tile id="67" type="7">
  <properties>
   <property name="Tile.bg" value="Red"/>
   <property name="Tile.ch" value="C"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="message" value="You found gems and whips inside the chest!"/>
   <property name="name" value="Chest"/>
  </properties>
 </tile>
 <tile id="68" type="13">
  <properties>
   <property name="Tile.bg" value="Magenta"/>
   <property name="Tile.ch" value="∞"/>
   <property name="Tile.fg" value="Cyan"/>
   <property name="message" value="The Door opens!  (One of your Keys is used.)"/>
   <property name="name" value="Door"/>
  </properties>
 </tile>
 <tile id="69" type="28">
  <properties>
   <property name="message" value="Oh no, you set off an Earthquake trap!"/>
   <property name="name" value="Quake"/>
  </properties>
 </tile>
 <tile id="70" type="15">
  <properties>
   <property name="Tile.ch" value="Θ"/>
   <property name="Tile.fg" value="LightCyan"/>
   <property name="description" value="Speed time spell"/>
   <property name="message" value="You activated a Speed Creature spell."/>
   <property name="name" value="SpeedTime"/>
  </properties>
 </tile>
 <tile id="71" type="36">
  <properties>
   <property name="Tile.ch" value="♠"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="message" value="You have discovered a Creature Generator!"/>
   <property name="name" value="Generator"/>
  </properties>
 </tile>
 <tile id="72" type="44">
  <properties>
   <property name="message" value="You triggered Exploding Walls!"/>
   <property name="name" value="BlockSpell"/>
  </properties>
 </tile>
 <tile id="73" type="10">
  <properties>
   <property name="Tile.ch" value="¡"/>
   <property name="Tile.fg" value="Green"/>
   <property name="message" value="Oh no, a temporary Blindness Potion!"/>
   <property name="name" value="Invisible"/>
  </properties>
 </tile>
 <tile id="75" type="12">
  <properties>
   <property name="Tile.ch" value="î"/>
   <property name="Tile.fg" value="LightRed"/>
   <property name="message" value="Use Keys to unlock doors."/>
   <property name="name" value="Key"/>
  </properties>
 </tile>
 <tile id="76" type="6">
  <properties>
   <property name="Tile.bg" value="White"/>
   <property name="Tile.ch" value="≡"/>
   <property name="message" value="Stairs take you to the next lower level."/>
   <property name="name" value="Stairs"/>
  </properties>
 </tile>
 <tile id="77" type="38">
  <properties>
   <property name="Movement.pace" type="int" value="2"/>
   <property name="Tile.ch" value="▓"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="description" value="Moving wall"/>
   <property name="message" value="A Moving Wall blocks your way."/>
   <property name="name" value="MBlock"/>
  </properties>
 </tile>
 <tile id="78" type="47">
  <properties>
   <property name="message" value="Yikes!  A trap has made many of the wall sections invisible!"/>
   <property name="name" value="WallVanish"/>
  </properties>
 </tile>
 <tile id="79" type="43">
  <properties>
   <property name="Tile.ch" value="▓"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="name" value="ZBlock"/>
  </properties>
 </tile>
 <tile id="80" type="40">
  <properties>
   <property name="Movement.pace" type="int" value="1"/>
   <property name="Tile.bg" value="Black"/>
   <property name="Tile.ch" value="☻"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="description" value="The player"/>
   <property name="name" value="Player"/>
  </properties>
 </tile>
 <tile id="81" type="18">
  <properties>
   <property name="Tile.ch" value="○"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="message" value="A Power Ring--your whip is now a little stronger!"/>
   <property name="name" value="Power"/>
  </properties>
 </tile>
 <tile id="82" type="17">
  <properties>
   <property name="Tile.bg" value="Blue"/>
   <property name="Tile.ch" value="≈"/>
   <property name="Tile.fg" value="LightBlue"/>
   <property name="message" value="You cannot travel through Water."/>
   <property name="name" value="River"/>
  </properties>
 </tile>
 <tile id="83" type="8">
  <properties>
   <property name="Tile.ch" value="Φ"/>
   <property name="Tile.fg" value="LightCyan"/>
   <property name="description" value="Slow time spell"/>
   <property name="message" value="You activated a Slow Time spell."/>
   <property name="name" value="SlowTime"/>
  </properties>
 </tile>
 <tile id="84" type="11">
  <properties>
   <property name="Tile.ch" value="↑"/>
   <property name="Tile.fg" value="LightMagenta"/>
   <property name="message" value="You found a Teleport scroll."/>
   <property name="name" value="Teleport"/>
  </properties>
 </tile>
 <tile id="85" type="25">
  <properties>
   <property name="Tile.ch" value="∩"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="message" value="You passed through a secret Tunnel!"/>
   <property name="name" value="Tunnel"/>
  </properties>
 </tile>
 <tile id="86" type="22">
  <properties>
   <property name="Tile.bg" value="Red"/>
   <property name="Tile.ch" value="▓"/>
   <property name="Tile.fg" value="LightRed"/>
   <property name="message" value="Oooooooooooooooooooh!  Lava hurts!  (Lose 10 Gems.)"/>
   <property name="name" value="Lava"/>
  </properties>
 </tile>
 <tile id="87" type="5">
  <properties>
   <property name="Tile.ch" value="⌠"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="description" value="Breakable wall"/>
   <property name="message" value="You found a Whip"/>
   <property name="name" value="Whip"/>
  </properties>
 </tile>
 <tile id="88" type="4">
  <properties>
   <property name="Tile.ch" value="▓"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="message" value="A Breakable Wall blocks your way"/>
   <property name="name" value="Block"/>
  </properties>
 </tile>
 <tile id="89" type="64">
  <properties>
   <property name="Tile.bg" value="Black"/>
   <property name="Tile.ch" value="▓"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="GBlock"/>
  </properties>
 </tile>
 <tile id="90" type="26">
  <properties>
   <property name="Tile.ch" value="ƒ"/>
   <property name="Tile.fg" value="LightCyan"/>
   <property name="description" value="Freeze time spell"/>
   <property name="message" value="You have activated a Freeze Creature spell!"/>
   <property name="name" value="Freeze"/>
  </properties>
 </tile>
 <tile id="91" type="49">
  <properties>
   <property name="Tile.ch" value="R"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="name" value="R"/>
  </properties>
 </tile>
 <tile id="92" type="20">
  <properties>
   <property name="Tile.bg" value="Green"/>
   <property name="Tile.ch" value="♣"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="message" value="A tree blocks your way."/>
   <property name="name" value="Tree"/>
  </properties>
 </tile>
 <tile id="93" type="35">
  <properties>
   <property name="Tile.ch" value="▼"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="description" value="Creature creation trap"/>
   <property name="message" value="A Creature Creation Trap!"/>
   <property name="name" value="Create"/>
  </properties>
 </tile>
 <tile id="96" type="31">
  <properties>
   <property name="message" value="An Invisible Door blocks your way."/>
   <property name="name" value="IDoor"/>
  </properties>
 </tile>
 <tile id="124" type="50">
  <properties>
   <property name="Tile.ch" value="O"/>
   <property name="Tile.fg" value="Yellow"/>
   <property name="name" value="O"/>
  </properties>
 </tile>
 <tile id="126" type="66">
  <properties>
   <property name="Tile.bg" value="Red"/>
   <property name="Tile.ch" value="X"/>
   <property name="Tile.fg" value="LightRed"/>
   <property name="message" value="You hit a Electrified Wall!  You lose one Gem."/>
   <property name="name" value="EWall"/>
  </properties>
 </tile>
 <tile id="145" type="68">
  <properties>
   <property name="name" value="TBlock"/>
  </properties>
 </tile>
 <tile id="146" type="69">
  <properties>
   <property name="name" value="TRock"/>
  </properties>
 </tile>
 <tile id="147" type="70">
  <properties>
   <property name="name" value="TGem"/>
  </properties>
 </tile>
 <tile id="148" type="71">
  <properties>
   <property name="name" value="TBlind"/>
  </properties>
 </tile>
 <tile id="149" type="72">
  <properties>
   <property name="name" value="TWhip"/>
  </properties>
 </tile>
 <tile id="150" type="73">
  <properties>
   <property name="name" value="TGold"/>
  </properties>
 </tile>
 <tile id="151" type="74">
  <properties>
   <property name="name" value="TTree"/>
  </properties>
 </tile>
 <tile id="159" type="81">
  <properties>
   <property name="Tile.ch" value="♀"/>
   <property name="Tile.fg" value="HighIntensityWhite"/>
   <property name="description" value="Amulet of Yendor"/>
   <property name="message" value="YOUR QUEST FOR THE AMULET WAS SUCCESSFUL!"/>
   <property name="name" value="Amulet"/>
  </properties>
 </tile>
 <tile id="174" type="83">
  <properties>
   <property name="Tile.ch" value="←"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="ShootLeft"/>
  </properties>
 </tile>
 <tile id="175" type="82">
  <properties>
   <property name="Tile.ch" value="→"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="ShootRight"/>
  </properties>
 </tile>
 <tile id="179" type="75">
  <properties>
   <property name="Tile.ch" value="│"/>
   <property name="Tile.fg" value="White"/>
   <property name="message" value="You grabbed a Rope."/>
   <property name="name" value="Rope"/>
  </properties>
 </tile>
 <tile id="185" type="76">
  <properties>
   <property name="Tile.ch" value="↓"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="DropRope"/>
  </properties>
 </tile>
 <tile id="186" type="77">
  <properties>
   <property name="Tile.ch" value="↓"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="DropRope2"/>
  </properties>
 </tile>
 <tile id="187" type="78">
  <properties>
   <property name="Tile.ch" value="↓"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="DropRope3"/>
  </properties>
 </tile>
 <tile id="188" type="79">
  <properties>
   <property name="Tile.ch" value="↓"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="DropRope4"/>
  </properties>
 </tile>
 <tile id="189" type="80">
  <properties>
   <property name="Tile.ch" value="↓"/>
   <property name="Tile.fg" value="White"/>
   <property name="name" value="DropRope5"/>
  </properties>
 </tile>
 <tile id="224" type="224">
  <properties>
   <property name="name" value="Trap6"/>
  </properties>
 </tile>
 <tile id="225" type="225">
  <properties>
   <property name="name" value="Trap7"/>
  </properties>
 </tile>
 <tile id="226" type="226">
  <properties>
   <property name="name" value="Trap8"/>
  </properties>
 </tile>
 <tile id="227" type="227">
  <properties>
   <property name="name" value="Trap9"/>
  </properties>
 </tile>
 <tile id="228" type="228">
  <properties>
   <property name="name" value="Trap10"/>
  </properties>
 </tile>
 <tile id="229" type="229">
  <properties>
   <property name="name" value="Trap11"/>
  </properties>
 </tile>
 <tile id="230" type="230">
  <properties>
   <property name="name" value="Trap12"/>
  </properties>
 </tile>
 <tile id="231" type="231">
  <properties>
   <property name="name" value="Trap13"/>
  </properties>
 </tile>
 <tile id="241" type="58">
  <properties>
   <property name="Tile.ch" value="⌂"/>
   <property name="Tile.fg" value="LightCyan"/>
   <property name="message" value="Magic has been released is this chamber!"/>
   <property name="name" value="OSpell1"/>
  </properties>
 </tile>
 <tile id="242" type="59">
  <properties>
   <property name="Tile.ch" value="⌂"/>
   <property name="Tile.fg" value="LightCyan"/>
   <property name="message" value="Magic has been released is this chamber!"/>
   <property name="name" value="OSpell2"/>
  </properties>
 </tile>
 <tile id="243" type="60">
  <properties>
   <property name="Tile.ch" value="⌂"/>
   <property name="Tile.fg" value="LightCyan"/>
   <property name="message" value="Magic has been released is this chamber!"/>
   <property name="name" value="OSpell3"/>
  </properties>
 </tile>
 <tile id="244" type="61">
  <properties>
   <property name="message" value="New Walls have magically appeared!"/>
   <property name="name" value="CSpell1"/>
  </properties>
 </tile>
 <tile id="245" type="62">
  <properties>
   <property name="message" value="New Walls have magically appeared!"/>
   <property name="name" value="CSpell2"/>
  </properties>
 </tile>
 <tile id="246" type="63">
  <properties>
   <property name="message" value="New Walls have magically appeared!"/>
   <property name="name" value="CSpell3"/>
  </properties>
 </tile>
 <tile id="252" type="252">
  <properties>
   <property name="Tile.bg" value="Green"/>
   <property name="Tile.ch" value="♣"/>
   <property name="Tile.fg" value="Brown"/>
   <property name="name" value="Message"/>
  </properties>
 </tile>
</tileset>
