
const charsetA = {
    "camel": "🐫",
    "wall": "🔲",
    "tree": "🌳",
    "fire": "🔥",
    "seed": "🌰"
}

const charsetB = {
    "camel": "C",
    "wall": "[X]",
    "tree": "T",
    "fire": "F",
    "seed": "S"
}

let charset = charsetB;

const cgame = {
    grid: [],
    cols: 9,
    rows: 12,

    MAX_WATER: 5,
    water: 3,

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
        content.append("<div id='watermeter'></div>");
        content.append("<div id='screen'></div>");

        cgame.grid = [];
        for (let row = 0; row < this.rows; row++) {
            cgame.grid.push([]);
            for (let col = 0; col < this.cols; col++) {
                if (col == 0 || col == this.cols-1 || row == 0 || row == this.rows-1)
                    cgame.grid[row].push(charset.wall);
                else
                    if (Math.random() > 0.2 || (col == 6 && row == 6)) // Hack to avoid tree under first fire
                        this.grid[row].push("");
                    else
                        this.grid[row].push(charset.tree)
            }
        }

        this.renderWater();
        this.render();
    },

    renderWater: function renderWater() {
        // Render water
        let water = "";
        while (water.length < cgame.water*2)
            water += "💧";
        while (water.length < cgame.MAX_WATER*2)
            water += "🔹"
        $("#watermeter").text("🚰" + water);
    },

    render: function render() {
        // Render screen
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

    update: function update() {
        if (!this.gameover) {
            this.updateEntities();
            this.updateWater();

            this.render();
        }

        this.renderWater();
    },

    updateWater: function() {

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

        this.entitiesBuffer = [];
    },

    updateEntity: function updateEntity(entity) {
        switch (entity.type) {
            case "fire":
                // Spread to trees
                for (pos of this.buildNeighbours(entity)) {
                    if (this.getGrid(pos.x, pos.y) == charset["tree"]) {
                        this.setGrid(pos.x, pos.y, "");
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

        this.moveCamelTo(nx, ny);

        this.update();

        
    },

    moveCamelTo: function moveCamelTo(nx, ny) {
        // Check if camel can move to new position
        if (cgame.grid[ny][nx] == '') {
            cgame.camel.x = nx;
            cgame.camel.y = ny;

            console.log("Checking entities");
            for (entity of this.entities) {
                if (entity.x == nx && entity.y == ny) {
                    console.log("Entity " + JSON.stringify(entity));
                    // Camel vs entity.type
                    switch (entity.type) {
                        case "fire": 
                            cgame.removeWater(1);
                    }
                }
            }
        }
    },

    addWater: function addWater(amount) {
        if (amount != undefined && amount != null)
            cgame.water += amount;
        if (cgame.water > cgame.MAX_WATER) {
            cgame.water = cgame.MAX_WATER;
        }
    },

    removeWater: function removeWater(amount) {
        if (amount != undefined && amount != null)
            cgame.water -= amount;
        if (cgame.water <= 0)
            cgame.handleGameover();
    },

    handleGameover: function handleGameover() {
        cgame.gameover = true;
        $('table').css('background', "gray");
    },

    setupInput: function setupInput() {
        Mousetrap.bind("left", function() {cgame.moveCamel("left")});
        Mousetrap.bind("right", function() {cgame.moveCamel("right")});
        Mousetrap.bind("up", function() {cgame.moveCamel("up")});
        Mousetrap.bind("down", function() {cgame.moveCamel("down")});
    }
};
