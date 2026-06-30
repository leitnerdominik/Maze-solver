const cols = 20;
const rows = 20;
const grid = [];
let isMazeCompleted = false;

let recursiveBacktracker,
    astar;


function setup() {
    createCanvas(windowWidth, windowHeight);

    const cellWidth = Math.floor(width / cols);
    const cellHeight = Math.floor(height / rows);

    for(let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }

    for(let x = 0; x < cols; x++) {
        for(let y = 0; y < rows; y++) {
            grid[x][y] = new Cell(x, y, cellWidth, cellHeight);
        }
    }

    for(let x = 0; x < cols; x++) {
        for(let y = 0; y < rows; y++) {
            grid[x][y].getNeighbours();
        }
    }

    // frameRate(10);

    recursiveBacktracker = new RecursiveBacktracker(grid);
    const startCell = grid[0][0];
    const goalCell = grid[cols-1][rows-1];
    astar = new AStar(startCell, goalCell);
}

function draw() {
    background(0);

    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            grid[i][j].render();
        }
    }

    if(!isMazeCompleted) {
        isMazeCompleted = recursiveBacktracker.update();
    }
    else {
        let solution = astar.search();
        astar.drawPath();

        if(solution != undefined) noLoop();
    }
}
