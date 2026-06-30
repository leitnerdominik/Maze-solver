const cols = 20;
const rows = 20;
const APP_STATUS = Object.freeze({
    GENERATING: 'generating',
    SOLVING: 'solving',
    SOLVED: 'solved',
    NO_SOLUTION: 'no-solution',
    PAUSED: 'paused',
});

let grid = [];
let appStatus = APP_STATUS.GENERATING;
let recursiveBacktracker,
    astar,
    startCell,
    goalCell;


function setup() {
    createCanvas(windowWidth, windowHeight);
    resetMaze();
}

function createGrid() {
    const cellWidth = Math.floor(width / cols);
    const cellHeight = Math.floor(height / rows);
    const nextGrid = [];

    for(let i = 0; i < cols; i++) {
        nextGrid[i] = new Array(rows);
    }

    for(let x = 0; x < cols; x++) {
        for(let y = 0; y < rows; y++) {
            nextGrid[x][y] = new Cell(x, y, cellWidth, cellHeight);
        }
    }

    grid = nextGrid;

    for(let x = 0; x < cols; x++) {
        for(let y = 0; y < rows; y++) {
            grid[x][y].getNeighbours();
        }
    }

    return {
        grid: grid,
        startCell: grid[0][0],
        goalCell: grid[cols - 1][rows - 1],
    };
}

function resetMaze() {
    const maze = createGrid();
    startCell = maze.startCell;
    goalCell = maze.goalCell;
    recursiveBacktracker = new RecursiveBacktracker(grid);
    astar = new AStar(startCell, goalCell);
    appStatus = APP_STATUS.GENERATING;
    loop();
}

function draw() {
    background(0);

    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            grid[i][j].render();
        }
    }

    if(appStatus === APP_STATUS.GENERATING) {
        const generationComplete = recursiveBacktracker.update();
        if(generationComplete) {
            appStatus = APP_STATUS.SOLVING;
        }
    } else if(appStatus === APP_STATUS.SOLVING) {
        const solution = astar.search();
        astar.drawPath();

        if(solution === true) {
            appStatus = APP_STATUS.SOLVED;
            noLoop();
        } else if(solution === false) {
            appStatus = APP_STATUS.NO_SOLUTION;
            noLoop();
        }
    }
}
