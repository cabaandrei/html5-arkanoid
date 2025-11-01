const levelData = loadLevel(levels[0]);
const bricks = levelData.bricks;

const canvas = document.getElementById("gameCanvas");
canvas.width = levelData.canvasWidth;
canvas.height = levelData.canvasHeight;
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const ballRadius = 10;
let x = canvasWidth / 2;
let y = canvasHeight - 50;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvasWidth - paddleWidth) / 2;

let lastBrickHit = null;
let score = 0;
let highScore = parseInt(localStorage.getItem("arkanoidHighScore")) || 0;
let gameState = "menu";

// canvas.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("mousemove", mouseMoveHandler);

function mouseMoveHandler(e) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = e.clientX - rect.left;
  if (relativeX > 0 && relativeX < canvasWidth) {
    paddleX = relativeX - paddleWidth / 2;
    paddleX = Math.max(0, Math.min(paddleX, canvasWidth - paddleWidth));
  }
  console.log("Mouse moved:", e.clientX);
}

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
          b.type === "strong"
            ? "#FF00FF"
            : b.type === "indestructible"
            ? "#666666"
            : "#00DD66";
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
  const padding = 24; // gives breathing room from the edge
  ctx.fillText("Score: " + score, padding, 24);
  ctx.fillText("High Score: " + highScore, canvasWidth - 150, 24);
  ctx.textAlign = "center";
  ctx.fillText("Level: " + levels[0].name, canvasWidth / 2, 24);
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
  ctx.fillText(
    "High Score: " + highScore,
    canvasWidth / 2,
    canvasHeight / 2 + 30
  );
  ctx.fillText("Click to Play Again", canvasWidth / 2, canvasHeight / 2 + 60);
  canvas.addEventListener("click", startGame, { once: true });
}

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

  if (
    lastBrickHit &&
    (x < lastBrickHit.x - 100 ||
      x > lastBrickHit.x + 175 ||
      y < lastBrickHit.y - 100 ||
      y > lastBrickHit.y + 120)
  ) {
    lastBrickHit = null;
  }
}

function draw() {
  if (gameState !== "playing") return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBricks();
  drawBall();
  drawPaddle();
  drawHUD();
  collisionDetection();

  let nextX = x + dx;
  let nextY = y + dy;

  if (nextX > canvasWidth - ballRadius || nextX < ballRadius) dx = -dx;
  if (nextY < ballRadius) dy = -dy;

  if (
    nextY + ballRadius >= canvasHeight - paddleHeight &&
    nextY + ballRadius <= canvasHeight &&
    nextX > paddleX &&
    nextX < paddleX + paddleWidth
  ) {
    const hitPoint = nextX - (paddleX + paddleWidth / 2);
    const normalized = hitPoint / (paddleWidth / 2);
    dx = normalized * 4;
    dy = -Math.abs(dy);
  } else if (nextY + ballRadius > canvasHeight) {
    gameOver();
    return;
  }

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

function startGame() {
  score = 0;
  x = canvasWidth / 2;
  y = canvasHeight - 50;
  dx = 2;
  dy = -2;
  gameState = "playing";
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

// Start with menu
drawMenu();
