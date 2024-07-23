<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Symbolic Computation with Math.js and Numeric.js</title>
</head>
<body>
    <h1>Symbolic Computation with Math.js and Numeric.js</h1>
    <p>Check the console for the Jacobian matrix, its SVD, and the computed joint velocities.</p>
    <div id="jacobian"></div>
    <div id="svd"></div>
    <div id="joint-velocities"></div>
</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/10.0.0/math.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js"></script>
<script>
    function computeJacobian() {
        // Define the joint variables
        let q1 = 'q1';
        let q2 = 'q2';
        let q3 = 'q3';
        let q4 = 'q4';
        let q5 = 'q5';
        
        // Define the lengths
        let L1 = 'L1';
        let L2 = 'L2';
        let L3 = 'L3';
        let L4 = 'L4';
        let L5 = 'L5';
        let L6 = 'L6';
        
        // Define the forward kinematics equations
        let x = math.parse(`cos(${q1}) * (-${L2} * cos(${q2}) + (${L3}+${L4}) * cos(${q2}+${q3})) + (${L5}+${L6}) * (cos(${q5})*cos(${q2}+${q3})*cos(${q1}) + sin(${q5})*(sin(${q1})*sin(${q4})-cos(${q1})*sin(${q2}+${q3})*cos(${q4})))`);
        let y = math.parse(`${L1} + ${L2} * cos(${q2}) + (${L3} + ${L4}) * sin(${q2}+${q3}) + (${L5}+${L6})*(cos(${q5})*sin(${q2}+${q3}) + sin(${q5})*cos(${q2}+${q3})*cos(${q4}))`);
        let z = math.parse(`cos(${q1}) * (-${L2}*cos(${q2}) - (${L3}+${L4}) * cos(${q2}+${q3})) + (${L5}+${L6}) * (-cos(${q5})*cos(${q2}+${q3})*sin(${q1}) + sin(${q5})*(cos(${q1})*sin(${q4})+sin(${q1})*sin(${q2}+${q3})*cos(${q4})))`);
        
        let q = [q1, q2, q3, q4, q5];
        
        let fk = [x, y, z];
        let J = [];

        // Compute partial derivatives
        for (let i = 0; i < fk.length; i++) {
            J[i] = [];
            for (let j = 0; j < q.length; j++) {
                let partialDerivative = math.derivative(fk[i], q[j]);
                J[i][j] = partialDerivative;
            }
        }

        return J;
    }

    function evaluateJacobian(J, values) {
        // Evaluate the symbolic Jacobian matrix numerically
        let evaluatedJ = J.map(row => row.map(expr => expr.evaluate(values)));
        return evaluatedJ;
    }

    function computePseudoinverse(J) {
        // Compute the SVD of the Jacobian matrix
        let { U, S, V } = numeric.svd(J);

        // Create a diagonal matrix for S+
        let SigmaPlus = numeric.diag(S.map(s => s !== 0 ? 1 / s : 0));

        // Compute J+ = V * SigmaPlus * U^T
        let V_SigmaPlus = numeric.dot(V, SigmaPlus);
        let J_pseudo = numeric.dot(V_SigmaPlus, numeric.transpose(U));

        return J_pseudo;
    }

    function computeJointVelocities(J_pseudo, desiredVelocity) {
        // Compute the joint velocities by multiplying J+ with the desired end-effector velocity
        let jointVelocities = numeric.dot(J_pseudo, desiredVelocity);
        return jointVelocities;
    }

    function displayResults() {
        // Define numerical values for the lengths and joint variables
        let values = {
            L1: 1, L2: 1, L3: 1, L4: 1, L5: 1, L6: 1,
            q1: 0.1, q2: 0.2, q3: 0.3, q4: 0.4, q5: 0.5
        };

        // Define the desired end-effector velocity
        let desiredVelocity = [0.1, 0.2, 0.3];

        let J = computeJacobian();
        let evaluatedJ = evaluateJacobian(J, values);
        let J_pseudo = computePseudoinverse(evaluatedJ);
        let jointVelocities = computeJointVelocities(J_pseudo, desiredVelocity);

        console.log('Symbolic Jacobian Matrix:', J.map(row => row.map(expr => expr.toString())));
        console.log('Evaluated Jacobian Matrix:', evaluatedJ);
        console.log('Pseudoinverse of Jacobian Matrix:', J_pseudo);
        console.log('Joint Velocities:', jointVelocities);

        document.getElementById('jacobian').innerText = `Symbolic Jacobian Matrix:\n${J.map(row => row.map(expr => expr.toString()).join(", ")).join("\n")}`;
        document.getElementById('svd').innerText = `Pseudoinverse of Jacobian Matrix: ${JSON.stringify(J_pseudo, null, 2)}\nJoint Velocities: ${JSON.stringify(jointVelocities, null, 2)}`;
    }

    window.onload = displayResults;
</script>