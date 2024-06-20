let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let gravity = 0.5;
let radius = 1
let numPoints = 3;
let friction = 0.1;

class RigidBody {
    constructor(s, r, t, mass){
        this.t = t;
        this.r = r;
        this.s = s;
        this.v = {x:0, y:0, z:0};
        this.mass = mass;
        this.rotVel = {x:0, y:0, z:0};
        this.avg = {x:0, y:0, z:0};
        this.impact = {x:0, y:0, z:0};
        this.preImpact = {x:0, y:0, z:0};
        this.gravity = {x:0, y:gravity, z:0};
        this.flags = 0;
        this.vertices = [];
        // this.vertexMesh = [
        // ];
        // for (let i = 0; i < numPoints; i++) {
        //     let theta = i * 2 * Math.PI / numPoints; // Angle with respect to the x-axis
        //     for (let j = 0; j < numPoints; j++) {
        //         let phi = j * Math.PI / numPoints; // Angle with respect to the z-axis
        //         let x = radius * Math.sin(phi) * Math.cos(theta);
        //         let y = radius * Math.sin(phi) * Math.sin(theta);
        //         let z = radius * Math.cos(phi);
        //         this.vertexMesh.push([[x], [y], [z], [1]]);
        //     }
        // }
        this.vertexMesh = [
            [[0],[0],[0],[1]],
            [[1],[2],[1],[1]],
            [[1],[2],[-1],[1]],
            [[-1],[2],[-1],[1]],
            [[-1],[2],[1],[1]],
        ];
        console.log(this.vertexMesh)

        this.center =
        multiplyMatrices(matrixTable(2, {x:this.t.x, y:this.t.y, z:this.t.z}), 
            multiplyMatrices(matrixTable(3, {x:this.r.x, y:this.r.y, z:this.r.z}),
                multiplyMatrices(matrixTable(4, {x:this.r.x, y:this.r.y, z:this.r.z}),
                    multiplyMatrices(matrixTable(5, {x:this.r.x, y:this.r.y, z:this.r.z}),
                        matrixTable(1, {x:this.s.x, y:this.s.y, z:this.s.z})
                    )
                )
            )
        );
    }
    draw(){
        for (let i = 0; i < this.vertices.length; i++){
            ctx.fillRect(this.vertices[i].x-2, this.vertices[i].y-2, 4, 4)
            ctx.fillText(this.vertices[i].x, 100 * i, 10)
            ctx.fillText(this.vertices[i].y, 100 * i, 40)
            ctx.fillText(this.vertices[i].v.x, 100 * i, 70)
            ctx.fillText(this.vertices[i].v.y, 100 * i, 110)
            ctx.fillText(this.vertices[i].impact.x, 100 * i, 140)
            ctx.fillText(this.vertices[i].impact.y, 100 * i, 170)
            ctx.fillText(this.v.x, 100 * i, 210)
            ctx.fillText(this.v.y, 100 * i, 240)
        }
    }
    initializer(){
        for (let i = 0; i < this.vertexMesh.length; i++){
            let vertexVector = multiplyMatrices(this.center, this.vertexMesh[i])
            let newVertex = new Vertex(vertexVector[0], vertexVector[1], vertexVector[2])
            newVertex.parent = this;
            this.vertices.push(newVertex)
            
        }
    }
    update(){
        this.center =
        multiplyMatrices(matrixTable(2, {x:this.t.x, y:this.t.y, z:this.t.z}), 
            multiplyMatrices(matrixTable(3, {x:this.r.x, y:this.r.y, z:this.r.z}),
                multiplyMatrices(matrixTable(4, {x:this.r.x, y:this.r.y, z:this.r.z}),
                    multiplyMatrices(matrixTable(5, {x:this.r.x, y:this.r.y, z:this.r.z}),
                        matrixTable(1, {x:this.s.x, y:this.s.y, z:this.s.z})
                    )
                )
            )
        );
        this.collectAverageVelocity();
        this.avg.y += this.gravity.y;

        if (this.impact.y < this.avg.y && this.flags > 0){
            this.impact.y = this.preImpact.y * -0.5;
            console.log("hit")
        }
        this.avg.x *=0.95
        this.avg.y *=0.95
        this.avg.z *=0.95
        this.v.x = this.avg.x
        this.v.y = this.avg.y
        this.v.z = this.avg.z
        this.v.x += this.impact.x;
        this.v.y += this.impact.y;
        this.v.z += this.impact.z;

        if (this.flags = 0){
            this.impact = {x:0, y:0, z:0}
        }
        this.flags = 0;
        this.t.x += this.v.x
        this.t.y += this.v.y;
        this.t.z += this.v.z;
        this.r.x += this.rotVel.x * 0.017;
        this.r.y += this.rotVel.y * 0.017;
        this.r.z += this.rotVel.z * 0.017;
        this.rotVel.x *= 0.95
        this.rotVel.y *= 0.95
        this.rotVel.z *= 0.95
        
        for (let i = 0; i < this.vertices.length; i++){
            this.vertices[i].v.x = this.v.x;
            this.vertices[i].v.y = this.v.y;
            this.vertices[i].v.z = this.v.z;
            let vertexVector = multiplyMatrices(this.center, this.vertexMesh[i])
            this.vertices[i].x = vertexVector[0]
            this.vertices[i].y = vertexVector[1]
            this.vertices[i].z = vertexVector[2]
            this.vertices[i].impact.y = 0;
        }
    }
    collectAverageVelocity(){
        this.avg = {x:0, y:0, z:0}
        this.impact = {x:0, y:0, z:0}
        for (let i = 0; i < this.vertices.length; i++){
            if (this.vertices[i].flag){
                this.flags++
            }
            this.vertices[i].detect();
            if (this.vertices[i].flag){
                this.impact.x = Math.min(this.vertices[i].impact.x,this.impact.x);
                this.impact.y = Math.min(this.vertices[i].impact.y,this.impact.y);
                this.impact.z = Math.min(this.vertices[i].impact.z,this.impact.z);
            }
            this.avg.x += this.vertices[i].v.x;
            this.avg.y += this.vertices[i].v.y;
            this.avg.z += this.vertices[i].v.z;

        }
        this.avg.x /= this.vertices.length;
        this.avg.y /= this.vertices.length;
        this.avg.z /= this.vertices.length;
    }
}
class Vertex{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.v = {x:0, y:0, z:0}
        this.temp = 0;
        this.impact = {x:0, y:0, z:0}
        this.prev = {x:0, y:1, z:0}
        this.mass = 1;
        this.parent = null;
        this.torque = 0;
        this.flag = true;
    }
    detect(){            
        if(this.y >= canvas.height ){
            let arm = this.armVector();
            if (!this.flag){
                this.parent.preImpact.x = Math.max(this.parent.preImpact.x, this.temp.x)
                this.parent.preImpact.y = Math.max(this.parent.preImpact.y, this.temp.y)
                this.impact.y = -this.v.y;
                this.impact.x = this.parent.rotVel.x * radius;
                this.parent.rotVel.x *= friction;
                this.prev.y = this.impact.y;
                this.flag = true;
            }
            let forceVector = subVectors(this.temp, this.impact)
            this.torque = crossProduct(arm, [forceVector.x, forceVector.y, forceVector.z]);
            this.parent.rotVel.x += this.torque[0]/50
            this.parent.rotVel.y += this.torque[1]/50
            this.parent.rotVel.z += this.torque[2]/50
        }else{
            this.impact.y = 0; this.flag = false;
        }
    }
    update(){
        this.v.x = this.parent.v.x
        this.v.y = this.parent.v.y
        this.v.z = this.parent.v.z
    }
    armVector(){
        let center = [this.parent.t.x, this.parent.t.y, this.parent.t.z];
        this.temp = {x:this.v.x, y:this.v.y, z:this.v.z};
        return [this.x - center[0], this.y - center[1], this.z - center[2]];
    }
}
function distance(a, b){
    let x = a.x + b.x;
    let y = a.y + b.y;
    let z = a.z + b.z;
    return Math.hypot(x, y, z)
}
function addVectors(v1, v2){
    v1.x += v2.x;
    v1.y += v2.y;
    v1.z += v2.z;
}
function subVectors(v1, v2){
    return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z}
}
function crossProduct(v1, v2){
    return [
        (v1[1]*v2[2])-(v1[2]*v2[1]),
        (v1[2]*v2[0])-(v1[0]*v2[2]),
        (v1[0]*v2[1])-(v1[1]*v2[0])
    ]
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
            [Math.cos(vector.z), -Math.sin(vector.z), 0, 0],
            [Math.sin(vector.z), Math.cos(vector.z), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]
        case 4: return [
            [Math.cos(vector.y), 0, Math.sin(vector.y), 0],
            [0, 1, 0, 0],
            [-Math.sin(vector.y), 0, Math.cos(vector.y), 0],
            [0, 0, 0, 1],
        ]
        case 5: return [
            [1, 0, 0, 0],
            [0, Math.cos(vector.x), -Math.sin(vector.x), 0],
            [0, Math.sin(vector.x), Math.cos(vector.x), 0],
            [0, 0, 0, 1],
        ]
    }
}

let obj = new RigidBody({x:40, y:40, z:40}, {x:0, y:0.6, z:0}, {x:400, y:300, z:200}, 1)
obj.initializer()

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.beginPath();
    obj.update();
    obj.draw();
    ctx.moveTo(0,canvas.height-200)
    ctx.lineTo(700,canvas.height-200)
    ctx.moveTo(obj.vertices[0].x, obj.vertices[0].y)
    for (let i = 0; i < obj.vertices.length; i++){
        ctx.lineTo(obj.vertices[i].x, obj.vertices[i].y)
    }
    ctx.lineTo(obj.vertices[0].x, obj.vertices[0].y)
    ctx.stroke();
    // requestAnimationFrame(draw)
}
setInterval(draw, 30)
// draw();
