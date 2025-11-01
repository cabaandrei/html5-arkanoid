// --- Brick Class ---
class Brick {
  constructor(x, y, type = "normal") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.status = 1;
    this.hits = type === "strong" ? 2 : 1;
  }

  hit() {
    if (this.type === "indestructible") return;
    this.hits--;
    if (this.hits <= 0) this.status = 0;
  }
}

// --- Level Definitions ---
const levels = [
  {
    name: "Level 1",
    rows: 3,
    columns: 5,
    layout: [
      ["normal", "normal", "normal", "normal", "normal"],
      ["normal", "strong", "strong", "strong", "normal"],
      ["normal", "normal", "indestructible", "normal", "normal"],
    ],
  },
];

// --- Level Loader ---
function loadLevel(levelConfig) {
  const brickWidth = 75;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 30;

  const canvasWidth =
    brickOffsetLeft * 2 + levelConfig.columns * (brickWidth + brickPadding);
  const canvasHeight =
    brickOffsetTop + levelConfig.rows * (brickHeight + brickPadding) + 200;

  const bricks = [];
  for (let r = 0; r < levelConfig.rows; r++) {
    bricks[r] = [];
    for (let c = 0; c < levelConfig.columns; c++) {
      const type = levelConfig.layout[r][c];
      if (type) {
        const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const y = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[r][c] = new Brick(x, y, type);
      } else {
        bricks[r][c] = null;
      }
    }
  }

  return { bricks, canvasWidth, canvasHeight };
}
