
const charsetA = {
    "camel": "🐫",
    "tree": "🌳"
}

const charsetB = {
    "camel": "C",
    "tree": "T"
}

let charset = charsetB;

const cgame = {
    grid: [],
    cols: 9,
    rows: 12,

    camel: {
        x: 4,
        y: 4,
        char: charset.camel
    },

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
                    if (Math.random() > 0.5)
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

        let innerText = "<table>";
        for (let row = 0; row < this.rows; row++) {
            innerText += "<tr>"
            for (let col = 0; col < this.cols; col++) {
                innerText += this.renderCell(col, row);
            }
            innerText += "</tr>";
        }
        innerText += "</table>";

        screen.append(innerText);
    },

    renderCell: function renderCell(col, row) {
        let cellText = "";

        // First, camel
        if (cgame.camel.x == col && cgame.camel.y == row)
            cellText += "<td>" + this.camel.char + "</td>";
        else
        // Finally, the grid
            cellText += "<td>" + this.grid[row][col] + "</td>";

        return cellText;
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

        cgame.render();
    },

    setupInput: function setupInput() {
        Mousetrap.bind("left", function() {cgame.moveCamel("left")});
        Mousetrap.bind("right", function() {cgame.moveCamel("right")});
        Mousetrap.bind("up", function() {cgame.moveCamel("up")});
        Mousetrap.bind("down", function() {cgame.moveCamel("down")});
    }
};
