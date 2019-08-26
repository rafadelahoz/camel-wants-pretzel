
const charsetA = {
    "camel": "🐫",
    "tree": "🌳",
    "fire": "🔥",
    "seed": "🌰"
}

const charsetB = {
    "camel": "C",
    "tree": "T",
    "fire": "F",
    "seed": "S"
}

let charset = charsetA;

const cgame = {
    grid: [],
    cols: 9,
    rows: 12,

    camel: {
        x: 4,
        y: 4,
        char: charset.camel
    },

    entities: [
        {
            "type": "fire",
            x: 6, y: 6
        }
    ],

    entitiesBuffer: [],

    init: function init() {

        this.setupInput();

        let content = $(".content");
        content.append("The screen of 🐫 goes below");
        content.append("<div id='screen'></div>");

        cgame.grid = [];
        for (let row = 0; row < this.rows; row++) {
            cgame.grid.push([]);
            for (let col = 0; col < this.cols; col++) {
                if (col == 0 || col == this.cols-1 || row == 0 || row == this.rows-1)
                    cgame.grid[row].push(charset.tree);
                else
                    if (Math.random() > 0.2)
                        this.grid[row].push("");
                    else
                        this.grid[row].push(charset.tree)
            }
        }

        this.render();
    },

    render: function render() {
        let screen = $("#screen");
        screen.html('');

        let computedGrid = this.computeGrid();

        let innerText = "<table>";
        for (let row = 0; row < this.rows; row++) {
            innerText += "<tr>"
            for (let col = 0; col < this.cols; col++) {
                innerText += "<td>" + computedGrid[row][col] + "</td>";
            }
            innerText += "</tr>";
        }
        innerText += "</table>";

        screen.append(innerText);
    },

    computeGrid: function computeGrid() {
        var cgrid = [];

        // Put source grid
        for (let row = 0; row < this.rows; row++) {
            cgrid.push([]);
            for (let col = 0; col < this.cols; col++) {
                cgrid[row].push(this.grid[row][col]);
            }
        }

        // Put entities
        for (entity of this.entities) {
            cgrid[entity.y][entity.x] = charset[entity.type];
        }

        // Put camel
        cgrid[this.camel.y][this.camel.x] = this.camel.char;

        return cgrid;
    },

    updateEntities: function updateEntities() {
        // Update entities
        for (entity of this.entities) {
            this.updateEntity(entity);
        }

        // Clear buffer
        for (entity of this.entitiesBuffer) {
            this.entities.push(entity);
        }

        entitiesBuffer = [];
    },

    updateEntity: function updateEntity(entity) {
        switch (entity.type) {
            case "fire":
                // Spread to trees
                for (pos of this.buildNeighbours(entity)) {
                    if (this.getGrid(pos.x, pos.y) == charset["tree"]) {
                        this.setGrid(pos.x, pos.y, "x");
                        this.entitiesBuffer.push({type: "fire", x: pos.x, y: pos.y});
                    }
                }
                break;
        }
    },

    setGrid: function setGrid(x, y, value) {
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows)
            this.grid[y][x] = value;
    },

    getGrid: function getGrid(x, y) {
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows)
            return this.grid[y][x];
        return null;
    },

    buildNeighbours: function buildNeighbours(pos) {
        return [{x: pos.x-1, y: pos.y}, {x: pos.x+1, y: pos.y},
                {x: pos.x, y: pos.y-1}, {x: pos.x, y: pos.y+1}];
    },

    moveCamel: function moveCamel(dir) {

        let nx = cgame.camel.x;
        let ny = cgame.camel.y;

        switch (dir) {
            case "left":
                nx -= 1;
                if (nx < 0)
                    nx = 0;
            break;
            case "right":
                nx += 1;
                if (nx >= cgame.cols)
                    nx = cgame.cols-1;
            break;
            case "up":
                ny -= 1;
                if (ny < 0)
                    ny = 0;
            break;
            case "down":
                ny += 1;
                if (ny >= cgame.rows)
                    ny = cgame.rows-1;
        }

        // TODO: Checks for new position
        if (cgame.grid[ny][nx] == '') {
            cgame.camel.x = nx;
            cgame.camel.y = ny;
        }

        this.updateEntities();

        cgame.render();
    },

    setupInput: function setupInput() {
        Mousetrap.bind("left", function() {cgame.moveCamel("left")});
        Mousetrap.bind("right", function() {cgame.moveCamel("right")});
        Mousetrap.bind("up", function() {cgame.moveCamel("up")});
        Mousetrap.bind("down", function() {cgame.moveCamel("down")});
    }
};
