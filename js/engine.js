/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;
        //frame;

    canvas.width = CANVAS.width;
    canvas.height = CANVAS.height;
    doc.body.appendChild(canvas);



    /* This function does setup that only occurs once, and sets the 
     * lastTime variable that is required for the game loop.
     */
    function init() {
        lastTime = Date.now();
        theGame = new Game();
        theGame.init();
        //game.init();
        theFrame = new Frame();
        theDash = new Dash(theGame.level,theGame.score,theGame.teamAll);
        main();
    }



    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        // Determine time delta, which copes for diffeing processing speeds. 
        var now = Date.now(),  // refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
            dt = (now - lastTime) / 1000.0;

        /* Call update() and render(), providing time delta to update() since
         * it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set lastTime, which will be referrenced the next time dt gets 
         * calculated, the next time main() is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };


    /* This is called by main(). This calls all functions used to 
     * update entities' data. Use of checkCollisions() is optional based on 
     * how I choose to deal with entity collisions.
     */
    function update(dt) {
        var spin = Math.random();
        enemies.update(dt);
        thePlayer.checkEdge();
        thePlayer.checkEnemies();
        thePlayer.update(dt);
        if (spin < 0.002) enemies.members.push(new Enemy());
    }


    /* This function draws the landscape, then calls renderEntities() to draw 
     * all the sprites. This is called once per tick of the game engine.
     */
    function render() {

        if (theGame.state != "inGame") {
            renderSplash(theGame.state);
        } else {

        // Render the map.
        theMap.render();
        
        //Render the goodies.
        //goodies.render();

        // Render the buggies.
        enemies.render();

        // Render the player.
        thePlayer.render();
        

        theFrame.render();
        theDash.render();
        }
    }

    function renderSplash(gameState) {
            var width = GRID.xMax,
                height = GRID.yMax;
            ctx.fillStyle = COLORS.bg1;
            ctx.fillRect(0,0,width,height);
            ctx.fillStyle = COLORS.bg2;
            ctx.fillRect(width*0.1,height*0.1,width*0.8,height*0.8);
            ctx.fillStyle = COLORS.txt1;
            ctx.font = "30px Arial";
            ctx.strokeText(SPLASH.msg[gameState][0],150,100);
            ctx.strokeText(SPLASH.msg[gameState][1],150,150);  
    }



/*
    function scoreboard() {
        ctx.fillStyle = SPLASH.txtcolor;
        ctx.fillRect()
    }

    function makeFrame() {
        ctx.fillStyle = SPLASH.txtcolor;
        ctx.fillRect(DASH.xMin,DASH.yMin,DASH.xMax,50);
    }
    */
    

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/block-stone.png',
        'images/block-water.png',
        'images/block-grass.png',
        'images/bug-right.png',
        'images/bug-left.png',
        'images/girl-cat-lg.png',
        'images/girl-cat-sm.png',
        'images/girl-royal-lg.png',
        'images/girl-royal-sm.png',
        'images/girl-pink-lg.png',
        'images/girl-pink-sm.png',
        'images/girl-horn-lg.png',
        'images/girl-horn-sm.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
