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
    game.load.spritesheet('hair', 'assets/game/explosion.png', 64, 64, 4);
}

var land;
var players = [];
var planets;
var bullets;
var logo;
var airconsole = null;

function create () {

    // Setup physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = 0.8;

    var playersCollisionGroup = game.physics.p2.createCollisionGroup();
    var planetsCollisionGroup = game.physics.p2.createCollisionGroup();
    var hairCollisionGroup = game.physics.p2.createCollisionGroup();

    // Checks all objects  for world border
    game.physics.p2.updateBoundsCollisionGroup();

    // Setup background-color
    land = game.add.sprite(0, 0, 'earth');
    land.width = game.width;
    land.height = game.height;
    land.fixedToCamera = true;

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(20, "bullet");
    bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetBullet);
    bullets.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    bullets.setAll('checkWorldBounds', true);

    planets = game.add.group();
    hairs = game.add.group();
    hairs.enableBody = true;
    hairs.physicsBodyType = Phaser.Physics.P2JS;
    planets.enableBody = true;
    planets.physicsBodyType = Phaser.Physics.P2JS;

    for( var i = 0; i < 5; i++ )
    {
      var x = game.world.randomX;
      var y = game.world.randomY;
      var planet = planets.create(x, y, 'rock');
      planet.body.setRectangle(40, 40);
      planet.setHealth(10);
      //planet.angle = game.rnd.angle();
      planet.body.setZeroVelocity();
      planet.body.setCollisionGroup(planetsCollisionGroup);
      planet.body.collides([planetsCollisionGroup, playersCollisionGroup]);
    }

    airconsole = new AirConsole();
    airconsole.onReady = function() {};


    airconsole.onConnect = function(device_id) {
      console.log("onConnect called");
      if( players.length <= 8 )
      {
        var player = game.add.sprite(game.world.randomX, game.world.randomY, 'cat2');
        game.physics.p2.enable(player, false);
        player.body.setCircle(50);
        player.setHealth(250);
        player.scale.set(0.5, 0.5);
        player.anchor.setTo(0.5, 0.5);
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
            players[device_id].body.moveLeft(Math.abs(jlX) * 400);
          } else if( jlX > 0 )
          {
            players[device_id].body.moveRight(Math.abs(jlX) * 400);
          }

          if( jlY < 0 )
          {
            players[device_id].body.moveUp(Math.abs(jlY) * 400);
          } else if( jlY > 0 )
          {
            players[device_id].body.moveDown(Math.abs(jlY) * 400);
          }

        }
      }

      if( data['joystick-right'] )
      {
        var jrX = data['joystick-right'].message.x;
        var jrY = data['joystick-right'].message.y;

        //players[device_id].angle += jrX;

        var bullet = bullets.getFirstExists(false);

        if( bullet )
        {
          bullet.reset(players[device_id].x, players[device_id].y);
          bullet.body.velocity.x = 500 * jrX;
          bullet.body.velocity.y = 500 * jrY;
        }


      }

      if (data.Poop && data.Poop.pressed)
      {

        players[device_id].damage(25);
        var hair = planets.create(players[device_id].x, players[device_id].y, 'hair');
        hair.body.setRectangle(10, 10);
        hair.setHealth(10);
        //planet.angle = game.rnd.angle();
        hair.body.setZeroVelocity();
        hair.body.setCollisionGroup(hairCollisionGroup);
        hair.body.collides([planetsCollisionGroup, hairCollisionGroup], playerHit, this);

        players[device_id].damage(1);

      }
    };


    game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
//    logo = game.add.sprite(300, 200, 'logo');
//    logo.fixedToCamera = true;
//    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
//    game.camera.focusOnXY(0, 0);

}

function resetBullet(bullet)
{
  bullet.kill();
}

function playerHit(body1, body2)
{
  body1.damage -= 1;
  body2.damage -= 1;
  body1.sprite.alpha -= 0.2;
  body2.sprite.alpha -= 0.2;
  if (body1.sprite.alpha < 0 )
    body1.sprite.kill();
  if (body2.sprite.alpha < 0 )
    body2.sprite.kill();
}

function update () {
  for( var i = 0; i < planets.children.length; i++)
  {
    planets.children[i].body.setZeroVelocity();
  }

  for(var i = 1; i <= players.length; i++ )
  {
    if( players[i] )
    {
      if( players[i].body )
      {
        //console.log("Setting Zero Velocity");
        //players[i].body.setZeroVelocity();
      }
    }
  }
}

function render () {
    //game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text("Players connected: " + players.length, 32, 32);
}
