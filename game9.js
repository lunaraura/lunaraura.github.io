const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const maxPix = document.getElementById("maxPoints");
const pointQuality = document.getElementById("pointQuality");

maxPix.addEventListener("input", () => {
  let maxPoints = parseFloat(maxPix.value);
  spawnCloud(maxPoints, parseFloat(pointQuality.value));
});
pointQuality.addEventListener("input", () => {
  let pointQualityValue = parseFloat(pointQuality.value);
  spawnCloud(parseFloat(maxPix.value), pointQualityValue);
});
let points = [];
let boxes = [];
let gravity = 0.098;
function box(x, y, width, height) {
  let box = {
    x: x,
    y: y,
    width: width,
    height: height,
    innerTop: y + 1,
    innerRight: x + width - 1,
    innerBottom: y + height - 1,
    innerLeft: x + 1,
    outerTop: y + 1,
    outerRight: x + width + 1,
    outerBottom: y + height + 1,
    outerLeft: x - 1,
  };
  console.log("Box created:", box); 
  return box;
}
let canvasbox = box(0, 0, canvas.width, canvas.height);
boxes.push(canvasbox);
function spawnCloud(maxPoints, pointQualityValue) {
  points = [];

  for (let i = 0; i < maxPoints; i++) {
    let point = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0,
      vy: 0,
      width: 5,
      height: 5,
      repulsion: maxPoints / pointQualityValue,
    };
    points.push(point);
  }
}
function updateVelocity() {
  points.forEach((point, index) => {
    let collisionX = 0;
    let collisionY = 0;
    point.vy += gravity;
    boxes.forEach((box) => {
      if (point.x + point.width >= box.innerRight && point.vx > 0) {
        collisionX = -1.1 * point.vx;
      } else if (point.x <= box.innerLeft && point.vx < 0) {
        collisionX = -1.1 * point.vx;
      } else if (point.y + point.height >= box.innerBottom && point.vy > 0) {
        collisionY = -1.1 * point.vy;
      } else if (point.y <= box.innerTop && point.vy < 0) {
        collisionY = -1.1 * point.vy;
      }
    });
    for (let i = 0; i < points.length; i++) {
      if (i !== index) {
        const otherPoint = points[i];
        const dx = otherPoint.x - point.x;
        const dy = otherPoint.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < point.repulsion) {
          const repulsionForce = 0.1 * (point.repulsion - distance) / point.repulsion;

          point.vx -= repulsionForce * (dx / distance);
          point.vy -= repulsionForce * (dy / distance);
        }
      }
    }
    point.vx += collisionX;
    point.vy += collisionY;
    point.x += point.vx;
    point.y += point.vy;
    if (point.x < -1){
      point.x = canvas.width - 1;
    }
    if (point.x > (canvas.width + 1)){
      point.x = 0;
    }
    if (point.y < 0){
      point.y =  1;
    }
    if (point.y > (canvas.height + 1)){
      point.y = canvas.height;
    }
  });
}
function drawPoints() {
  points.forEach((point) => {
    ctx.fillStyle = "#0077FF";
    ctx.fillRect(point.x, point.y, point.width, point.height);
  });
}
function drawbox() {
  boxes.forEach((box) => {
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.width, box.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();
  });
}
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  updateVelocity();
  drawPoints();
  drawbox();
  requestAnimationFrame(update);
}
requestAnimationFrame(update);
