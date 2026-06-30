const WALL_DIRECTION = Object.freeze({
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
});
const WALL_DIRECTIONS = Object.freeze([
    { direction: WALL_DIRECTION.TOP, dx: 0, dy: -1 },
    { direction: WALL_DIRECTION.RIGHT, dx: 1, dy: 0 },
    { direction: WALL_DIRECTION.BOTTOM, dx: 0, dy: 1 },
    { direction: WALL_DIRECTION.LEFT, dx: -1, dy: 0 },
]);
const OPPOSITE_WALL_DIRECTION = Object.freeze({
    [WALL_DIRECTION.TOP]: WALL_DIRECTION.BOTTOM,
    [WALL_DIRECTION.RIGHT]: WALL_DIRECTION.LEFT,
    [WALL_DIRECTION.BOTTOM]: WALL_DIRECTION.TOP,
    [WALL_DIRECTION.LEFT]: WALL_DIRECTION.RIGHT,
});

function getNeighbourCells(cell, cellGrid, totalCols, totalRows) {
    const neighbours = [];

    for (const offset of WALL_DIRECTIONS) {
        const neighbourX = cell.x + offset.dx;
        const neighbourY = cell.y + offset.dy;

        if (neighbourX >= 0 && neighbourX < totalCols && neighbourY >= 0 && neighbourY < totalRows) {
            neighbours.push(cellGrid[neighbourX][neighbourY]);
        }
    }

    return neighbours;
}

function getDirectionBetween(currentCell, nextCell) {
    const dx = nextCell.x - currentCell.x;
    const dy = nextCell.y - currentCell.y;
    const offset = WALL_DIRECTIONS.find((wallDirection) => wallDirection.dx === dx && wallDirection.dy === dy);

    return offset ? offset.direction : null;
}

function getOppositeDirection(direction) {
    return OPPOSITE_WALL_DIRECTION[direction];
}

function canMoveBetweenCells(currentCell, nextCell) {
    const direction = getDirectionBetween(currentCell, nextCell);

    return direction !== null && !currentCell.walls[direction];
}

class Cell {
    constructor(x, y, cellWidth, cellHeight) {
        this.x = x;
        this.y = y;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;

        this.pos = {
            x: this.x * this.cellWidth,
            y: this.y * this.cellHeight,
        };

        this.visited = false;
        this.neighbours = [];

        this.walls = [true, true, true, true];

        this.color = '#07111f';

        //for astar
        this.f = 0;
        this.g = 0;
        this.h = 0;

        this.cameFrom = null;
    }

    render() {
        push();
        noStroke();
        fill(this.color);
        rect(this.pos.x, this.pos.y, this.cellWidth, this.cellHeight);
        pop();

        stroke(255);
        if (this.walls[WALL_DIRECTION.TOP]) {
            line(this.pos.x, this.pos.y, this.pos.x + this.cellWidth, this.pos.y);
        }

        if (this.walls[WALL_DIRECTION.RIGHT]) {
            line(this.pos.x + this.cellWidth, this.pos.y, this.pos.x + this.cellWidth, this.pos.y + this.cellHeight);
        }

        if (this.walls[WALL_DIRECTION.BOTTOM]) {
            line(this.pos.x, this.pos.y + this.cellHeight, this.pos.x + this.cellWidth, this.pos.y + this.cellHeight);
        }

        if (this.walls[WALL_DIRECTION.LEFT]) {
            line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + this.cellHeight);
        }
    }

    setNeighbours(cellGrid, totalCols, totalRows) {
        this.neighbours = getNeighbourCells(this, cellGrid, totalCols, totalRows);
    }
}
