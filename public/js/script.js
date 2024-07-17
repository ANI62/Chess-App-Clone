const socket = io(); // Connect the frontend to the socket
const chess = new Chess();
const boardElement = document.querySelector('.chessBoard');
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add("piece", square.color === 'w' ? 'white' : 'black');
        pieceElement.innerHTML = getPieceUnicode(square.type);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", " ");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col)
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });
  if(playerRole=='b'){
    boardElement.classList.add('flipped')
  }
  else{
    boardElement.classList.remove('flipped')
  }
};

const handleMove = (sourceSquare, targetSquare) => {
  const move = {
    from: `${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}`,
    to: `${String.fromCharCode(97 + targetSquare.col)}${8 - targetSquare.row}`,
    promotion: 'q'
  };

  if (chess.move(move)) {
    socket.emit("move", move);
    renderBoard();
  } else {
    console.log("Invalid move:", move);
  }
};

const getPieceUnicode = (piece) => {
  switch (piece) {
    case 'p': return '♙'; // Pawn
    case 'r': return '♖'; // Rook
    case 'n': return '♘'; // Knight
    case 'b': return '♗'; // Bishop
    case 'q': return '♕'; // Queen
    case 'k': return '♔'; // King
    default: return ''; // Return an empty string if the piece type is unknown
  }
};

renderBoard();

socket.on("playerRole", (role) => {
  playerRole = role;
  console.log("Player role:", playerRole);
  renderBoard();
});

socket.on("move", (move) => {
  if (chess.move(move)) {
    renderBoard();
  } else {
    console.log("Received invalid move from server:", move);
  }
});

socket.on("spectatorRole", (fen) => {
  playerRole = null;
  chess.load(fen); // Assuming fen is needed here
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("invalidMove", (move) => {
  console.log("Invalid move:", move);
});
