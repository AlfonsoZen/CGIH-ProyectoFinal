import { Matrix4x4 } from './MathEngine';

export class ProjectionTransform {
  static perspective(fovRad: number, aspect: number, near: number, far: number): Matrix4x4 {
    const f = 1.0 / Math.tan(fovRad / 2);
    const m = new Matrix4x4();
    
    m.data[0] = f / aspect;
    m.data[5] = f;
    m.data[10] = (far + near) / (near - far);
    m.data[11] = (2 * far * near) / (near - far);
    m.data[14] = -1;
    m.data[15] = 0;

    return m;
  }
}
