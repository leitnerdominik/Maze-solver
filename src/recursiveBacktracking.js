class RecursiveBacktracker {
    constructor(grid) {
        this.current = grid[0][0];
        this.current.visited = true;
        this.stack = [];
    }

    update() {
        const unvisitedNeighbours = [];

        // If the current cell has any neighbours which have not been visited
        for (const neighbour of this.current.neighbours) {
            if (!neighbour.visited) {
                unvisitedNeighbours.push(neighbour);
            }
        }

        if (unvisitedNeighbours.length) {
            // Choose randomly one of the unvisited neighbours
            const nextNeighbour = this.getRandomCell(unvisitedNeighbours);

            // Push the current cell to the stack
            this.stack.push(this.current);
            // Remove the wall between the current cell and the chosen cell
            this.removeWalls(this.current, nextNeighbour);

            // Make the chosen cell the current cell and mark it as visited
            this.current = nextNeighbour;
            this.current.visited = true;
        }
        // Else if stack is not empty
        else {
            // Pop a cell from the stack
            const nextCell = this.stack.pop();
            // maze generated
            if (!nextCell) return true;
            // console.log(nextCell);
            // Make it the current cell
            this.current = nextCell;
        }

        return false;
    }

    getRandomCell(arr) {
        const rndIndex = Math.floor(Math.random() * arr.length);
        return arr[rndIndex];
    }

    removeWalls(currentCell, nextCell) {
        const direction = getDirectionBetween(currentCell, nextCell);

        if (direction !== null) {
            currentCell.walls[direction] = false;
            nextCell.walls[getOppositeDirection(direction)] = false;
        }
    }
}
