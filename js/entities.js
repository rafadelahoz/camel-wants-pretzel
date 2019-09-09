
const entities = {
    init: function(ent) {
        switch (ent.type) {
            case "automover":
                ent.message = "dododo" + Math.random();
                break;
            case "seed":
                ent.stage = 0;
                break;
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
        case "seed":
            if (playerAction) {
                switch (entity.stage) {
                    case 0: // nop!
                    break;
                    case 1:
                        // start growing!
                        entity.stage++;
                        break;
                    case 2:
                    case 3:
                        // grow 
                        // unless the camel is on top
                        // TODO: other entities?
                        if (cgame.camel.x != entity.x || cgame.camel.y != entity.y) {
                            entity.stage++;
                            message("The baby plant is growing!");
                        }
                        break;
                    case 4:
                        if (cgame.camel.x != entity.x || cgame.camel.y != entity.y) {
                           message("The baby plant has grown into a tree!");
                           cgame.removeEntity(entity);
                           cgame.entitiesBuffer.push({type: "tree", x: entity.x, y: entity.y});
                        }
                        break;
                }
            }
            break;
        case "automover":
            // When not in player turns, move randomly
            if (!inPlayerTurn) {
                let sides = cgame.buildNeighbours(entity);
                sides = utils.shuffle(sides);
                for (pos of sides) {
                    if (entities.canEntityMoveTo(entity, pos.x, pos.y)) {
                        let oldx = entity.x;
                        let oldy = entity.y;

                        if (entity.x > pos.x)
                            entity.facing = "right";
                        else if (entity.x < pos.x)
                            entity.facing = "left";
                        else if (entity.y < pos.y)
                            entity.facing = "up";
                        else if (entity.y > pos.y)
                            entity.facing = "down";
                        
                        entity.x = pos.x;
                        entity.y = pos.y;

                        // try to move camel
                        if (entity.x == cgame.camel.x && entity.y == cgame.camel.y) {
                            var nx = cgame.camel.x;
                            var ny = cgame.camel.y;
                            
                            switch (entity.facing) {
                                case "left": nx++; break;
                                case "right": nx--; break;
                                case "up": ny++; break;
                                case "down": ny--; break;
                            }

                            if (cgame.canCamelMoveTo(nx, ny)) {
                                // Push camel if possible
                                message("8-ball pushes Camel")
                                cgame.camel.x = nx;
                                cgame.camel.y = ny;
                            } else {
                                // Swap if not
                                message("8-ball swaps with Camel");
                                cgame.camel.x = oldx;
                                cgame.camel.y = oldy;
                            }

                            // Recompute interactions (is this safe?)
                            entities.handleInteractions(inPlayerTurn, true);
                        }

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
                    break;
                }
            }
        }
    },

    canEntityMoveTo: function canEntityMoveTo(entity, nx, ny) {
        let ent = cgame.findEntityAt(nx, ny);
        let emptyCell = cgame.grid[ny][nx] == '';

        switch (entity.type) {
            case "automover":
                return emptyCell && (!ent || ent.type == 'seed' || ent.type == 'fire');
        }

        return true;
    },

    getAllOfType: function getAllOfType(type) {
        return cgame.entities.filter(function (ent) {
            return ent && (ent.type == type);
        });
    },

    render: function render(entity) {
        switch (entity.type) {
            case "seed":
                if (entity.stage <= 1)
                    return charset["seed"];
                else if (entity.stage > 1)
                    return charset["baby-plant"];
                else
                    return charset["tree"];
                break;
        }

        return charset[entity.type];
    }
}