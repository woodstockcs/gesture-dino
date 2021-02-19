/* eslint-disable no-undef */

class Fireball {
  constructor() {
    this.h = 150;
    this.w = 200;
    this.x = 350;
    this.y = height - this.h;
    this.sprite = fireBall;
  }
  
  show() {
    // fill(200, 50, 50);
    // rect(this.x, this.y, this.w, this.h);
    // this.sprite.position(this.x, this.y);
    // this.sprite.show();
    this.sprite.position(this.x, this.y);
    this.sprite.show();
  }
  
  hide() {
    this.sprite.hide();
  }
  move() {
    this.x += -7;
  }
  
  isGone() {
    return this.x < -this.w;
  }
}