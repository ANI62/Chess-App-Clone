const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const app = express();
const path = require("path");
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs"); // set ejs view engine
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

// This will decide who will connect to the server through the socket
io.on("connection", function (uniquesocket) {
  // connect backend to the server
  console.log("Connected");

  // Here we add the new white and black players
  if (!players.white) {
    players.white = uniquesocket.id; // Connects white player
    uniquesocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id; // Connects black player
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("SpectatorRole");
  }

  uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === players.white) {
      // If disconnected socket id is equal to the white player socket id, delete white player
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      // If disconnected socket id is equal to the black player socket id, delete black player
      delete players.black;
    }
    console.log("Disconnected");
  });

  uniquesocket.on("move", function (move) {
    try {
      if ((chess.turn() === "w" && uniquesocket.id !== players.white) ||
          (chess.turn() === "b" && uniquesocket.id !== players.black)) {
        return; // Only allow move if it's the player's turn
      }

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move:", move);
        uniquesocket.emit("invalidMove", move);
      }
    } catch (err) {
      console.log(err);
      uniquesocket.emit("invalidMove", move);
    }
  });
});

server.listen(3000, (err) => {
  if (err) {
    console.log("Error starting server:", err);
  } else {
    console.log("Server running on port 3000");
  }
});
