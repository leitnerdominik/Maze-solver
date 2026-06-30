class AStar {
    constructor(start, goal) {
        this.start = start;
        this.goal = goal;

        this.openSet = [this.start];
        this.closedSet = [];
        this.currentCell = null;
        this.finalPath = [];
        this.isSolved = false;
        this.hasFailed = false;

        this.start.f = this.start.g + this.heuristic_cost(start, goal);
    }

    search() {
        if(this.isSolved) {
            return true;
        }

        if(this.hasFailed) {
            return false;
        }

        if (this.openSet.length) {

            let closestCellIndex = 0;

            for (let i = 0; i < this.openSet.length; i++) {
                if (this.openSet[i].f < this.openSet[closestCellIndex].f) {
                    closestCellIndex = i;
                }
            }

            this.currentCell = this.openSet[closestCellIndex];

            if (this.currentCell.x === this.goal.x && this.currentCell.y === this.goal.y) {
                this.finalPath = this.calcPath();
                this.isSolved = true;
                return true;
            }

            this.openSet.splice(closestCellIndex, 1); // remove current cell
            this.closedSet.push(this.currentCell);

            for (const neighbour of this.currentCell.neighbours) {
                if (!this.closedSet.includes(neighbour)) {
                    if (canMoveBetweenCells(this.currentCell, neighbour)) {

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
            this.hasFailed = true;
            this.finalPath = [];
            return false;
        }
    }

    calcPath() {
        if(!this.currentCell) {
            return [];
        }

        const path = [];
        let tempCell = this.currentCell;
        path.push(tempCell);

        while(tempCell.cameFrom) {
            path.push(tempCell.cameFrom);
            tempCell = tempCell.cameFrom;
        }
        return path;
    }

    heuristic_cost(start, goal) {
        return Math.abs(start.pos.x - goal.pos.x) + Math.abs(start.pos.y - goal.pos.y);
    }

}
