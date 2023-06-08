const nightModeBtn = document.getElementById("night-mode-btn");
const image = document.getElementById("image");
const originalImageSrc = image.src;
const nightModeImageSrc = "xz.png";
const scriptElement = document.getElementById("lines-script");
let currentScript = script2;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const overlayTriggers = document.querySelectorAll(".overlay-trigger");

overlayTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    trigger.classList.toggle("open");
  });
});
//rando color lines
function script1() {
  let lines = [];

  class RandomLine {
    constructor(x, y, canvasWidth, canvasHeight) {
      this.x = x;
      this.y = y;
      this.length = Math.floor((Math.random() + 1.3) * 2) ** 2.5;
      this.angle = Math.random() * 2 * Math.PI;
      this.dx = Math.cos(this.angle);
      this.dy = Math.sin(this.angle);
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.strokeColor = getRandomColor();
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.strokeStyle = this.strokeColor;
      ctx.beginPath();
      ctx.moveTo(-this.length / 2, 0);
      ctx.lineTo(this.length / 2, 0);
      ctx.stroke();
      ctx.restore();
    }

    update() {
      this.x += this.dx;
      this.y += this.dy;

      if (this.x < 0) {
        this.x += this.canvasWidth;
      } else if (this.x > this.canvasWidth) {
        this.x -= this.canvasWidth;
      }

      if (this.y < 0) {
        this.y += this.canvasHeight;
      } else if (this.y > this.canvasHeight) {
        this.y -= this.canvasHeight;
      }

      this.angle += Math.random() * 0.1;
    }
  }

  function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  }

  function initialize() {
    lines = [];
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const line = new RandomLine(x, y, canvas.width, canvas.height);
      lines.push(line);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const line of lines) {
      line.draw();
      line.update();
    }
    requestAnimationFrame(draw);
  }
  initialize();
  draw();
}
//futury lines
function script2() {
  let numPoints;
  let points;
  let additionalPoints;
  let startTime;

  numPoints = 100;
  points = [];
  additionalPoints = [];

  for (let i = 0; i < numPoints; i++) {
    const x = Math.floor(Math.random() * canvas.width);
    const y = Math.floor(Math.random() * canvas.height);
    const offsetX = Math.floor(Math.random() + 2);
    const offsetY = Math.floor(Math.random() + 2);
    points.push({
      x,
      y,
      offsetX,
      offsetY,
      moveX: x,
      moveY: y,
      moveTime: null,
    });

    const isHorizontal = Math.random() < 0.5;
    const offset = Math.floor(Math.random() * 1);
    const offsetX2 = isHorizontal ? offset : 0;
    const offsetY2 = isHorizontal ? 0 : offset;

    const isOffsetX = Math.random() < 0.5;
    const additionalOffset = Math.floor(Math.random() + 1.5);
    const additionalOffsetX = isOffsetX ? additionalOffset : 0;
    const additionalOffsetY = isOffsetX ? 0 : additionalOffset;

    additionalPoints.push({
      x: x + additionalOffsetX,
      y: y + additionalOffsetY,
      offsetX: additionalOffsetX,
      offsetY: additionalOffsetY,
      moveX: null,
      moveY: null,
      moveTime: null,
    });
  }

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    [points, additionalPoints].flat().forEach((point, index) => {
      ctx.fillRect(point.x, point.y, 2, 2);
      if (elapsed >= 3000 && point.moveTime === null) {
        point.moveX = Math.floor(Math.random() * canvas.width);
        point.moveY = Math.floor(Math.random() * canvas.height);
        point.moveTime = elapsed;
        if (index >= numPoints) {
          const initialPoint = points[index - numPoints];
          const maxOffset = Math.floor(
            Math.min(canvas.width, canvas.height) / 500
          );
          const offset = Math.floor(Math.random() * maxOffset);
          const useX = Math.random() >= 0.5;
          point.moveX = useX ? initialPoint.x + offset : initialPoint.moveX;
          point.moveY = useX ? initialPoint.moveY : initialPoint.y + offset;
        }
      } else if (point.moveTime !== null && elapsed >= point.moveTime + 3000) {
        point.x = point.moveX;
        point.y = point.moveY;
        point.moveTime = null;
      } else if (elapsed < 3000) {
        point.x += point.offsetX;
        point.y += point.offsetY;
      } else {
        const dx = point.moveX - point.x;
        const dy = point.moveY - point.y;
        const progress = Math.min((elapsed - 3000) / 3000, 1);
        point.x += dx * progress;
        point.y += dy * progress;
      }
      point.x = (point.x + canvas.width) % canvas.width;
      point.y = (point.y + canvas.height) % canvas.height;
    });
    if (elapsed >= 3200 && elapsed <= 5000) {
      ctx.strokeStyle = "black";
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const initialPoint = points[i];
        const additionalPoint = additionalPoints[i];
        ctx.moveTo(initialPoint.x, initialPoint.y);
        ctx.lineTo(additionalPoint.x, additionalPoint.y);
      }
      ctx.stroke();
    }
    if (elapsed >= 6000) {
      startTime = null;
      [points, additionalPoints].flat().forEach((point) => {
        point.moveTime = null;
      });
    }
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

nightModeBtn.addEventListener("click", function () {
  const dayModeCSS = document.querySelector('link[href="day.css"]');
  const nightModeCSS = document.querySelector('link[href="night.css"]');

  if (dayModeCSS.disabled) {
    dayModeCSS.disabled = false;
    nightModeCSS.disabled = true;
    image.src = originalImageSrc;
    currentScript = script2;
    localStorage.setItem('toggleState', 'on');
  } else {
    dayModeCSS.disabled = true;
    nightModeCSS.disabled = false;
    image.src = nightModeImageSrc;
    currentScript = script1;
    localStorage.setItem('toggleState', 'off');
  }

  currentScript();
});
document.addEventListener("DOMContentLoaded", function() {
  var toggleState = localStorage.getItem('toggleState');

  if (toggleState === 'on') {
    const dayModeCSS = document.querySelector('link[href="day.css"]');
    const nightModeCSS = document.querySelector('link[href="night.css"]');
    dayModeCSS.disabled = false;
    nightModeCSS.disabled = true;
    image.src = originalImageSrc;
    currentScript = script2;
  } else {
    const dayModeCSS = document.querySelector('link[href="day.css"]');
    const nightModeCSS = document.querySelector('link[href="night.css"]');
    dayModeCSS.disabled = true;
    nightModeCSS.disabled = false;
    image.src = nightModeImageSrc;
    currentScript = script1;
  }

  currentScript();
});
currentScript();
