console.log("Hello People");

let GameScore = 0;
let level = 0;
let segments = [];
let bullets = [];
let bulletDelay = 10;

let keys = [];
let keyPressed = function(){ keys[keyCode] = true};
let keyReleased = function(){ delete keys[keyCode];} ;

let Bullet = (x, y, size, speed) => {
  this.x = x;
  this.y = y;
  this.size = size;
  this.speed = speed;
  this.show = function () {
    noStroke();
    fill(176, 176, 176);
    ellipse(this.x, this.y, this.size, this.size);
  };

  this.move = function () {
    this.y = this.y - this.speed;
  };
};

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

    if(keys[ALT] && bulletDelay < 0){
      var b = new Bullet(this.x, this.y, 5, 5);
      bullets.push(b);
      bulletDelay = 40;
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

let checkCollide = (player, segments) => {
  for (let i = 0; i < segments.length; i++) {
    let distance = dist(player.x, player.y, segments[i].x, segments[i].y);
    if(distance < player.size / 2 + segments[i].size/2){
      //a crash has happened
        segments.length = 0;
        player.x = width/2;
        player.y = height - 40;
    }
    
  }
};

let checkBulletCollide = (bullets, segments) => {
  for (let bulletCounter = 0; bulletCounter < bullets.length; bulletCounter++) {
    if (bullets[bulletCounter].y < 0){
      bullets.splice(BulletCounter, 1);
    }    
  }

  let bulletToRemove = "none";
  let dotToRemove = "none";

  for (let bulletCounter = 0; bulletCounter < bullets.length; bulletCounter++) {
    for (let i = 0; i < segments.length; i++) {
      let distance = dist(bullets[bulletCounter].x, bullets[bulletCounter].y, segments[i].x, segments[i].y);
      
      if(distance < bullets[bulletCounter].size/2 + dots[i].size/2){
        bulletToRemove = bulletCounter;
        dotToRemove = i;
      }
    }
  }

  if (bulletToRemove !== "none"){
    bullets.splice(bulletToRemove, 1);
  }
  if (dotToRemove !== "none"){
    segments.splice(dotToRemove, 1);
  }

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
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].move();
      bullets[i].show();      
    }

  player.update();
  bulletDelay = bulletDelay - 1;

  checkCollide(player, segments);

  checkBulletCollide(bullets, segments);

  fill(255, 0, 0);
  text("Score: " + GameScore + "       Level: " + level, 15, 30);
};