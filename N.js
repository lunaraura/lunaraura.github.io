let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

class Chunk {
    constructor(iterationX, iterationY, amount, grid){
        this.x = grid * iterationX;
        this.y = grid * iterationY;
        this.amount = amount;
        this.grid = grid;
        this.node = null;
        this.blocks = [];
    }
    generate(){
        let spend = 0;
        for (let i = 0; i < this.grid; i++){
            for (let j = 0; j < this.grid; j++){
                for (let k = 0; k < this.grid; k++){
                    if(spend < this.amount){
                        let blockIteration = new Block(j + this.x,i, k + this.y);
                        this.blocks.push(blockIteration);
                        ++spend;
                    } else continue;
                    
                }
            }
        }
    }
}
class Block {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.vertices = [
            {x:0.5+this.x, y:0.5+this.y, z:0.5+this.z, flag: false},//0
            {x:0.5+this.x, y:-0.5+this.y, z:0.5+this.z, flag: false},//1
            {x:-0.5+this.x, y:-0.5+this.y, z:0.5+this.z, flag: false},//2
            {x:-0.5+this.x, y:0.5+this.y, z:0.5+this.z, flag: false},//3
            {x:0.5+this.x, y:0.5+this.y, z:-0.5+this.z, flag: false},//4
            {x:0.5+this.x, y:-0.5+this.y, z:-0.5+this.z, flag: false},//5
            {x:-0.5+this.x, y:-0.5+this.y, z:-0.5+this.z, flag: false},//6
            {x:-0.5+this.x, y:0.5+this.y, z:-0.5+this.z, flag: false},//7
        ];
        this.faces = [
            [this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3]],//front
            [this.vertices[0], this.vertices[1], this.vertices[5], this.vertices[4]],//left
            [this.vertices[0], this.vertices[3], this.vertices[7], this.vertices[4]],//top
            [this.vertices[6], this.vertices[5], this.vertices[1], this.vertices[2]],//bottom
            [this.vertices[6], this.vertices[2], this.vertices[3], this.vertices[7]],//right
            [this.vertices[6], this.vertices[7], this.vertices[4], this.vertices[5]],//back
        ]
    }
}
class Camera {
    constructor(velocityX, velocityY, velocityZ, angleY, angleZ, fov, aspect, near, far) {
        this.x = 0;
        this.y = 10;
        this.z = 0;
        this.lX = 0;
        this.lY = 0;
        this.lZ = 0;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.velocityZ = velocityZ;
        this.angleY = angleY;
        this.angleZ = angleZ;
        this.angleX = 0;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.cameraPosition = [this.x, this.y, this.z];
        this.cameraTarget = [this.lX, this.lY, this.lZ];
        this.cameraUp = [0, 1, 0];
        this.projectionMatrix = [
            [1 / (this.aspect * Math.tan(this.fov / 2)), 0, 0, 0],
            [0, 1 / Math.tan(this.fov / 2), 0, 0],
            [0, 0, -(this.far + this.near) / (this.far - this.near), -2 * this.far * this.near / (this.far - this.near)],
            [0, 0, -1, 0]
        ];
    }
    //good  
    lookAt(cameraPosition, cameraTarget, cameraUp) {
        const zAxis = normalize(subtractVectors(cameraPosition, cameraTarget));
        const xAxis = normalize(crossProduct(cameraUp, zAxis));
        const yAxis = crossProduct(zAxis, xAxis);

        return [
            [xAxis[0], yAxis[0], zAxis[0], -dotProduct(xAxis, cameraPosition)],
            [xAxis[1], yAxis[1], zAxis[1], -dotProduct(yAxis, cameraPosition)],
            [xAxis[2], yAxis[2], zAxis[2], -dotProduct(zAxis, cameraPosition)],
            [0, 0, 0, 1]
        ];
    }
    //good
    project(vertex) {
        const point = [[vertex.x], [vertex.y], [vertex.z], [1]];
        const projected = multiplyMatrices(this.cameraMatrix, point);
        const w = projected[3][0];

        if (w <= 0) return null; // Vertex is behind the camera

        const x = projected[0][0] / w;
        const y = projected[1][0] / w;
        const z = projected[2][0] / w;
        if (x < -1 || x > 1 || y < -1 || y > 1 || z < -1 || z > 1) return null; // Vertex is outside the view frustum

        const screenX = (x + 1) * (canvas.width / 2);
        const screenY = (1 - y) * (canvas.height / 2);

        return { x: screenX, y: screenY };
    }
    //centerMatrix
    updateCameraMatrix() {
        let rotX = [
            [1, 0, 0, 0],
            [0, Math.cos(this.angleX), -(Math.sin(this.angleX)), 0],
            [0, Math.sin(this.angleX), Math.cos(this.angleX), 0],
            [0, 0, 0, 1],
        ];
        let rotY = [
            [Math.cos(this.angleY), 0, Math.sin(this.angleY), 0],
            [0, 1, 0, 0],
            [-(Math.sin(this.angleY)), 0, Math.cos(this.angleY), 0],
            [0, 0, 0, 1],
        ];
        let rotZ = [
            [Math.cos(this.angleZ), -(Math.sin(this.angleZ)), 0, 0],
            [Math.sin(this.angleZ), Math.cos(this.angleZ), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ];
        let translate = [
            [1, 0, 0, this.x],
            [0, 1, 0, this.y],
            [0, 0, 1, this.z],
            [0, 0, 0, 1],
        ];
        
        this.centerMatrix = multiplyMatrices(translate, multiplyMatrices(rotY, multiplyMatrices(rotX, rotZ)));
    
        let direction =  multiplyMatrices(this.centerMatrix, [[0],[0],[1],[0]]);
        let distance = 1;

        this.cameraPosition = [this.centerMatrix[0][3], this.centerMatrix[1][3], this.centerMatrix[2][3]]
        this.cameraTarget = [this.cameraPosition[0] + direction[0] * distance, this.cameraPosition[1] + direction[1] * distance, this.cameraPosition[2] + direction[2] * distance];
        this.cameraUp = [0, 1, 0]
        const lookAtMatrix = this.lookAt(this.cameraPosition, this.cameraTarget, this.cameraUp);
        this.viewMatrix = lookAtMatrix;
        this.cameraMatrix = multiplyMatrices(this.projectionMatrix, this.viewMatrix);
    }
    

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.z += this.velocityZ;
        this.velocityX *= 0.8;
        this.velocityY *= 0.8;
        this.velocityZ *= 0.8;
        this.updateCameraMatrix()


        if (Math.abs(this.velocityX) < 0.05) this.velocityX = 0;
        if (Math.abs(this.velocityY) < 0.05) this.velocityY = 0;
        if (Math.abs(this.velocityZ) < 0.05) this.velocityZ = 0;
    }
}
let chunkNumber = 4;
let chunkGrid = 1;
let blocksInChunk = 50;
let chunkGridSize = 8;
let chunkList = [];
let camera = new Camera(0, 0, 0, 0, 0, 3.14 / 1.5, canvas.width/canvas.height, 1, 2000)
document.addEventListener("keydown", (event) => {
    switch(event.key){
        case "e":
            camera.velocityY += 1;
            break;
        case "q":
            camera.velocityY += -1;
            break;
        case "a":
            camera.velocityX += 1;
            break;
        case "d":
            camera.velocityX += -1;
            break;
        case "w":
            camera.velocityZ += 1;
            break;
        case "s":
            camera.velocityZ += -1;
            break;
        case "t":
            camera.angleZ += .034;
            break;
        case "g":
            camera.angleZ += -0.034;
            break;
        case "f":
            camera.angleY += 0.034;
            break;
        case "h":
            camera.angleY += -0.034;
            break;
        case "r":
            camera.angleX += 0.034;
            break;
        case "y":
            camera.angleX += -0.034;
            break;

    }
});
for (let i = 0; i < chunkNumber * chunkGrid; i++){
    for (let j = 0; j < chunkNumber ; j++){
        let chunk = new Chunk(i, j, blocksInChunk, chunkGridSize);
        chunkList.push(chunk);
    }
}
chunkList.forEach((chunk) => {
    chunk.generate();
})

function animate() {
    camera.update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    // Draw camera position and target for debugging
    ctx.fillText("+", camera.cameraPosition[0]+150, camera.cameraPosition[2]+150);
    ctx.moveTo(camera.cameraPosition[0]+150, camera.cameraPosition[2]+150);
    ctx.lineTo(camera.cameraTarget[0]+150,camera.cameraTarget[2]+150);
    ctx.fillText("T", camera.cameraTarget[0]+150,camera.cameraTarget[2]+150);
    ctx.fillText("+", camera.cameraPosition[0]+250, camera.cameraPosition[1]+150);
    ctx.moveTo(camera.cameraPosition[0]+250, camera.cameraPosition[1]+150);
    ctx.lineTo(camera.cameraTarget[0]+250,camera.cameraTarget[1]+150);
    ctx.fillText("T", camera.cameraTarget[0]+250,camera.cameraTarget[1]+150);
    ctx.font = "20px Arial"
    ctx.fillText(camera.cameraPosition[0], 0, 100);
    ctx.fillText(camera.cameraPosition[1], 0, 200);
    ctx.fillText(camera.cameraPosition[2], 0, 300);
    
    ctx.fillText(camera.cameraTarget[0], 500, 100);
    ctx.fillText(camera.cameraTarget[1], 500, 200);
    ctx.fillText(camera.cameraTarget[2], 500, 300);
    ctx.fillText(camera.angleY, 200, 100);
    ctx.fillText(camera.angleZ, 200, 200);
    ctx.fillText(camera.angleX, 200, 300);
    chunkList.forEach((chunk) => {
        chunk.blocks.forEach((block) => {
            block.faces.forEach((face) => {
                const projectedFace = face.map(vertex => camera.project(vertex)).filter(p => p !== null);

                if (projectedFace.length === face.length) {
                    ctx.moveTo(projectedFace[0].x, projectedFace[0].y);
                    for (let i = 1; i < projectedFace.length; i++) {
                        ctx.lineTo(projectedFace[i].x, projectedFace[i].y);
                    }
                    ctx.lineTo(projectedFace[0].x, projectedFace[0].y);
                }
                
                ctx.moveTo(face[0].x+150, face[0].z+150);
                ctx.lineTo(face[2].x+150, face[2].z+150);
                ctx.moveTo(face[0].x+250, face[0].z+150);
                ctx.lineTo(face[2].x+250, face[2].z+150);
            });
        });
    });

    ctx.stroke();
}

setInterval(animate, 30)




function normalize (vector){
    let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] **2)
    if (magnitude === 0) {
        console.error("zero vector detected.");
    }
    let xVector = vector[0]/magnitude;
    let yVector = vector[1]/magnitude;
    let zVector = vector[2]/magnitude;
    return [xVector, yVector, zVector];
}
function subtractVectors (vector1, vector2){
    return [vector1[0]-vector2[0], vector1[1]-vector2[1], vector1[2]-vector2[2]]
}
function crossProduct(vector1, vector2){
    return [
        (vector1[1]*vector2[2])-(vector1[2]*vector2[1]),
        (vector1[2]*vector2[0])-(vector1[0]*vector2[2]),
        (vector1[0]*vector2[1])-(vector1[1]*vector2[0])
    ]
}
function dotProduct(vector1, vector2){
    return (
        (vector1[0]*vector2[0])+(vector1[1]*vector2[1])+(vector1[2]*vector2[2])
    )
}
function dist(p1, p2){
    let x = p1.x - p2.x;
    let y = p1.y - p2.y;
    let z = p1.z - p2.z;
    let dist = Math.sqrt(x **2 + y**2 + z**2)
return dist;
}
function multiplyMatrices(matrix1, matrix2) {
    let result = [];
    if (matrix1[0].length !== matrix2.length) {
        console.error("Matrix dimensions mismatch");
        return result;
    }
    for (let i = 0; i < matrix1.length; i++) {
        result[i] = [];
        for (let j = 0; j < matrix2[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < matrix1[0].length; k++) {
                sum += matrix1[i][k] * matrix2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}
