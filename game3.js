const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const maxPix = document.getElementById("maxPixels");
const toggle = document.getElementById("toggleCollision");

let collisionToggle = false;

toggle.addEventListener("change", () => {
  collisionToggle = true;
});

maxPix.addEventListener("input", () => {
  let maxPixels = parseFloat(maxPix.value);
  spawnPixels(maxPixels);
});

let pixels = [];
minDistance = 1;

function spawnPixels(maxPixels, minDistance) {
  pixels = [];

  for (let i = 0; i < maxPixels; i++) {
    let pixel;
    do {
      pixel = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        width: 2,
        height: 2,
        mass: Math.random() * 500,
      };
    } while (
      pixels.some(
        (p) =>
          Math.sqrt((p.x - pixel.x) ** 2 + (p.y - pixel.y) ** 2) < minDistance
      )
    );
    pixels.push(pixel);
  }
}
spawnPixels(parseFloat(maxPix.value));

let isMouseDown = false;

canvas.addEventListener("mousedown", () => {
  isMouseDown = true;
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

canvas.addEventListener("mousemove", (event) => {
  if (isMouseDown) {
    pixels.forEach((pixel1) => {
      const dx1 = event.offsetX - pixel1.x;
      const dy1 = event.offsetY - pixel1.y;
      const distance1 = Math.sqrt(dx1 ** 2 + dy1 ** 2);
      const directionX1 = dx1 / distance1;
      const directionY1 = dy1 / distance1;
      pixel1.ax += directionX1 * 0.01;
      pixel1.ay += directionY1 * 0.01;
      pixels.forEach((pixel2) => {
        if (pixel1 !== pixel2) {
          const dx2 = pixel1.x - pixel2.x;
          const dy2 = pixel1.y - pixel2.y;
          const distance2 = Math.sqrt(dx2 ** 2 + dy2 ** 2);
          const minDistance = pixel1.width / 2 + pixel2.width / 2 + 1;
          if (distance2 < minDistance) {
            const overlap = minDistance - distance2;
            const totalMass = pixel1.mass + pixel2.mass;
            const overlap1 = overlap * (pixel2.mass / totalMass);
            const overlap2 = overlap * (pixel1.mass / totalMass);
            pixel1.x -= overlap1 * (dx2 / distance2);
            pixel1.y -= overlap1 * (dy2 / distance2);
            pixel2.x += overlap2 * (dx2 / distance2);
            pixel2.y += overlap2 * (dy2 / distance2);
          }
        }
      });
    });
  }
});

spawnPixels();

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function checkOverlap(pixel1, pixel2) {
    const distance = Math.sqrt(
      (pixel1.x - pixel2.x) ** 2 + (pixel1.y - pixel2.y) ** 2
    );
    const radiusSum = pixel1.width / 2 + pixel2.width / 2;
    return distance < radiusSum;
  }

  // Attraction
  const attractionConstant = 0.001;
  const minDistance = 10;
  pixels.forEach((pixel1, i) => {
    pixels.slice(i + 1).forEach((pixel2, j) => {
      const dx = pixel2.x - pixel1.x;
      const dy = pixel2.y - pixel1.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      if (distance > minDistance) {
        const force =
          (attractionConstant * pixel1.mass * pixel2.mass) / distance ** 2;
        const directionX = dx / distance;
        const directionY = dy / distance;
        pixel1.ax += (force * directionX) / pixel1.mass;
        pixel1.ay += (force * directionY) / pixel1.mass;
        pixel2.ax -= (force * directionX) / pixel2.mass;
        pixel2.ay -= (force * directionY) / pixel2.mass;
      }
    });
  });

  if (collisionToggle) {
    // Check for collisions between all pairs of pixels
    for (let i = 0; i < pixels.length; i++) {
      for (let j = i + 1; j < pixels.length; j++) {
        const pixel1 = pixels[i];
        const pixel2 = pixels[j];
        const dx = pixel2.x - pixel1.x;
        const dy = pixel2.y - pixel1.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const minDistance = pixel1.width / 2 + pixel2.width / 2;
        if (distance < minDistance) {
          collide(pixel1, pixel2);
        }
      }
    }

    // Collide
    function collide(pixel1, pixel2) {
      const totalMass = pixel1.mass + pixel2.mass;
      const systemVx =
        (pixel1.vx * pixel1.mass + pixel2.vx * pixel2.mass) / totalMass;
      const systemVy =
        (pixel1.vy * pixel1.mass + pixel2.vy * pixel2.mass) / totalMass;

      const dx = pixel2.x - pixel1.x;
      const dy = pixel2.y - pixel1.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const minDistance = pixel1.width / 2 + pixel2.width / 2;
      if (distance < minDistance) {
        const normalX = dx / distance;
        const normalY = dy / distance;
        const tangentX = -normalY;
        const tangentY = normalX;

        const initialNormalVelocity1 =
          pixel1.vx * normalX + pixel1.vy * normalY;
        const initialTangentVelocity1 =
          pixel1.vx * tangentX + pixel1.vy * tangentY;
        const initialNormalVelocity2 =
          pixel2.vx * normalX + pixel2.vy * normalY;
        const initialTangentVelocity2 =
          pixel2.vx * tangentX + pixel2.vy * tangentY;

        // Calculate the maximum possible final velocity
        const maxFinalVelocity = Math.abs(
          initialNormalVelocity1 - initialNormalVelocity2
        );

        // Calculate the actual final velocities to use
        let finalNormalVelocity1 =
          (initialNormalVelocity1 * (pixel1.mass - pixel2.mass) +
            2 * pixel2.mass * initialNormalVelocity2) /
          totalMass;
        let finalNormalVelocity2 =
          (initialNormalVelocity2 * (pixel2.mass - pixel1.mass) +
            2 * pixel1.mass * initialNormalVelocity1) /
          totalMass;
        if (Math.abs(finalNormalVelocity1) > maxFinalVelocity) {
          finalNormalVelocity1 =
            Math.sign(finalNormalVelocity1) * maxFinalVelocity;
        }
        if (Math.abs(finalNormalVelocity2) > maxFinalVelocity) {
          finalNormalVelocity2 =
            Math.sign(finalNormalVelocity2) * maxFinalVelocity;
        }

        const finalNormalVelocity1Vector = {
          x: finalNormalVelocity1 * normalX,
          y: finalNormalVelocity1 * normalY,
        };
        const finalNormalVelocity2Vector = {
          x: finalNormalVelocity2 * normalX,
          y: finalNormalVelocity2 * normalY,
        };
        const finalTangentVelocity1Vector = {
          x: initialTangentVelocity1 * tangentX,
          y: initialTangentVelocity1 * tangentY,
        };
        const finalTangentVelocity2Vector = {
          x: initialTangentVelocity2 * tangentX,
          y: initialTangentVelocity2 * tangentY,
        };

        pixel1.vx =
          systemVx +
          finalNormalVelocity1Vector.x +
          finalTangentVelocity1Vector.x;
        pixel1.vy =
          systemVy +
          finalNormalVelocity1Vector.y +
          finalTangentVelocity1Vector.y;
        pixel2.vx =
          systemVx +
          finalNormalVelocity2Vector.x +
          finalTangentVelocity2Vector.x;
        pixel2.vy =
          systemVy +
          finalNormalVelocity2Vector.y +
          finalTangentVelocity2Vector.y;
      }
    }
  }
  pixels.forEach((pixel) => {
    pixel.vx += pixel.ax;
    pixel.vy += pixel.ay;
    pixel.x += pixel.vx;
    pixel.y += pixel.vy;
    pixel.ax = 0;
    pixel.ay = 0;

    if (pixel.x < 0 || pixel.x > canvas.width - 1) {
      pixel.vx *= -0.7;
    }
    if (pixel.y < 0 || pixel.y > canvas.height - 1) {
      pixel.vy *= -0.7;
    }

    ctx.fillStyle = "green";
    ctx.fillRect(pixel.x, pixel.y, pixel.width, pixel.height);
  });
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
