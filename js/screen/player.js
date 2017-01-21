Player = function(index, game, players, bullets)
{
  var x = game.world.randomX;
  var y = game.world.randomY;

  this.game = game;
  this.index = index;
  this.health = 10;
  this.players = players;
  this.fireRate = 1000;
  this.bullets = bullets;
  this.nextFire = 0;
  this.alive = true;
}

Player.prototype.SetSize(size)
{
  this.cat = game.add.sprite(x, y, 'cat1');
  this.cat.tint = Math.random() * 0xffffff;

  this.cat.anchor.set(0.5);

  game.physics.enable(this.cat, Phaser.Physics.ARCADE);

  this.cat.body.immovable = false;
  this.cat.body.collideWorldBounds = true;
  this.cat.body.bounce.setTo(1, 1);
  this.cat.body.maxVelocity.setTo(400, 400);
  this.cat.body.drag.set(0.2);
  this.cat.angle = game.rnd.angle();

  game.physics.arcade.velocityFromRotation(this.cat.rotation, 100, this.cat.body.velocity);

}

Player.prototype.update = function()
{

}
