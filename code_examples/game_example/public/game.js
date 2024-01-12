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
var otherPlayers = [];
var playerHealth = 100;

///////////////////////////
// Preload assets
///////////////////////////

function preload() {
  this.load.image("background", "assets/map/first_map.png");
  this.load.image("ship_blue", "assets/kenney_pixel-shmup/Ships/ship_0000.png");
  this.load.image("ship_red", "assets/kenney_pixel-shmup/Ships/ship_0001.png");
  this.load.image("ship_green", "assets/kenney_pixel-shmup/Ships/ship_0002.png");
  this.load.image("ship_orange", "assets/kenney_pixel-shmup/Ships/ship_0003.png");
  this.load.image("ship_ghost", "assets/kenney_pixel-shmup/Ships/ship_0015.png");
  this.load.image("laser", "assets/kenney_pixel-shmup/Tiles/tile_0000.png");
}

///////////////////////////
// Game setup
///////////////////////////

function create() {
  var self = this;
  this.socket = io();

  // Hintergrundbild
  let background = this.add.sprite(0, 0, "background");
  background.setOrigin(0, 0);
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height;

  healthText = this.add.text(16, 16, "Health: " + playerHealth + "%", { fontSize: "20px", fill: "#000" });

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
    otherPlayers.forEach(function (otherPlayer) {
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
    otherPlayers.forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        setShipToPosition(otherPlayer, playerInfo.x, playerInfo.y);
      }
    });
  });

  //-----------------------
  // Event: fireLaser
  //-----------------------
  this.socket.on("playerFiredLaser", function (laserData) {
    fireLaser(self, laserData);
  });

  //-----------------------
  // Event: playerHit
  //-----------------------
  this.socket.on("playerHit", function (data) {
    if (data.playerHitId == self.socket.id) {
      playPlayerHitAnimation(self, self.player_ship);
      playerHealth -= 10;

      if (playerHealth <= 0) {
        alert("You died!");
        self.socket.disconnect();
      }
      updateHealthText();
    } else {
      otherPlayers.forEach(function (otherPlayer) {
        if (data.playerHitId == otherPlayer.playerId) {
          playPlayerHitAnimation(self, otherPlayer);
        }
      });
    }
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
  otherPlayers.push(otherPlayer);
}

function setShipToPosition(ship, x, y) {
  ship.x = x;
  ship.y = y;
  ship.shadow.x = x - SHADOW_OFFSET;
  ship.shadow.y = y + SHADOW_OFFSET;
}

function createNewShip(self, playerInfo) {
  let newShip = self.add.sprite(playerInfo.x, playerInfo.y, playerInfo.sprite).setOrigin(0.5, 0.5);
  newShip.depth = 10;
  newShip.shadow = createShadow(self, playerInfo);
  return newShip;
}

function createShadow(self, playerInfo) {
  let shadow = self.add.sprite(playerInfo.x, playerInfo.y, playerInfo.sprite).setOrigin(0.5, 0.5);
  shadow.tint = 0x000000;
  shadow.alpha = 0.15;
  shadow.depth = 8;
  shadow.x -= SHADOW_OFFSET;
  shadow.y += SHADOW_OFFSET;
  shadow.setScale(0.95);
  return shadow;
}

function fireLaser(self, laserData) {
  if (laserData.playerId !== self.socket.id) {
    const laser = createLaser(self, laserData);

    laser.tween = self.tweens.add({
      targets: laser,
      alpha: 0.8,
      duration: 500,
      onComplete: function () {
        laser.destroy();
      },
      onUpdate: function () {
        laser.y -= 10;
      },
    });
  }
}

function createLaser(self, laserData) {
  const laser = self.add.sprite(laserData.x, laserData.y, "laser");
  laser.playerId = laserData.playerId;
  laser.laserId = laserData.laserId;
  return laser;
}

function playPlayerHitAnimation(scene, target) {
  const originalX = target.x;
  const shakeIntensity = 3;

  scene.tweens.add({
    targets: target,
    alpha: 0.5,
    duration: 500,
    yoyo: true,
    onComplete: function (tween, targets) {
      targets[0].setAlpha(1);
    },
    onUpdate: function (tween) {
      const progress = tween.progress;
      const shakeOffset = Math.sin(progress * Math.PI * 10) * shakeIntensity;
      target.x = originalX + shakeOffset;
    },
    onCompleteScope: this,
  });
}

function updateHealthText() {
  healthText.setText("Health: " + playerHealth + "%");
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

  if (checkKeyDown.call(this, this.cursors.space)) {
    fireLaserLocally.call(this);
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

  if (this.player_ship.oldPosition && (x !== this.player_ship.oldPosition.x || y !== this.player_ship.oldPosition.y)) {
    this.socket.emit("playerMovement", { x, y });
  }

  updatePlayerOldPosition.call(this, x, y);
}

function updatePlayerOldPosition(x, y) {
  this.player_ship.oldPosition = { x, y };
}

function fireLaserLocally() {
  let laserData = this.add.sprite(this.player_ship.x, this.player_ship.y, "laser");
  laserData.depth = 9;
  laserData.playerId = this.socket.id;

  this.socket.emit("fireLaser", laserData);

  let self = this; // Speichern Sie den Kontext von 'this' in einer Variable
  laserData.tween = this.tweens.add({
    targets: laserData,
    alpha: 0.8,
    duration: 500,
    onComplete: function () {
      laserData.destroy();
    },
    onUpdate: function (tween) {
      otherPlayers.forEach(function (otherPlayer) {
        if (checkOverlap(laserData, otherPlayer)) {
          self.socket.emit("hitPlayer", {
            playerId: self.socket.id,
            laserId: laserData.laserId,
            playerHitId: otherPlayer.playerId,
          });

          tween.stop();
          laserData.destroy();
        }
      });
      laserData.y -= 10;
    },
  });
}

function checkOverlap(spriteA, spriteB) {
  if (spriteA.playerId !== spriteB.playerId) {
    return (
      spriteA.x < spriteB.x + spriteB.width &&
      spriteA.x + spriteA.width > spriteB.x &&
      spriteA.y < spriteB.y + spriteB.height &&
      spriteA.y + spriteA.height > spriteB.y
    );
  } else {
    return false;
  }
}
