console.log("Hello People");

let GameScore = 0;
let level = 0;
let segments = [];

let keys = [];
let keyPressed = function(){ keys[keyCode] = true};
let keyReleased = function(){ delete keys[keyCode];} ;

let Player = function(x, y, size, speed){
  this.x = x;
  this.y = y;
  this.size = size;
  this.speed  = speed;
  
  this.update = function(){
    if(keys[LEFT]){
      this.x -= this.speed;
    }
    if(keys[RIGHT]){
      this.x += this.speed;
    }
    if(keys[DOWN]){
      this.y += this.speed;
    }
    if(keys[UP]){
      this.y -= this.speed;
    }

    if(this.x < 0){
      this.x = 0;
    }
    if(this.x > width){
      this.x = width;
    }
    if(this.y > 400){
      this.y = 400;
    }
    if(this.y < 100){
      this.y = 100;
    }

    noStroke();
    fill(0, 255, 0);
    ellipse(this.x, this.y, this.size, this.size);
  };
};

let Segment = function (x, y, size, speed) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.speed = speed;
  this.show = function(){
    strokeWeight(2);
    stroke(255, 255, 0);
    fill (255, 0, 0);
  };

  this.move = function(){
    this.x = this.x + this.speed;
      if(this.x < 0 || this.x > width){
        this.drop();
      }
  };

  this.drop = function(){
    this.speed = -this.speed;
    this.y = this.y + this.size;
    if (this.y > height){
      this.y = 10;
    }
  };
};

let player = new Player(100, 350, 19, 1);

let draw = function(){
  if (segments.length < 1){
    for (let i = 0; i < 10 ; i++) {
      segments[i] = new Segment(i * 40, 20, 20, level/8+1);      
    }
  }

  background(0);
    for (let i = 0; i < segments.length; i++) {
      segment[i].move();
      segment[i].show();      
    }

  player.update();

  fill(255, 0, 0);
  text("Score: " + GameScore + "       Level: " + level, 15, 30);
};