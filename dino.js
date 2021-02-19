/* eslint-disable no-undef */

class Dino {
  constructor(standing, running, dead) {
    this.r = 50;
    this.x = 50;
    this.ground = height - this.r;
    this.y = this.ground;
    this.w = this.r;
    this.h = this.r;
    this.vw = 0;
    this.vh = 0;
    this.vy = 0;
    this.gravity = 1.5;
    this.standing = standing;
    this.running = running;
    this.state = "running";
    noStroke();
    noFill();
    this.hitbox = rect(this.x, this.y, this.w, this.h);
    this.dead = dead;
  }

  show() {
    this.running.position(this.x, this.y);
    this.standing.position(this.x, this.y);
    this.dead.position(this.x, this.y);
    if (this.state == "standing") {
      this.running.hide();
      this.standing.show();
      this.dead.hide();
    } else if (this.state == "running") {
      this.standing.hide();
      this.running.show();
      this.dead.hide();
    } else if (this.state == "dead") {
      this.standing.hide();
      this.running.hide();
      this.dead.show();
    }
  }

  die() {
    this.running.hide();
    this.standing.hide();
    this.dead.show();
  }
  
  jump() {
    if (this.y == this.ground) {
      this.vy = -15;
    }
  }

  duck() {
    if (this.y == this.ground) {
      this.vw = 10;
      this.vh = 10;
    }
  }

  move() {
    this.y += this.vy;
    this.vy += this.gravity;
    this.y = constrain(this.y, 0, this.ground);

    this.w += this.vw;
    this.vw -= this.gravity / 4;
    this.w = constrain(this.w, this.r, 2 * this.r);

    this.h -= this.vh;
    this.vh -= this.gravity / 4;
    this.h = constrain(this.h, this.r / 2, this.r);

    if (this.h < 50) {
      this.y = height - this.h;
    }
  }

  isCollidingWith(obs) {
    let hits = intersection(
      { x: this.x, y: this.y, width: this.w / 2, height: this.h / 2 },
      { x: obs.x, y: obs.y, width: obs.w / 2, height: obs.h / 2 }
    );
    console.log(hits);
    if (hits != false) {
      return true;
    } else {
      return false;
    }
  }
}
