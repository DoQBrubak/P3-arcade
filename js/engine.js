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
    /* Predefine the variables we'll be using within the Engine scope.
     * Create the <canvas> element, grab the 2D "ctx", set the context 
     * height and width, and add <canvas> to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = CANVAS.width;
    canvas.height = CANVAS.height;
    doc.body.appendChild(canvas);



    /* This function does setup that occurs once, and establishes the 
     * lastTime variable that is required for the game loop.
     */
    function init() {
        lastTime = Date.now();
        theGame = new Game();
        theGame.init();
        //game.init();
        //TODO: Move both Frame and Dash into Game class.
        //theFrame = new Frame();
        theDash = new Dash(theGame.level,theGame.score,theGame.teamNow);
        main();
    }



    /* main() kicks off the game loop itself, and handles properly calling
     * the update and render methods.
     */
    function main() {
        // Determine time delta, which copes for diffeing processing speeds. 
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call update() and render() methods within the Engine scope,
         * providing dt for smoother rendering.
         */
        update(dt);
        render();

        /* Set lastTime, which will be referrenced the next time dt gets
         * calculated, during the next iteration of main().
         */
        lastTime = now;

        /* Use browser's requestAnimationFrame function to call main()
         * once more, as soon as the browser is able.
         */
        win.requestAnimationFrame(main);
    }

    /* update() gets called by main() once per iteration of the Engine.
     * This calls all functions necessary to update entities' status.
     */
    function update(dt) {
        // spin assists with random enemy generation
        var spin = Math.random();
        enemies.update(dt);
        thePlayer.checkEdge();
        thePlayer.checkEnemies();
        thePlayer.update(dt);
        if (spin < 0.005) enemies.members.push(new Enemy());
    }


    /* render() gets called by main() once per iteration of the Engine.
     * If the the game state is not "inGame,", it draws the splash screen.
     * Otherwise it renders the map, frame, and entities.
     */
    function render() {
        if (theGame.state != "inGame") {
            theGame.splash();

        } else {
        /* Render the map. This comes first because the map is permanently
         * "under" everything else.
         */
        theMap.render();

        /* Render the goodies. This comes next because the moving entities can
         * walk "over" the goodies. 
         */
        // TODO: build out Goodies class, Collection, and functionality.
        //theGoodies.render();

        /* Render the bugs. This comes next because the bugs appear "under" the 
         * player sprite.
         */
        enemies.render();

        // Render the player.
        thePlayer.render();
        
        theGame.render();
        theDash.render();
        }
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
