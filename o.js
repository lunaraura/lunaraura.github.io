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
            [[0], [2], [0], [1]],
            [[1], [1], [1], [1]],
            [[1], [-1], [1], [1]],
            [[-1], [-1], [1], [1]],
            [[-1], [1], [1], [1]],
            [[0], [-2], [0], [1]],
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
            this.v.x = -10
            this.v.y = 0
            this.av.y = 0.1
            this.av.z = 0
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
        this.t.x += this.fix.x;
        this.t.y += this.fix.y;
        this.t.z += this.fix.z;
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
        this.t.y += this.v.y;
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
        this.av.x *= 0.99
        this.av.y *= 0.99
        this.av.z *= 0.99
    }
    zeroImpulses(){
        this.torque = {x:0, y:0, z:0}
        this.jerk = {x:0, y:0, z:0}
        this.fix = {x:0, y:0, z:0}
        this.resistances = 1;
    }
    applyImpulse(impulseVector, contactVector){
        this.energyLoss *= 0.9
        this.jerk.x += (impulseVector.x/this.mass );
        this.jerk.y += (impulseVector.y/this.mass);
        this.jerk.z += (impulseVector.z/this.mass)
        let angularImpulse = crossProduct(contactVector, impulseVector);
        this.torque.x += angularImpulse.x / this.inertiaTensor[0][0];
        this.torque.y += angularImpulse.y / this.inertiaTensor[1][1];
        this.torque.z += angularImpulse.z / this.inertiaTensor[2][2];
    }
}
class Vertex{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.v = {x:0, y:0.1, z:0};
        this.mass = 0;
        this.elasticity = 0.4;
        this.flag = {x:false, y:false};
        this.parent = null;
    }
    detect(){
        if (this.x  <= 0){
            let impulseVector = this.impulse();
            let contactVector = {x:this.x - this.parent.t.x, y:this.y - this.parent.t.y, z:this.z - this.parent.t.z};  
            this.parent.fix.x -= this.x;
            this.parent.resistances += 1;
            this.parent.applyImpulse(impulseVector, contactVector)
        } else if (this.x >= canvas.width){
            let impulseVector =this.impulse();
            let contactVector = {x:this.x - this.parent.t.x, y:this.y - this.parent.t.y, z:this.z - this.parent.t.z};
            this.parent.fix.x -= this.x - canvas.width;
            this.parent.resistances += 1;
            this.parent.applyImpulse(impulseVector, contactVector)
        }
        if (this.y <= 0){
            let impulseVector =this.impulse();
            let contactVector = {x:this.x - this.parent.t.x, y:this.y - this.parent.t.y, z:this.z - this.parent.t.z};
            this.parent.fix.y -= this.y
            this.parent.resistances += 1;
            this.parent.applyImpulse(impulseVector, contactVector)
        } else if (this.y >= canvas.height){
            let impulseVector =this.impulse();
            let contactVector = {x:this.x - this.parent.t.x, y:this.y - this.parent.t.y, z:this.z - this.parent.t.z};
            this.parent.fix.y -= this.y - canvas.height;
            this.parent.resistances += 1;
            this.parent.applyImpulse(impulseVector, contactVector)
        }
        this.v = {x:0, y:0, z:0}
    }
    impulse(){
        let former = -(1 - this.elasticity);
        let latter = {x: this.parent.v.x * this.parent.mass, y: (this.parent.v.y - 0.1 )* this.parent.mass, z: this.parent.v.z * this.parent.mass}
        return {x: latter.x * former, y: latter.y * former, z: latter.z * former};
    }

}
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
let obj = new Object({x:40, y:40, z:40}, {x:0, y:0, z:0.5}, {x:300, y:200, z:200})
obj.initialize()

function draw(){
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.beginPath();
    obj.update();
    ctx.moveTo(obj.vertices[0].x, obj.vertices[0].y)
    for (let i = 0; i < obj.vertices.length; i++){
        for (let j = 0; j < obj.vertices.length; j++){
            ctx.moveTo(obj.vertices[i].x, obj.vertices[i].y)
            ctx.lineTo(obj.vertices[j].x, obj.vertices[j].y)
        }
    }
    // ctx.fillText(obj.t.x, 10, 50)
    // ctx.fillText(obj.t.y, 30, 60)
    // ctx.fillText(obj.t.z, 50, 70)
    // ctx.fillText(obj.r.x, 10, 80)
    // ctx.fillText(obj.r.y, 30, 90)
    // ctx.fillText(obj.r.z, 50, 100)
    // ctx.fillText(obj.s.x, 10, 110)
    // ctx.fillText(obj.s.y, 30, 120)
    // ctx.fillText(obj.s.z, 50, 130)
    // ctx.fillText(obj.v.x, 10, 140)
    // ctx.fillText(obj.v.y, 30, 150)
    // ctx.fillText(obj.v.z, 50, 160)
    ctx.fillText(obj.energyLoss, 50, 50)
    ctx.stroke();
    requestAnimationFrame(draw)
}
draw()
// setInterval(draw, 16)
