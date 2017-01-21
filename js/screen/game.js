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
var device_control_map = [];

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

    for( var i = 0; i < 5; i++ )
    {
      var x = game.world.randomX;
      var y = game.world.randomY;
      var planet = planets.create(x, y, 'rock');
      planet.body.setRectangle(40, 40);
      planet.angle = game.rnd.angle();
      planet.body.setCollisionGroup(planetsCollisionGroup);
      planet.body.collides([planetsCollisionGroup, playersCollisionGroup]);
    }

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
          if (data.Poop && data.Poop.pressed)
          {
            players[i].damage(1);
          }
          break;
        }
      }

    };

    // =======================================================
    // THE FOLLOWING PART IS MOST LIKELEY FROM THE ORIGINAL EXAMPLE
    // =======================================================

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);

    logo = game.add.sprite(300, 200, 'logo');
    logo.fixedToCamera = true;
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

}

function update () {
  if( players.length <= 1 )
  {
    if( !logo )
    {
      logo.reset(300, 200);// = game.add.sprite(300, 200, 'logo');
    }
  } else {
    if( logo )
    {
      removeLogo();
    }
  }
}

function render () {
    //game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text("Players connected: " + players.length, 32, 32);
}


function createPlanets(group)
{

}

function removeLogo() {
    logo.kill();
}

function DestroySprite(sprite)
{
  sprite.destroy();
}
