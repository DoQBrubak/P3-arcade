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

    //canvas.width = config.grid.numCols * config.grid.colWidth;
    canvas.width = config.grid.xMax;
    canvas.height = config.grid.rowOffset + config.grid.numRows * config.grid.rowHeight;
    doc.body.appendChild(canvas);

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

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This is called by main(). This calls all functions used to 
     * update entities' data. Use of checkCollisions() is optional based on 
     * how I choose to deal with entity collisions.
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    };

    /* This is called by update() and loops through all of the objects within 
     * your allEnemies array as defined in app.js and calls their update() 
     * methods. It then calls player.update() for my player object. These 
     * update methods focus purely on updating object data and properties.
     * All drawing is done in render() methods.
     */
    function updateEntities(dt) {
        enemyHandler(dt);
        player.update();
    };

    function enemyHandler(dt){
        /* Iterate over the enemy rows. If the row is empty, spawn an enemy.
         * Randomly spawn more enemies as a factor of the total enemy count.
         * Evaluate the n=0th enemy in each row to see if it has left the 
         * screen and if so get rid of it. 
         */
        for (var i = config.enemy.rowBounds.min; i < config.enemy.rowBounds.max; i++) {
            var row = enemyRows.rows[i];
            // If the current row is empty, spawn an enemy.
            if (row.length == 0) {
                row.push(new Enemy(i))
            };
            if (row.length < config.level) {
                if (Math.random() < 0.01) {
                    row.push(new Enemy(i));
                }
            };

            /* If the n=0th enemy in each row has exited the visible landscape, 
             * drop it from that row's array.
             */
            if ((row[0].loc.x > (config.grid.xMax + 100)) ||
                (row[0].loc.x < (config.grid.xMin - 100))) {
                row.shift()
            };
            row.forEach(function(eachEnemy) {
                eachEnemy.update(dt);
            });
        }
    };







    /* This function draws the landscape, then calls renderEntities() to draw 
     * all the sprites. This is called once per tick of the game engine.
     */
    function render() {
        // Render the landscape.
        renderLandscape();
        // Render the enemies.
        for (var i = config.enemy.rowBounds.min; i < config.enemy.rowBounds.max; i++) {
            enemyRows.renderRow(i);
        };
        // Render the player.
        player.render();
    };


    function renderLandscape() {
        /* This array holds the relative URL to the image used
        * for that particular row of the game level.
        */
        var rowImages = [
            'images/water-block.png',   // Row i=0, water
            'images/stone-block.png',   // Row i=1, stone
            'images/stone-block.png',   // Row i=2, stone
            'images/stone-block.png',   // Row i=3, stone
            'images/grass-block.png',   // Row i=4, grass
            'images/grass-block.png',    // Row i=5, grass
            'images/grass-block.png',   // Row i=4, grass
            'images/grass-block.png'    // Row i=5, grass
        ],
        row, col;

        /* Loop through the number of rows and columns we've defined above
        * and, using the rowImages array, draw the correct image for that
        * portion of the "grid"
        */
        for (row = 0; row < config.grid.numRows; row++) {
            for (col = 0; col < config.grid.numCols; col++) {
                /* ctx.drawImage() requires 3 parameters: the image to draw, 
                * the x and y coordinates (top left corner). 
                * We're using our Resources helpers to refer to our images
                * so that we get the benefits of caching these images, since
                * we're using them over and over.
                */
                ctx.drawImage(
                    Resources.get(rowImages[row]),
                    col * config.grid.colWidth,
                    row * config.grid.rowHeight
                );
            };
        };
    };




    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    };



    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug-right.png',
        'images/enemy-bug-left.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
