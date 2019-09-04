
const entities = {
    init: function(ent) {
        switch (ent.type) {
            case "automover":
                ent.message = "dododo" + Math.random();
        }
    },

    update: function update(entity, inPlayerTurn, playerAction) {
        switch (entity.type) {
        case "fire":
            if (playerAction) {
                // Spread to trees
                for (pos of cgame.buildNeighbours(entity)) {
                    if (cgame.getGrid(pos.x, pos.y) == charset["tree"]) {
                        cgame.setGrid(pos.x, pos.y, "");
                        cgame.entitiesBuffer.push({
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
                    if (cgame.isCellEmpty(pos.x, pos.y)) {
                        if (entity.x < pos.x)
                            entity.facing = "right";
                        else if (entity.x > pos.x)
                            entity.facing = "left";
                        else if (entity.y < pos.y)
                            entity.facing = "up";
                        else if (entity.y > pos.y)
                            entity.facing = "down";
                        
                        entity.x = pos.x;
                        entity.y = pos.y;
                        break;
                    }
                }
            }
        }
    },

    handleInteractions: function handleInteractions(inPlayerTurn, playerAction) {
        // Camel vs things
        console.log("handling interactions");
        for (entity of cgame.entities) {
            if (entity.x == cgame.camel.x && entity.y == cgame.camel.y) {
                console.log("Entity " + JSON.stringify(entity));
                // Camel vs entity.type
                switch (entity.type) {
                case "fire":
                    if (playerAction) {
                        cgame.removeWater(1);
                        flashy(cgame.cellDesc(cgame.camel.x, cgame.camel.y), "red");
                        message("Ouch!");
                    }
                    break;
                case "fountain":
                    if (playerAction) {   
                        cgame.addWater(1);
                        flashy(cgame.cellDesc(cgame.camel.x, cgame.camel.y), "aqua");
                        message("Fresh!");
                    }
                    break;
                case "pretzel":
                    if (playerAction) {
                        cgame.removeWater(1);
                        if (!cgame.gameover)
                            cgame.handleWin();
                    }
                    break;
                case "automover":
                    message("Black ball hits the camel");
                    flashy(cgame.cellDesc(entity.x, entity.y), "black");
                    // try to move camel
                    var nx = cgame.camel.x;
                    var ny = cgame.camel.y;
                    // TODO: maybe swapping would be cooler?
                    switch (entity.facing) {
                        case "left": nx++; break;
                        case "right": nx--; break;
                        case "up": ny++; break;
                        case "down": ny--; break;
                    }
                    
                    if (cgame.getGrid(nx, ny) == '') {
                        cgame.camel.x = nx;
                        cgame.camel.y = ny;
                        // TODO: recompute interactions?
                        entities.handleInteractions(inPlayerTurn, true);
                    }

                    break;
                }
            }
        }
    }
}