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



/* This object holds settings that can be tweaked without 
 * having to dig around all the class constructors. 
 */
var config = {
    grid: {
        colWidth: 101,
        rowOffset: 58,
        rowHeight: 83,
        numRows: 7,
        numCols: 10,
        xMin: 0,
        yMin: 0,
    },
    enemy: {
        imgUrl: 'images/enemy-bug-%data-direction%.png',
        rowBounds: {min:0,max:5}
    },
    player: {
        imgUrl:'images/char-cat-girl.png',
        points: 0,
        speed: 4,
        lives: 3,
        loc: {x:0,y:0},
    }
};
config.grid.xMax = config.grid.colWidth * config.grid.numCols;
config.grid.yMax = config.grid.rowHeight * config.grid.numRows;



var Level = function(numRows, numCols, waterProb) {
    this.urlTile = 'images/%data%-block.png';
    this.board = [];
    this.waterProb = waterProb;
    this.numRows = numRows;
    this.numCols = numCols;
};

Level.prototype.reticulateSplines = function() {
    for (var y = 1; y <= this.numRows; y++) {
        var row = [];
            for (var x = 1; x <= this.numCols; x++) {
                var tile;
                if ((x == 1) || (x == this.numCols)) {
                    tile = "stone"
                } else {
                    tile = (Math.random() < this.waterProb ? "water" : "grass");
                };
                row.push(tile)
            }
        this.board.push(row);
    }
};



var oneLevel = new Level(config.grid.numRows,config.grid.numCols,0.3);
oneLevel.reticulateSplines();



/* The Enemy and Player classes have several attributes in common, 
 * which are factored out into a Character class constructor.
 */
var Character = function(imgUrl, loc, speed) {
    // Any character must have an image source
    this.imgUrl = imgUrl;
    // Any character must have a current location
    this.loc = loc;
    // Any character has a speed - pixels per engine tick.
    this.speed = speed;
};
Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.imgUrl), this.loc.x, this.loc.y);
};



var Player = function() {
    setup = config.player;
    Character.call(this, setup.imgUrl, setup.loc, setup.speed);
    this.accel = {x:0, y:0};
};

/* Being a pseudoclassical subclass of Character, Player must inherit 
 * its prototype explicitly.
 */
Player.prototype = Object.create(Character.prototype);

/* Having inherited Character.prototype, Player must re-establish its 
 * constructor explicitly
 */
Player.prototype.constructor = Player;


// This receives inpute strings from the keystroke listener. 
Player.prototype.handleInput = function(key, onOff) {
    this.accel.x += ((key == 'right') * onOff) - ((key == 'left') * onOff);
    this.accel.y += ((key == 'down') * onOff) - ((key == 'up') * onOff); 
    if (onOff == 0) {this.accel = {x:0, y:0}};
};



Player.prototype.testEnemies = function() {
};

Player.prototype.testWall = function() {
};

Player.prototype.update = function(nav) {
    if (this.loc.x < config.grid.xMin) {
        this.accel.x = 0;
        this.loc.x += 5;
    } else if (this.loc.x > config.grid.xMax - config.grid.colWidth) {
        this.accel.x = 0;
        this.loc.x -= 5;
    };
    if (this.loc.y < config.grid.yMin-10) {
        this.accel.y = 0;
        this.loc.y += 5;
}
    this.move();
};

Player.prototype.move = function() {
    this.loc.x += (this.speed * this.accel.x);
    this.loc.y += (this.speed * this.accel.y);
};









/* Enemy is a subclass of Character, just like Player. Its .prototype and 
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
    var imgUrl = config.enemy.imgUrl.replace('%data-direction%', direction);
    // Each enemy speed depends on directionality and a random factor.
    var randomSpeed = (direction == 'right' ? 1 : -1) * [2,2,3,4].pickRand();
    
    // Call the superclass to build out an instance
    Character.call(this, imgUrl, {x:xInit,y:yInit}, 3); 
    // Some variables from the constructor survive as permanent properties.
    this.direction = direction;
    this.speed = randomSpeed;
};

/* Enemy is a subclass of Character, per the same logic described above  
 * for Player.
 */
Enemy.prototype = Object.create(Character.prototype);
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
var player = new Player();




/* This listens for key presses, translates the 'allowed' keys to 
 * strings, and sends a string to Player.handleInput()
 */
var playerMoves = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'jump'
    };

document.addEventListener('keydown', function(e) {
    player.handleInput(playerMoves[e.keyCode], true)
}); 

document.addEventListener('keyup', function(e) { 
    player.handleInput(playerMoves[e.keyCode], false);
});

