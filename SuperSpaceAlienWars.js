(function () {
  var TIME = 60;
  var CONTROLS = {
    STEER_LEFT: 'ArrowLeft',
    STEER_RIGHT: 'ArrowRight',
    SHOOT: 'Space',
  };

  var playButton = document.getElementById("play");
  var timerDiv = document.getElementById("timer");
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var keyCodeMap = {};

  var StartGame = function() {
    this.setAttribute("style", "display: none");
    game.start();
    document.addEventListener('keyup', controlShip);
    document.addEventListener('keydown', controlShip);
  }

  var FinishGame = function() {
    context.clearRect(0, 0, 1000, 400);
    game.missilesFired = [];
    game.aliens = [];
    game.time = TIME;

    playButton.setAttribute("style", "display: inline");
    document.removeEventListener('keyup', controlShip);
    document.removeEventListener('keydown', controlShip);
  }

  var everyinterval = function(n) {
    if ((game.frame / n) % 1 == 0) {
      return true;
    }
    return false;
  }

  var controlShip = function(e) {
    keyCodeMap[e.code] = e.type == 'keydown';

    if (keyCodeMap[CONTROLS.SHOOT]) {
      var missile = new Missile(game.spaceship.x, game.spaceship.y).render();
      game.missilesFired.push(missile);
      game.updateGame(true);
    }
    if (keyCodeMap[CONTROLS.STEER_LEFT]) {
      game.spaceship.x = game.spaceship.x - 10;
      game.updateGame(true);
    }
    if (keyCodeMap[CONTROLS.STEER_RIGHT]) {
      game.spaceship.x = game.spaceship.x + 10;
      game.updateGame(true);
    }
  };

  var SpaceShip = function() {
    this.x = 480;
    this.y = 380;
    this.render = function() {
      context.fillStyle = "red";
      context.fillRect(this.x, this.y, 20, 20);
    };
    return this;
  }

  var Missile = function(x, y) {
    this.x = x;
    this.y = y;
    this.render = function() {
      context.fillStyle = "blue";
      context.fillRect(this.x, this.y, 5, 5);
      return this;
    };
  }

  var Alien = function() {
    this.x = Math.floor(Math.random() * (980 - 20)) + 20;
    this.y = 0;
    this.isHit = false;
    this.render = function() {
      context.fillStyle = "green";
      context.fillRect(this.x, this.y, 20, 20);
      return this;
    };
  }

  var Game = function() {
    this.time = TIME;
    this.spaceship = null;
    this.aliens = [];
    this.missilesFired = [];

    this.timer = null;
    this.gameRenderInterval = null;
    this.frame = 0;

    this.start = function() {

      // Launch the spaceship
      this.spaceship = new SpaceShip();
      this.spaceship.render();

      // Start the game timer
      var timerTick = this.tick.bind(this);
      this.timer = setInterval(function() {
        timerTick();
      }, 1000);

      // Start the game renderer
      var gameRenderer = this.updateGame.bind(this);
      this.gameRenderInterval = setInterval(function() {
        gameRenderer();
      }, 20);
    };

    this.updateGame = function(isShipMoving = false) {
      this.frame += 1;

      context.clearRect(0, 0, 1000, 400);

      if (this.frame === 1 || everyinterval(40)) {
        var alien = new Alien().render();
        this.aliens.push(alien);
      }

      this.missilesFired.forEach((missile) => {
        var alienHit = this.aliens.find(function(alien) {
          var yOffset = alien.y + 20;
          var xOffset = alien.x + 20;
          return !alien.isHit && (missile.y > alien.y && missile.y < yOffset) && (missile.x > alien.x && missile.x < xOffset);
        });

        if (alienHit) {
          alienHit.isHit = true;
        }

        missile.y = missile.y - 1;
        missile.render();
      });

      this.aliens.forEach((alien) => {
        alien.y = alien.y + 1;
        alien.render();
      });

      this.aliens = this.aliens.filter(function(alien) {
        return !alien.isHit
      });

      this.aliens.forEach(function(alien) {
        if (!isShipMoving) {
          alien.y = alien.y + 1;
        }
        alien.render();
      });

      this.spaceship.render();
    }

    this.tick = function() {
      this.time -= 1;

      if (this.time === 0) {
        clearInterval(this.timer);
        clearInterval(this.gameRenderInterval);
        FinishGame();
      }

      timerDiv.innerHTML = this.time;
    };
  }

  playButton.addEventListener('click', StartGame);

  var game = new Game();
})();
