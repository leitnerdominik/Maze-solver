let cols = 20;
let rows = 20;
const APP_STATUS = Object.freeze({
    GENERATING: 'generating',
    SOLVING: 'solving',
    SOLVED: 'solved',
    NO_SOLUTION: 'no-solution',
    PAUSED: 'paused',
});
const STATUS_LABELS = Object.freeze({
    [APP_STATUS.GENERATING]: 'Generating',
    [APP_STATUS.SOLVING]: 'Solving',
    [APP_STATUS.SOLVED]: 'Solved',
    [APP_STATUS.NO_SOLUTION]: 'No solution',
    [APP_STATUS.PAUSED]: 'Paused',
});
const VISUAL_COLORS = Object.freeze({
    UNVISITED: '#07111f',
    VISITED: '#164b67',
    CURRENT_GENERATOR: '#2bd17e',
    ASTAR_OPEN: '#f0b429',
    ASTAR_CLOSED: '#6f52ed',
    PATH: '#fff7d6',
    START: '#27c7ff',
    GOAL: '#ff5d73',
});

let grid = [];
let appStatus = APP_STATUS.GENERATING;
let statusBeforePause = APP_STATUS.GENERATING;
let stepsPerFrame = 1;
let controls = {};
let recursiveBacktracker,
    astar,
    startCell,
    goalCell;


function setup() {
    createCanvas(windowWidth, windowHeight);
    setupControls();
    resetMaze();
}

function setupControls() {
    controls = {
        regenerateButton: document.getElementById('regenerateButton'),
        pauseButton: document.getElementById('pauseButton'),
        speedInput: document.getElementById('speedInput'),
        speedValue: document.getElementById('speedValue'),
        gridSizeInput: document.getElementById('gridSizeInput'),
        gridSizeValue: document.getElementById('gridSizeValue'),
        statusDisplay: document.getElementById('statusDisplay'),
    };

    if(controls.regenerateButton) {
        controls.regenerateButton.addEventListener('click', resetMaze);
    }

    if(controls.pauseButton) {
        controls.pauseButton.addEventListener('click', togglePause);
    }

    if(controls.speedInput) {
        stepsPerFrame = Number(controls.speedInput.value);
        controls.speedInput.addEventListener('input', updateSpeed);
    }

    if(controls.gridSizeInput) {
        controls.gridSizeInput.addEventListener('change', updateGridSize);
    }

    updateSpeed();
    updateGridSizeLabel();
    updateStatusDisplay();
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
            nextGrid[x][y].color = VISUAL_COLORS.UNVISITED;
        }
    }

    grid = nextGrid;

    for(let x = 0; x < cols; x++) {
        for(let y = 0; y < rows; y++) {
            grid[x][y].setNeighbours(grid, cols, rows);
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
    statusBeforePause = APP_STATUS.GENERATING;
    setAppStatus(APP_STATUS.GENERATING);
    loop();
}

function draw() {
    background(0);

    for(let step = 0; step < stepsPerFrame; step++) {
        if(!advanceMaze()) {
            break;
        }
    }

    renderMaze();
}

function advanceMaze() {
    if(appStatus === APP_STATUS.GENERATING) {
        const generationComplete = recursiveBacktracker.update();
        if(generationComplete) {
            if(hasPathBetween(startCell, goalCell)) {
                setAppStatus(APP_STATUS.SOLVING);
            } else {
                setAppStatus(APP_STATUS.NO_SOLUTION);
                noLoop();
                return false;
            }
        }
        return true;
    } else if(appStatus === APP_STATUS.SOLVING) {
        const solution = astar.search();

        if(solution === true) {
            setAppStatus(APP_STATUS.SOLVED);
            noLoop();
            return false;
        } else if(solution === false) {
            setAppStatus(APP_STATUS.NO_SOLUTION);
            noLoop();
            return false;
        }

        return true;
    }

    return false;
}

function renderMaze() {
    applyVisualState();

    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            grid[i][j].render();
        }
    }

    drawAStarPath();
    drawStartGoalMarkers();
}

function applyVisualState() {
    const visualStatus = appStatus === APP_STATUS.PAUSED ? statusBeforePause : appStatus;
    const openCells = astar ? new Set(astar.openSet) : new Set();
    const closedCells = astar ? new Set(astar.closedSet) : new Set();

    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            const cell = grid[i][j];
            cell.color = cell.visited ? VISUAL_COLORS.VISITED : VISUAL_COLORS.UNVISITED;

            if(visualStatus !== APP_STATUS.GENERATING) {
                if(closedCells.has(cell)) {
                    cell.color = VISUAL_COLORS.ASTAR_CLOSED;
                } else if(openCells.has(cell)) {
                    cell.color = VISUAL_COLORS.ASTAR_OPEN;
                }
            }
        }
    }

    if(visualStatus === APP_STATUS.GENERATING && recursiveBacktracker) {
        recursiveBacktracker.current.color = VISUAL_COLORS.CURRENT_GENERATOR;
    }

    if(startCell) {
        startCell.color = VISUAL_COLORS.START;
    }

    if(goalCell) {
        goalCell.color = VISUAL_COLORS.GOAL;
    }
}

function drawStartGoalMarkers() {
    drawCellMarker(startCell, VISUAL_COLORS.START);
    drawCellMarker(goalCell, VISUAL_COLORS.GOAL);
}

function drawCellMarker(cell, markerColor) {
    if(!cell) {
        return;
    }

    const markerSize = Math.max(4, Math.min(cell.cellWidth, cell.cellHeight) * 0.42);
    push();
    noStroke();
    fill(markerColor);
    ellipse(cell.pos.x + cell.cellWidth / 2, cell.pos.y + cell.cellHeight / 2, markerSize);
    pop();
}

function drawAStarPath() {
    if(!astar || !astar.currentCell || appStatus === APP_STATUS.GENERATING) {
        return;
    }

    const path = astar.finalPath.length ? astar.finalPath : astar.calcPath();
    if(!path.length) {
        return;
    }

    const pathWidth = Math.max(2, Math.min(startCell.cellWidth, startCell.cellHeight) * 0.28);
    push();
    noFill();
    stroke(VISUAL_COLORS.PATH);
    strokeWeight(pathWidth);
    beginShape();
    for(const cell of path) {
        vertex(cell.pos.x + cell.cellWidth / 2, cell.pos.y + cell.cellHeight / 2);
    }
    endShape();
    pop();
}

function hasPathBetween(start, goal) {
    const openCells = [start];
    const visitedCells = new Set([start]);

    while(openCells.length) {
        const currentCell = openCells.shift();

        if(currentCell === goal) {
            return true;
        }

        for(const neighbour of currentCell.neighbours) {
            if(!visitedCells.has(neighbour) && canMoveBetweenCells(currentCell, neighbour)) {
                visitedCells.add(neighbour);
                openCells.push(neighbour);
            }
        }
    }

    return false;
}

function togglePause() {
    if(appStatus === APP_STATUS.PAUSED) {
        setAppStatus(statusBeforePause);
        loop();
        return;
    }

    if(appStatus === APP_STATUS.GENERATING || appStatus === APP_STATUS.SOLVING) {
        statusBeforePause = appStatus;
        setAppStatus(APP_STATUS.PAUSED);
        noLoop();
    }
}

function updateSpeed() {
    if(controls.speedInput) {
        stepsPerFrame = Number(controls.speedInput.value);
    }

    if(controls.speedValue) {
        controls.speedValue.textContent = `${stepsPerFrame}x`;
    }
}

function updateGridSize() {
    if(controls.gridSizeInput) {
        cols = Number(controls.gridSizeInput.value);
        rows = cols;
    }

    updateGridSizeLabel();
    resetMaze();
}

function updateGridSizeLabel() {
    if(controls.gridSizeValue) {
        controls.gridSizeValue.textContent = `${cols}x${rows}`;
    }
}

function setAppStatus(status) {
    appStatus = status;
    updateStatusDisplay();
    updatePauseButton();
}

function updateStatusDisplay() {
    if(controls.statusDisplay) {
        controls.statusDisplay.textContent = STATUS_LABELS[appStatus];
    }
}

function updatePauseButton() {
    if(!controls.pauseButton) {
        return;
    }

    controls.pauseButton.textContent = appStatus === APP_STATUS.PAUSED ? 'Play' : 'Pause';
    controls.pauseButton.disabled = appStatus === APP_STATUS.SOLVED || appStatus === APP_STATUS.NO_SOLUTION;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    resetMaze();
}
