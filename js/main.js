const charsetA = {
    "camel": "🐫",
    "wall": "🔲",
    "tree": "🌳",
    "fire": "🔥",
    "seed": "🌰",
    "pretzel": "🥨",
    "fountain": "⛲️",
    "automover": "🎱"
}

const charsetB = {
    "camel": "C",
    "wall": "[X]",
    "tree": "T",
    "fire": "F",
    "seed": "S",
    "pretzel": "P",
    "fountain": "F",
    "automover": "O"
}

let charset = charsetA;

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

    entities: [],
    entitiesBuffer: [],

    init: function init() {
        this.gameover = false;
        this.won = false;

        this.water = 3;
        this.camel.x = 4;
        this.camel.y = 4;

        this.entities = [];

        let content = $(".content");
        content.html('');
        content.append("<div id='title' style='text-align: center;'><h2>🐫❤️🥨</h2></div>");
        content.append("<div id='screen'></div>");
        $("#screen")
            .append("<div id='watermeter'></div>")
            .append("<table id='gridTable'></table>")
        content.append("<div id='messages'>" + 
                        "<span id='msg-old'></span><br/>" + 
                        "<span id='msg-new'></span>" + 
                    "</div>");

        message("Camel wants pretzel...");
        message("but he can't if he is thirsty!");

        cgame.grid = [];
        for (let row = 0; row < this.rows; row++) {
            cgame.grid.push([]);
            for (let col = 0; col < this.cols; col++) {
                if (col == 0 || col == this.cols - 1 || row == 0 || row == this.rows - 1)
                    cgame.grid[row].push(charset.wall);
                else if (Math.random() > 0.2)
                    this.grid[row].push("");
                else
                    this.grid[row].push(charset.tree)
            }
        }

        this.placeAtRandomFreePosition("fire");
        this.placeAtRandomFreePosition("pretzel");
        this.placeAtRandomFreePosition("fountain");
        this.placeAtRandomFreePosition("automover");

        this.buildFirstGridTable();

        this.renderWater();
        this.render();

        this.playerTurn();
        this.timedActions();
    },

    playerTurn: function() {
        cgame.update(true);
        if (!cgame.gameover && !cgame.won)
            setTimeout(cgame.playerTurn, 10);
    },

    timedActions: function() {
        cgame.update(false);
        if (!cgame.gameover && !cgame.won)
            setTimeout(cgame.timedActions, 1000);
    },

    placeAtRandomFreePosition: function placeAtRandomFreePosition(what) {
        let placed = false;
        let col, row = null;
        while (!placed) {
            col = Math.round(Math.random() * cgame.cols);
            row = Math.round(Math.random() * cgame.rows);
            if (this.isCellEmpty(col, row)) {
                placed = true;
                this.entities.push({
                    type: what,
                    x: col,
                    y: row
                });
            }
        }
    },

    isCellEmpty: function isCellEmpty(x, y) {
        return this.getGrid(x, y) == "" && !this.findEntityAt(x, y);
    },

    findEntityAt: function findEntityAt(x, y) {
        for (ent of this.entities) {
            if (ent.x == x && ent.y == y)
                return ent;
        }

        return null;
    },

    renderWater: function renderWater() {
        // Render water
        let water = "";
        let ctr = 0;
        while (ctr < cgame.water) {
            water += "💧";
            ctr++;
        }

        while (ctr < cgame.MAX_WATER) {
            water += "✖️"
            ctr++;
        }

        $("#watermeter").text("🚰" + water);
    },

    buildFirstGridTable: function() {
        // Render screen
        let table = $("#gridTable");

        let innerText = "";
        for (let row = 0; row < this.rows; row++) {
            innerText += "<tr>"
            for (let col = 0; col < this.cols; col++) {
                innerText += "<td col='"+ col +"' row='" + row + "'></td>";
            }
            innerText += "</tr>";
        }

        table.html(innerText);
    },

    render: function render() {
        // Render screen
        let computedGrid = this.computeGrid();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                $(this.cellDesc(col, row)).text(computedGrid[row][col]);
            }
        }
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

    update: function update(inPlayerTurn) {
        if (!inPlayerTurn)
            console.log("Update timed things");
        if (!this.gameover) {
            if (!this.won) {
                let playerAction = false;
                // Camel can only act in player turn
                if (inPlayerTurn)
                    playerAction = this.updateCamel();
                this.updateEntities(inPlayerTurn, playerAction);
                if (!inPlayerTurn || playerAction)
                    this.handleInteractions(inPlayerTurn, playerAction);
                this.updateWater();
            }
        }

        this.render();
        this.renderWater();
    },

    updateWater: function() {},

    updateEntities: function updateEntities(inPlayerTurn, playerAction) {
        // Update entities
        for (entity of this.entities) {
            this.updateEntity(entity, inPlayerTurn, playerAction);
        }

        // Clear buffer
        for (entity of this.entitiesBuffer) {
            this.entities.push(entity);
        }

        this.entitiesBuffer = [];
    },

    updateEntity: function updateEntity(entity, inPlayerTurn, playerAction) {
        switch (entity.type) {
        case "fire":
            if (playerAction) {
                // Spread to trees
                for (pos of this.buildNeighbours(entity)) {
                    if (this.getGrid(pos.x, pos.y) == charset["tree"]) {
                        this.setGrid(pos.x, pos.y, "");
                        this.entitiesBuffer.push({
                            type: "fire",
                            x: pos.x,
                            y: pos.y
                        });
                    }
                }
            }
            break;
        case "automover":
            // When not in player turns, move randomly
            if (!inPlayerTurn) {
                let sides = cgame.buildNeighbours(entity);
                sides = utils.shuffle(sides);
                for (pos of sides) {
                    if (this.isCellEmpty(pos.x, pos.y)) {
                        entity.x = pos.x;
                        entity.y = pos.y;
                        break;
                    }
                }
            }
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
        return [{
            x: pos.x - 1,
            y: pos.y
        }, {
            x: pos.x + 1,
            y: pos.y
        }, {
            x: pos.x,
            y: pos.y - 1
        }, {
            x: pos.x,
            y: pos.y + 1
        }];
    },

    updateCamel: function() {

        let playerInput = input.any();

        if (input.left)
            this.moveCamel("left");
        else if (input.right)
            this.moveCamel("right");
        else if (input.up)
            this.moveCamel("up");
        else if (input.down)
            this.moveCamel("down");

        input.clear();

        return playerInput;
    },

    moveCamel: function moveCamel(dir) {
        // Don't move on gameover
        if (cgame.gameover)
            return;

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
                nx = cgame.cols - 1;
            break;
        case "up":
            ny -= 1;
            if (ny < 0)
                ny = 0;
            break;
        case "down":
            ny += 1;
            if (ny >= cgame.rows)
                ny = cgame.rows - 1;
        }

        this.moveCamelTo(nx, ny);
    },

    moveCamelTo: function moveCamelTo(nx, ny) {
        // Check if camel can move to new position
        if (cgame.grid[ny][nx] == '') {
            cgame.camel.x = nx;
            cgame.camel.y = ny;
        }
    },

    handleInteractions: function handleInteractions(inPlayerTurn, playerAction) {
        // Camel vs things
        console.log("handling interactions");
        for (entity of this.entities) {
            if (entity.x == this.camel.x && entity.y == this.camel.y) {
                console.log("Entity " + JSON.stringify(entity));
                // Camel vs entity.type
                switch (entity.type) {
                case "fire":
                    if (playerAction)
                        cgame.removeWater(1);
                    break;
                case "fountain":
                    if (playerAction)
                        cgame.addWater(1);
                    break;
                case "pretzel":
                    if (playerAction) {
                        cgame.removeWater(1, true);
                        if (!cgame.gameover)
                            cgame.handleWin();
                    }
                    break;
                case "automover":
                    message("Black ball hits the camel");
                    flashy(this.cellDesc(entity.x, entity.y), "black");
                    break;
                }
            }
        }
    },

    cellDesc: function cellDesc(x, y) {
        return "td[col='" + x + "'][row='" + y + "']";
    },

    addWater: function addWater(amount) {
        if (amount == undefined || amount == null)
            return;

        message("Fresh!");

        cgame.water += amount;
        if (cgame.water > cgame.MAX_WATER) {
            cgame.water = cgame.MAX_WATER;
        }

        flashy('#watermeter', 'aqua');
    },

    removeWater: function removeWater(amount, dontShowMsg) {
        if (amount == undefined || amount == null)
            return;

        if (!dontShowMsg)
            message("Ouch!");

        cgame.water -= amount;
        flashy('#watermeter', 'red', function() {
            if (cgame.water <= 0)
                cgame.handleGameover();            
        });

        if (cgame.water <= 0)
            cgame.gameover = true;
    },

    handleWin: function handleWin() {
        /*this.render();
        this.renderWater();*/
        this.won = true;

        setTimeout(function() {
            if (cgame.gameover)
                setTimeout(function() {
                    message("Camel got pretzel... but got thirsty!");
                    alert("Camel got pretzel... but got thirsty!");
                }, 5);
            else
                $("#title").delay(100).animate({
                    "font-size": "5em"
                }, 100, function() {
                    $("#title").delay(100).animate({
                        "font-size": "1em"
                    }, 100, function() {
                        message("Camel got pretzel!");
                        alert("Camel got pretzel!");
                        cgame.init();
                    });
                });
        }, 5);
    },

    handleGameover: function handleGameover() {
        setTimeout(function() {
            cgame.gameover = true;
            $('table').css('background', "gray");

            wait(function() {
                message("Camel got thirsty!");
                alert("Camel got thirsty!");
            });
        }, 5);
    },

    setupInput: function setupInput() {
        /*$("#btnLeft").on("click", function() {
            cgame.moveCamel("left")
        });
        $("#btnRight").on("click", function() {
            cgame.moveCamel("right")
        });
        $("#btnUp").on("click", function() {
            cgame.moveCamel("up")
        });
        $("#btnDown").on("click", function() {
            cgame.moveCamel("down")
        });*/

        Mousetrap.bind("left", function() {
            // cgame.moveCamel("left")
            input.left = true;
        });
        Mousetrap.bind("right", function() {
            // cgame.moveCamel("right")
            input.right = true;
        });
        Mousetrap.bind("up", function() {
            // cgame.moveCamel("up")
            input.up = true;
        });
        Mousetrap.bind("down", function() {
            // cgame.moveCamel("down")
            input.down = true;
        });
    }
};

const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    button: false,

    clear: function clear() {
        this.left = this.right = this.up = this.down = false;
    },

    any: function any() {
        return this.left || this.right || this.up || this.down;
    }
}

function flashy(component, color, callback) {
    if (!color) color = 'yellow';
    let bgcolor = '#fff'; // $(component).css('background-color');
    $(component).delay(10).animate({
        "background-color": color
    }, 150, function() {
        $(component).animate({
            "background-color": bgcolor,
        }, 150, (callback));
    });
}

function wait(callback, time) {
    setTimeout(callback, (!time ? 50 : time));
}

function message(msg) {
    let msgnew = $('#msg-new');
    $('#msg-old').text(msgnew.text());
    msgnew.text(msg);
    flashy(msgnew, '#eee');
    wait(flashy('#msg-old', '#eee'));
}

function bootstrap() {
    cgame.setupInput();
    cgame.init();
}

const utils = {
    shuffle: function shuffle(arr) {
        var j, x, i;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    }
};