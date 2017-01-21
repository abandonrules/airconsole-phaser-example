var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser-example', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function unitVectorFor(x, y) {
  var magnitude = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));

  var unitX = x / magnitude;
  var unitY = y / magnitude;

  return [unitX, unitY];
};


function preload () {
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/game/bullet.png');
    game.load.image('earth', 'assets/game/starfield.jpg');
    game.load.spritesheet('kaboom', 'assets/game/explosion.png', 64, 64, 23);
    game.load.image('cat0', 'assets/game/cat9.png');
    game.load.image('cat1', 'assets/game/cat2.png');
    game.load.image('cat2', 'assets/game/cat3.png');
    game.load.image('cat3', 'assets/game/cat4.png');
    game.load.image('cat4', 'assets/game/cat5.png');
    game.load.image('cat5', 'assets/game/cat6.png');
    game.load.image('cat6', 'assets/game/cat7.png');
    game.load.image('cat7', 'assets/game/cat8.png');
    game.load.image('rock', 'assets/game/rock.png');
    game.load.spritesheet('hair', 'assets/game/explosion.png', 64, 64, 4);
}

var land;
var players = [];
var cat_num = 0;
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
    bullets.setAll('lifeSpan', 1);
    //game.physics.arcade.overlap(bullets, player, playerHit, null, this);
    //game.physics.arcade.overlap(planets, player, playerHit, null, this);

    //bullets.body.collides([planetsCollisionGroup, playersCollisionGroup], playerHit, this);

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
      // if(active_players.length === 0)
      // {
      // if(connected_controllers.length >= 2)
      // {
      //     logo.kill();
      // }
      //   else {
      // Main.airconsole.setActivePlayers(2);
      // }
      //if (1) {
      // if (connected_controllers.length < 9) {
      var spaceScale = 2;
      var centerX = game.world.centerX;
      var centerY = game.world.centerY;
      var randX = game.world.randomX - centerX;
      var randY = game.world.randomY - centerY;

      function unitVectorFor(x, y) {
        var magnitude = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));

        var unitX = x / magnitude;
        var unitY = y / magnitude;

        return [unitX, unitY];
      };

      var locations = unitVectorFor(randX, randY);
      var locationX = locations[0];
      var locationY = locations[1];

      locationX *= spaceScale;
      locationY *= spaceScale;

      var player = game.add.sprite(locationX, locationY, 'cat'+cat_num);
      cat_num++;
      game.physics.p2.enable(player, false);
      player.body.setCircle(50);
      player.setHealth(250);
      player.scale.set(0.5, 0.5);
      //player.anchor.setTo(0.5, 0.5);
      player.anchor.setTo(centerX, centerY);
      player.body.setCollisionGroup(playersCollisionGroup);
      player.body.collides([planetsCollisionGroup, playersCollisionGroup], playerHit, this);
      players[device_id] = player;
      // }
    };

    // Called when a device disconnects (can take up to 5 seconds after device left)
    airconsole.onDisconnect = function(device_id) {
        // Remove the device from the map
        players.splice(device_id, 1);
    };

    // onMessage is called everytime a device sends a message with the .message() method
    airconsole.onMessage = function(device_id, data) {
      console.log(data);
      if( data["joystick-left"] && data["joystick-left"].pressed )
      {
        var jlX = data["joystick-left"].message.x;
        var jlY = data["joystick-left"].message.y;
        var speed = 40;
        var body = players[device_id].body;

        // move anticlockwise
        if (jlX < 0)
        {
          body.rotateLeft(speed);
        }

        // move clockwise
        if (jlX > 0)
        {
          body.rotateRight(speed);
        }
      };


      if( data['joystick-right'] && data['joystick-right'].pressed )
      {
        var jrX = data['joystick-right'].message.x;
        var jrY = data['joystick-right'].message.y;

        //players[device_id].angle += jrX;

        var bullet = bullets.getFirstExists(false);

        if( bullet)
        {
          console.log("Bullet X: " + jrX + ": Bully Y: " + jrY);
          bullet.reset(players[device_id].x, players[device_id].y);
          bullet.body.velocity.x = 500 * jrX;
          bullet.body.velocity.y = 500 * jrY;

          if( bullet.body.velocity.x < 0 )
          {
            bullet.scale.x *= -1;
          }
          else {
              bullet.scale.x = 1;
          }
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
    //enableLogo();
}
function enableLogo()
{
  logo = game.add.sprite(300, 200, 'logo');
  logo.fixedToCamera = true;
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
  game.camera.focusOnXY(0, 0);
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
  body2.setZeroVelocity();
  if (body1.sprite.alpha < 0 )
    body1.sprite.kill();
  if (body2.sprite.alpha < 0 )
    body2.sprite.kill();
}

function update () {

}

function render () {
    //game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text("Players connected: " + players.length, 32, 32);
}
