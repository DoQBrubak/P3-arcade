/* I wanted to randomize properties of enemies as they were 
 * generated. Instead of doing all the work at Enemy, I abstracted 
 * randomization out to a method on the Array prototype. This is 
 * directly based on  
 * http://stackoverflow.com/questions/4550505/getting-random-value-from-an-array
 * I may want to find a more appropriate place to declare this still...
 */ 

Array.prototype.pickRand = function() {
    return this[Math.floor(Math.random() * this.length)];
};



/* This is a library of setting  that can be tweaked without 
 * having to dig around all the class constructors. This might be 
 * more appropriately located in engine.js
 */
var settings = {
    enemyImgUrl: 'images/enemy-bug-%direction%.png',
    enemySpeed: 5,
    playerImgUrl: 'images/char-boy.png',
    playerStartLoc: {x:0,y:0},
    grid: {
        colOffset: 10,
        colWidth: 10,
        rowOffset: 0,
        rowHeight: 0,
        numRows: 6,
        numCols: 6,
        Xmin: 0,
        Xmax: 505,
        Ymin: 0,
        Ymax: 606
    }
};




/* The Enemy and Player classes have several attributes in common, 
 * which are factored out into a Character class constructor.
 */
var Character = function(imgUrl, loc) {
    // Any character must have a current location
    this.loc = loc;
    // Any character must have an image source
    this.imgUrl = imgUrl;
    // Any character instantiated must be living, at least at first
    this.isAlive = true;
};
Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.imgUrl), this.loc.x, this.loc.y);
};



var Player = function() {
    Character.call(this, settings.playerImgUrl, settings.playerStartLoc);
};

/* Being a pseudoclassical subclass of Character, Player must inherit 
 * its prototype explicitly
 */
Player.prototype = Object.create(Character.prototype);

/* Having inherited Character.prototype, Player must re-establish its 
 * constructor explicitly
 */
Player.prototype.constructor = Player;

/* handleInput() is not common to all Characters, and is thus specified 
 * uniquely to the Player class. This receives data from the global 
 * listener and updates Player location accordingly...
 */
Player.prototype.handleInput = function(keyName) {
};

Player.prototype.update = function() {
};





/* Enemy is a subclass of Character, just like Player. Its .prototype and 
 * .constructor are set per Player annotation, above.
 */

var Enemy = function () {
    // I think this might be an IFFE..?
    (function() {
        // Enemy bugs have directionality.
        direction = ['left','right'].pickRand();
        // Left- and right-oriented sprite files exist to choose from.
        imgUrl = settings.enemyImgUrl.replace('%direction%', direction);
        // Initial x coordinate is dependent on the directionality.
        xInit = (function() {
            if (direction=='right')
                {return settings.grid.Xmin}//  0}
            else
                {return settings.grid.Xmax}}
        ());
        // Initial y coordinate is randomized to a row.
        yInit = 58 + 83 * [0,1,2,3].pickRand();
    })();
    Character.call(this, imgUrl, {x:xInit,y:yInit});
};

Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
    //this.loc.x += settings.enemySpeed;
    //console.log("xInit: "+ xInit);
};




// allEnemies contains all of the Enemy instances
var allEnemies = [];
for (i=0; i<8; i++) {
    allEnemies.push(new Enemy());
}

// The 'new' keyword is used, per Pseudoclassical inheritance.
var player = new Player();


/* This listens for key presses, translates the 'allowed' keys to 
 * strings, and sends a string to Player.handleInput()
 */
document.addEventListener('keyup', function(e) {
    
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        73: 'up', 
        74: 'left',
        75: 'down',
        77: 'right'
    };
    player.handleInput(allowedKeys[e.keyCode]);
    console.log("allow it: " + allowedKeys[e.keyCode]);
    console.log("any key: "+ e.keyCode);
});
