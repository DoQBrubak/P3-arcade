/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * This engine is available globally via the Engine variable and also makes
 * the canvas' context object globally available globally (most importantly,
 * to app.js).
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

    /* init() performs one-time pregame setup, and establishes the
     * lastTime variable that is required for the game loop.
     */
    function init() {
        lastTime = Date.now();
        theGame = new Game();
        theGame.init();
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
     * Otherwise it renders the map, entities and Game layout.
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
        //theDash.render();
        }
    }

    /* Load the images needed to draw the game. Then set init() as the callback
     * method, so when these images are done loading the game will begin.
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

