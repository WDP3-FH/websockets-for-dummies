///////////////////////////
// Game settings
///////////////////////////

var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 960,
  height: 640,
  zoom: 1,
  pixelArt: true,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

///////////////////////////
// Game constants
///////////////////////////

const MOVEMENT_SPEED = 16;
const SHADOW_OFFSET = 10;

///////////////////////////
// Global variables
///////////////////////////

var game = new Phaser.Game(config);

///////////////////////////
// Preload assets
///////////////////////////

function preload() {
  this.load.image("background", "assets/map/first_map.png");
  this.load.image("ship_blue", "assets/kenney_pixel-shmup/Ships/ship_0000.png");
  this.load.image("ship_red", "assets/kenney_pixel-shmup/Ships/ship_0001.png");
  this.load.image(
    "ship_green",
    "assets/kenney_pixel-shmup/Ships/ship_0002.png"
  );
  this.load.image(
    "ship_orange",
    "assets/kenney_pixel-shmup/Ships/ship_0003.png"
  );
  this.load.image(
    "ship_ghost",
    "assets/kenney_pixel-shmup/Ships/ship_0015.png"
  );
  this.load.image("")
}

///////////////////////////
// Game setup
///////////////////////////

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = [];

  // Hintergrundbild
  let background = this.add.sprite(0, 0, "background");
  background.setOrigin(0, 0);
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height;

  //-----------------------
  // Event: currentPlayers
  //-----------------------
  this.socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  //-----------------------
  // Event: newPlayer
  //-----------------------
  this.socket.on("newPlayer", function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  //-----------------------
  // Event: myDisconnect
  //-----------------------
  this.socket.on("myDisconnect", function (playerId) {
    self.otherPlayers.forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.shadow.destroy();
        otherPlayer.destroy();
      }
    });
  });

  //-----------------------
  // Event: gameIsFull
  //-----------------------
  this.socket.on("gameIsFull", function () {
    alert("Game is full, please try again later");
  });

  //-----------------------
  // Event: playerMoved
  //-----------------------
  this.socket.on("playerMoved", function (playerInfo) {
    self.otherPlayers.forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        setShipToPosition(otherPlayer, playerInfo.x, playerInfo.y);
      }
    });
  });

  // Tastatursteuerung
  this.cursors = this.input.keyboard.createCursorKeys();
}

/*===============================*/
// Helper functions: Game setup
/*===============================*/

function addPlayer(self, playerInfo) {
  self.player_ship = createNewShip(self, playerInfo);
}

function addOtherPlayers(self, playerInfo) {
  let otherPlayer = createNewShip(self, playerInfo);

  otherPlayer.playerId = playerInfo.playerId;

  self.otherPlayers.push(otherPlayer);
}

function setShipToPosition(ship, x, y) {
  ship.x = x;
  ship.y = y;
  ship.shadow.x = x - SHADOW_OFFSET;
  ship.shadow.y = y + SHADOW_OFFSET;
}

function createNewShip(self, playerInfo) {
  let newShip = self.add
    .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
    .setOrigin(0.5, 0.5);
  newShip.depth = 10;

  newShip.shadow = createShadow(self, playerInfo);

  return newShip;
}

function createShadow(self, playerInfo) {
  let shadow = self.add
    .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
    .setOrigin(0.5, 0.5);

  shadow.tint = 0x000000;
  shadow.alpha = 0.15;
  shadow.depth = 9;

  shadow.x -= SHADOW_OFFSET;
  shadow.y += SHADOW_OFFSET;
  shadow.setScale(0.95);

  return shadow;
}

///////////////////////////
// Game loop
///////////////////////////
function update() {
  if (this.player_ship) {
    handlePlayerInput.call(this);
    sendPlayerMovement.call(this);
  }
}

/*===============================*/
// Helper functions: Game loop
/*===============================*/

function handlePlayerInput() {
  if (checkKeyDown.call(this, this.cursors.left)) {
    moveShip.call(this, this.player_ship, -MOVEMENT_SPEED, 0);
  } else if (checkKeyDown.call(this, this.cursors.right)) {
    moveShip.call(this, this.player_ship, MOVEMENT_SPEED, 0);
  } else if (checkKeyDown.call(this, this.cursors.down)) {
    moveShip.call(this, this.player_ship, 0, MOVEMENT_SPEED);
  } else if (checkKeyDown.call(this, this.cursors.up)) {
    moveShip.call(this, this.player_ship, 0, -MOVEMENT_SPEED);
  }
}

function moveShip(ship, deltaX, deltaY) {
  ship.x += deltaX;
  ship.y += deltaY;
  ship.shadow.x += deltaX;
  ship.shadow.y += deltaY;
}

function checkKeyDown(cursors) {
  return this.input.keyboard.checkDown(cursors, 150); // Für mind. 150ms gedrückt halten
}

function sendPlayerMovement() {
  const { x, y } = this.player_ship;

  if (
    this.player_ship.oldPosition &&
    (x !== this.player_ship.oldPosition.x ||
      y !== this.player_ship.oldPosition.y)
  ) {
    this.socket.emit("playerMovement", { x, y });
  }

  updatePlayerOldPosition.call(this, x, y);
}

function updatePlayerOldPosition(x, y) {
  this.player_ship.oldPosition = { x, y };
}
