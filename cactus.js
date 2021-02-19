/* eslint-disable no-undef */

class Cactus {
  constructor() {
    this.h = 24;
    this.w = 32;
    this.x = 450;
    this.y = height - 10 - this.h;
    this.sprite = cactusImage;
  }
  
  show() {
    // fill(200, 50, 50);
    // rect(this.x, this.y, this.w, this.h);
    // this.sprite.position(this.x, this.y);
    // this.sprite.show();
    
    image(this.sprite, this.x, this.y);
  }
  
  move() {
    this.x += -5;
  }
  
  isGone() {
    return this.x < -this.w;
  }
}