const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const sourceFiles = ['src/cell.js', 'src/recursiveBacktracking.js', 'src/astar.js'];

function loadAlgorithmContext() {
    const context = {
        Math,
        push: () => {},
        pop: () => {},
        noStroke: () => {},
        fill: () => {},
        rect: () => {},
        stroke: () => {},
        line: () => {},
    };

    vm.createContext(context);

    for (const file of sourceFiles) {
        vm.runInContext(fs.readFileSync(path.join(process.cwd(), file), 'utf8'), context, { filename: file });
    }

    vm.runInContext(
        `
        this.Cell = Cell;
        this.RecursiveBacktracker = RecursiveBacktracker;
        this.AStar = AStar;
        this.WALL_DIRECTION = WALL_DIRECTION;
        this.getDirectionBetween = getDirectionBetween;
        this.canMoveBetweenCells = canMoveBetweenCells;
        `,
        context,
    );

    return context;
}

function createGrid(context, cols, rows) {
    const grid = [];

    for (let x = 0; x < cols; x++) {
        grid[x] = new Array(rows);
    }

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            grid[x][y] = new context.Cell(x, y, 10, 10);
        }
    }

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            grid[x][y].setNeighbours(grid, cols, rows);
        }
    }

    return grid;
}

function generateMaze(context, cols = 6, rows = 5) {
    const grid = createGrid(context, cols, rows);
    const generator = new context.RecursiveBacktracker(grid);

    for (let step = 0; step < cols * rows * 20; step++) {
        if (generator.update()) {
            return grid;
        }
    }

    throw new Error('Maze generation did not complete');
}

function hasPath(context, start, goal) {
    const openCells = [start];
    const visitedCells = new Set([start]);

    while (openCells.length) {
        const currentCell = openCells.shift();

        if (currentCell === goal) {
            return true;
        }

        for (const neighbour of currentCell.neighbours) {
            if (!visitedCells.has(neighbour) && context.canMoveBetweenCells(currentCell, neighbour)) {
                visitedCells.add(neighbour);
                openCells.push(neighbour);
            }
        }
    }

    return false;
}

function solveMaze(context, start, goal) {
    const astar = new context.AStar(start, goal);

    for (let step = 0; step < 1000; step++) {
        const result = astar.search();

        if (result !== undefined) {
            return { astar, result };
        }
    }

    throw new Error('A* search did not finish');
}

test('calculates neighbours without global grid dimensions', () => {
    const context = loadAlgorithmContext();
    const grid = createGrid(context, 3, 3);

    assert.equal(grid[0][0].neighbours.length, 2);
    assert.equal(grid[1][1].neighbours.length, 4);
    assert.equal(grid[2][2].neighbours.length, 2);
});

test('removes walls between adjacent cells', () => {
    const context = loadAlgorithmContext();
    const grid = createGrid(context, 2, 1);
    const generator = new context.RecursiveBacktracker(grid);
    const leftCell = grid[0][0];
    const rightCell = grid[1][0];

    generator.removeWalls(leftCell, rightCell);

    assert.equal(leftCell.walls[context.WALL_DIRECTION.RIGHT], false);
    assert.equal(rightCell.walls[context.WALL_DIRECTION.LEFT], false);
    assert.equal(context.canMoveBetweenCells(leftCell, rightCell), true);
    assert.equal(context.getDirectionBetween(leftCell, rightCell), context.WALL_DIRECTION.RIGHT);
});

test('generated maze connects start and goal', () => {
    const context = loadAlgorithmContext();
    const grid = generateMaze(context, 6, 5);

    assert.equal(hasPath(context, grid[0][0], grid[5][4]), true);
});

test('A* finds a valid final path through open walls', () => {
    const context = loadAlgorithmContext();
    const grid = generateMaze(context, 6, 5);
    const { astar, result } = solveMaze(context, grid[0][0], grid[5][4]);

    assert.equal(result, true);
    assert.equal(astar.isSolved, true);
    assert.equal(astar.hasFailed, false);
    assert.ok(astar.finalPath.length > 1);
    assert.equal(astar.finalPath[0], grid[5][4]);
    assert.equal(astar.finalPath.at(-1), grid[0][0]);

    for (let index = 0; index < astar.finalPath.length - 1; index++) {
        assert.equal(context.canMoveBetweenCells(astar.finalPath[index], astar.finalPath[index + 1]), true);
    }
});
