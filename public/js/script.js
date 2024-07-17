const socket = io(); // Connect the frontend to the socket
const chess = new Chess();
const boardElement = document.querySelector('.chessBoard');
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach(row,rowindex => {
      row.forEach((square,squareindex)=>{
       const squareElement=document.createElement("div");
       squareElement.classList.add("square",
       (rowindex+squareindex)%2===0 ? "light":"dark");

        squareElement.dataset.row=rowindex;
        squareElement.dataset.col=squareindex;

        if(square){
          const pieceElement=document.createElement("div");
          pieceElement.classList.add("piece",square.color==='w'?'white':'black');
   
          pieceElement.innerHTML=" ";
          pieceElement.draggable=playerRole===square.color;

          pieceElement.addEventListener("dragstart",()=>{
            if(pieceElement.draggable){
              draggedPiece = pieceElement;
              sourceSquare={row:rowindex,column:columnindex};

            }
          })
        }
      })
  });
}
renderBoard();

const handleMove = () => {
  // Add logic for handling piece move
}

const getPieceUnicode = () => {
  // Add logic for getting piece Unicode
}


