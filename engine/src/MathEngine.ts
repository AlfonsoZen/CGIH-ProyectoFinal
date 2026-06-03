export class Vector3 {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length(): number {
    return Math.sqrt(this.dot(this));
  }

  normalize(): Vector3 {
    const len = this.length();
    if (len === 0) return new Vector3();
    return new Vector3(this.x / len, this.y / len, this.z / len);
  }

  multiplyScalar(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }
}

export class Vector4 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 1
  ) {}

  static fromVector3(v: Vector3, w: number = 1): Vector4 {
    return new Vector4(v.x, v.y, v.z, w);
  }

  toVector3(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }
}

type Mat16 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

export class Matrix4x4 {
  public data: Mat16;

  constructor() {
    this.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  static identity(): Matrix4x4 {
    const m = new Matrix4x4();
    m.data[0] = 1; m.data[5] = 1; m.data[10] = 1; m.data[15] = 1;
    return m;
  }

  multiply(other: Matrix4x4): Matrix4x4 {
    const result = new Matrix4x4();
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += this.data[row * 4 + k]! * other.data[k * 4 + col]!;
        }
        result.data[row * 4 + col] = sum;
      }
    }
    return result;
  }

  multiplyVector(v: Vector4): Vector4 {
    return new Vector4(
      this.data[0] * v.x + this.data[1] * v.y + this.data[2] * v.z + this.data[3] * v.w,
      this.data[4] * v.x + this.data[5] * v.y + this.data[6] * v.z + this.data[7] * v.w,
      this.data[8] * v.x + this.data[9] * v.y + this.data[10] * v.z + this.data[11] * v.w,
      this.data[12] * v.x + this.data[13] * v.y + this.data[14] * v.z + this.data[15] * v.w
    );
  }
}
