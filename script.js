// Dino Brawl
// A simple fighting game made with HTML Canvas
// By Bill Yu @blloop

// Canvas preparation
const canvas = document.getElementById('canvas');
canvas.width = 960;
canvas.height = 540;
const c = canvas.getContext('2d');
c.imageSmoothingEnabled = false;
c.fillRect(0, 0, canvas.width, canvas.height);

// List of game constants
const gravity = 0.5;
const OFFLIM = 150;
const OFFPAD = 50;
const UILAG = 150;

// Background image
const bg = new Background({
  position: { x: 0, y: 0 },
  size: { width: 1260, height: 540 },
  source: './img/bg1.png'
})

// Background expansion mechanic
let offset = 0;
function shiftBg(x, isOne) {
  if (isOne && (
    p2.position.x < OFFPAD ||
    p2.position.x + p2.width > canvas.width - OFFPAD
  )) {
    return;
  }
  if (!isOne && (
    p1.position.x < OFFPAD ||
    p1.position.x + p1.width > canvas.width - OFFPAD
  )) {
    return;
  }
  let old = offset;
  offset += x;
  offset = Math.min(offset, OFFLIM);
  offset = Math.max(offset, OFFLIM * -1);
  if (isOne) {
    p2.position.x -= offset - old;
  } else {
    p1.position.x -= offset - old;
  }
}

// Fighter class declarations
const attacks1 = []; // attack queue
const attacks2 = [];
let select1 = 0; // fighter number selection, 0-3
let select2 = 0;
let p1 = null; // declare as new Fighter, w/ attacks1
let p2 = null; // declare as new Fighter, w/ attacks2
let cameraX = 0;
let cameraLimit = [-50, 50];

// Function to check collision between player/attack
function collide(player, attack) {
  if (!attack.hurt) return false;
  return (attack.position.x + attack.width >= player.position.x &&
    attack.position.x <= player.position.x + player.width &&
    attack.position.y +  attack.height > player.position.y &&
    attack.position.y <= player.position.y + player.height);
}

// Check for all possible collisions
function checkCombat() {
  attacks1.forEach((a) => {
    if (a && collide(p2, a)) {
      p2.takeHit(p1.damage);
      a.hurt = false;
    }
  });
  attacks2.forEach((a) => {
    if (a && collide(p1, a)) {
      p1.takeHit(p2.damage);
      a.hurt = false;
    }
  });
}

// Character selection sprites
let chosen1 = new AnimatedSprite({
  position: {x: 220, y: 120},
  size: {x: 120, y: 150},
  sprites: {
    src: './img/select-p1.png',
    frames: 16,
    idle: [0, 3],
    0: [0, 3],
    1: [4, 7],
    2: [8, 11],
    3: [12, 15]
  },
  rate: 4,
  offset: { x: 6, y: 6 }, 
  scale: 7
});
let chosen2 = new AnimatedSprite({
  position: {x: 640, y: 120},
  size: {x: 120, y: 150},
  sprites: {
    src: './img/select-p2.png',
    frames: 16,
    idle: [0, 3],
    0: [0, 3],
    1: [4, 7],
    2: [8, 11],
    3: [12, 15]
  },
  rate: 4,
  offset: { x: 6, y: 6 }, 
  scale: 7
});

// Character selection input
let change1 = true;
let change2 = true;
function charSelect() {
  if (change1 && keys[keySet1.a]) {
    select1 = Math.max(0, select1 - 1);
    chosen1.sprite(select1);
    change1 = false;
    setTimeout(() => change1 = true, UILAG);
  }
  if (change1 && keys[keySet1.d]) {
    select1 = Math.min(3, select1 + 1);
    chosen1.sprite(select1);
    change1 = false;
    setTimeout(() => change1 = true, UILAG);
  }
  if (change2 && keys[keySet2.a]) {
    select2 = Math.max(0, select2 - 1);
    chosen2.sprite(select2);
    change2 = false;
    setTimeout(() => change2 = true, UILAG);
  }
  if (change2 && keys[keySet2.d]) {
    select2 = Math.min(3, select2 + 1);
    chosen2.sprite(select2);
    change2 = false;
    setTimeout(() => change2 = true, UILAG);
  }
}

// Map selection sprites
const mapSprites = [
  'img/bg1.png',
  'img/bg2.png',
  'img/bg3.png',
  'img/bg4.png',
]


// Map selection input
let currMap = 0;
let changeMap = true;
function mapSelect() {
  if (changeMap && (keys[keySet1.a] || keys[keySet2.a])) {
    currMap = Math.max(0, currMap - 1);
    bg.sprite = mapSprites[currMap];
    changeMap = false;
    setTimeout(() => changeMap = true, UILAG);
  }
  if (changeMap && (keys[keySet1.d] || keys[keySet2.d])) {
    currMap = Math.min(mapSprites.length - 1, currMap + 1);
    bg.sprite = mapSprites[currMap];
    changeMap = false;
    setTimeout(() => changeMap = true, UILAG);
  }
}

// Announce that game has ended
let gameStatus = '';
function checkGame() {
  if (gameStatus) return;
  if (p1.health === 0 || p2.health === 0 || timer === 0) {
    timer = 0;
    gameStatus = (p1.health > p2.health ?
      'Player 1 Wins!' : (p2.health > p1.health ?
        'Player 2 Wins!' : '   Tie Game   '));
    setTimeout(() => {
      menu = 1;
      gameStatus = '';
    }, 2000);
  }
}

// In game timer
let timer;
let gameTimer;
function startTimer(count) {
  timer = count;
  updateTimer();
}
function updateTimer() {
  if (timer > 0) {
    gameTimer = setTimeout(updateTimer, 1000);
    timer -= 1;
  }
}

// Drawing box declarations
let menu = 0;
let box1 = [370, 280, 200, 80, false]; // play button
let box2 = [360, 380, 220, 80, false]; // start button
let box3 = [30, 40, 400, 30]; // p1 health bar
let box4 = [530, 40, 400, 30]; // p2 health bar
let box5 = [430, 10, 100, 100]; // timer

// Event loop function
function loop() {
  if (keys['-']) shiftBg(-10);
  if (keys['=']) shiftBg(10);
  switch (menu) {
    case 0: // Main menu
      drawMain(box1);
      break;
    case 1:  // Character Select
      drawChars(box2);
      charSelect();
      chosen1.update();
      chosen2.update();
      break;
    case 2: // Map Select
      drawMaps(box2);
      mapSelect();
      // Add map previews to update
      break;
    default: // Game
      bg.update();
      checkCombat();
      checkGame();
      drawStatus(box3, box4, box5);
      p1.update();
      p2.update();
      attacks1.forEach((a) => a ? a.update() : void(0));
      attacks2.forEach((a) => a ? a.update() : void(0)); 
  }
  window.requestAnimationFrame(loop);
}
loop();

// Event listeners for keyboard + mouse input
window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

// Canvas relative mouse position: 
// https://stackoverflow.com/questions/17130395
window.onmousemove = function(e) {
  let rect = canvas.getBoundingClientRect();
  let mX = e.pageX - rect.left;
  let mY = e.pageY - rect.top;
  if (menu === 0 && mX > box1[0] && mY > box1[1] && 
    mX < box1[0] + box1[2] && mY < box1[1] + box1[3]) {
    canvas.style.cursor = 'pointer';
    box1[4] = true;
  } else if (menu === 1 && mX > box2[0] && mY > box2[1] && 
    mX < box2[0] + box2[2] && mY < box2[1] + box2[3]) {
    canvas.style.cursor = 'pointer';
    box2[4] = true;
  } else if (menu === 2 && mX > box2[0] && mY > box2[1] && 
    mX < box2[0] + box2[2] && mY < box2[1] + box2[3]) {
    canvas.style.cursor = 'pointer';
    box2[4] = true;
  } else {
    canvas.style.cursor = 'default';
    box1[4] = false;
    box2[4] = false;
  }
}

window.onmouseup = function(e) {
  let rect = canvas.getBoundingClientRect();
  let mX = e.pageX - rect.left;
  let mY = e.pageY - rect.top;
  if (menu === 0 && mX > box1[0] && mY > box1[1] && 
    mX < box1[0] + box1[2] && mY < box1[1] + box1[3]) {
    // Switch to character selection screen
    menu = 1;
  } else if (menu === 1 && mX > box2[0] && mY > box2[1] && 
    mX < box2[0] + box2[2] && mY < box2[1] + box2[3]) {
    menu = 2;
  } else if (menu === 2 && mX > box2[0] && mY > box2[1] && 
    mX < box2[0] + box2[2] && mY < box2[1] + box2[3]) {
    // Start the game!
    menu = 3;
    p1 = new Fighter(fighters[select1], attacks1);
    p2 = new Fighter(fighters[select2 + 4], attacks2);
    startTimer(30);
  }
}