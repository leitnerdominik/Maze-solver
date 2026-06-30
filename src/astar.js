class AStar {
    constructor(start, goal) {
        this.start = start;
        this.goal = goal;

        this.openSet = [this.start];
        this.closeSet = [];

        this.start.f = this.start.g + this.heuristic_cost(start, goal);
    }

    search() {
        if (this.openSet.length) {

            let closestCellIndex = 0;

            for (let i = 0; i < this.openSet.length; i++) {
                if (this.openSet[i].f < this.openSet[closestCellIndex].f) {
                    closestCellIndex = i;
                }
            }

            this.currentCell = this.openSet[closestCellIndex];

            if (this.currentCell.x === this.goal.x && this.currentCell.y === this.goal.y) {
                return true;
            }

            this.openSet.splice(closestCellIndex, 1); // remove current cell
            this.closeSet.push(this.currentCell);

            for (const neighbour of this.currentCell.neighbours) {
                if (!this.closeSet.includes(neighbour)) {
                    const openNeighbours = this.getCellDirection(this.currentCell, neighbour);

                    if ((openNeighbours.isTop && !this.currentCell.walls[0]) ||
                        (openNeighbours.isRight && !this.currentCell.walls[1]) ||
                        (openNeighbours.isBottom && !this.currentCell.walls[2]) ||
                        (openNeighbours.isLeft && !this.currentCell.walls[3])) {

                        let betterPath = false;

                        const tentativeG = this.currentCell.g + 1;
                        neighbour.f = neighbour.g + this.heuristic_cost(neighbour, this.goal);
                        if (!this.openSet.includes(neighbour)) {
                            this.openSet.push(neighbour);
                            neighbour.g = tentativeG;
                            betterPath = true;
                        } else {
                            if (tentativeG < neighbour.g) {
                                neighbour.g = tentativeG;
                                betterPath = true;
                            }
                        }

                        if (betterPath) {
                            neighbour.h = this.heuristic_cost(neighbour, this.goal);

                            neighbour.f = neighbour.g + neighbour.h;
                            neighbour.cameFrom = this.currentCell;
                        }
                    }
                }
            }
        } else {
            return false;
        }
    }

    getCellDirection(currentCell, nextCell) {
        const isTop = nextCell.x === currentCell.x && nextCell.y < currentCell.y;
        const isRight = nextCell.x > currentCell.x && nextCell.y === currentCell.y;
        const isBottom = nextCell.x === currentCell.x && nextCell.y > currentCell.y;
        const isLeft = nextCell.x < currentCell.x && nextCell.y === currentCell.y;

        return {
            isTop: isTop,
            isRight: isRight,
            isBottom: isBottom,
            isLeft: isLeft,
        };
    }

    calcPath() {
        const path = [];
        let tempCell = this.currentCell;
        path.push(tempCell);

        while(tempCell.cameFrom) {
            path.push(tempCell.cameFrom);
            tempCell = tempCell.cameFrom;
        }
        return path;
    }

    drawPath() {

        let linepath = this.calcPath();
        push();
        noFill();
        stroke(255);
        strokeWeight(8);
        beginShape();
        for(const cell of linepath) {
            vertex(cell.pos.x + cell.cellWidth / 2, cell.pos.y + cell.cellHeight / 2);
            // cell.color = color(200, 0, 0);
        }
        endShape();
        pop();
    }

    heuristic_cost(start, goal) {
        return abs(start.pos.x - goal.pos.x) + abs(start.pos.y - goal.pos.y);
    }

}
