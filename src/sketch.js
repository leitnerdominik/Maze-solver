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
    setAppStatus(APP_STATUS.GENERATING);
    loop();
}

function draw() {
    background(0);

    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            grid[i][j].render();
        }
    }

    for(let step = 0; step < stepsPerFrame; step++) {
        if(!advanceMaze()) {
            break;
        }
    }
}

function advanceMaze() {
    if(appStatus === APP_STATUS.GENERATING) {
        const generationComplete = recursiveBacktracker.update();
        if(generationComplete) {
            setAppStatus(APP_STATUS.SOLVING);
        }
        return true;
    } else if(appStatus === APP_STATUS.SOLVING) {
        const solution = astar.search();
        astar.drawPath();

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
