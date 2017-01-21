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
var players = [];
var planets;
var logo;
var airconsole = null;

function create () {

    // Setup physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = 0.8;

    var playersCollisionGroup = game.physics.p2.createCollisionGroup();
    var planetsCollisionGroup = game.physics.p2.createCollisionGroup();

    // Checks all objects  for world border
    game.physics.p2.updateBoundsCollisionGroup();

    // Setup background-color
    land = game.add.sprite(0, 0, 'earth');
    land.width = game.width;
    land.height = game.height;
    land.fixedToCamera = true;

    planets = game.add.group();
    planets.enableBody = true;
    planets.physicsBodyType = Phaser.Physics.P2JS;

    for( var i = 0; i < 10; i++ )
    {
      var x = game.world.randomX;
      var y = game.world.randomY;
      var planet = planets.create(x, y, 'rock');
      planet.body.setRectangle(40, 40);
      //planet.angle = game.rnd.angle();
      planet.body.setZeroVelocity();
      planet.body.setCollisionGroup(planetsCollisionGroup);
      planet.body.collides([planetsCollisionGroup, playersCollisionGroup]);
    }

    airconsole = new AirConsole();
    airconsole.onReady = function() {};


    airconsole.onConnect = function(device_id) {
      console.log("onConnect called");
      if( players.length < 8 )
      {
        var player = game.add.sprite(game.world.randomX, game.world.randomY, 'cat1');
        game.physics.p2.enable(player, false);
        player.body.setCircle(30);
        player.body.setCollisionGroup(playersCollisionGroup);
        player.body.collides([planetsCollisionGroup, playersCollisionGroup], playerHit, this);
        players[device_id] = player;
      }
    };

    // Called when a device disconnects (can take up to 5 seconds after device left)
    airconsole.onDisconnect = function(device_id) {
        // Remove the device from the map
        players.splice(device_id, 1);
    };

    // onMessage is called everytime a device sends a message with the .message() method
    airconsole.onMessage = function(device_id, data) {
      console.log(data);
      if( data["joystick-left"] )
      {
        if( data["joystick-left"].pressed )
        {
          var jlX = data["joystick-left"].message.x;
          var jlY = data["joystick-left"].message.y;
          if( jlX < 0 )
          {
            players[device_id].body.moveLeft(jlX * 400);
          }

          if( jlX > 0 )
          {
            players[device_id].body.moveRight(jlX * 400);
          }

          if( jlY < 0 )
          {
            players[device_id].body.moveUp(jlY * 400);
          }

          if( jlY > 0 )
          {
            players[device_id].body.moveDown(jlY * 400);
          }

        }
      }
      if (data.Poop && data.Poop.pressed)
      {
        players[device_id].damage(1);
      }
    };


    game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
//    logo = game.add.sprite(300, 200, 'logo');
//    logo.fixedToCamera = true;
//    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
//    game.camera.focusOnXY(0, 0);

}

function playerHit(body1, body2)
{
  body1.sprite.alpha -= 0.1;
}

function update () {
  for(var i = 1; i <= players.length; i++ )
  {
    if( players[i] )
    {
      if( players[i].body )
      {
        console.log("Setting Zero Velocity");
        //players[i].body.setZeroVelocity();
      }
    }
  }
}

function render () {
    //game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text("Players connected: " + players.length, 32, 32);
}
