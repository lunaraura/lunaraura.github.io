const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

let circleX = canvas.width / 2;
let circleY = canvas.height / 2 + 200;
let circleRadius = 20;
let circleSpeed = 10;
let velocityX = 0;
let velocityY = 0;

let boxWidth = 600;
let boxHeight = 600;
let boxX = (canvas.width - boxWidth) / 2;
let boxY = (canvas.height - boxHeight) / 2;

function drawBalls() {
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "red";
  ctx.stroke();
}

function drawCircle() {
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function drawBox() {
  ctx.beginPath();
  ctx.rect(boxX, boxY, boxWidth, boxHeight);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function drawStats() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "black";

  ctx.fillText("X Velocity: " + xStats, 10, 30);
  ctx.fillText("Y Velocity: " + yStats, 10, 60);
  ctx.fillText("Velocity:" + pyth, 10, 90);
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircle();
  drawBox();
  drawStats();
}

canvas.addEventListener("mousedown", (event) => {
  const clickX = event.offsetX;
  const clickY = event.offsetY;

  const dx = circleX - clickX;
  const dy = circleY - clickY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const directionX = dx / distance;
  const directionY = dy / distance;

  velocityX = -circleSpeed * directionX;
  velocityY = -circleSpeed * directionY;
});

function update() {
  velocityX *= 0.98;
  velocityY *= 0.98;

  xStats = velocityX.toFixed(2);
  yStats = velocityY.toFixed(2);
  pyth = Math.sqrt(xStats * xStats + yStats * yStats);

  circleX += -velocityX;
  circleY += -velocityY;

  // Check if the circle has hit the walls of the box, and reverse its velocity if it has
  if (
    circleX - circleRadius < boxX ||
    circleX + circleRadius > boxX + boxWidth
  ) {
    velocityX = -velocityX;
  }
  if (
    circleY - circleRadius < boxY ||
    circleY + circleRadius > boxY + boxHeight
  ) {
    velocityY = -velocityY;
  }

  drawGame();

  requestAnimationFrame(update);
}
requestAnimationFrame(update);
