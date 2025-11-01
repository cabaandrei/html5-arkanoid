// --- Load Level and Canvas ---
const levelData = loadLevel(levels[0]);
const bricks = levelData.bricks;

const canvas = document.getElementById("gameCanvas");
canvas.width = levelData.canvasWidth;
canvas.height = levelData.canvasHeight;

const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// --- Fixed Sizes ---
const ballRadius = 10;
let x = canvasWidth / 2;
let y = canvasHeight - 50;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvasWidth - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;
let lastBrickHit = null;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvasWidth) {
    paddleX = relativeX - paddleWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > canvasWidth)
      paddleX = canvasWidth - paddleWidth;
  }
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
          return;
        }
      }
    }
  }

  // Reset lastBrickHit if ball is far away
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
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBricks();
  drawBall();
  drawPaddle();
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
    alert("GAME OVER! Try again!");
    document.location.reload();
    return;
  }

  if (rightPressed && paddleX < canvasWidth - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

draw();
