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
}

///////////////////////////
// Game setup
///////////////////////////

function create() {
  //Set background
  let background = this.add.sprite(0, 0, "background");
  background.setOrigin(0, 0);
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height;

  var self = this;
  this.socket = io();
  this.otherPlayers = [];
  //when receiving "currentPlayers" message:
  this.socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  //when receiving "newPlayer" message:
  this.socket.on("newPlayer", function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  //when receiving "myDisconnect" message:
  this.socket.on("myDisconnect", function (playerId) {
    self.otherPlayers.forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.shadow.destroy();
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on("gameIsFull", function () {
    alert("Game is full, please try again later");
  });
  //when receiving "playerMoved" message:
  this.socket.on("playerMoved", function (playerInfo) {
    console.log("Client: a user moved");
    self.otherPlayers.forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.shadow.setPosition(
          playerInfo.x - SHADOW_OFFSET,
          playerInfo.y + SHADOW_OFFSET
        );
      }
    });
  });
  //bind keyboard
  this.cursors = this.input.keyboard.createCursorKeys();
}

///////////////////////////
// Game loop
///////////////////////////

function update() {
  if (this.player_ship) {
    if (this.input.keyboard.checkDown(this.cursors.left, 250)) {
      this.player_ship.x -= MOVEMENT_SPEED;
      this.player_ship.shadow.x -= MOVEMENT_SPEED;
    } else if (this.input.keyboard.checkDown(this.cursors.right, 250)) {
      this.player_ship.x += MOVEMENT_SPEED;
      this.player_ship.shadow.x += MOVEMENT_SPEED;
    } else if (this.input.keyboard.checkDown(this.cursors.down, 250)) {
      this.player_ship.y += MOVEMENT_SPEED;
      this.player_ship.shadow.y += MOVEMENT_SPEED;
    } else if (this.input.keyboard.checkDown(this.cursors.up, 250)) {
      this.player_ship.y -= MOVEMENT_SPEED;
      this.player_ship.shadow.y -= MOVEMENT_SPEED;
    }
    //emit player movement
    var x = this.player_ship.x;
    var y = this.player_ship.y;
    if (
      this.player_ship.oldPosition &&
      (x !== this.player_ship.oldPosition.x ||
        y !== this.player_ship.oldPosition.y)
    ) {
      this.socket.emit("playerMovement", {
        x: this.player_ship.x,
        y: this.player_ship.y,
      });
    }
    //save old position data
    this.player_ship.oldPosition = {
      x: this.player_ship.x,
      y: this.player_ship.y,
    };
  }
}

///////////////////////////
// Helper functions
///////////////////////////

function addPlayer(self, playerInfo) {
  self.player_ship = createNewShip(self, playerInfo);
}

function addOtherPlayers(self, playerInfo) {
  let otherPlayer = createNewShip(self, playerInfo);

  otherPlayer.playerId = playerInfo.playerId;

  self.otherPlayers.push(otherPlayer);
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
