class Game {
    constructor(canvas, boxes) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.boxes = boxes;
      this.circle = {
        x: canvas.width / 2,
        y: (4 * canvas.height) / 5,
        radius: 20,
        speed: 20,
        velocityX: 0,
        velocityY: 0,
      };
      this.bindEvents();
      this.update();
    }

    bindEvents() {
      this.canvas.addEventListener("mousedown", (event) => {
        event.preventDefault();
        const clickX = event.offsetX;
        const clickY = event.offsetY;
        const dx = this.circle.x - clickX;
        const dy = this.circle.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const directionX = dx / distance;
        const directionY = dy / distance;
        this.circle.velocityX = -this.circle.speed * directionX;
        this.circle.velocityY = -this.circle.speed * directionY;
      });
    }

    update() {
      this.updateCircle();
      this.draw();
      requestAnimationFrame(() => this.update());
    }

    updateCircle() {
      const circle = this.circle;
      circle.velocityX *= 0.98;
      circle.velocityY *= 0.98;
      circle.x += -circle.velocityX;
      circle.y += -circle.velocityY;
      let hitBox = null;
      for (const box of this.boxes) {
        if (
          circle.x - circle.radius < box.x ||
          circle.x + circle.radius > box.x + box.width
        ) {
          circle.velocityX = -circle.velocityX;
          hitBox = box;
        }
        if (
          circle.y - circle.radius < box.y ||
          circle.y + circle.radius > box.y + box.height
        ) {
          circle.velocityY = -circle.velocityY;
          hitBox = box;
        }
      }
      if (circle.y - circle.radius < 60 + this.boxes[0].height) {
        circle.velocityY -= 0.2;
      }
      if (hitBox) {
        if (circle.x < hitBox.x) {
          circle.x = hitBox.x - circle.radius;
        } else if (circle.x > hitBox.x + hitBox.width) {
          circle.x = hitBox.x + hitBox.width + circle.radius;
        }
        if (circle.y < hitBox.y) {
          circle.y = hitBox.y - circle.radius;
        } else if (circle.y > hitBox.y + hitBox.height) {
          circle.y = hitBox.y + hitBox.height + circle.radius;
        }
      }
    }

    draw() {
      const { ctx, canvas, circle, boxes } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "black";
      ctx.stroke();
      for (const box of boxes) {
        ctx.beginPath();
        ctx.rect(box.x, box.y, box.width, box.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
      }
    }
  }
  const canvas = document.getElementById('canvas');
  const boxes = [{ x: 100, y: 100, width: 600, height: 600 }];
  const game = new Game(canvas, boxes);