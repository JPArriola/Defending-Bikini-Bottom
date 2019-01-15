let KEY_CODE_LEFT = 37;
let KEY_CODE_RIGHT = 39;
let KEY_CODE_SPACE = 32;
let KEY_CODE_M = 77;

let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;

let PLAYER_WIDTH = 20;
let PLAYER_MAX_SPEED = 600;
let LASER_MAX_SPEED = 300;
let LASER_COOLDOWN = 0;

let ENEMIES_PER_ROW = 10;
let ENEMY_HORIZONTAL_PADDING = 80;
let ENEMY_VERTICAL_PADDING = 70;
let ENEMY_VERTICAL_SPACING = 80;
let ENEMY_COOLDOWN = 6.0;

const GAME_STATE = {
  lastTime: Date.now(),
  leftPressed: false,
  rightPressed: false,
  spacePressed: false,
  playerX: 0,
  playerY: 0,
  playerCooldown: 0,
  lasers: [],
  enemies: [],
  enemyLasers: [],
  gameOver: false,
  score: 0,
  level: 1,
  killed: 0,
  mute: false,
};

document.getElementById("fas").addEventListener("click", (e) => {
  GAME_STATE.mute = !GAME_STATE.mute;
  console.log(e.target);
  if (GAME_STATE.mute) {
    e.target.classList.remove("fa-volume-up");
    e.target.classList.add("fa-volume-mute");
  } else {
    e.target.classList.remove("fa-volume-mute");
    e.target.classList.add("fa-volume-up");
  }
});

document.addEventListener("keydown", (e) => {
  let i = document.getElementById("fas");
  if (e.keyCode === 77){
    GAME_STATE.mute = !GAME_STATE.mute;
    if (GAME_STATE.mute) {
      i.classList.remove("fa-volume-up");
      i.classList.add("fa-volume-mute");
    } else {
      i.classList.remove("fa-volume-mute");
      i.classList.add("fa-volume-up");
    }
  }
});


function rectsIntersect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top 
  );
}

function setPosition($el, x, y) {
  $el.style.transform = `translate(${x}px, ${y}px)`;
}

function clamp(v, min, max){
  if ( v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}

function rand(min, max) {
  if (min === undefined) min = 0;
  if (max === undefined) max = 1;
  return min + Math.random() * (max - min);
}

function createPlayer($container){
  GAME_STATE.playerX = GAME_WIDTH / 2; //x position of player
  GAME_STATE.playerY = GAME_HEIGHT - 50; //bottom of the screen
  const $player = document.createElement("img");
  $player.src = "img/gary.png";
  $player.className = "player";
  $container.appendChild($player);
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function init(){
  playerInit();
  enemyInit();
}

function playerInit(){
  const $container = document.querySelector(".game");
  createPlayer($container);
}

function enemyInit(){
  const $container = document.querySelector(".game");
  const enemySpacing = (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) / (ENEMIES_PER_ROW - 1);
  for (let j = 0; j < 3; j++) {
    const y = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
    for (let i = 0; i < ENEMIES_PER_ROW; i++) {
      const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING;
      createEnemy($container, x, y);
    }
  }
}

function destroyPlayer($container, player) {
  $container.removeChild(player);
  GAME_STATE.gameOver = true;
}

function playerHasWon() {
  return GAME_STATE.level > 5;
}

function updatePlayer(dt, $container){
  if (GAME_STATE.leftPressed){
    GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
  }
  if (GAME_STATE.rightPressed){
    GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
  }

  GAME_STATE.playerX = clamp(GAME_STATE.playerX, PLAYER_WIDTH, GAME_WIDTH - PLAYER_WIDTH);
  if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
    createLaser($container, GAME_STATE.playerX, GAME_STATE.playerY);
    GAME_STATE.playerCooldown = LASER_COOLDOWN;
  }
  if (GAME_STATE.playerCooldown > 0) {
    GAME_STATE.playerCooldown -= dt;
  }

  const $player = document.querySelector(".player");
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY); 
}

function createLaser($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "img/green_beam.png";
  $element.className = "laser";
  $container.appendChild($element);
  const laser = {x, y, $element};
  GAME_STATE.lasers.push(laser);
  const audio = playSound("gary");
  audio.volume = 0.5;
  audio.currentTime = 0;
  audio.play();
  setPosition($element, x, y);
}

function updateLasers(dt, $container){
  const lasers = GAME_STATE.lasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    laser.y -= dt * LASER_MAX_SPEED;
    if (laser.y < 0){
      destroyLaser($container, laser);
    }
    setPosition(laser.$element, laser.x, laser.y);
    const r1 = laser.$element.getBoundingClientRect();
    const enemies = GAME_STATE.enemies;
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      if (enemy.isDead) continue;
      const r2 = enemy.$element.getBoundingClientRect();
      if (rectsIntersect(r1, r2)) {
        destroyEnemy($container, enemy);
        destroyLaser($container, laser);
        break;
      }
    }
  }
  GAME_STATE.lasers = GAME_STATE.lasers.filter(l => !l.isDead);
}

function destroyLaser($container, laser){
  $container.removeChild(laser.$element);
  laser.isDead = true;
}

function createEnemy($container, x, y){
  const $element = document.createElement("img");
  $element.src = "img/plankton.png";
  $element.className = "enemy";
  $container.appendChild($element);
  const enemy = {x, y, cooldown: rand(0.5, ENEMY_COOLDOWN), $element};
  GAME_STATE.enemies.push(enemy);
  setPosition($element, x, y);
}

function updateEnemies(dt, $container) {
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 50;
  const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 20;

  const enemies = GAME_STATE.enemies;
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const x = enemy.x + dx;
    const y = enemy.y + dy;
    setPosition(enemy.$element, x, y);
    enemy.cooldown -= dt;
    if (enemy.cooldown <= 0) {
      createEnemyLaser($container, x, y);
      enemy.cooldown = ENEMY_COOLDOWN;
    }
  }
  GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
}

function destroyEnemy($container, enemy){
  GAME_STATE.level === 5 ? document.querySelector(".level").innerHTML = "Final" : document.querySelector(".level").innerHTML = GAME_STATE.level;
  $container.removeChild(enemy.$element);
  enemy.isDead = true;
  const audio = playSound("plankton");
  audio.volume = 1.0;
  audio.play();
  GAME_STATE.score += (10 + (GAME_STATE.level));
  GAME_STATE.killed += 1;
  document.querySelector(".score").innerHTML=GAME_STATE.score;
    if (GAME_STATE.killed % 30 === 0) {
      GAME_STATE.level += 1;
      ENEMY_COOLDOWN = (ENEMY_COOLDOWN * 0.7);
      if(GAME_STATE.level <= 5){
        const audio = playSound("newLevel");
        audio.volume = 0.3;
        audio.play();
      }
    }
}

function createEnemyLaser($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "img/red_beam.png";
  $element.className = "enemy-laser";
  $container.appendChild($element);
  const laser = {x, y, $element};
  GAME_STATE.enemyLasers.push(laser);
  setPosition($element, x, y);
}

function updateEnemyLasers(dt, $container) {
  const lasers = GAME_STATE.enemyLasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    laser.y += dt * LASER_MAX_SPEED;
    if (laser.y > GAME_HEIGHT - 30) {
      destroyLaser($container, laser);
    }
    setPosition(laser.$element, laser.x, laser.y);
    const r1 = laser.$element.getBoundingClientRect();
    const player = document.querySelector(".player");
    const r2 = player.getBoundingClientRect();
    if (rectsIntersect(r1, r2)) {
      destroyPlayer($container, player);
      break;
    }
  }
  GAME_STATE.enemyLasers = GAME_STATE.enemyLasers.filter(l => !l.isDead);
}

function update(){
  const currentTime = Date.now();
  const dt = (currentTime - GAME_STATE.lastTime) / 1000;

  if (GAME_STATE.gameOver) {
    const audio = playSound("gameOver");
    audio.play();
    document.querySelector(".game-over").style.display = "block";
    return;
  }

  if(playerHasWon()){
    const audio = playSound("win");
    audio.play();
    document.querySelector(".congratulations").style.display = "block";
    return;
  }

  if (GAME_STATE.enemies.length === 0){
    enemyInit();
  }

  const $container = document.querySelector(".game");
  updatePlayer(dt, $container);
  updateLasers(dt, $container);
  updateEnemies(dt, $container);
  updateEnemyLasers(dt, $container);

  GAME_STATE.lastTime = currentTime;
  window.requestAnimationFrame(update);
}

function playSound(sound){
  if (GAME_STATE.mute){
    return new Audio();
  }
  switch(sound){
    case "gary":
      return new Audio("sound/gary_meow.mp3");
    case "win":
      return new Audio("sound/win.mp3");
    case "gameOver":
      return new Audio("sound/game_over.mp3");
    case "plankton":
      return new Audio("/sound/plankton_yell.mp3");
    case "newLevel":
      return new Audio("sound/new_level.mp3");
    default:
      return new Audio();
  }
}

function onKeyDown(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = true;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = true;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = true;
  }
}

function onKeyUp(e){
  if(e.keyCode === KEY_CODE_LEFT){
    GAME_STATE.leftPressed = false;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = false;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = false;
  }
}

init();
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);