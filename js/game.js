// creating our scene
let gameScene = new Phaser.Scene('Game');

// initiate scene parameters
gameScene.init = function() {
  // player speed
  this.playerSpeed = 3.2;

  // enemy speed
  this.enemyMinSpeed = 3;
  this.enemyMaxSpeed = 4;

  // boundaries
  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  // we are not terminating
  this.isTerminating = false;
};

// preloading function/loading our assets
gameScene.preload = function(){
  // load images
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/dragon.png');
  this.load.image('goal', 'assets/treasure.png');
};

// create function is called once after the preload ends
gameScene.create = function() {
  // create background sprite
  let bg = this.add.sprite(0, 0, 'background');

  // change the origin to the top-left corner
  bg.setOrigin(0,0);

  // create the player
  this.player = this.add.sprite(20, this.sys.game.config.height / 2, 'player');

  // we are reducing the width and height by 50%
  this.player.setScale(0.5);

  // goal
  this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'goal');
  this.goal.setScale(0.6);

  // enemy group
  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 3,
    setXY: {
      x: 110,
      y: 100,
      stepX: 120,
      stepY: 40
    }
  });

  // setting scale to all group elements
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);

  // set flipX, and speed
  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy){
    // flip enemy
    enemy.flipX = true;

    // set speed
    let dir = Math.random() < 0.5 ? 1 : -1;
    let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
    enemy.speed = dir * speed;

  }, this);
};

// this is called up to 60 times per second
gameScene.update = function(){

  // don't execute if we are terminating
  if(this.isTerminating) return;

  // check for active input (left click / touch)
  if(this.input.activePointer.isDown) {
    // player walks
    this.player.x += this.playerSpeed;
  }

  // treasure overlap check with Phaser methods
  let playerRect = this.player.getBounds();
  let treasureRect = this.goal.getBounds();

  if(Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
    //

    // end game with wining status
    return this.gameWin();
  }

  // get enemies
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for(let i = 0; i< numEnemies; i++) {

    // enemy movement
    enemies[i].y += enemies[i].speed;

    // check we haven't passed min or max Y
    let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
    let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;

    // if we passed the upper or lower limit, reverse
    if(conditionUp || conditionDown) {
      enemies[i].speed *= -1;
    }

    // check enemy overlap
    let enemyRect = enemies[i].getBounds();

    if(Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      //alert('Game over!');
        

      // end game
      return this.gameOver();
    }
  }
    
};
//win status
gameScene.gameWin = function () {
    
    // initiated game over sequence
  this.isTerminating = true;

  // shake camera
  this.cameras.main.shake(150);

  // listen for event completion
  this.cameras.main.on('camerashakecomplete', function(camera, effect){

    // fade out
    this.cameras.main.fade(300);
  }, this);

  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
     
    // restart the Scene
    this.scene.restart();
     alert('You win!');
  }, this);
};

//lose status
gameScene.gameOver = function() {

  // initiated game over sequence
  this.isTerminating = true;

  // shake camera
  this.cameras.main.shake(150);

  // listen for event completion
  this.cameras.main.on('camerashakecomplete', function(camera, effect){

    // fade out
    this.cameras.main.fade(300);
  }, this);

  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
     
    // restart the Scene
    this.scene.restart();
      alert("Game Over");
  }, this);


};

// set the configuration of the game
let config = {
  type: Phaser.AUTO, // Phaser will use WebGL if available, if not it will use Canvas
  width: 640,
  height: 360,
  scene: gameScene
};

// create a new game, pass the configuration
let game = new Phaser.Game(config);
