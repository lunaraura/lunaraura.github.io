const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Calculate box dimensions
const boxWidth = canvas.width * (2/3);
const boxHeight = canvas.height * (2/3);

// Define grid size and cell dimensions
const numRows = 15;
const numCols = 15;
const cellWidth = boxWidth / numCols;
const cellHeight = boxHeight / numRows;

// Create the grid
const grid = [];
for (let row = 0; row < numRows; row++) {
  const rowData = [];
  for (let col = 0; col < numCols; col++) {
    // Add initial values or objects to represent each cell in the grid
    rowData.push(/* Initial value or object */);
  }
  grid.push(rowData);
}

// Render the grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const cellX = col * cellWidth;
      const cellY = row * cellHeight;
      
      ctx.fillStyle = 'black';
      ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
    }
  }
}

drawGrid();
