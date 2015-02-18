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
var config = {
    grid: {
        colWidth: 101,
        rowOffset: 58,
        rowHeight: 83,
        numRows: 7,
        numCols: 9,
        xMin: 0,
        yMin: 0
    },
    enemy: {
        imgUrl: 'images/bug-%data%.png',
        rowBounds: {min:1,max:6}
    }
};
config.grid.xMax = config.grid.colWidth * config.grid.numCols;
config.grid.yMax = config.grid.rowHeight * config.grid.numRows;



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
    ctx.drawImage(Resources.get(this.imgUrl), this.loc.x, this.loc.y);
};




var Tile = function(row, col, terrain) {
    Entity.call(
        this,
        {x:(col*config.grid.colWidth),y:(row*config.grid.rowHeight)},
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




var Lifeform = function(imgUrl, loc, offset) {
    Entity.call(
        this,
        imgURl,
        loc,
        offset)
};






var Player = function(whichGirl) {
    Entity.call(
        this,
        'images/girl-%data%-lg.png'.replace('%data%',whichGirl),
        {x:0,y:0},
        10
    );
    this.veloc = {x:0, y:0};
};

// A pseudoclassical subclass of Entity, Player must inherit its prototype explicitly.
Player.prototype = Object.create(Entity.prototype);

/* Having inherited Entity.prototype, Player must re-establish its 
 * constructor explicitly
 */
Player.prototype.constructor = Player;





// This receives inpute strings from the keystroke listener. 
Player.prototype.handleInput = function(key, onOff) {
    this.veloc.x = ((key == 'right') * onOff) - ((key == 'left') * onOff);
    this.veloc.y = ((key == 'down') * onOff) - ((key == 'up') * onOff); 
    if (onOff == 0) {this.veloc = {x:0, y:0}};
};

Player.prototype.update = function(nav) {
    if (this.loc.x < config.grid.xMin - 15) {
        this.veloc.x = 0;
        this.loc.x += 5;
    } else if (this.loc.x > config.grid.xMax - config.grid.colWidth + 15) {
        this.veloc.x = 0;
        this.loc.x -= 5;
    };
    if (this.loc.y < config.grid.yMin-6) {
        this.veloc.y = 0;
        this.loc.y += 5;
    } else if (this.loc.y > config.grid.yMax-90) {
        this.veloc.y = 0;
        this.loc.y -= 5;
    }
    this.move();
};

Player.prototype.move = function() {
    this.loc.x += (this.speed * this.veloc.x);
    this.loc.y += (this.speed * this.veloc.y);
};









/* Enemy is a subclass of Entity, just like Player. Its .prototype and 
 * .constructor are set per Player annotation, above.
 */

var Enemy = function (row) {
    // Each new enemy has random directionality.
    var direction = ['left','right'].pickRand(); 
    // Starting x coordinate depends on the directionality.
    var xInit = direction == 'right' ? config.grid.xMin - 100 : config.grid.xMax + 100;
    // Starting y coordinate is derived from the row argument passed in.
    var yInit = config.grid.rowOffset + (config.grid.rowHeight * row);
    // Load a left- or right- sprite depending on directionality.
    var imgUrl = config.enemy.imgUrl.replace('%data%', direction);
    // Each enemy speed depends on directionality and a random factor.
    var randomSpeed = (direction == 'right' ? 1 : -1) * [2,2,3,4].pickRand();
    
    // Call the superclass to build out an instance
    Entity.call(this, imgUrl, {x:xInit,y:yInit}, 3); 
    // Some variables from the constructor survive as permanent properties.
    this.direction = direction;
    this.speed = randomSpeed;
};

/* Enemy is a subclass of Entity, per the same logic described above  
 * for Player.
 */
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;
// Unique Enemy methods...
Enemy.prototype.update = function() {
    this.loc.x += this.speed;
};





/* This is a class designed initially as a superclass to the enemyRows 
 * object. It is anticipated that other object types may do well to be 
 * managed by row also...
 */
var RowHolder = function (bounds) {
    var obj = {};
    for (var i = bounds.min; i < bounds.max; i++) {
        obj[i] = [];
    };
    this.rows = obj;
    this.bounds = bounds;
};

RowHolder.prototype.renderRow = function(i) {
    this.rows[i].forEach(function(each){
        each.render();
    });
};

/* enemyRows is an object, derived from the RowHolder class, which 
 * binds each row accessible to enemies to an array which contains the 
 * enemies that actually occupy that row.
 */
var enemyRows = new RowHolder(config.enemy.rowBounds);



// The 'new' keyword is used, per Pseudoclassical inheritance.
var player = new Player('pink');




/* This listens for key presses, translates the 'allowed' keys to 
 * strings, and sends a string to Player.handleInput()
 */
var playerMoves = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };


var aMap = new Map(config.grid.numRows,config.grid.numCols);
aMap.generate(0.1,0.3);



document.addEventListener('keydown', function(e) {
    player.handleInput(playerMoves[e.keyCode], true)
}); 

document.addEventListener('keyup', function(e) { 
    player.handleInput(playerMoves[e.keyCode], false);
});

