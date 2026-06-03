import { Matrix4x4 } from './MathEngine';
import { Transformations } from './Transformations';

export class ModelTransform {
  static getModelMatrix(
    translation: {x: number, y: number, z: number},
    rotation: {x: number, y: number, z: number},
    scale: {x: number, y: number, z: number}
  ): Matrix4x4 {
    const T = Transformations.translate(translation.x, translation.y, translation.z);
    const RX = Transformations.rotateX(rotation.x);
    const RY = Transformations.rotateY(rotation.y);
    const RZ = Transformations.rotateZ(rotation.z);
    const S = Transformations.scale(scale.x, scale.y, scale.z);

    // M = T * R * S
    // Order of rotation usually Y, X, Z or Z, Y, X
    const R = RZ.multiply(RY.multiply(RX));
    return T.multiply(R.multiply(S));
  }
}
