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


/* The GRID object holds settings that can be tweaked without 
 * having to dig around all the class constructors. 
 */

var DASHBOARD = {
    xMin: 0,
    xMax: 909,
    yMin: 0,
    yMax: 50,
    BG1: 'grey'
};

var GRID = {
    xMin: 10,
    xMax: 919,
    numCols: 9,
    colWidth: 101,
    
    yMin: 0,
    yMax: 581,
    numRows: 7,
    rowHeight: 83,
    rowHeiOffset: 58,

};

var PLAYERSPEED = 6;
var BOUNCE = 11;

var ENEMYGEOM = {ctrX:50, ctrY:42, radius:35};
var TILEGEOM = {ctrX:50, ctrY:83, radius:0};
var GOODYGEOM = {ctrx:50, ctrY:0};
var BOTTOMBUFFER = 60;

var GIRLS = ['cat', 'horn', 'pink', 'royal'];

var SPLASH = {
    BG1: '#5f74e2', 
    BG2: '#2efe2e', 
    TXTCOLOR: "#000066",
    MSG: {
        preGame: [
            'Welcome to Teen Girl Squad vs Buggers.',
            'Press >SPACE< to begin.'],
        pauseGame: [
            'The game is now paused',
            'Not going to score many points that way...'],
        postGame: [
            'The Teen Girl Squad was eaten by bugs.',
            'Press >SPACE< to play again.']
    }
};


/* This object stores properties and capabilities relevant to
 * the state of the game.
 */
var game = {
    state: "preGame",
    score: 0,
    leader: "cat",
    team: [],
    level: 1,
    toggle: function() {
        if (this.state == "preGame") {this.state = "inGame"}
        else if (this.state == "inGame") {this.state = "pauseGame"}
        else if (this.state == "pauseGame") {this.state = "inGame"}
        else if (this.state == "postGame") {this.state = "inGame"}
    }
};








/*
 * The Map class goes here.
 * A Map is comprised of a matrix (Array of Arrays), in which each 
 * first- and second- order index corresponds to the row and col 
 * identities for Tile objects stored therein.
 * It does not currently have any sub- or super-classes.
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
        }
    }
}

Map.prototype.generate = function(pWater,pStone){
    var draftMatrix = [];
    for (var i = 0; i < this.numRows; i ++) {
        draftMatrix[i] = [];
        for (var j = 0; j < this.numCols; j++) {
            var groundString;
            if (i==0) {
                if (j==0) {groundString = 'grass'}
                else {groundString = 'water'}
            } else if (i == (GRID.numRows - 1) && j == (GRID.numCols-1)) {
                groundString = 'stone'
            } else {
                groundString = (Math.random() < pWater ? 'water' : Math.random() < pStone ? 'stone' : 'grass');
            }
            draftMatrix[i][j] = groundString;
        }
    }

    /* This builds the matrix full of Tile objects based on 
     * the draft matrix full of strings.
     */
    for (var i = 0; i < this.numRows; i ++) {
        this.matrix[i] = [];
        for (var j = 0; j < this.numCols; j++) {
            this.matrix[i][j] = new Tile(i,j,draftMatrix[i][j]);
        }
    }
};










/* The Enemy, Player and Tile classes have several attributes in common, 
 * which are factored out into a Entity class constructor.
 */
var Entity = function(loc, imgUrl, geom) {
    // This is the gameplay coordinates.
    this.loc = loc;
    // This is the image source url.
    this.imgUrl = imgUrl;
    // This describes geometry relevant to collisions and other gameplay.
    this.geom = geom;
};

// Any Entity can be called on to render itself.
Entity.prototype.render = function() {
    ctx.drawImage(  
        Resources.get(this.imgUrl),
        this.loc.x - this.geom.ctrX,
        this.loc.y - this.geom.ctrY
    );
};





/* Tile is a subclass of Entity. If goodies turn out to have 
 * characteristics in common with Tile, I may create "Living" and
 * "NonLiving" subclasses.
 */
var Tile = function(rowID, colID, groundType) {
    var geom = TILEGEOM;
    Entity.call(
        this,
        {
            x:(colID*GRID.colWidth+geom.ctrX),
            y:(rowID*GRID.rowHeight+geom.ctrY-50)
        },
        'images/block-%data%.png'.replace('%data%', groundType),
        geom);
    this.rowID = rowID;
    this.colID = colID;
    this.groundType = groundType;
}
Tile.prototype = Object.create(Entity.prototype);
Tile.prototype.constructor = Tile;








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






/* This is a class for all Living things. This is a subclass 
 * of Entity that is super to all classes of things that move around.
 */
var Living = function(loc, imgUrl, geom, speed) {
    Entity.call(
        this,
        loc,
        imgUrl,
        geom);
    this.speed = speed;
    this.isInBounds = true;
};
Living.prototype = Object.create(Entity.prototype);
Living.prototype.constructor = Living;

Living.prototype.checkGround = function(map){
    var row, col;
    row = Math.floor(this.loc.y / GRID.rowHeight);
    col = Math.floor(this.loc.x / GRID.colWidth);
    if (map.matrix[Number(row)][Number(col)] && Math.random()<0.05) {
        console.log( aMap.matrix[row][col].groundType );
    }
}



/* The update function for a given entity will run a number of functions to 
 * evaluate for changes in its status before finally actually updating its 
 * location.
 */ 
Living.prototype.update = function() {
    /* checkEdge is defined separately for Player and Enemy, and leads to 
    * different results for these two main Entity types.
    */
    this.checkEdge();


    /* Every Living thing can evaluate the ground it is currently located on, 
     * leading to different behavior (primarily an adjustment to speed).
     */
    //this.checkGround(); // Check the ground to determine appropriate velocity.

    if (this.isInBounds) {this.move()};
}


// Actually move the living thing's location.
Living.prototype.move = function() {
    this.loc.x += (this.speed * this.veloc.x);
    this.loc.y += (this.speed * this.veloc.y);
};








/* Player is a subclass of Entity/Living inheritance.
 */
var Player = function(whichGirl) {
    Living.call(
        this,
        {
            x:(GRID.colWidth/2),
            y:(GRID.rowHeight/2)
        }, 
        'images/girl-%data%-lg.png'.replace('%data%',whichGirl),
        geom = {ctrX:50 , ctrY:115, radius: 35},
        PLAYERSPEED
    );
    this.veloc = {x:0, y:0};
};
Player.prototype = Object.create(Living.prototype);
Player.prototype.constructor = Player;

// This receives inpute strings from the keystroke listener. 
Player.prototype.handleInput = function(key, onOff) {
    

    this.veloc.x = ((key == 'right') * onOff) - ((key == 'left') * onOff);
    this.veloc.y = ((key == 'down') * onOff) - ((key == 'up') * onOff); 
    if (onOff == 0) {this.veloc = {x:0, y:0};
    }
}

/* This keeps the player in bounds by immediately updating her position. 
 * This code is fairly verbose, but my attempts 
 * at making it more consise tended up to mess up the velocity property and led 
 * to glitches.
 */
Player.prototype.checkEdge = function() {
    if ((this.loc.x - this.geom.ctrX + this.geom.radius) < GRID.xMin) {
        this.loc.x += BOUNCE
    }
    else if ((this.loc.x + this.geom.ctrX - this.geom.radius) > GRID.xMax) {
        this.loc.x -= BOUNCE
    }
    else if ((this.loc.y - this.geom.radius) < GRID.yMin) {
        this.loc.y += BOUNCE
    }
    else if ((this.loc.y) > GRID.yMax){
        this.loc.y -= BOUNCE;  
    }
}

// This checks for enemy collisions.
Player.prototype.checkEnemy = function() {
    var a = this.loc
    for (var i = 0; i < allEnemies.length; i++){
        var b = allEnemies[i].loc;
        if ( Math.sqrt( Math.pow( (a.x - b.x),2 ) + Math.pow( (a.y - b.y) ),2 ) < 50 ) {
            console.log("BUG CONTACT");
        }
    }
}











/* Enemy is a subclass of Entity/Living inheritance.
 */
var Enemy = function () {
    var row, direction, speed, loc;
    var geom = ENEMYGEOM;
    // Randomize distinguishing attributes
    row = [1,2,3,4,5,6].pickRand();
    direction = ['right','left'].pickRand();
    // Call the superclass to build out an instance
    Living.call(
        this,
        loc = {
            x: (direction == 'right' ? (GRID.xMin - GRID.colWidth) : (GRID.xMax + GRID.colWidth)),
            y: (row-1)*GRID.rowHeight+geom.ctrY
        },
        'images/bug-%data%.png'.replace('%data%',direction),
        geom,
        speed = (direction == 'right' ? 1 : -1) * [1,2,2].pickRand() 
        ); 
    this.row = row;
    this.direction = direction;
    this.speed = speed;
    this.veloc = {x:1,y:0};
};

Enemy.prototype = Object.create(Living.prototype);
Enemy.prototype.constructor = Enemy;


/* The Enemy checkEdge function is unlike that for the Player in that it 
 * leads to the extenction - rather than repositioning - of said Enemy.
 */
Enemy.prototype.checkEdge = function() {
    if (this.loc.x < (GRID.xMin - (2*GRID.colWidth)) || this.loc.x > GRID.xMax + (2*GRID.colWidth)) {
        this.isInBounds = false;
    }
}











var Collection = function (dt){
    this.members = [];
}

Collection.prototype.update = function() {
    for(var i=0; i<this.members.length; i++) {
        this.members[i].update();
    }
}

Collection.prototype.render = function() {
    for (var i=0; i < this.members.length; i++) {
        this.members[i].render();
    }
}








/* This listens for key presses, translates the 'allowed' keys to 
 * strings, and sends a string to Player.handleInput()
 */
var validKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };


document.addEventListener('keydown', function(e) {
    player.handleInput(validKeys[e.keyCode], true);
}) 

document.addEventListener('keyup', function(e) { 
    player.handleInput(validKeys[e.keyCode], false);
    if (validKeys[e.keyCode] == 'space') { game.toggle() };
})


