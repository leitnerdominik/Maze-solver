class Cell {
    constructor(x, y, cellWidth, cellHeight) {
        this.x = x;
        this.y = y;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        
        this.pos = createVector(this.x * this.cellWidth, this.y * this.cellHeight);

        this.visited = false;
        this.neighbours = [];

        this.walls = [true, true, true, true]

        this.color = color(3, 36, 100);

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
        // top
        if(this.walls[0]) {
            line(this.pos.x, this.pos.y, this.pos.x + this.cellWidth, this.pos.y);
        }

        // right
        if(this.walls[1]) {
            line(this.pos.x + this.cellWidth, this.pos.y, this.pos.x + this.cellWidth, this.pos.y + this.cellHeight);
        }

        //bottom
        if(this.walls[2]) {
            line(this.pos.x, this.pos.y + this.cellHeight, this.pos.x + this.cellWidth, this.pos.y + this.cellHeight);
        }

        // left
        if(this.walls[3]) {
            line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + this.cellHeight);
        }
    }

    highlightCell() {
        push();
        fill(color(3, 98, 3));
        noStroke();
        ellipse(this.pos.x + (this.cellWidth / 2), this.pos.y + (this.cellHeight / 2), this.cellHeight / 2);
        pop();
    }

    getNeighbours() {
        const top = this.y - 1 >= 0 ? grid[this.x][this.y-1] : false;
        const right = this.x + 1 < cols ? grid[this.x+1][this.y] : false;
        const bottom = this.y + 1 < rows ? grid[this.x][this.y+1] : false;
        const left = this.x - 1 >= 0 ? grid[this.x-1][this.y] :  false;

        if(top) this.neighbours.push(top);
        if(right) this.neighbours.push(right);
        if(bottom) this.neighbours.push(bottom);
        if(left) this.neighbours.push(left);
    }
}
