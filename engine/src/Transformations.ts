import { Matrix4x4 } from './MathEngine';

export class Transformations {
  static translate(tx: number, ty: number, tz: number): Matrix4x4 {
    const m = Matrix4x4.identity();
    m.data[3] = tx;
    m.data[7] = ty;
    m.data[11] = tz;
    return m;
  }

  static scale(sx: number, sy: number, sz: number): Matrix4x4 {
    const m = Matrix4x4.identity();
    m.data[0] = sx;
    m.data[5] = sy;
    m.data[10] = sz;
    return m;
  }

  static rotateX(angleRad: number): Matrix4x4 {
    const m = Matrix4x4.identity();
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    m.data[5] = c; m.data[6] = -s;
    m.data[9] = s; m.data[10] = c;
    return m;
  }

  static rotateY(angleRad: number): Matrix4x4 {
    const m = Matrix4x4.identity();
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    m.data[0] = c;  m.data[2] = s;
    m.data[8] = -s; m.data[10] = c;
    return m;
  }

  static rotateZ(angleRad: number): Matrix4x4 {
    const m = Matrix4x4.identity();
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    m.data[0] = c; m.data[1] = -s;
    m.data[4] = s; m.data[5] = c;
    return m;
  }
}
