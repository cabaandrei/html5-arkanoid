// =======================
// 🎮 Game Setup & Globals
// =======================
const levelData = loadLevel(levels[0]);
const canvas = document.getElementById("gameCanvas");
canvas.width = levelData.canvasWidth;
canvas.height = levelData.canvasHeight;
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const ballRadius = 10;
const paddleHeight = 10;

let bricks = [];
let x = canvasWidth / 2;
let y = canvasHeight - 50;
let dx = 2;
let dy = -2;
let paddleWidth = 75;
let paddleX = (canvasWidth - paddleWidth) / 2;

let lastBrickHit = null;
let score = 0;
let highScore = parseInt(localStorage.getItem("arkanoidHighScore")) || 0;
let gameState = "menu";
let isFrozen = false;
let isPaused = false;

// =======================
// 🧪 Cheat Mode System
// =======================
let cheatBuffer = "";
let cheatExitBuffer = "";
let cheatMode = false;
const cheatPassword = "dev";

// =======================
// 🖱️ Input Listeners
// =======================
document.addEventListener("mousemove", mouseMoveHandler);
canvas.addEventListener("mousedown", dragBallIfFrozen);
document.addEventListener("keydown", cheatKeyListener);

// =======================
// 🎯 Input Handlers
// =======================
function mouseMoveHandler(e) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = e.clientX - rect.left;
  if (relativeX > 0 && relativeX < canvasWidth) {
    paddleX = relativeX - paddleWidth / 2;
    paddleX = Math.max(0, Math.min(paddleX, canvasWidth - paddleWidth));
  }
}

function dragBallIfFrozen(e) {
  if (isFrozen) {
    const rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
}

function cheatKeyListener(e) {
  const key = e.key;

  if (key === "p" || key === "P") {
    isPaused = !isPaused;
    if (!isPaused && gameState === "playing") draw();
    return;
  }

  // Activate cheat mode
  if (!cheatMode && key.length === 1) {
    cheatBuffer += key.toLowerCase();
    if (cheatBuffer.length > cheatPassword.length) {
      cheatBuffer = cheatBuffer.slice(-cheatPassword.length);
    }
    if (cheatBuffer === cheatPassword) {
      cheatMode = true;
      console.log("Cheat mode activated!");
    }
  }

  // Deactivate cheat mode
  if (cheatMode) {
    if (key === "Escape") {
      cheatMode = false;
      cheatExitBuffer = "";
      console.log("Cheat mode deactivated.");
    } else if (key.toLowerCase() === "c") {
      cheatExitBuffer += "c";
      if (cheatExitBuffer.length > 2) {
        cheatExitBuffer = cheatExitBuffer.slice(-2);
      }
      if (cheatExitBuffer === "cc") {
        cheatMode = false;
        cheatExitBuffer = "";
        console.log("Cheat mode deactivated.");
      }
    }

    // Cheat controls
    if (key === "+") {
      dx *= 1.2;
      dy *= 1.2;
    } else if (key === "-") {
      dx *= 0.8;
      dy *= 0.8;
    } else if (key === "[") {
      paddleWidth = Math.max(30, paddleWidth - 10);
    } else if (key === "]") {
      paddleWidth = Math.min(canvasWidth, paddleWidth + 10);
    } else if (key === "b" || key === "B") {
      for (let r = 0; r < bricks.length; r++) {
        for (let c = 0; c < bricks[r].length; c++) {
          if (bricks[r][c]) bricks[r][c].status = 0;
        }
      }
    } else if (key === "r" || key === "R") {
      x = canvasWidth / 2;
      y = canvasHeight - 50;
      dx = 2;
      dy = -2;
    } else if (key === "f" || key === "F") {
      isFrozen = !isFrozen;
    }
  }
}

// =======================
// 🧱 Drawing Functions
// =======================
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FF4500";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      const b = bricks[r][c];
      if (b && b.status === 1) {
        ctx.beginPath();
        ctx.rect(b.x, b.y, 75, 20);
        ctx.fillStyle =
          b.type === "strong" ? "#FF00FF" :
            b.type === "indestructible" ? "#666666" :
              "#00DD66";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawHUD() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 24, 24);
  ctx.textAlign = "right";
  ctx.fillText("High Score: " + highScore, canvasWidth - 24, 24);
  ctx.textAlign = "center";
  ctx.fillText("Level: " + levels[0].name, canvasWidth / 2, 24);
  if (cheatMode) {
    ctx.fillStyle = "#FF0";
    ctx.fillText("CHEAT MODE", canvasWidth / 2, 44);
  }
}

function drawMenu() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = "28px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("Classic Arkanoid", canvasWidth / 2, canvasHeight / 2 - 40);
  ctx.font = "18px Arial";
  ctx.fillText("Click to Start", canvasWidth / 2, canvasHeight / 2);
  canvas.addEventListener("click", startGame, { once: true });
}

function drawGameOver() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = "28px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvasWidth / 2, canvasHeight / 2 - 40);
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, canvasWidth / 2, canvasHeight / 2);
  ctx.fillText("High Score: " + highScore, canvasWidth / 2, canvasHeight / 2 + 30);
  ctx.fillText("Click to Play Again", canvasWidth / 2, canvasHeight / 2 + 60);
  canvas.addEventListener("click", startGame, { once: true });
}

function drawWinScreen() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = "28px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("You Win!", canvasWidth / 2, canvasHeight / 2 - 40);
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, canvasWidth / 2, canvasHeight / 2);
  ctx.fillText("Click or press Space to Play Again", canvasWidth / 2, canvasHeight / 2 + 40);

  const restart = () => {
    document.removeEventListener("keydown", spaceListener);
    canvas.removeEventListener("click", restart);
    startGame();
  };

  const spaceListener = (e) => {
    if (e.code === "Space") restart();
  };

  canvas.addEventListener("click", restart);
  document.addEventListener("keydown", spaceListener);
}

// =======================
// 🧠 Game Logic
// =======================
function collisionDetection() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      const b = bricks[r][c];
      if (b && b.status === 1 && b !== lastBrickHit) {
        if (
          x + ballRadius > b.x &&
          x - ballRadius < b.x + 75 &&
          y + ballRadius > b.y &&
          y - ballRadius < b.y + 20
        ) {
          const overlapLeft = x + ballRadius - b.x;
          const overlapRight = b.x + 75 - (x - ballRadius);
          const overlapTop = y + ballRadius - b.y;
          const overlapBottom = b.y + 20 - (y - ballRadius);
          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          if (minOverlapX < minOverlapY) {
            dx = -dx;
            x += dx;
          } else {
            dy = -dy;
            y += dy;
          }

          b.hit();
          lastBrickHit = b;
          score += b.type === "strong" ? 20 : 10;
          return;
        }
      }
    }
  }

  if (lastBrickHit && (
    x < lastBrickHit.x - 100 || x > lastBrickHit.x + 175 ||
    y < lastBrickHit.y - 100 || y > lastBrickHit.y + 120
  )) {
    lastBrickHit = null;
  }
}

function checkWin() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      const b = bricks[r][c];
      if (b && b.status === 1 && b.type !== "indestructible") {
        return false;
      }
    }
  }
  return true;
}

// =======================
// 🔁 Game Loop
// =======================
function draw() {
  if (gameState !== "playing") return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBricks();
  drawBall();
  drawPaddle();
  drawHUD();

  if (!isFrozen && !isPaused) {
    collisionDetection();

    let nextX = x + dx;
    let nextY = y + dy;

    // Wall collisions
    if (nextX + ballRadius > canvasWidth || nextX - ballRadius < 0) {
      dx = -dx;
    }
    if (nextY - ballRadius < 0) {
      dy = -dy;
    }

    // Paddle collision
    const paddleTop = canvasHeight - paddleHeight;
    const ballWillCrossPaddle = y < paddleTop && nextY >= paddleTop;

    if (
      ballWillCrossPaddle &&
      nextX > paddleX &&
      nextX < paddleX + paddleWidth
    ) {
      const hitPoint = x - (paddleX + paddleWidth / 2);
      const normalized = hitPoint / (paddleWidth / 2);
      dx = normalized * 4;
      dy = -Math.abs(dy);
    } else if (nextY + ballRadius > canvasHeight) {
      gameOver();
      return;
    }

    // Win condition
    if (checkWin()) {
      gameState = "win";
      drawWinScreen();
      return;
    }

    x += dx;
    y += dy;
  }

  if (!isPaused) {
    requestAnimationFrame(draw);
  } else {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvasWidth / 2, canvasHeight / 2);
  }
}

// =======================
// 🔄 Game State Functions
// =======================
function startGame() {
  const levelData = loadLevel(levels[0]);
  bricks = [];
  for (let r = 0; r < levelData.bricks.length; r++) {
    bricks[r] = [];
    for (let c = 0; c < levelData.bricks[r].length; c++) {
      bricks[r][c] = levelData.bricks[r][c];
    }
  }

  canvas.width = levelData.canvasWidth;
  canvas.height = levelData.canvasHeight;

  score = 0;
  x = canvas.width / 2;
  y = canvas.height - 50;
  dx = 2;
  dy = -2;
  paddleWidth = 75;
  paddleX = (canvas.width - paddleWidth) / 2;
  gameState = "playing";
  isFrozen = false;
  isPaused = false;
  draw();
}

function gameOver() {
  gameState = "gameover";
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("arkanoidHighScore", highScore);
  }
  drawGameOver();
}

// =======================
// 🚀 Start Game
// =======================
drawMenu();
