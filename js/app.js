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


/* The CONFIG object holds settings that can be tweaked without 
 * having to dig around all the class constructors. 
 */
var GRID = {
    xMin: 0,
    colNum: 9,
    colWid: 101,
    xMax: 909,
    
    yMin: 0,
    rowNum: 7,
    rowHei: 83,
    rowHeiOffset: 58,
    yMax: 581
};



var config = {
    grid: {
        colWidth: 101,
        rowOffset: 58,
        rowHeight: 83,
        numRows: 7,
        numCols: 9,
        xMin: 0,
        yMin: 0
    }
};
config.grid.xMax = config.grid.colWidth * config.grid.numCols;
config.grid.yMax = config.grid.rowHeight * config.grid.numRows;

var rowsWithEnemies = {min:1,max:6};


/*
 * The Map class goes here.
 * A Map is comprised of a matrix (Array of Arrays), in which each 
 * first- and second- order index corresponds to the row and col 
 * identities for Tile objects stored therein.
 * It does not currently have any sub- or super-classes.
 */
var Map = function(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.matrix = [];
}


Map.prototype.render = function(){
    for (var i = 0; i < this.rows; i++) {
        for (var j =0; j < this.cols; j++) {
            this.matrix[i][j].render();
        }
    }
}

Map.prototype.generate = function(pWater,pStone){
    var draftMatrix = [];

    for (var i = 0; i < this.rows; i ++) {
        draftMatrix[i] = [];
        for (var j = 0; j < this.cols; j++) {
            var what;
            if (i==0) {
                if (j==0) {what = 'grass'}
                else {what = 'water'}
            } else if (i == config.grid.numRows && j ==config.grid.numCols) {
                what = 'stone'
            } else {
                what = (Math.random() < pWater ? 'water' : Math.random() < pStone ? 'stone' : 'grass');
            }
            draftMatrix[i][j] = what;
        }
    }

    /* This builds the matrix full of Tile objects based on 
     * the draft matrix full of strings.
     */
    for (var i = 0; i < this.rows; i ++) {
        this.matrix[i] = [];
        for (var j = 0; j < this.cols; j++) {
            this.matrix[i][j] = new Tile(i,j,draftMatrix[i][j]);
        }
    }

    this.matrix[0][0] = new Tile(0,0,'grass'),
    this.matrix[6][8] = new Tile(6,8,'stone')
};





/* The Enemy, Player and Tile classes have several attributes in common, 
 * which are factored out into a Entity class constructor.
 */
var Entity = function(loc, imgUrl, imgOffset, geom) {
    // This is the gameplay coordinates.
    this.loc = loc;
    // This is the image source url.
    this.imgUrl = imgUrl;
    // This describes the offset from the Entity center point to image origin point. 
    this.imgOffset = imgOffset; 
    // This describes geometry relevant to collisions and other gameplay.
    this.geom = geom;
};
// Any Entity can be called on to render itself.
Entity.prototype.render = function() {
    if (this instanceof Player) {
    //console.log(this);
    }
    ctx.drawImage(Resources.get(this.imgUrl), this.loc.x, this.loc.y);
};




/* Tile is a subclass of Entity. If goodies turn out to have 
 * characteristics in common with Tile, I may create "Living" and
 * "InLiving" subclasses.
 */
var Tile = function(row, col, terrain) {
    Entity.call(
        this,
        {x:(col*config.grid.colWidth),y:(row*config.grid.rowHeight-50)},
        'images/block-%data%.png'.replace('%data%', terrain),
        null,   // no current imgOffset determined
        null);  // no current geom determined
    this.row = row;
    this.col = col;
    this.hasGirl = false;
    this.hasEnemy = false;
    this.hasGoody = false;
}
Tile.prototype = Object.create(Entity.prototype);
Tile.prototype.constructor = Tile;



/* This is a class for all Living things. This is a subclass 
 * of Entity that is super to all classes of things that move around.
 */
var Living = function(loc, imgUrl, imgOffset, geom, speed) {
    Entity.call(
        this,
        loc,
        imgUrl,
        imgOffset,
        geom);
    this.speed = speed;
};
Living.prototype = Object.create(Entity.prototype);
Living.prototype.constructor = Living;
Living.prototype.onWhatGround = function(){};




/* Player is a subclass of Entity/Living inheritance.
 */
var Player = function(whichGirl) {
    Living.call(
        this,
        {x:0,y:-60},
        'images/girl-%data%-lg.png'.replace('%data%',whichGirl),
        null,
        null,
        5
    );
    this.veloc = {x:0, y:0};
};
Player.prototype = Object.create(Living.prototype);
Player.prototype.constructor = Player;

// This receives inpute strings from the keystroke listener. 
Player.prototype.handleInput = function(key, onOff) {
    this.veloc.x = ((key == 'right') * onOff) - ((key == 'left') * onOff);
    this.veloc.y = ((key == 'down') * onOff) - ((key == 'up') * onOff); 
    if (onOff == 0) {this.veloc = {x:0, y:0}
    console.log("x: ",this.loc.x, " y: ", this.loc.y);
    };
};

Player.prototype.update = function(nav) {
    // These logicals address boundary collisions.
    if (this.loc.x < config.grid.xMin - 10) {
        this.veloc.x = 0;
        this.loc.x += 5;
    } else if (this.loc.x > config.grid.xMax - config.grid.colWidth + 15) {
        this.veloc.x = 0;
        this.loc.x -= 5;
    };
    if (this.loc.y < config.grid.yMin-76) {
        this.veloc.y = 0;
        this.loc.y += 5;
    } else if (this.loc.y > config.grid.yMax-140) {
        this.veloc.y = 0;
        this.loc.y -= 5;
    };
    // Now actually update the player location.
    this.loc.x += (this.speed * this.veloc.x);
    this.loc.y += (this.speed * this.veloc.y);
};









/* Enemy is a subclass of Entity/Living inheritance.
 */
var Enemy = function (row, direction, speed, loc, imgUrl) {
    // Call the superclass to build out an instance
    Living.call(
        this,
        loc,
        'images/bug-%data%.png'.replace('%data%',direction),
        null,
        null,
        speed
        ); 
    this.row = row;
    this.direction = direction;
    this.speed = speed;
    this.isExpired = false;
    this.ground = null;
};

Enemy.prototype = Object.create(Living.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.randAttr

Enemy.prototype.outOfBounds = function(){
    if (this.loc.x < GRID.xMin || this.loc.x > GRID.xMax) {
        this.isExpired = true;
    }
}

Enemy.prototype.update = function() {
    this.loc.x += this.speed;
};



var makeEnemy = function(){
    var row, direction, speed, loc;
    row = [1,2,3,4,5].pickRand();
    direction = ['right','left'].pickRand();
    speed = (direction == 'right' ? 1 : -1) * [2,3,4,5].pickRand();
    loc = {
        x: (direction == 'right' ? 0 : GRID.xMax),
        y: row*GRID.rowHei
    }
    return new Enemy(row, direction, speed, loc);
}




var Collection = function (){
    this.members = [];
}

Collection.prototype.render = function() {
    for (var i=0; i < this.members.length; i++) {
        this.members[i].render();
    }
}
Collection.prototype.update = function() {
    for(var i=0; i< this.members.length; i++) {
        if(Math.random()<0.01) console.log(this);
        this.members[i].update();
        this.members[i].outOfBounds();
        if(this.members[i].isExpired) this.members.splice(i,1);

    }
}





/* This listens for key presses, translates the 'allowed' keys to 
 * strings, and sends a string to Player.handleInput()
 */
var playerMoves = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

document.addEventListener('keydown', function(e) {
    player.handleInput(playerMoves[e.keyCode], true)
}); 

document.addEventListener('keyup', function(e) { 
    player.handleInput(playerMoves[e.keyCode], false);
});