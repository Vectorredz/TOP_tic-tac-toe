import './styles/index.css'

const ROWS = 3
const COLS = 3
let availableCells = [[0, 0], [0, 1], [0, 2],
[1, 0], [1, 1], [1, 2],
[2, 0], [2, 1], [2, 2]]
let cells = []

let isPlayerOne = true
let isPlayerTwo = false

const gameState = {
  isWin: false,
  isTie: false,
}

const page = {
  landing: document.querySelector("#landing-page"),
  game: document.querySelector("#game-page"),
  gameGrid: document.querySelector("#game-grid"),
  p1Turn: document.querySelector("#p1-turn"),
  p2Turn: document.querySelector("#p2-turn"),
  victory: document.querySelector("#victory-call"),
  retry: document.querySelector("#retry")
}

if (document.body.id === page.game.id) {
  gameStart()
}

Array.prototype.exists = function ([x, y]) { return this.some(([a, b]) => a == x && b == y) }
Array.prototype.index = function ([x, y]) { for (let i = 0; i < this.length; i++) { if (this[i][0] == x && this[i][1] == y) return i } }

function gameStart() {

  // <------- 1). INIT THE GRID ------->

  let gameBoard = function gameBoardInit() {
    let gameBoardCols = []
    for (let r = 0; r < ROWS; r++) {
      let gameBoardRows = []
      for (let c = 0; c < COLS; c++) {
        gameBoardRows.push(0)
        let gridCell = document.createElement("div")
        let gridShadow = document.createElement("div")

        gridCell.classList.add("cell")
        gridCell.classList.add("flex")
        gridCell.classList.add("text-[5em]")
        gridCell.classList.add("font-bold")
        gridCell.classList.add("items-center")
        gridCell.classList.add("justify-center")

        gridCell.innerHTML = ""
        page.gameGrid.append(gridCell)

      }
      gameBoardCols.push(gameBoardRows)
    }
    return gameBoardCols
  }()

  // <------- 2). INIT PLAYERS BASED ON CHOICE ------->

  function createUser(playerName) {
    let name = playerName
    let move = function turn(x, y) {
      let k = gameBoardUpdate(gameBoard, playerName, x, y)
      console.log(k)

    }
    let isMoved = false

    return { name, move, isMoved }
  }

  const players = {
    p1: createUser("louise"),
    p2: createUser("bot")
  }

  // <------- 3). POLL THE CELLS TO UPDATE ------->

  cells = Array.from(document.querySelectorAll(".cell"))

  setTimeout(playerOneTurn, 500)
 
  
  function playerOneTurn() {
    for (let i = 0; i < cells.length; i++) {
      cells[i].addEventListener("click", () => {
        if (gameState.isWin === false && isPlayerOne === true && gameState.isTie === false) {
          let [r, c] = [Math.floor(i / ROWS), i % ROWS]
          players.p1.move(r, c)
          
          
          if (players.p1.isMoved) {
            renderUpdatedCell(players.p1.name, cells[i])
            isPlayerOne = false
            isPlayerTwo = true
            if (!gameState.isWin && !gameState.isTie) turnBased()
        
            setTimeout(playerTwoTurn, 2000)
          }
        }
      
      })
    }
  }

  function turnBased(){
      if (isPlayerTwo){
        page.p1Turn.classList.add("hidden")
        page.p2Turn.classList.remove("hidden")
      }
      else if (isPlayerOne) {
        page.p1Turn.classList.remove("hidden")
        page.p2Turn.classList.add("hidden")
      }
  }



  function playerTwoTurn() {
    if (gameState.isWin === true || isPlayerTwo === false || gameState.isTie === true) return;

 
    if (gameState.isWin === false && isPlayerTwo === true || gameState.isTie === false) {
      let i = Math.floor(Math.random() * availableCells.length)
      let [dr, dc] = availableCells[i]
      let j = dr * ROWS + dc
      players.p2.move(dr, dc)

      renderUpdatedCell(players.p2.name, cells[j])
      isPlayerOne = true
      isPlayerTwo = false

      if (!gameState.isWin && !gameState.isTie) turnBased()

    }
   
  }

  function gameBoardUpdate(gameBoard, playerName, dr, dc) {
    // only land at the empty cell
    let symbol = playerName === players.p1.name ? 'x' : 'o'
    let playerMoving = playerName === players.p1.name ? 'p1' : 'p2'
    if (availableCells.exists([dr, dc]) === true) {
      let index = availableCells.index([dr, dc])
      availableCells.splice(index, 1)
      gameBoard[dr][dc] = symbol

      players[playerMoving].isMoved = true

      if (availableCells.length <= 0) gameState.isTie = true
    }

    else {
      players[playerMoving].isMoved = false
    }

    checkWinningLanes()
    return gameBoard
  }

  function checkWinningLanes() {
    let curr_diag = []
    let curr_diag_reversed = []
    let curr_col = []
    let winningCells = []

    // HORIZONTAL WIN
    for (let r = 0; r < ROWS; r++) {
      checkWinner(gameBoard[r], "horizontal", r)
    }
    
    // VERTICAL WIN
    for (let r = 0; r < ROWS; r++) {
      if (r == 0) {
        // choose single row
        for (let c = 0; c < COLS; c++) {
          curr_col = []
          for (const [x, y] of [[0, c], [1, c], [2, c]]) {
            if (0 <= x < ROWS && 0 <= y < COLS) {
              curr_col.push(gameBoard[x][y])
            }
          }
          checkWinner(curr_col, "vertical", c)
        }
      }
    }
    // DIAGONAL WIN
    if (gameState.isWin === false) {
      for (const [x, y] of [[0, 0], [1, 1], [2, 2], [0, 2], [1, 1], [2, 0]]) {
        if (curr_diag.length < 3) {
          curr_diag.push(gameBoard[x][y])
        }
        else {
          curr_diag_reversed.push(gameBoard[x][y])
        }
      }
      checkWinner(curr_diag, "diagonal")
      checkWinner(curr_diag_reversed, "diagonal_reversed")
    }
  }

  function renderUpdatedCell(playerName, cell) {
    if (playerName === players.p1.name) {
      cell.innerHTML = "x"
      if (gameState.isWin) {
        cell.classList.add("text-[var(--secondary-blue)]")
      }
    }
    else {
      cell.innerHTML = "o"
      if (gameState.isWin) {
        cell.classList.add("text-[var(--primary-red)]")
      }
    }
  }

  function checkWinner(array, lane, pivot) {
    let color = ""
    if (array.every((currentValue) => currentValue === 'x')) {
      console.log("Player1 wins")
      color = "text-[var(--secondary-blue)]"
      gameState.isWin = true
      page.game.classList.remove("in-game")
      page.game.classList.add("p1-win")
      page.p1Turn.classList.add("hidden")
      page.p2Turn.classList.add("hidden")
      page.victory.innerHTML = "Player 1 wins!"
      page.victory.classList.remove("hidden")
      page.retry.classList.remove("hidden")
      crossWinningCells(color, lane, pivot)
    }
    else if (array.every((currentValue) => currentValue === 'o')) {
      console.log("Player2 wins")
      color = "text-[var(--primary-red)]"
      gameState.isWin = true
      page.game.classList.remove("in-game")
      page.game.classList.add("p2-win")
      page.p1Turn.classList.add("hidden")
      page.p2Turn.classList.add("hidden")
      page.victory.innerHTML = "Bot wins!"
      page.victory.classList.remove("hidden")
      page.retry.classList.remove("hidden")
      crossWinningCells(color, lane, pivot)
    }
    else if (gameState.isTie === true){
      page.game.classList.remove("in-game")
      page.p1Turn.classList.add("hidden")
      page.p2Turn.classList.add("hidden")
      page.victory.classList.remove("hidden")
      page.victory.innerHTML = "TIE!"
      page.retry.classList.remove("hidden")
      page.game.classList.add("tie")
  }
  }

  function crossWinningCells(color, lane, pivot) {
    // horizontal win
    // if (lane === "horizontal"){
    let k = 0
      if (gameState.isWin) {
        for (let i = 0; i < cells.length; i++) {
          if (pivot === Math.floor(i / ROWS) && lane === "horizontal") {
            cells[i].classList.add(`${color}`)  
          }
          else if (pivot == i % COLS && lane === "vertical"){
            cells[i].classList.add(`${color}`)
          }
        }
        for (let i = 0; i < ROWS; i++){
          for (let j = 0; j < COLS; j++){
            if ([[0, 0], [1, 1], [2, 2]].exists([i,j]) && lane === "diagonal"){
              cells[k].classList.add(`${color}`)
            }
            else if ([[0, 2], [1, 1], [2, 0]].exists([i,j]) && lane === "diagonal_reversed"){
              cells[k].classList.add(`${color}`)
            }
            k++
          }
        }
    }
  }

}





