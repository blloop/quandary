class Sprite {
  constructor({ position, size, source }) {
    this.position = position;
    this.width = size.width;
    this.height = size.height;
    this.image = new Image();
    this.image.src = source;
  }

  draw() {
    c.drawImage(this.image, 
      this.position.x, this.position.y, 
      this.width, this.height
    );
  }

  update() {
    this.draw();
  }
}

class AnimatedSprite extends Sprite {
  constructor({ 
      position, size, sprites, flip = false, 
      offset = {x: 0, y: 0}, scale = 1
  }) {
    super({ position, size, source: sprites.src });
    this.sprites = sprites;
    this.flip = flip;
    this.offset = offset;
    this.scale = scale;

    this.frames = sprites.frames;
    this.state = 'idle';
    this.timeStamp = 0;
    this.idx = sprites.idle[0];
  }

  draw() {
    c.drawImage(this.image, 
      this.idx * (this.image.width / this.frames),
      0, 
      this.image.width / this.frames,
      this.image.height,
      this.position.x - (this.offset.x * this.scale),        
      this.position.y - (this.offset.y * this.scale),
      (this.image.width / this.frames) * this.scale,
      this.image.height * this.scale
    );
  }

  // Sprite actions: Idle, Run, Jump, Attack, ...
  sprite(name) {
    if (this.state === name) return;
    this.state = name;
    this.idx = this.sprites[name][0];
    this.timeStamp = 0;
  }

  animate() {
    this.timeStamp += 1;
    if (this.timeStamp % 8 == 0) {
      this.idx = this.idx === this.sprites[this.state][1] ? 
        this.sprites[this.state][0] : this.idx + 1;
    }
  }

  update() {
    this.animate();
    this.draw();
  }
}