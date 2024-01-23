import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const server = createServer(app);
const socketIo = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gameMapSize = {
  width: 960,
  height: 640,
};

var players = {};
var sprites = ["ship_blue", "ship_red", "ship_green", "ship_orange", "ship_grey", "ship_brown", "ship_green_orange", "ship_red_blue", "ship_black"];
//var maxPlayers = sprites.length;
var maxPlayers = sprites.length;
var defaultSprite = "ship_ghost";
var healingPacks = [];

app.use(express.static(__dirname + "/public"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

socketIo.on("connection", function (socket) {
  if (checkIfGameIsFull()) {
    console.log("Server: a user tried to connect, but the game is full");
    socket.emit("gameIsFull");
    socket.disconnect();
    return;
  }

  console.log("Server: a user connected");

  const centerX = gameMapSize.width / 2;
  const centerY = gameMapSize.height / 2;
  const centerSpawnWidth = 500;
  const centerSpawnHeight = 350;
  const randomX = Math.floor(Math.random() * centerSpawnWidth) + (centerX - centerSpawnWidth / 2);
  const randomY = Math.floor(Math.random() * centerSpawnHeight) + (centerY - centerSpawnHeight / 2);

  players[socket.id] = {
    x: randomX,
    y: randomY,
    playerId: socket.id,
    sprite: getNextAvailableSprite(),
  };

  socket.emit("currentPlayers", players);
  socket.emit("spawnHealingPacks", healingPacks);

  // Alle anderen Spieler über den neuen Spieler informieren
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // Sobald ein Spieler die Verbindung zum Server trennt, entferne den Spieler aus der players-Liste, und füge sein Schiff wieder der sprites-Liste hinzu, am Ende benachrichtige alle anderen Spieler
  socket.on("disconnect", function () {
    console.log("Server: user disconnected");

    sprites.push(players[socket.id].sprite);
    delete players[socket.id];
    socketIo.emit("userDisconnected", socket.id);
  });

  // Sobald ein Spieler seine Position aktualisiert, wird die Position an alle anderen Spieler gesendet
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].angle = movementData.angle;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("fireLaser", function (laserData) {
    socketIo.emit("playerFiredLaser", laserData);
  });

  socket.on("hitPlayer", function (data) {
    socketIo.emit("playerHit", data);
  });

  sendHealingPackToAll(socketIo);

  socket.on("collectHealingPack", (healingPackData) => {
    healingPacks.forEach((healingPack) => {
      if (healingPack.x === healingPackData.x && healingPack.y === healingPackData.y) {
        healingPacks.splice(healingPacks.indexOf(healingPack), 1);
      }
    });
    socketIo.emit("playerCollectedHealingPack", healingPackData);
  });
});

setHealingPackInterval(socketIo);

/*===============================*/
// Helper functions:
/*===============================*/

function getNextAvailableSprite() {
  if (sprites.length > 0) {
    let tempSprite = sprites[0];
    sprites.shift();
    return tempSprite;
  } else {
    return defaultSprite;
  }
}

function checkIfGameIsFull() {
  return Object.keys(players).length >= maxPlayers;
}

function createHealingPackItem() {
  return {
    x: Math.floor(Math.random() * gameMapSize.width),
    y: Math.floor(Math.random() * gameMapSize.height),
  };
}

function sendHealingPackToAll(socketIo) {
  const newHealingPack = createHealingPackItem();
  healingPacks.push(newHealingPack);

  socketIo.emit("spawnHealingPack", newHealingPack);

  setHealingPackInterval(socketIo);
}

function setHealingPackInterval(socketIo) {
  // Zufällige Zeit zwischen 30 Sekunden und 3 Minuten
  const randomInterval = Math.floor(Math.random() * (180000 - 30000 + 1)) + 30000;

  setTimeout(() => {
    sendHealingPackToAll(socketIo);
  }, randomInterval);
}

server.listen(8081, () => {
  console.log(`Listening on Port: ${server.address().port}`);
  console.log(`IP: http://localhost:${server.address().port}`);
});
