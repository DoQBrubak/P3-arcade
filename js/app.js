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


var NUMROWS = 7;
var NUMCOLS = 9;
var FRAMETHICK = 10;
var DASHTHICK = 50;
var ROWHEIGHT = 83;
var COLWIDTH = 101;

var GRID = {
    width: NUMCOLS * COLWIDTH,
    height: NUMROWS * ROWHEIGHT
};

var CANVAS = {
    xMin: 0,
    yMin: 0,
    width: 2*FRAMETHICK + GRID.width,
    height: DASHTHICK + GRID.height + FRAMETHICK
};
CANVAS.xMax = CANVAS.xMin + CANVAS.width;
CANVAS.yMax = CANVAS.yMin + CANVAS.height;

GRID.xMin = CANVAS.xMin + FRAMETHICK;
GRID.yMin = CANVAS.yMin + DASHTHICK;
GRID.xMax = GRID.xMin + GRID.width;
GRID.yMax = GRID.yMin + GRID.height;






var PLAYERSPEED = 6;
var PLAYERSTARTLOC =  {x:(COLWIDTH/2), y:(ROWHEIGHT/2)};
var BOUNCE = 11;

var ENEMYGEOM = {ctrX:50, ctrY:42, radius:35};
var TILEGEOM = {ctrX:50, ctrY:83, radius:0};
var GOODYGEOM = {ctrx:50, ctrY:0};
var BOTTOMBUFFER = 60;


var COLORS = {
    bg1: '#5f74e2',
    bg2: '#2efe2e', 
    frame: "#CBB677",
    txt1: "#000066"
}

var SPLASH = {
    bg1: 1, 
    bg2: 1,
    txtcolor: 1,
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
    }
};

//var player = new Player('horn');

/* This object stores properties and capabilities relevant to
 * the state of the game.
 */


 /*
var game = {
    state: "preGame",
    score: 0,
    leader: "cat",
    team: ["horn","pink","pink","cat"],
    level: 1,
    toggle: function(stateIn) {
        var map = {
            preGame:"inGame",
            inGame:"pauseGame",
            pauseGame: "inGame",
            postGame: "inGame"
        };
        this.state = map[stateIn];
    },
    death: function() {
        console.log("Death!");
        player.whichGirl = 'cat';
        player.loc = PLAYERSTARTLOC;
        /*if (this.team.length == 0) {this.state = "postGame"}
        else (player = new Player(this.team.shift()));
    },
    init: function() {
        player = new Player('horn');
        map = new Map(NUMROWS,NUMCOLS);
        map.generate(0.3,0.3);
        enemies = new Collection();
        for (var i=0; i<3; i++) {enemies.members.push(new Enemy())};
        //goodies = new Collection();
    }
};
*/


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
    this.teamAll = ['cat', 'horn', 'pink', 'royal'];
    this.teamNow = ['pink'];
    this.playerNow = 'horn';

};

Game.prototype.init = function() {
    thePlayer = new Player(this.playerNow);
    theMap = new Map(NUMROWS, NUMCOLS);
    theMap.generate(0.2,0.2);
    enemies = new Collection();
    goodies = new Collection();
}

Game.prototype.toggle = function(state) {
    this.state = this.stateRef[state];
}

Game.prototype.death = function() {
    console.log("Death");
};








var Frame = function() {
    this.members = [
        [0,0,CANVAS.width,DASHTHICK],
        [0,0,FRAMETHICK,CANVAS.height],
        [CANVAS.width,0,-FRAMETHICK,CANVAS.height],
        [0,CANVAS.height,CANVAS.width,-FRAMETHICK]
    ];
}

Frame.prototype.render = function() {
    var mem = this.members;
        ctx.fillStyle = COLORS.frame;
        for (var i = 0; i < mem.length; i++) {
            ctx.fillRect(  mem[i][0], mem[i][1], mem[i][2], mem[i][3]  );
        }
}








var Dash = function(level,score,roster) {
    this.reportLevel = ["Level: "+level,20,20];
    this.reportScore = ["Score: "+score,40,20];
    this.roster = roster;
    this.teamUrl = 'images/girl-%data%-sm.png';
    this.txtColor = COLORS.txt1;
    this.txtFont =  "18px Arial"
};
    
Dash.prototype.render = function() {
    for (var i = 0; i < this.roster.length; i++){
        ctx.drawImage(Resources.get(this.teamUrl.replace('%data%',this.roster[i])),500+i*50,0);
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











/* A Map is comprised of a matrix (Array of Arrays), in which each 
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
    var x = []; // An array
    for (var i = 0; i < this.numRows; i ++) {
        x[i] = [];
        for (var j = 0; j < this.numCols; j++) {
            var y;
                m = Math.random();
            if (i==0) {
                if (j==0) {y = 'grass'}
                else {y = 'water'}
            } else if (i == (NUMROWS - 1) && j == (NUMCOLS-1)) {
                y = 'stone'
            } else {
                y = (m < pWater ? 'water' : m > (1 - pStone) ? 'stone' : 'grass');
            }
            x[i][j] = y;
        }
    }

    /* This builds the matrix full of Tile objects based on 
     * the draft matrix full of strings.
     */
    for (var i = 0; i < this.numRows; i ++) {
        this.matrix[i] = [];
        for (var j = 0; j < this.numCols; j++) {
            this.matrix[i][j] = new Tile(i, j, x[i][j]);
        }
    }
};










/* The Enemy, Player and Tile classes have several attributes in common, 
 * which are factored out into a Entity class constructor.
 */
var Entity = function(loc, imgUrl, geom) {
    // The entity's coordinates: {x:val,y:val}
    this.loc = loc;
    // The entity's url source
    this.imgUrl = imgUrl;
    // This describes geometry relevant to collisions and other gameplay.
    this.geom = geom;
};

// Any Entity can be called on to render itself.
Entity.prototype.render = function() {
    ctx.drawImage(  
        Resources.get(this.imgUrl),
        GRID.xMin + this.loc.x - this.geom.ctrX,
        GRID.yMin + this.loc.y - this.geom.ctrY
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
            x:(colID*COLWIDTH+geom.ctrX),
            y:(rowID*ROWHEIGHT+geom.ctrY-50)
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
    row = Math.floor(this.loc.y / ROWHEIGHT);
    col = Math.floor(this.loc.x / COLWIDTH);
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
    //this.checkGround();
    this.move();
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
        PLAYERSTARTLOC, 
        'images/girl-%data%-lg.png'.replace('%data%',whichGirl),
        geom = {ctrX:50 , ctrY:115, radius: 35},
        PLAYERSPEED
    );
    this.veloc = {x:0, y:0};
    this.whichGirl = whichGirl;
};
// These make Player a sub-class of Living.
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
    var tx = this.loc.x,
        ty = this.loc.y,
        g = this.geom,
        r = g.radius,
        b = BOUNCE;

    if ((tx - g.ctrX + r) < GRID.xMin) {
        this.loc.x += b}
    else if ((tx + g.ctrX - r) > GRID.xMax) {
        this.loc.x -= b}
    else if ((ty) < GRID.yMin) {
        this.loc.y += b}
    else if ((ty + g.ctrY) > GRID.yMax){
        this.loc.y -= b};
}

// This checks for enemy collisions.
Player.prototype.checkEnemies = function() {
    var a = this.loc,
        b = enemies.members;
    for (var i = 0; i < b.length; i++){
        if (Math.sqrt(Math.pow(a.x-b[i].loc.x,2) + Math.pow(a.y-b[i].loc.y,2))<60){
            game.death();
        }
    }
}











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
        loc = {
            x: (direction == 'right' ? (GRID.xMin - COLWIDTH) : (GRID.xMax + COLWIDTH)),
            y: (row-1)*ROWHEIGHT+geom.ctrY
        },
        'images/bug-%data%.png'.replace('%data%',direction),
        ENEMYGEOM,
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
    if (this.loc.x < (GRID.xMin - (2*COLWIDTH)) || this.loc.x > GRID.xMax + (2*COLWIDTH)) {
        this.isInBounds = false;
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
    thePlayer.handleInput(validKeys[e.keyCode], true);
}) 

document.addEventListener('keyup', function(e) { 
    thePlayer.handleInput(validKeys[e.keyCode], false);
    if (validKeys[e.keyCode] == 'space') { theGame.toggle(theGame.state) };
})


