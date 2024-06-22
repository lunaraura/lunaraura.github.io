let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let gravity = 0.5
class Object {
    constructor(s, r, t){
        this.s = s;
        this.r = r;
        this.t = t;
        this.mass = 8;
        this.energyLoss = 1;
        this.v = {x:0, y:0, z:0}
        this.fix = {x:0, y:0, z:0}
        this.gravity = {x:0, y: gravity, z:0}
        this.jerk = {x:0, y:0, z:0}
        this.torque = {x:0, y:0, z:0}
        this.av = {x:0, y:0, z:0}
        this.resistances = 0.5;
        this.inertiaTensor = [
            [[(this.mass/12)*(this.s.y**2 + this.s.z**2)], [0], [0]],
            [[0], [(this.mass/12)*(this.s.x**2 + this.s.z**2)], [0]],
            [[0], [0], [(this.mass/12)*(this.s.x**2 + this.s.y**2)]],
        ]
        this.vertexMesh = [
            [[1], [1], [-1], [1]],
            [[1], [-1], [-1], [1]],
            [[-1], [-1], [-1], [1]],
            [[-1], [1], [-1], [1]],
            // [[0], [2], [0], [1]],
            [[1], [1], [1], [1]],
            [[1], [-1], [1], [1]],
            [[-1], [-1], [1], [1]],
            [[-1], [1], [1], [1]],
            // [[0], [-2], [0], [1]],
        ];
        this.vertices = []
        this.center =
        multiplyMatrices(matrixTable(2, {x:this.t.x, y:this.t.y, z:this.t.z}), 
            multiplyMatrices(matrixTable(3, {x:this.r.x, y:this.r.y, z:this.r.z}),
                matrixTable(1, {x:this.s.x, y:this.s.y, z:this.s.z})
            )
        );
    }
    initialize(){
        for (let i = 0; i < this.vertexMesh.length; i++){
            let vertexVector = multiplyMatrices(this.center, this.vertexMesh[i])
            let newVertex = new Vertex(vertexVector[0], vertexVector[1], vertexVector[2])
            newVertex.parent = this;
            newVertex.mass = this.mass/this.vertexMesh.length;
            this.vertices.push(newVertex)
        }
    }
    update(){
        this.v.y += this.gravity.y;
        for (let i = 0; i < this.vertices.length; i++){
            this.vertices[i].detect();
        }
        if (this.energyLoss < 0.01){
            this.energyLoss = 0;
        }
        this.t.x += this.fix.x/2;//full number jerks the polygon out of place
        this.t.y += this.fix.y/2*this.energyLoss;
        this.t.z += this.fix.z/2;
        this.addForces();
        this.resistance();
        this.center = multiplyMatrices(matrixTable(2, {x:this.t.x, y:this.t.y, z:this.t.z}), 
            multiplyMatrices(matrixTable(3, {x:this.r.x, y:this.r.y, z:this.r.z}),
                matrixTable(1, {x:this.s.x, y:this.s.y, z:this.s.z})
            )
        );
        this.t.y = Math.min(Math.max(0,this.t.y),canvas.height)
        this.t.x = Math.min(Math.max(0,this.t.x),canvas.width)
        for (let i = 0; i < this.vertices.length; i++){
            let vertexVector = multiplyMatrices(this.center, this.vertexMesh[i])
            this.vertices[i].x = vertexVector[0]
            this.vertices[i].y = vertexVector[1]
            this.vertices[i].z = vertexVector[2]
        }
        this.zeroImpulses();
    }
    addForces(){
        this.v.x += this.jerk.x  
        this.v.y += this.jerk.y 
        this.v.z += this.jerk.z 
        this.av.x += this.torque.x/ this.resistances;
        this.av.y += this.torque.y / this.resistances;
        this.av.z += this.torque.z / this.resistances;
        this.forceThreshold(this.v)
        this.forceThreshold(this.av)
        this.t.x += this.v.x;
        this.t.y += this.v.y
        this.t.z += this.v.z;
        this.r.x += this.av.x* this.energyLoss;
        this.r.y += this.av.y* this.energyLoss;
        this.r.z += this.av.z* this.energyLoss;
    }
    forceThreshold(vector){
        if (Math.abs(vector.x) < 0.2 && this.t.y > canvas.height - this.s.y){
            vector.x = 0;
        }if (Math.abs(vector.y) < 0.2 && this.t.y > canvas.height - this.s.y){
            vector.y = 0;
        }if (Math.abs(vector.z) < 0.2 && this.t.y > canvas.height - this.s.y){
            vector.z = 0;
        }
    }
    resistance(){
        this.v.x *= 0.99
        this.v.y *= 0.99
        this.v.z *= 0.99
        this.av.x *= 0.9
        this.av.y *= 0.9
        this.av.z *= 0.9
    }
    zeroImpulses(){
        this.torque = {x:0, y:0, z:0}
        this.jerk = {x:0, y:0, z:0}
        this.fix = {x:0, y:0, z:0}
        this.resistances = 1;
    }
    applyImpulse(impulseVector, contactVector) {
        this.energyLoss *= 0.95;

        this.jerk.x += (impulseVector.x / this.mass);
        this.jerk.y += (impulseVector.y / this.mass);
        this.jerk.z += (impulseVector.z / this.mass);

        let angularImpulse = crossProduct(contactVector, impulseVector);
        this.torque.x += angularImpulse.x / this.inertiaTensor[0][0];
        this.torque.y += angularImpulse.y / this.inertiaTensor[1][1];
        this.torque.z += angularImpulse.z / this.inertiaTensor[2][2];
    }
}
class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.v = { x: 0, y: 0.1, z: 0 };
        this.mass = 0;
        this.elasticity = 0.7;
        this.parent = null;
    }

    detect() {
        let impulseVector = { x: 0, y: 0, z: 0 };
        let contactVector = { x: this.x - this.parent.t.x, y: this.y - this.parent.t.y, z: this.z - this.parent.t.z };

        if (this.x <= 0) {
            impulseVector = this.impulse();
            this.parent.fix.x -= this.x;
            this.parent.applyImpulse(impulseVector, contactVector);
        } else if (this.x >= canvas.width) {
            impulseVector = this.impulse();
            this.parent.fix.x -= this.x - canvas.width;
            this.parent.applyImpulse(impulseVector, contactVector);
        }

        if (this.y <= 0) {
            impulseVector = this.impulse();
            this.parent.fix.y -= this.y;
            this.parent.applyImpulse(impulseVector, contactVector);
        } else if (this.y >= canvas.height) {
            impulseVector = this.impulse();
            this.parent.fix.y -= this.y - canvas.height;
            this.parent.applyImpulse(impulseVector, contactVector);
        }
        this.v = { x: 0, y: 0, z: 0 };
    }

    impulse() {
        let former = -(1 - this.elasticity);
        let latter = {
            x: this.parent.v.x * this.parent.mass,
            y: (this.parent.v.y - 0.1) * this.parent.mass,
            z: this.parent.v.z * this.parent.mass
        };
        return {
            x: latter.x * former,
            y: latter.y * former,
            z: latter.z * former
        };
    }
}
document.addEventListener("keydown", (event) => {
    switch(event.key){
        case "e":
            obj.energyLoss = 1.4
            obj.jerk = {x:0, y:-20, z:0}

            break;
        case "w":
            obj.energyLoss = 1.4
            obj.jerk = {x:0, y:-5, z:-2}

            break;
        case "a":
            obj.energyLoss = 1.4
            obj.jerk = {x:-2, y:-5, z:0}
            break;
        case "d":
            obj.energyLoss = 1.4
            obj.jerk = {x:2, y:-5, z:0}
            break;
        case "s":
            obj.energyLoss = 1.4
            obj.jerk = {x:0, y:-5, z:2}
            break;
        case "t":
            camera.y += -50;
            break;
        case "g":
            camera.y += 50;
            break;
        case "f":
            camera.x += 50;
            break;
        case "h":
            camera.x += -50;
            break;
        case "r":
            camera.z += 50;
            break;
        case "y":
            camera.z += -50;
            break;
    }
});

function crossProduct(v1, v2){
    return {
        x:(v1.y*v2.z)-(v1.z*v2.y),
        y:(v1.z*v2.x)-(v1.x*v2.z),
        z:(v1.x*v2.y)-(v1.y*v2.x)
    }
}
function multiplyMatrices(a, b) {
    let rowsA = a.length, colsA = a[0].length;
    let rowsB = b.length, colsB = b[0].length;
    let result = [];

    if (colsA != rowsB) return false;

    for (let i = 0; i < rowsA; i++) {
        result[i] = [];
        for (let j = 0; j < colsB; j++) {
            result[i][j] = 0;
            for (let k = 0; k < colsA; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return result;
}
function matrixTable(cases, vector){
    switch(cases){
        case 1: return [
            [vector.x, 0, 0, 0],
            [0, vector.y, 0, 0],
            [0, 0, vector.z, 0],
            [0, 0, 0, 1],
            ];
        case 2: return [
            [1, 0, 0, vector.x],
            [0, 1, 0, vector.y],
            [0, 0, 1,vector.z],
            [0, 0, 0, 1],
            ];
        case 3: return [
            [Math.cos(vector.z)*Math.cos(vector.y),
                -Math.sin(vector.z)*Math.cos(vector.x) + Math.cos(vector.z)*Math.sin(vector.y)*Math.sin(vector.x),
                Math.sin(vector.z)*Math.sin(vector.x) + Math.cos(vector.z)*Math.sin(vector.y)*Math.cos(vector.x),
                0],
            [Math.sin(vector.z)*Math.cos(vector.y),
                Math.cos(vector.z)*Math.cos(vector.x) + Math.sin(vector.z)*Math.sin(vector.y)*Math.sin(vector.x),
                -Math.cos(vector.z)*Math.sin(vector.x) + Math.sin(vector.z)*Math.sin(vector.y)*Math.cos(vector.x),
                0],
            [-Math.sin(vector.y),
                Math.cos(vector.y)*Math.sin(vector.x),
                Math.cos(vector.y)*Math.cos(vector.x), 0],
            [0, 0, 0, 1],
        ];
    }
}

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
function crossProduct(v1, v2){
    return {
        x:(v1.y*v2.z)-(v1.z*v2.y),
        y:(v1.z*v2.x)-(v1.x*v2.z),
        z:(v1.x*v2.y)-(v1.y*v2.x)
    }
}
function dotProduct(vector1, vector2){
    return (
        (vector1[0]*vector2[0])+(vector1[1]*vector2[1])+(vector1[2]*vector2[2])
    )
}

function crossPro(vector1, vector2){
    return [
        (vector1[1]*vector2[2])-(vector1[2]*vector2[1]),
        (vector1[2]*vector2[0])-(vector1[0]*vector2[2]),
        (vector1[0]*vector2[1])-(vector1[1]*vector2[0])
    ]
}
class Camera {
    constructor(x, y, z, lX, lY, lZ, anglex, angley, anglez, fov, aspect, near, far) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.lX = lX;
        this.lY = lY;
        this.lZ = lZ;
        this.anglex = anglex;
        this.angley = angley;
        this.anglez = anglez;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.cameraPosition = [this.x, this.y, this.z];
        this.cameraTarget = [this.lX, this.lY, this.lZ];
        this.cameraUp = [0, 1, 0];
        this.viewMatrix = this.lookAt(this.cameraPosition, this.cameraTarget, this.cameraUp);
        this.projectionMatrix = [
            [1 / (this.aspect * Math.tan(this.fov / 2)), 0, 0, 0],
            [0, 1 / Math.tan(this.fov / 2), 0, 0],
            [0, 0, -(this.far + this.near) / (this.far - this.near), -2 * this.far * this.near / (this.far - this.near)],
            [0, 0, -1, 0]
        ];
        this.cameraMatrix = multiplyMatrices(this.projectionMatrix, this.viewMatrix);
        this.centerMatrix = [
            [Math.cos(this.angley) * Math.cos(this.anglez),-Math.cos(this.angley) * Math.sin(this.anglez), Math.sin(this.angley), this.x],
            [(Math.sin(this.anglex) * Math.sin(this.angley) * Math.cos(this.anglez) + Math.cos(this.anglex) * Math.sin(this.anglez)), (Math.sin(this.anglex) * Math.sin(this.angley) * Math.sin(this.anglez) - Math.cos(this.anglex) * Math.cos(this.anglez)), -Math.sin(this.anglex) * Math.cos(this.angley), this.y],
            [(Math.cos(this.anglex) * Math.sin(this.angley) * Math.cos(this.anglez) - Math.sin(this.anglex) * Math.sin(this.anglez)), -(Math.cos(this.anglex) * Math.sin(this.angley) * Math.sin(this.anglez) + Math.sin(this.anglex) * Math.cos(this.anglez)), Math.cos(this.anglex) * Math.cos(this.angley), this.z],
            [0, 0, 0, 1]
        ];

    }

    lookAt(cameraPosition, cameraTarget, cameraUp) {
        const zAxis = normalize(subtractVectors(cameraTarget, cameraPosition));
        const xAxis = normalize(crossPro(cameraUp, zAxis));
        const yAxis = crossPro(zAxis, xAxis);
        console.log(xAxis)
        return [
            [xAxis[0], xAxis[1], xAxis[2], -dotProduct(xAxis, cameraPosition)],
            [yAxis[0], yAxis[1], yAxis[2], -dotProduct(yAxis, cameraPosition)],
            [zAxis[0], zAxis[1], zAxis[2], -dotProduct(zAxis, cameraPosition)],
            [0, 0, 0, 1]
        ];
    }

    project(vertex) {
        let point = [[vertex.x], [vertex.y], [vertex.z], [1]];
        let projected = multiplyMatrices(this.cameraMatrix, point);
        let w = projected[3][0];
        let x = projected[0][0] / w;
        let y = projected[1][0] / w;
        let screenX = (x + 1) * (canvas.width / 2);
        let screenY = (1 - y) * (canvas.height / 2);

        return { x: screenX, y: screenY };
    }

    updateCamera() {
        this.cameraPosition[0] = this.x;
        this.cameraPosition[1] = this.y;
        this.cameraPosition[2] = this.z;

        // if(this.x < 0.5){ this.x = 0; }
        // if(this.y < 0.5){ this.y = 0; }
        // if(this.z < 0.5){ this.z = 0; }
        
        
        //cameraTarget = [cube.x, cube.y, cube.z-400];
        this.viewMatrix = this.lookAt(this.cameraPosition, this.cameraTarget, this.cameraUp);
        this.projectionMatrix = [
            [1 / (this.aspect * Math.tan(this.fov / 2)), 0, 0, 0],
            [0, 1 / Math.tan(this.fov / 2), 0, 0],
            [0, 0, -(this.far + this.near) / (this.far - this.near), -2 * this.far * this.near / (this.far - this.near)],
            [0, 0, -1, 0]
        ];
        this.cameraMatrix = multiplyMatrices(this.projectionMatrix, this.viewMatrix);
    }
}

let camera = new Camera(canvas.width/2, canvas.height -100, 1400, canvas.width/2, canvas.height/2, canvas.width/2, 0, 0, 0, 3.14 / 2, canvas.width/canvas.height, 1, 2000)

let obj = new Object({x:30, y:30, z:30}, {x:0, y:0, z:0}, {x:500, y:500, z:500})
obj.initialize()

let ground = [
    {x: 0, y: canvas.height, z: 0}, 
    {x: canvas.width, y: canvas.height, z: 0},
    {x: canvas.width, y: canvas.height, z: canvas.width}, 
    {x: 0, y: canvas.height, z: canvas.width}
];

function draw() {
    let drawingBoard = [];
    let groundBoard = [];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    
    obj.update();
    camera.updateCamera()
    obj.vertices.forEach((vertex, index) => {
        drawingBoard[index] = camera.project(vertex);
    });

    ctx.moveTo(drawingBoard[0].x, drawingBoard[0].y);
    drawingBoard.forEach((vertex, i) => {
        drawingBoard.forEach((vertexTo, j) => {
            ctx.moveTo(drawingBoard[i].x, drawingBoard[i].y);
            ctx.lineTo(drawingBoard[j].x, drawingBoard[j].y);
        });
    });
    
    ground.forEach((vertex, index) => {
        groundBoard[index] = camera.project(vertex);
    });

    ctx.moveTo(groundBoard[0].x, groundBoard[0].y);
    groundBoard.forEach((vertex, i) => {
        let nextVertex = groundBoard[(i + 1) % groundBoard.length];
        ctx.lineTo(nextVertex.x, nextVertex.y);
    });

    ctx.fillText(obj.energyLoss.toFixed(2), 50, 50);
    ctx.stroke();
    
    requestAnimationFrame(draw);
}

draw();
// setInterval(draw, 16);
