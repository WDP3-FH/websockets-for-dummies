// Erforderliche Module
var express = require("express");
var http = require("http");
var socketIo = require("socket.io");

// Express-App erstellen
var app = express();
var server = http.createServer(app);

// Socket.io initialisieren und mit dem Server verbinden
var io = socketIo(server);

// Routen-Handler für die Startseite
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Socket.io-Events
io.on("connection", function (socket) {
  console.log("[socket.io] Ein neuer Client hat sich verbunden.\n");

  // SENDE "welcome"-Event an den Client:
  socket.emit("welcome", "Hello world");

  // Empfange "user agent"-Event vom Client:
  socket.on("user agent", function (data) {
    console.log(data, "\n");
  });
});

// Server auf Port 8080 starten
server.listen(8080, function () {
  console.log("Server läuft auf http://localhost:8080/");
});

/*=============================================
=              Ausgabe Console                =
=============================================*/
// Server läuft auf http://localhost:8080/
// [socket.io] Ein neuer Client hat sich verbunden.

// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36
