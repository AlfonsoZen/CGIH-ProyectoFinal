import { Matrix4x4, Vector3 } from './MathEngine';

export class ViewTransform {
  static lookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix4x4 {
    const zAxis = eye.sub(center).normalize(); // Forward
    const xAxis = up.cross(zAxis).normalize(); // Right
    const yAxis = zAxis.cross(xAxis).normalize(); // Up

    const view = new Matrix4x4();
    view.data[0] = xAxis.x; view.data[1] = xAxis.y; view.data[2] = xAxis.z;
    view.data[3] = -xAxis.dot(eye);

    view.data[4] = yAxis.x; view.data[5] = yAxis.y; view.data[6] = yAxis.z;
    view.data[7] = -yAxis.dot(eye);

    view.data[8] = zAxis.x; view.data[9] = zAxis.y; view.data[10] = zAxis.z;
    view.data[11] = -zAxis.dot(eye);

    view.data[15] = 1;

    return view;
  }
}
