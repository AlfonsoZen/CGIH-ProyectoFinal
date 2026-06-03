import { Vector3 } from './MathEngine';

export interface PhongMaterial {
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  baseColor: { r: number; g: number; b: number };
}

export const DEFAULT_PHONG_MATERIAL: PhongMaterial = {
  ambient: 0.30,
  diffuse: 0.70,
  specular: 0.9,
  shininess: 12,
  baseColor: { r: 180, g: 180, b: 255 },
};

export class PhongShader {
  static shade(
    normal: Vector3,
    viewDir: Vector3,
    lightDir: Vector3,
    material: PhongMaterial
  ): { r: number; g: number; b: number } {
    const N = normal.normalize();
    const L = lightDir.normalize();
    const V = viewDir.normalize();

    const NdotL = Math.max(0, N.dot(L));

    // R = 2*(N·L)*N - L
    const R = N.multiplyScalar(2 * NdotL).sub(L).normalize();
    const RdotV = Math.max(0, R.dot(V));

    const diffuseFactor  = material.ambient + material.diffuse * NdotL;
    // Specular is white (light color), independent of material base color
    const specularFactor = material.specular * Math.pow(RdotV, material.shininess);

    return {
      r: Math.min(255, material.baseColor.r * diffuseFactor + 255 * specularFactor),
      g: Math.min(255, material.baseColor.g * diffuseFactor + 255 * specularFactor),
      b: Math.min(255, material.baseColor.b * diffuseFactor + 255 * specularFactor),
    };
  }
}
