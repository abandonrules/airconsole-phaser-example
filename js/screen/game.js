/**
 * Example of how to make a game with Phaser and AirConsole
 * This example is originally from Phaser and was modified to work with AirConsole.
 * http://phaser.io/examples/v2/games/tanks
 *
 * In this example two players can control the same tank with their smartphones instead of
 * one player by keyboard and mouse.
 * One is the driver and the other one is the shooter.
 */

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser-example', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload () {
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/game/bullet.png');
    game.load.image('earth', 'assets/game/starfield.jpg');
    game.load.spritesheet('kaboom', 'assets/game/explosion.png', 64, 64, 23);
    game.load.image('cat1', 'assets/game/cat2.png');
    game.load.image('cat2', 'assets/game/cat3.png');
    game.load.image('cat3', 'assets/game/cat4.png');
    game.load.image('cat4', 'assets/game/cat5.png');
    game.load.image('cat5', 'assets/game/cat6.png');
    game.load.image('cat6', 'assets/game/cat7.png');
    game.load.image('cat7', 'assets/game/cat8.png');
    game.load.image('cat8', 'assets/game/cat9.png');
    game.load.image('rock', 'assets/game/rock.png');
}

var land;

var shadow;
//var tank;
var turret;

var players;
var enemies;
var planets;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var logo;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;

// ------------------------
// AirConsole relevant vars
var airconsole = null;

// A map that holds the device_ids of the driver and the shooter
var device_control_map = [];
/*
// A button-state map which indicates which buttons the driver has currently pressed
var driver_device = {
    left: 0,
    right: 0,
    up: false
};

// A button-state map which indicates which buttons the shooter has currently pressed
var shooter_device = {
    left: 0,
    right: 0,
    fire: false
};
// ------------------------
*/
function create () {
  players = [];


    // =======================================================
    // Create AirConsole instance
    // =======================================================

    // Send a message to each device to tell them the role (tank or shooter)
  /*  var setRoles = function() {
        for (var i = 0; i < device_control_map.length; i++) {
            // We only allow 8 players in this game
            if (i >= 2) break;
            var device_id = device_control_map[i];
            /*
            airconsole.message(device_id, {
                action: "SET_ROLE",
                role: i === 0 ? 'DRIVER' : 'SHOOTER'
            });

        }
    };
    */

    airconsole = new AirConsole();
    airconsole.onReady = function() {};

    // As soon as a device connects we add it to our device-map
    airconsole.onConnect = function(device_id) {
        // Only first two devices can play
        if (device_control_map.length < 8) {
            device_control_map.push(device_id);
            players.push(new Player(device_id, game, players, bullets));
            players[players.length - 1].SetSize(0.5);
            // Send a message back to the device, telling it which role it has (tank or shooter)
            //setRoles();
        }
    };

    // Called when a device disconnects (can take up to 5 seconds after device left)
    airconsole.onDisconnect = function(device_id) {
        // Remove the device from the map
        var index = device_control_map.indexOf(device_id);
        if (index !== -1) {
            device_control_map.splice(index, 1);
            // Update roles
            //setRoles();
            // remove player
            var deleteIndex;
            for( var i = 0; i < players.length; i++ )
            {
              if( players[i].index == device_id )
              {
                DestroySprite(players[i].cat);
                deleteIndex = i;
                break;
              }
            }

            players.splice(deleteIndex, 1);
        }
    };

    // onMessage is called everytime a device sends a message with the .message() method
    airconsole.onMessage = function(device_id, data) {
      console.log(data);
      for( var i = 0; i < players.length; i++ )
      {
        if( players[i].index == device_id )
        {

          if( data.data )
          {
            if( !players[i].SizeSet )
            {
              if( data.data.pressed == true && data.element.includes('small'))
              {
                players[i].SetSize(0.5);
              }


              if( data.data.pressed == true && data.element.includes('medium') )
              {
                players[i].SetSize(.75);

              }

              if( data.data.pressed == true && data.element.includes('large') )
              {
                  players[i].SetSize(1);
              }
            }
          }

          break;
        }

        if( players.length > 0 )
        {
          removeLogo();
        }
      }
      /*
        // First in the array is always the driver
        var driver  = device_control_map[0];
        // Second in the array is always the shooter
        var shooter = device_control_map[1];

        // A Message from the driver
        if (driver && device_id === driver) {
            // Driver pressed left button
            if (data.action === 'left') {
                driver_device.left = data.pressed;
            }
            // Driver pressed right button
            if (data.action === 'right') {
                driver_device.right = data.pressed;
            }
            // Driver pressed BOTH buttons
            if (driver_device.right && driver_device.left) {
                driver_device.up = !driver_device.up;
            }
        }

        // Message from the Shooter
        if (shooter && device_id === shooter) {
            // Shooter pressed left button
            if (data.action === 'left') {
                shooter_device.left = data.pressed;
            }
            // Shooter pressed right button
            if (data.action === 'right') {
                shooter_device.right = data.pressed;
            }
            // Shooter pressed BOTH buttons, which means we shoot
            if (shooter_device.right && shooter_device.left) {
                shooter_device.right = false;
                shooter_device.left = false;
                fire();
            }
        }

        */
    };

    // =======================================================
    // THE FOLLOWING PART IS MOST LIKELEY FROM THE ORIGINAL EXAMPLE
    // =======================================================

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);


    //  Our tiled scrolling background
    //land = game.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'earth');
    land = game.add.sprite(0, 0, 'earth');
    land.width = game.width;
    land.height = game.height;
    land.fixedToCamera = true;

    // Scale
  /*  var scale_manager = new Phaser.ScaleManager(game, 800, 600);
    scale_manager.scaleMode = Phaser.ScaleManager.RESIZE;
    scale_manager.pageAlignVertically = true;
    scale_manager.pageAlignHorizontally = true;
    scale_manager.refresh();
*/
    createPlanets();

    //  The base of our tank
    /*tank = game.add.sprite(0, 0, 'tank', 'tank1');
    tank.anchor.setTo(0.5, 0.5);
    tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    turret = game.add.sprite(0, 0, 'tank', 'turret');
    turret.anchor.setTo(0.3, 0.5);

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');

    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 20;
    enemiesAlive = 20;

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    }

    //  A shadow below our tank
    shadow = game.add.sprite(0, 0, 'tank', 'shadow');
    shadow.anchor.setTo(0.5, 0.5);

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }
    */
/*
    tank.bringToTop();
    turret.bringToTop();

    logo = game.add.sprite(300, 200, 'logo');
    logo.fixedToCamera = true;
*/
    // This is now handled by AirConsole
    // game.input.onDown.add(removeLogo, this);

  //  game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    // This is now handled by AirConsole onMessage
    // cursors = game.input.keyboard.createCursorKeys();
}

function removeLogo() {
    logo.kill();
}

function DestroySprite(sprite)
{
  sprite.destroy();
}

function createPlanets()
{
  for( var i = 0; i < 5; i++ )
  {
    var x = game.world.randomX;
    var y = game.world.randomY;
    var r = game.add.sprite(x, y, 'rock');
    r.bringToTop();
    console.log("Created Planet at " + x + ", " + y);
    r.anchor.set(0.5);
    r.angle = game.rnd.angle();
  }
}

function update () {

    //game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);
/*
    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    // Instead of checking for keyboard input we check the state of the devices-object
    // and which buttons are pressed

    // If the driver-device e.g. pressed the left button, then the tank turns left
    // Previously: cursors.left.isDown
    if (driver_device.left > 0) {
        tank.angle -= 4;
    }
    // Previously: cursors.right.isDown
    else if (driver_device.right > 0) {
        tank.angle += 4;
    }

    // Previously: cursors.up.isDown
    if (driver_device.up) {
        //  The speed we'll travel at
        currentSpeed = 300;
    } else {
        if (currentSpeed > 0) {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0) {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;

    // Check which buttons the shooter currently pressed
    if (shooter_device.left > 0) {
        turret.angle -= 3;
    } else if (shooter_device.right > 0) {
        turret.angle += 3;
    }
    */
}
/*
// A bullet hits the players tank
function bulletHitPlayer (tank, bullet) {
    bullet.kill();
}

// A bullet hits the enemy
function bulletHitEnemy (tank, bullet) {
    bullet.kill();
    var destroyed = enemies[tank.name].damage();
    if (destroyed) {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }
}

// Called when the Shooter presses both buttons (left and right)
function fire () {
    if (game.time.now > nextFire && bullets.countDead() > 0) {
        nextFire = game.time.now + fireRate;
        var bullet = bullets.getFirstExists(false);
        bullet.reset(turret.x, turret.y);
        // We don't play this game any more by mouse, so we have to calculate the direction
        // of the bullet in another way
        var rad = turret.angle * (Math.PI / 180);
        var distance = 400;
        var x = turret.x + distance * Math.cos(rad);
        var y = turret.y + distance * Math.sin(rad);
        // Previous: game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
        bullet.rotation = game.physics.arcade.moveToXY(bullet, x, y, 1000, 500);
    }
}
*/
function render () {
    //game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text("Players connected: " + players.length, 32, 32);
}
