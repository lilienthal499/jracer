export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    if (isNaN(this.x)) {
      this.x = 0;
    }
    if (isNaN(this.y)) {
      this.y = 0;
    }
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  rotate(rotationAngle) {
    const tmpX = this.x;
    const tmpY = this.y;
    this.x = Math.cos(rotationAngle) * tmpX - Math.sin(rotationAngle) * tmpY;
    this.y = Math.sin(rotationAngle) * tmpX + Math.cos(rotationAngle) * tmpY;
  }

  copyFrom(otherVector) {
    this.x = otherVector.x;
    this.y = otherVector.y;
  }

  equals(otherVector) {
    return (this.x === otherVector.x && this.y === otherVector.y);
  }
}
