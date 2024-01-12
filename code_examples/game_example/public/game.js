//game.js
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

const movementSpeed = 16;
const shadowOffset = 10;

var game = new Phaser.Game(config);

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
      }
    });
  });
  //bind keyboard
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (this.player_ship) {
    if (this.input.keyboard.checkDown(this.cursors.left, 250)) {
      this.player_ship.x -= movementSpeed;
      this.player_ship_shadow.x -= movementSpeed;
    } else if (this.input.keyboard.checkDown(this.cursors.right, 250)) {
      this.player_ship.x += movementSpeed;
      this.player_ship_shadow.x += movementSpeed;
    } else if (this.input.keyboard.checkDown(this.cursors.down, 250)) {
      this.player_ship.y += movementSpeed;
      this.player_ship_shadow.y += movementSpeed;
    } else if (this.input.keyboard.checkDown(this.cursors.up, 250)) {
      this.player_ship.y -= movementSpeed;
      this.player_ship_shadow.y -= movementSpeed;
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

function addPlayer(self, playerInfo) {
  self.player_ship = self.add
    .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
    .setOrigin(0.5, 0.5);
  self.player_ship.depth = 10;

  self.player_ship_shadow = createShadow(self, playerInfo);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
    .setOrigin(0.5, 0.5);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.push(otherPlayer);
}

function createShadow(self, playerInfo) {
  const shadow = self.add
    .sprite(playerInfo.x, playerInfo.y, playerInfo.sprite)
    .setOrigin(0.5, 0.5);

  shadow.tint = 0x000000;
  shadow.alpha = 0.15;
  shadow.depth = 9;

  shadow.x -= shadowOffset;
  shadow.y += shadowOffset;
  shadow.setScale(0.95);

  return shadow;
}
