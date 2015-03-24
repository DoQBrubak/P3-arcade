/* I wanted to randomize properties of enemies as they were 
 * generated. Instead of doing all the work at Enemy, I abstracted 
 * randomization out to a method on the Array prototype. This is 
 * directly based on  
 * http://stackoverflow.com/questions/4550505/getting-random-value-from-an-array
 * I may want to find a more appropriate place to declare this still.
 * Maybe a library.js file.
 */ 
Array.prototype.pickRand = function() {
    return this[Math.floor(Math.random() * this.length)];
};






/* These are the constants. Note that GRID, CANVAS, FRAME,
 * and PLAYER_START_LOC are dependent on higher constants.
 */

var NUM_OF_ROWS = 7;
var NUM_OF_COLS = 9;
var FRAME_THICKNESS = 10;
var DASH_THICKNESS = 50;
var ROW_HEIGHT = 83;
var COL_WIDTH = 101;

var GRID = {
    width: NUM_OF_COLS * COL_WIDTH,
    height: NUM_OF_ROWS * ROW_HEIGHT
};

var CANVAS = {
    xMin: 0,
    yMin: 0,
    width: 2*FRAME_THICKNESS + GRID.width,
    height: DASH_THICKNESS + GRID.height + FRAME_THICKNESS
};

CANVAS.xMax = CANVAS.xMin + CANVAS.width;
CANVAS.yMax = CANVAS.yMin + CANVAS.height;

GRID.xMin = CANVAS.xMin + FRAME_THICKNESS;
GRID.yMin = CANVAS.yMin + DASH_THICKNESS;
GRID.xMax = GRID.xMin + GRID.width;
GRID.yMax = GRID.yMin + GRID.height;

var FRAME = [
    [0,0,CANVAS.width,DASH_THICKNESS],
    [0,0,FRAME_THICKNESS,CANVAS.height],
    [CANVAS.width,0,-FRAME_THICKNESS,CANVAS.height],
    [0,CANVAS.height,CANVAS.width,-FRAME_THICKNESS]
];

var PLAYER_SPEED = 5;
var PLAYER_START_LOC =  {x:(COL_WIDTH/2), y:(ROW_HEIGHT/2)};
var BOUNCE = 7;

var ENEMY_GEOM = {ctrX:50, ctrY:42, radius:35};
var TILE_GEOM = {ctrX:50, ctrY:83, radius:0};

var COLORS = {
    bg1: '#5f74e2',
    bg2: '#2efe2e', 
    frame: "#CBB677",
    txt1: "#000066"
};

var TEAM = ['cat', 'horn', 'pink', 'royal'];

var SPLASH = {
    msg: {
        preGame: [
            'Welcome to Teen Girl Squad vs Buggers.',
            'Press >SPACE< to begin.'],
        pauseGame: [
            'The game is now paused',
            'Not going to score many points that way...'],
        postGame: [
            'The Teen Girl Squad was eaten by bugs.',
            'Press >SPACE< to play again.']
}};

var URLS = {
    'bug': 'images/bug-%data%.png',
    'girlLg': 'images/girl-%data%-lg.png',
    'girlSm': 'images/girl-%data%-sm.png',
    'tile': 'images/block-%data%.png',
};

GROUND_FACTOR = {
    "grass": {"player":0.8,"bug":0.4},
    "water": {"player":0.2,"bug":1.0}, 
    "stone": {"player":1.0,"bug":0.8}
};

var memo1 = ""; // This will change through the testing process
var memo2 = ""; // Likewise








var Game = function() {
    this.state = "preGame";
    this.stateRef = {
        preGame:"inGame",
        inGame:"pauseGame",
        pauseGame: "inGame",
        postGame: "inGame"
    };
    this.level = 1;
    this.score = 0;
    this.teamNow = ['pink'];
    this.playerNow = 'horn';
};

Game.prototype.render = function() {
    // First render the FRAME.
    ctx.fillStyle = COLORS.frame;
    for (var i = 0; i < FRAME.length; i++) {
        ctx.fillRect(FRAME[i][0], FRAME[i][1], FRAME[i][2], FRAME[i][3]);
    }
    // Then render the DASHBOARD.
    for (var i = 0; i < this.teamNow.length; i++) {
        ctx.drawImage(Resources.get(URLS.girlSm.replace('%data%',this.teamNow[i])),550+i*50,-15);
    }
    ctx.strokeText("SCORE: " + this.score, 10, 35);
    ctx.strokeText("LEVEL: "+ this.level, 250, 35);
    ctx.strokeText("TEAM: ", 450, 35);
    ctx.strokeText(memo1, 650, 15);
    ctx.strokeText(memo2, 650, 40);
}

Game.prototype.init = function() {
    thePlayer = new Player(this.playerNow);
    theMap = new Map(NUM_OF_ROWS, NUM_OF_COLS);
    theMap.generate(0.2,0.2);
    enemies = new Collection();
    goodies = new Collection();
}

Game.prototype.toggle = function(state) {
    this.state = this.stateRef[state];
}

Game.prototype.death = function() {
    thePlayer = new Player(this.playerNow);
    console.log("Death");
}

Game.prototype.splash = function() {
    var width = GRID.xMax,
        height = GRID.yMax;
    ctx.fillStyle = COLORS.bg1;
    ctx.fillRect(0,0,width,height);
    ctx.fillStyle = COLORS.bg2;
    ctx.fillRect(width*0.1,height*0.1,width*0.8,height*0.8);
    ctx.fillStyle = COLORS.txt1;
    ctx.font = "30px Arial";
    ctx.strokeText(SPLASH.msg[this.state][0],150,100);
    ctx.strokeText(SPLASH.msg[this.state][1],150,150);
}










/* A Map-class instance is comprised of an array-of-arrays matrix in which
 * the first- and second- order indeces correspond to the row and column
 * identities for Tile objects, which are stored in the scecond-order
 * array.
 * A Map does not currently have any sub- or super-classes.
 */
var Map = function(numRows, numCols) {
    this.numRows = numRows;
    this.numCols = numCols;
    this.matrix = [];
}

Map.prototype.render = function(){
    for (var i = 0; i < this.numRows; i++) {
        for (var j =0; j < this.numCols; j++) {
            this.matrix[i][j].render();
}}}

Map.prototype.generate = function(pWater,pStone){
    var preMatrix = []; // An empty array
    for (var i = 0; i < this.numRows; i ++) {
        preMatrix[i] = [];
        for (var j = 0; j < this.numCols; j++) {
            var y;
                m = Math.random();
            if (i==0) {
                if (j==0) {y = 'grass'}
                else {y = 'water'}
            } else if (i == (this.numRows - 1) && j == (this.numCols - 1)) {
                y = 'stone'
            } else {
                y = (m < pWater ? 'water' : m > (1 - pStone) ? 'stone' : 'grass');
            }
            preMatrix[i][j] = y;
    }}

    /* This builds the matrix full of Tile objects based on 
     * the draft preMatrix full of strings.
     */
    for (var i = 0; i < this.numRows; i ++) {
        this.matrix[i] = [];
        for (var j = 0; j < this.numCols; j++) {
            this.matrix[i][j] = new Tile(i, j, preMatrix[i][j]);
}}}












var Collection = function (dt){
    this.members = [];
}
/* A Collection can update() itself, by calling the update() method
 * of each of its members.
 */
Collection.prototype.update = function() {
    for(var i=0; i<this.members.length; i++) {
        this.members[i].update();
}}
/* A Collection can render() itself, by calling the render() method
 * of each of its members.
 */
Collection.prototype.render = function() {
    for (var i=0; i < this.members.length; i++) {
        this.members[i].render();
}}




















/* The Enemy, Player and Tile classes have several attributes in common, 
 * which are factored out into a Entity class constructor.
 */
var Entity = function(loc, imgUrl, geom, ground) {
    // The entity's coordinates as an Object: {x:val,y:val}
    this.loc = loc;
    // The entity's url source
    this.imgUrl = imgUrl;
    // This describes geometry relevant to collisions and other gameplay.
    this.geom = geom;
    /* This indicates the ground the Entity IS in the case of Tiles,
     * or IS STANDING ON in the case of Living things.
     */
    this.ground = ground;
}

// Any Entity can be called on to render itself.
Entity.prototype.render = function() {
    ctx.drawImage(  
        Resources.get(this.imgUrl),
        GRID.xMin + this.loc.x - this.geom.ctrX,
        GRID.yMin + this.loc.y - this.geom.ctrY
);}











/* Tile is a subclass of Entity. If goodies turn out to have 
 * characteristics in common with Tile, I may create "Living" and
 * "NonLiving" subclasses.
 */
var Tile = function(rowID, colID, ground) {
    var geom = TILE_GEOM;
    Entity.call(
        this,
        {x:(colID*COL_WIDTH+geom.ctrX), y:(rowID*ROW_HEIGHT+geom.ctrY-50)}, // Entity.loc
        URLS.tile.replace('%data%', ground), // Entity.imgUrl
        TILE_GEOM, // Entity.geom
        ground // Entity.ground
    ); 
    this.rowID = rowID;
    this.colID = colID;
}
// This validates Tile as a subclass of Entity
Tile.prototype = Object.create(Entity.prototype);
Tile.prototype.constructor = Tile;







/* THE GOODY CLASS IS NOT YET IN SERVICE

var Goody = function(geom, rowID, colID, goodyType, grabEffect) {
    Entity.call(
        this,
        loc=null,
        imgUrl=null,
        geom=null
     );
    this.goodyType = goodyType;
    this.grabEffect = grabEffect;
}

Goody.prototype = Object.create(Entity.prototype);
Goody.prototype.constructor = Goody;

*/









/* This is a class for all Living things. This is a subclass 
 * of Entity that is super to all classes of things that move around.
 */
var Living = function(loc, imgUrl, geom, ground, speed) {
    Entity.call(
        this,
        loc, // Entity.loc
        imgUrl, // Entity.imgUrl
        geom, // Entity.geom
        ground // Entity.ground
    );
    this.speed = speed;
    this.isInBounds = true;
};
// This validates Living as a subclass of Entity
Living.prototype = Object.create(Entity.prototype);
Living.prototype.constructor = Living;

Living.prototype.checkGround = function(map){
    var row, col;
    row = Math.floor(this.loc.y / ROW_HEIGHT);
    col = Math.floor(this.loc.x / COL_WIDTH);
    if (theMap.matrix[row][col] !== undefined) {
        this.ground = theMap.matrix[row][col].ground
    } else {
        this.ground = "grass";
    }
}

// Actually adjust the Living Entity's location.
Living.prototype.move = function(species) {
    var multiplier = GROUND_FACTOR[this.ground][species];
    this.loc.x += (this.speed * this.veloc.x * multiplier);
    this.loc.y += (this.speed * this.veloc.y * multiplier);
}










/* Player is a subclass of Living, which is a subclass of Entity.
 * A Player must be initialized with a "personality" argument.
 */
var Player = function(personality) {
    Living.call(
        this,
        PLAYER_START_LOC, // Entity/Living.loc
        URLS.girlLg.replace('%data%',personality), // Entity/Living.imgUrl
        {ctrX:50 , ctrY:115, radius: 35}, // Entity/Living.geom
        "grass", // Entity/Living.ground
        PLAYER_SPEED // Living.speed
    );
    this.veloc = {x:0, y:0};
    this.personality = personality;
}

// These validate Player as a sub-class of Living.
Player.prototype = Object.create(Living.prototype);
Player.prototype.constructor = Player;

// This receives inpute strings from the keystroke listener. 
Player.prototype.handleInput = function(key, onOff) {
    this.veloc.x = ((key == 'right') * onOff) - ((key == 'left') * onOff);
    this.veloc.y = ((key == 'down') * onOff) - ((key == 'up') * onOff); 
    if (onOff == 0) {this.veloc = {x:0, y:0};
}}

/* The update() method for a Living Entity will perform several secondary
 * methods to evaluate for changes in its status before  actually updating
 * its location.
 */ 
Player.prototype.update = function() {
    this.checkEdge();
    this.checkEnemies();
    this.checkGround(); // Inherited from Living class
    memo1 = this.ground; //
    this.move("player"); // Inherited from Living class
}

/* The checkEdge function keeps the player in bounds by immediately updating her 
 * position if she encounters a screen edge.
 */
Player.prototype.checkEdge = function() {
    var tx = this.loc.x,
        ty = this.loc.y,
        g = this.geom,
        r = g.radius,
        b = BOUNCE;

    if ((tx - g.ctrX + r) < GRID.xMin) {
        this.loc.x += b
    } else if ((tx + g.ctrX - r) > GRID.xMax) {
        this.loc.x -= b
    } else if ((ty) < GRID.yMin) {
        this.loc.y += b
    } else if ((ty + g.ctrY) > GRID.yMax){
        this.loc.y -= b};
}

// This checks for collisions of the player against enemies.
Player.prototype.checkEnemies = function() {
    var a = this.loc,
        b = enemies.members;
    for (var i = 0; i < b.length; i++){
        if (Math.sqrt(Math.pow(a.x-b[i].loc.x,2) + Math.pow(a.y-b[i].loc.y,2))<60){
            memo2 = "DEATH by bug"; return
        } else {
            memo2 = "ALIVE and well";
}}}












/* Enemy is a subclass of Entity/Living inheritance.
 */
var Enemy = function () {
    var row, direction, speed, loc;
    // Randomize distinguishing attributes
    row = [1,2,3,4,5,6].pickRand();
    direction = ['right','left'].pickRand();
    // Call the superclass to build out an instance
    Living.call(
        this,
        loc = {x: (direction == 'right' ? (GRID.xMin - COL_WIDTH) : (GRID.xMax + COL_WIDTH)),
               y: (row-1)*ROW_HEIGHT+ENEMY_GEOM.ctrY}, // >>Entity/Living.loc
        URLS.bug.replace('%data%',direction), // >>Entity/Living.imgUrl
        ENEMY_GEOM, // >>Entity/Living.geom
        "grass", // >>Entity/Living.ground
        speed = (direction == 'right' ? 1 : -1) * [1,2,2,3].pickRand() // >>Living.speed
    );
    this.row = row;
    this.direction = direction;
    this.speed = speed;
    this.veloc = {x:1,y:0};
};
// These certify Player as a sub-class of Living.
Enemy.prototype = Object.create(Living.prototype);
Enemy.prototype.constructor = Enemy;

/* The update() method for a Enemy Entity will perform several secondary
 * methods to evaluate for changes in its status before  actually updating
 * its location.
 */ 
Enemy.prototype.update = function() {
    this.checkEdge();
    this.checkGround();
    this.move("bug");
}

/* The Enemy checkEdge function is unlike that for the Player in that it 
 * leads to the extenction - rather than repositioning - of said Enemy.
 */
Enemy.prototype.checkEdge = function() {
    if (this.loc.x < (GRID.xMin - (2*COL_WIDTH)) || this.loc.x > GRID.xMax + (2*COL_WIDTH)) {
        this.isInBounds = false;
}}
















/* This listens for key presses, translates the 'allowed' keys to 
 * strings, and sends a string to Player.handleInput()
 */
var validKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space'};

document.addEventListener('keydown', function(e) {
    thePlayer.handleInput(validKeys[e.keyCode], true);
}) 

document.addEventListener('keyup', function(e) { 
    thePlayer.handleInput(validKeys[e.keyCode], false);
    if (validKeys[e.keyCode] == 'space') { theGame.toggle(theGame.state) };
})


