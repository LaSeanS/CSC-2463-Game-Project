var character = "gamesprite.png";
var girl;
var gameState = "start";
var startButton;
var win;
var lives = 3;
var gameTime = 60;
var currObst = false;
var obst;
var cooldown;
var coolStart;
var music;

var serial;
var xcursval = 0;
var ycursval = 0;
var buttonCheck = false;
var outMessage = 3;

function preload() {
  girl = new Walker(character, 100, 220);
  obst = new Obstacle();
}

function setup() {
  createCanvas(500, 300);
  imageMode(CENTER);
  textAlign(CENTER);
  setInterval(timer, 1000);

  serial = new p5.SerialPort();
  serial.open("COM3");
  serial.onData(gotData);

  serial.write(outMessage);

  music = new Tone.Player("gamemusic.mp3").toDestination();

}

function gotData() { //pots = analog in; button = digital in; buzzer = digital out; led = analog out (PWM)
  var currentString = trim(serial.readStringUntil("\r\n"));
  if (!currentString) {
    return;
  }
  console.log(currentString);
  var data = split(trim(currentString), ',');
  if (data.length < 3) {
    return;
  }

  xcursval = parseInt(map(data[0], 0, 1023, 0, width));
  ycursval = parseInt(map(data[1], 0, 1023, 0, height));

  if (data[2] == 0) {
    buttonCheck = true;
  } else {
    buttonCheck = false;
  }
}

function buttonClicked() {
  if (gameState == "playing") {
    girl.jump();
  }
  else if (xcursval > width / 2 - 15 && xcursval < width / 2 + 25 && ycursval > 180 && ycursval < 180 + 20 && gameState == "start") {
    startGame();
  }
}

function timer() {
  if (gameTime > 0 && gameState == "playing") {
    gameTime--;
  }
  obstProb();
}

function obstProb() {
  if (!currObst) {
    var prob = Math.floor(Math.random() * 10);
    if (prob >= 4 && gameTime < 58) {
      currObst = true;
    }
  }
}

function startGame() {
  music.start();
  gameState = "playing";
  outMessage = 0;
  serial.write(outMessage);
}

function endGame() {
  music.stop();
  outMessage = 3;
  serial.write(outMessage);
}

function draw() {

  if (buttonCheck) {
    buttonClicked();
  }

  if (outMessage == 1) {
    serial.write(outMessage);
    outMessage = 0;
  }

  if (gameState == "start") {
    background(232, 209, 183);

    stroke(235, 155, 66);
    fill(235, 155, 66, 200);
    rect(width/2-15, 180, 40, 20);

    textFont('Courier New');
    textSize(15);
    stroke(0, 102, 153);
    fill(0, 102, 153);
    text('Play', width/2+5, 195);

    fill(235, 155, 66);
    noStroke();
    circle(xcursval, ycursval, 7);

    textSize(40);
    fill(0, 102, 153, 51);
    text('Synth Skip', width / 2, 80);
    fill(0, 102, 153);
    text('Synth Skip', width / 2, 100);
    fill(0, 102, 153, 51);
    text('Synth Skip', width / 2, 120);
  }

  else if (gameState == "playing") {
    background(189, 255, 255);
    fill(48, 61, 53);
    rect(0, 250, width, 50);

    textSize(15);

    if (gameTime >= 60) {
      text('Lives: ' + lives, 50, 20);
      text('jump over the obstacles to survive', width / 2, 45);
      text('until time runs out!', width / 2, 60);
      text(gameTime / 60 + ":" + gameTime % 60 + "0", 460, 20);
    }
    if (gameTime < 60 && gameTime >= 50) {
      text('Lives: ' + lives, 50, 20);
      text('jump over the obstacles to survive', width / 2, 45);
      text('until time runs out!', width / 2, 60);
      text("0:" + gameTime, 460, 20);
    }
    if (gameTime < 50 && gameTime >= 10) {
      text('Lives: ' + lives, 50, 20);
      text("0:" + gameTime, 460, 20);
    }
    if (gameTime < 10) {
      text('Lives: ' + lives, 50, 20);
      text('0:0' + gameTime, 460, 20);
    }
    if (gameTime == 0) {
      win = true;
      gameState = "over";
    }

    if (lives == 0) {
      win = false;
      gameState = "over";
    }

    if (cooldown) {
      if (coolStart - 1 > gameTime) {
        cooldown = false;
      }
    }

    girl.draw();

    if (currObst) {
      obst.draw();
      obst.checkCollision(girl.x, girl.y);
    }

  }

  else if (gameState == "over") {
    if(outMessage != 3) {
      endGame();
    }
    if (!win) {
      background(235, 155, 66);
      textFont('Courier New');

      textSize(40);
      fill(0, 102, 153, 51);
      text('You lose...', width / 2, 120);
      fill(0, 102, 153);
      text('You lose...', width / 2, 145);
      fill(0, 102, 153, 51);
      text('You lose...', width / 2, 170);
    }
    else {
      background(138, 253, 255);
      textFont('Courier New');

      textSize(40);
      fill(235, 155, 66, 51);
      text('Congrats, you won!', width / 2, 120);
      fill(235, 155, 66);
      text('Congrats, you won!', width / 2, 145);
      fill(235, 155, 66, 51);
      text('Congrats, you won!', width / 2, 170);
    }
  }
}

function Walker(imageName, x, y) {
  this.spriteSheet = loadImage(imageName);
  this.frame = 0;
  this.x = x;
  this.y = y;
  this.moving = 0;

  this.draw = function () {

    push();
    translate(this.x, this.y);

    if (this.moving == 0) {
      image(this.spriteSheet, 0, 0, 80, 80, 0, 0, 80, 80);
      console.log(this.y);
    }

    else if (this.moving == 1) {
      console.log("jumping up");
      console.log(this.y);

      for (var i = 0; i < 8; i++) {
        if (this.frame == i) {
          image(this.spriteSheet, 0, 0, 80, 80, 80 * i, 0, 80, 80);
        }
      }

      if (this.y <= 220 && this.y > 190) {
        this.frame = 1;
        this.y -= 3;
      }
      else if (this.y <= 190 && this.y > 160) {
        this.frame = 2;
        this.y -= 3;
      }
      else if (this.y <= 160 && this.y > 120) {
        this.frame = 3;
        this.y -= 3;
      }
      else if (this.y <= 120) {
        this.frame = 4;
        this.moving = 2;
      }
    }

    else if (this.moving == 2) {
      console.log("jumping down");
      console.log(this.y);

      for (var i = 0; i < 8; i++) {
        if (this.frame == i) {
          image(this.spriteSheet, 0, 0, 80, 80, 80 * i, 0, 80, 80);
        }
      }

      if (this.y >= 118 && this.y < 150) {
        this.frame = 4;
        this.y += 3;
      }
      else if (this.y >= 150 && this.y < 180) {
        this.frame = 5;
        this.y += 3;
      }
      else if (this.y >= 180 && this.y < 220) {
        this.frame = 6;
        this.y += 3;
      }
      else if (this.y >= 220) {
        this.frame = 7;
        this.moving = 0;
      }

    }

    pop();

    this.jump = function () {
      this.moving = 1;
    }

  }
}

function Obstacle() {
  this.x = 500;
  this.y = 230;
  this.width = 30;

  this.draw = function () {

    if (this.x > -30) {
      this.x -= 6;
      fill(235, 155, 66);
      rect(this.x, this.y, this.width, this.width);
    }
    else if (this.x < -30) {
      currObst = false;
      this.x = 500;
    }

  }

  this.checkCollision = function (x, y) {

    if (this.x < x + 30 && x - 30 < this.x && this.y < y + 40 && y - 40 < this.y && !cooldown) {
      cooldown = true;
      coolStart = gameTime;
      outMessage = 1;
      lives--;
    }
  }

}