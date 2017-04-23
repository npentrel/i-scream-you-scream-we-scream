// Credits to: http://www.lessmilk.com/tutorial/flappy-bird-phaser-1

// Create our 'main' state that will contain the game

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;


var mainState = {
  preload: function() {
    // Load the bird sprite
    game.load.image('bird', 'assets/anvil_small.png');
    game.load.image('pipe', 'assets/pipe.png');
  },

  create: function() {
    // Change the background color of the game to blue
    game.stage.backgroundColor = '#71c5cf';

    // Set the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Display the bird at the position x=100 and y=245
    this.bird = game.add.sprite(100, 245, 'bird');

    // Add physics to the bird
    // Needed for: movements, gravity, collisions, etc.
    game.physics.arcade.enable(this.bird);

    // Add gravity to the bird to make it fall
    this.bird.body.gravity.y = 200;

    // Call the 'jump' function when the spacekey is hit
    var spaceKey = game.input.keyboard.addKey(
                    Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);

    // Create an empty group
    this.pipes = game.add.group();

    this.timer = game.time.events.loop(3000, this.addRowOfPipes, this);

    this.score_start = 0;
    this.score = 0;
    this.labelScore = game.add.text(30, 30, "0",
        { font: "30px Arial", fill: "#ffffff" });
  },
  update: function() {
    // If the bird is out of the screen (too high or too low)
    // Call the 'restartGame' function
    if (this.bird.y < 0 || this.bird.y > y)
        this.restartGame();
    game.physics.arcade.overlap(
        this.bird, this.pipes, this.restartGame, null, this);
  },
  // Make the bird jump
  jump: function() {
      // Add a vertical velocity to the bird
      this.bird.body.velocity.y = -350;
  },

  // Restart the game
  restartGame: function() {
      // Start the 'main' state, which restarts the game
      game.state.start('main');
  },

  addOnePipe: function(x, y) {
    // Create a pipe at the position x and y
    var pipe = game.add.sprite(x, y, 'pipe');

    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Enable physics on the pipe
    game.physics.arcade.enable(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200;

    // Automatically kill the pipe when it's no longer visible
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
},

  addRowOfPipes: function() {
      // Randomly pick a number between 1 and 5
      // This will be the hole position
      var hole = Math.floor(Math.random() * (((y)/60) - 9)) + 1;

      // Add the 6 pipes
      // With one big hole at position 'hole' and 'hole + 1'
      for (var i = 0; i < ((y)/60); i++)
          if (i != hole && i != hole + 1 && i != hole + 2 && i != hole + 3 && i != hole + 4 && i != hole + 5)
              this.addOnePipe(x - 15, i * 60 + 10);
      if (this.score_start > 1) {
        this.score += 1;
      } else {
        this.score_start++;
      }
      this.labelScore.text = this.score;
  },
};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(x - 15, y - 15);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');
