// Idlepunk by Asher is licensed under CC BY-NC-SA 4.0 - https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
/*jshint esversion: 6 */
/*jshint eqeqeq: true */
/*jshint supernew: true */
/*jshint multistr: true */
let grid = new function() {
    const canvas = document.getElementById("hackGame");
    if (canvas.getContext) {
        this.ctx = canvas.getContext("2d");
        // Base width of lines. 
        this.ctx.lineWidth = "3";
        this.dimensions = {
            // Dimensions of the display area, change in HTML file as well.
            gridHeight: 300,
            gridWidth: 300,
            // Grid is made up of rectangles, these set their dimensions.
            cellHeight: 30,
            cellWidth: 30,
            cellPadding: 10
        };
        this.coords = {
            // Coordinates of rectangles in grid, will be set after number of rectangles is calculated.
            cellCoords: [[],[],[],[],[],[],[],[],[],[]],
            x: 0,
            y: 0,
            // Starting position of the pointer.
            pointerLoc: {
                x: 0,
                y: 0
            }
        };
        this.maps = {
            // Maps are made by drawing these 3 arrays.
            // Remember, these array are accessed using array[Y][X], NOT array[x][y]
            // The number corresponds to what item will be in that array position.
            // 0 = blank
            // 1 = start
            // 2 = end
            // 3 = firewall
            // 4 = ICE
            // 5 = server
            gridItemMap: [
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
                [0, 3, 5, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 4, 0, 0, 0, 3, 3, 3],
                [0, 0, 0, 0, 0, 0, 4, 3, 5, 5],
                [0, 0, 0, 0, 4, 0, 4, 3, 3, 3],
                [3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 4, 0, 0, 3, 3],
                [5, 0, 0, 0, 0, 4, 0, 0, 3, 2]
            ],
            // Where lines should appear running through the grid.
            // two 1s must be touching to draw a line between those rectangles.
            lineMap: [
                [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [1, 0, 1, 0, 0, 1, 1, 1, 1, 1],
                [1, 1, 1, 0, 0, 1, 0, 0, 0, 0],
                [1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
                [1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
                [1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
                [1, 0, 1, 0, 0, 1, 0, 0, 1, 1],
                [1, 1, 1, 0, 0, 1, 1, 1, 1, 1]
            ],
            // Where the player has access to.
            accessMap: [
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        };
        this.playerItems = {
            ICEPick: 30,
            dummyBarrier: 30,
            virtualServer: 30
        };
    }
}();
const gridItem = function(name, description, requirements, fillColor) {
    this.name = name;
    this.description = description;
    this.requirements = requirements;
    this.fillColor = fillColor;
    this.drawGridItem = function(x, y) {
        if (this.fillColor) {
            drawRectFill(x, y, this.fillColor);
        }
        if (grid.maps.accessMap[y][x] === 1) {
            drawRectOutline(x, y, "#00ff00");
        }
    };
};
grid.gridItem = [
    new gridItem(
        "Empty", 
        "There is nothing here.", 
        "Requires a Virtual Server to capture.",
        false),
    new gridItem(
        "Entry Node", 
        "Your attack starts here.", 
        false,
        "#00ff00"),
    new gridItem(
        "Node Core", 
        "Contains large quantities of sensitive information.", 
        "Requires an ICEPick, Dummy Barrier & Virtual Server to capture.",
        "#283747"),
    new gridItem(
        "Firewall", 
        "Prevents access.", 
        "Requires a Dummy Barrier to capture.",
        "grey"),
    new gridItem(
        "ICE", 
        "Attacks Intruders.",
        "Requires an ICE Pick to capture.",
        "#E74C3C"),
    new gridItem(
        "Server", 
        "Contains information",
        "Requires an ICEPick & Dummy Barrier to capture", 
        "#2980B9"),
];

function startHackGame() {
    // First time run.
    createGridCoordinates();
    refresh();
    displayDetailText();
    displayPointer();
}

function refresh() {
    // Refreshes the UI.
    grid.ctx.clearRect(0, 0, grid.dimensions.gridWidth, grid.dimensions.gridHeight);
    drawLineObjects();
    drawGridBase();
    drawGridItems();
    updateItemUI();
}

function createGridCoordinates() {
    // Fills 2d array of coordinates for the grid.
    // Coords are based off of how many rectangles can fit into the grid dimensions.
    for (let y = 1; y < grid.dimensions.gridHeight; y += grid.dimensions.cellHeight) {
        for (let x = 1; x < grid.dimensions.gridWidth; x += grid.dimensions.cellWidth) {
            grid.coords.cellCoords[grid.coords.x][grid.coords.y] = {
                x: x,
                y: y
            };
            grid.coords.x++;
        }
        grid.coords.y++;
        grid.coords.x = 0;
    }
}

function drawRectFill(x, y, color) {
    // Draws a full color square.
    grid.ctx.lineWidth = "3";
    grid.ctx.fillStyle = color;
    const drawX = grid.coords.cellCoords[x][y].x - 1;
    const drawY = grid.coords.cellCoords[x][y].y - 1;
    const cellWidth = grid.dimensions.cellWidth - grid.dimensions.cellPadding + 2;
    const cellHeight = grid.dimensions.cellHeight - grid.dimensions.cellPadding + 2;
    grid.ctx.fillRect(drawX, drawY, cellWidth, cellHeight);
}

function drawRectOutline(x, y, color) {
    // Draws the outline of a square.
    grid.ctx.lineWidth = "3";
    grid.ctx.strokeStyle = color;
    const drawX = grid.coords.cellCoords[x][y].x;
    const drawY = grid.coords.cellCoords[x][y].y;
    const cellWidth = grid.dimensions.cellWidth - grid.dimensions.cellPadding;
    const cellHeight = grid.dimensions.cellHeight - grid.dimensions.cellPadding;
    grid.ctx.strokeRect(drawX, drawY, cellWidth, cellHeight);
}

function drawLine(startXC, startYC, endXC, endYC, color) {
    // Draws a line between two points.
    grid.ctx.lineWidth = "3";
    grid.ctx.strokeStyle = color;
    const Xoffset = (grid.dimensions.cellWidth - grid.dimensions.cellPadding) / 2;
    const Yoffset = (grid.dimensions.cellHeight - grid.dimensions.cellPadding) / 2;
    const startX = grid.coords.cellCoords[startXC][startYC].x + Xoffset - 0;
    const startY = grid.coords.cellCoords[startXC][startYC].y + Yoffset - 0;
    const endX = grid.coords.cellCoords[endXC][endYC].x + Xoffset + 0;
    const endY = grid.coords.cellCoords[endXC][endYC].y + Yoffset + 0;
    grid.ctx.beginPath();
    grid.ctx.moveTo(startX, startY);
    grid.ctx.lineTo(endX, endY);
    //grid.ctx.lineCap = "square";
    grid.ctx.stroke();
}

function drawRectClear(x, y) {
    // Hides a grid square.
    const hideX = grid.coords.cellCoords[x][y].x - 1;
    const hideY = grid.coords.cellCoords[x][y].y - 1;
    const cellWidth = grid.dimensions.cellWidth;
    const cellHeight = grid.dimensions.cellHeight;
    grid.ctx.clearRect(hideX, hideY, cellWidth, cellHeight);
}

function updateItemUI() {
    //Updates the displayed number of items.
    HTMLEditor("gridItemICEPick", grid.playerItems.ICEPick);
    HTMLEditor("gridItemDummyBarrier", grid.playerItems.dummyBarrier);
    HTMLEditor("gridItemVirtualServer", grid.playerItems.virtualServer);
}

function drawGridBase() {
    // Draws the grid based on coordinates.
    for (let y = grid.coords.cellCoords.length - 1; y >= 0; y--) {
        for (let x = grid.coords.cellCoords[y].length - 1; x >= 0; x--) {
            drawRectOutline(x, y, "#7D3C98");
        }
    }
}

function drawGridItems() {
    // Fills grid in with objects from the .maps.gridItemMap.
    for (let y = grid.coords.cellCoords.length - 1; y >= 0; y--) {
        for (let x = grid.coords.cellCoords[y].length - 1; x >= 0; x--) {
            const gridCoord = grid.maps.gridItemMap[y][x];
            grid.gridItem[gridCoord].drawGridItem(x, y);
        }
    }
}

function displayPointer() {
    // If the pointer is over normal empties, display as white.
    // If the pointer is over player owned empties, display as light green.
    if (grid.maps.accessMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] === 1) {
        drawRectOutline(grid.coords.pointerLoc.x, grid.coords.pointerLoc.y, "#B4FF96");
    } else drawRectOutline(grid.coords.pointerLoc.x, grid.coords.pointerLoc.y, "white");
    // Display tooltip of what the pointer is over.
    displayDetailText();
}

function displayDetailText() {
    // Shows text based on what the pointer is over.
    const objectType = grid.maps.gridItemMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x];

    const displayName = grid.gridItem[objectType].name;
    const displayDesc = grid.gridItem[objectType].description;
    const displayReq = grid.gridItem[objectType].requirements;

    const displayAccess = "You have access to this.";
    const br = "<br>";
    let displayText = displayName + br + displayDesc;

    // If pointer is on accessed location.
    if (pointerOnAccessArea()) {
        displayText += br + displayAccess;
    }
    // If pointer is not on accessed location and location has requirements to access.
    else if (displayReq) {
        displayText += br + displayReq;
    }
    // Display message.
    HTMLEditor("hackGameDetailText", displayText);
}

function drawLineObjects() {
    // Draws between rectangles on grid.
    // Lines are only drawn between two 1s that are touching on grid.maps.lineMap.
    drawXLines();
    drawYLines();
}

function drawXLines() {
    // Draws horizontal lines from maps.lineMap.
    for (let y = grid.coords.cellCoords.length - 1; y >= 0; y--) {
        for (let x = grid.coords.cellCoords[y].length - 1; x >= 0; x--) {
            if (checkForXLineNeighbour(x, y)) {
                drawLine(x, y, x + 1, y, "#D35400");
                drawRectFill(x, y, "black");
                drawRectFill(x + 1, y, "black");
            }
        }
    }
}

function drawYLines() {
    // Draws vertical lines from maps.lineMap.
    for (let y = grid.coords.cellCoords.length - 1; y >= 0; y--) {
        for (let x = grid.coords.cellCoords[y].length - 1; x >= 0; x--) {
            if (checkForYLineNeighbour(x, y)) {
                drawLine(x, y, x, y + 1, "#D35400");
                drawRectFill(x, y, "black");
                drawRectFill(x, y + 1, "black");
            }
        }
    }
}

function checkForXLineNeighbour(x, y) {
    // Checks if there is a 1 to the right of x.
    if (x === grid.maps.lineMap[9].length - 1) {
        return false;
    } else {
        return grid.maps.lineMap[y][x] === 1 && grid.maps.lineMap[y][x + 1] === 1;
    }
}

function checkForYLineNeighbour(x, y) {
    // Checks if there is a 1 below y.
    if (y === grid.maps.lineMap.length - 1) {
        return false;
    } else {
        return grid.maps.lineMap[y][x] === 1 && grid.maps.lineMap[y + 1][x] === 1;
    }
}

document.onkeydown = function(e) {
    // Player inputs.
    // Gets input.
    e = e || window.event;
    // Different keys call different functions.
    // foo = {bar: () => baz()} will not call baz() when foo is initialized, baz can be called through foo().
    const actionFromInput = {
        // Move Left.
        37:  () => movePointerLeft(), // Left Arrow
        65:  () => movePointerLeft(), // A
        100: () => movePointerLeft(), // Numpad 4
        // MoveRight.
        39:  () => movePointerRight(), // Right Arrow
        68:  () => movePointerRight(), // D
        102: () => movePointerRight(), // Numpad 6
        // Move Down.
        40:  () => movePointerDown(), // Down Arrow
        83:  () => movePointerDown(), // S
        98:  () => movePointerDown(), // Numpad 2
        // Move Up.
        87:  () => movePointerUp(), // Up arrow
        38:  () => movePointerUp(), // W
        104: () => movePointerUp(), // Numpad 8
        // Move diagonally left/up.
        36:  () => {movePointerLeft(); movePointerUp();}, // Home
        103: () => {movePointerLeft(); movePointerUp();}, // Numpad 7
        // Move diagonally right/up.
        33:  () => {movePointerRight(); movePointerUp();}, // Page Up
        105: () => {movePointerRight(); movePointerUp();}, // Numpad 9
        // Move diagonally left/down.
        35:  () => {movePointerLeft(); movePointerDown();}, // End
        97:  () => {movePointerLeft(); movePointerDown();}, // Numpad 1
        // Move diagonally right/down.
        34:  () => {movePointerRight(); movePointerDown();}, // Page Down
        99:  () => {movePointerRight(); movePointerDown();}, // Numpad 3
        // Action.
        32:  () => playerAction(), // Space bar
        69:  () => playerAction(), // E
        13:  () => playerAction(), // Enter
        107: () => playerAction() // +
    }[e.keyCode];
    // If an input keyCode isn't a key in actionFromInput, it will be undefined.
    if (actionFromInput) {
        refresh();
        actionFromInput();
        displayPointer();
    } else {
        console.log(e.key + " is not bound to anything.");
    }
};

function movePointerUp() {
    // If pointer is not at top, move pointer up.
    if (grid.coords.pointerLoc.y !== 0) {
        grid.coords.pointerLoc.y--;
    }
}

function movePointerDown() {
    // If pointer is not at bottom, move pointer down.
    if (grid.coords.pointerLoc.y !== grid.coords.cellCoords.length - 1) {
        grid.coords.pointerLoc.y++;
    }
}

function movePointerLeft() {
    // If pointer is not leftmost. move pointer left.
    if (grid.coords.pointerLoc.x !== 0) {
        grid.coords.pointerLoc.x--;
    }
}

function movePointerRight() {
    // If pointer is not rightmost, move pointer right.
    if (grid.coords.pointerLoc.x !== grid.coords.cellCoords[0].length - 1) {
        grid.coords.pointerLoc.x++;
    }
}
function playerAction() {
    // The pointer is interacting with something on the grid.
    const pointerLocation = grid.maps.gridItemMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x];
    // Things that the player can interact with.
    const itemInteractions = {
            0: () => actionOnEmpty(),
            1: () => undefined,
            2: () => actionOnNodeCore(),
            3: () => actionOnFirewall(),
            4: () => actionOnICE(),
            5: () => actionOnServer()
        }
        [pointerLocation];
    // If the pointer is over an interactable thing.
    if (itemInteractions) {
        itemInteractions();
        updateItemUI();
    }
}

function actionOnEmpty() {
    // If the target is:
    // 1. On a line.
    // 2. Adjacent to an accessible location.
    // 3. Not already accessed.
    // 4. The player has an item to use here.
    if (canEnableAccess() && grid.playerItems.virtualServer >= 1) {
        // Remove a virtual server.
        grid.playerItems.virtualServer--;
        // Change this maps.accessMap location from unaccessed to accessed.
        grid.maps.accessMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] = 1;
    }
}

function actionOnNodeCore() {
    // If the player attempts an action on the end goal.
    // Should be a win condition.
    if (canEnableAccess() && grid.playerItems.ICEPick >= 1 && grid.playerItems.dummyBarrier >= 1 && grid.playerItems.virtualServer >= 1) {
        grid.playerItems.ICEPick--;
        grid.playerItems.dummyBarrier--;
        grid.playerItems.virtualServer--;
        grid.maps.accessMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] = 1;
    }
}

function actionOnServer() {
    // Should give the player a reward.
    if (canEnableAccess() && grid.playerItems.ICEPick >= 1 && grid.playerItems.dummyBarrier) {
        // Removes items required to access a server.
        grid.playerItems.ICEPick--;
        grid.playerItems.dummyBarrier--;
        // Mark location accessed.
        grid.maps.accessMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] = 1;
    }
}

function actionOnFirewall() {
    // Should block the player until they access it.
    if (canEnableAccess() && grid.playerItems.dummyBarrier >= 1) {
        grid.playerItems.dummyBarrier--;
        grid.maps.accessMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] = 1;
    }
}

function actionOnICE() {
    // Should attack the player until they access it.
    if (canEnableAccess() && grid.playerItems.ICEPick >= 1) {
        grid.playerItems.ICEPick--;
        grid.maps.accessMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] = 1;
    }
}

function canEnableAccess() {
    // If cell can be changed from unaccessed to accessed.
    return pointerOverLine() && pointerNextToAccessArea() && !pointerOnAccessArea();
}

function pointerOverLine() {
    // Checks if the pointer is over a line.
    return grid.maps.lineMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] === 1;
}

function pointerOnAccessArea() {
    // If the pointer is currently on an accessed area.
    return (grid.maps.accessMap[grid.coords.pointerLoc.y][grid.coords.pointerLoc.x] === 1);
}

function pointerNextToAccessArea() {
    // Checks if pointer is next to an area that is accessed.
    const x = grid.coords.pointerLoc.x;
    const y = grid.coords.pointerLoc.y;
    return (checkAccessAbove(x, y) || checkAccessBelow(x, y) || checkAccessLeft(x, y) || checkAccessRight(x, y));
}

function checkAccessAbove(x, y) {
    // If the cell above is accessed.
    if (y === 0) {
        return false;
    } else {
        return grid.maps.accessMap[y - 1][x] === 1;
    }
}

function checkAccessBelow(x, y) {
    // If the cell below is accessed.
    if (y === grid.maps.accessMap.length - 1) {
        return false;
    } else {
        return grid.maps.accessMap[y + 1][x] === 1;
    }
}

function checkAccessLeft(x, y) {
    // If the cell to the left is accessed.
    if (x === 0) {
        return false;
    } else {
        return grid.maps.accessMap[y][x - 1] === 1;
    }
}

function checkAccessRight(x, y) {
    // If the cell to the right is accessed.
    if (x === grid.maps.accessMap[y].length - 1) {
        return false;
    } else {
        return grid.maps.accessMap[y][x + 1] === 1;
    }
}

