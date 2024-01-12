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

var players = {};
var sprites = ["ship_blue", "ship_red", "ship_green", "ship_orange"];
//var maxPlayers = sprites.length;
var maxPlayers = sprites.length;
var defaultSprite = "ship_ghost";

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

  players[socket.id] = {
    x: Math.floor(Math.random() * 400) + 50, //400 ... Breite des möglichen bereiches zum spawnen ab Startpunkt  50 ... Startpunkt
    y: Math.floor(Math.random() * 400) + 50, //Höhe
    playerId: socket.id,
    sprite: getNextAvailableSprite(),
  };

  socket.emit("currentPlayers", players);

  // Alle anderen Spieler über den neuen Spieler informieren
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // Sobald ein Spieler die Verbindung zum Server trennt, entferne den Spieler aus der players-Liste, und füge sein Schiff wieder der sprites-Liste hinzu, am Ende benachrichtige alle anderen Spieler
  socket.on("disconnect", function () {
    console.log("Server: user disconnected");

    sprites.push(players[socket.id].sprite);
    delete players[socket.id];
    socket.disconnect();

    socketIo.emit("myDisconnect", socket.id);
  });

  // Sobald ein Spieler seine Position aktualisiert, wird die Position an alle anderen Spieler gesendet
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});

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

server.listen(8081, () => {
  console.log(`Listening on Port: ${server.address().port}`);
  console.log(`IP: http://localhost:${server.address().port}`);
});
