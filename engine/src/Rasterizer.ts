import { Vector3, Vector4, Matrix4x4 } from './MathEngine';
import type { Mesh } from './ObjLoader';
import { PhongShader, DEFAULT_PHONG_MATERIAL } from './PhongShader';
import { TextureMapper } from './TextureMapper';

export type ShadingMode = 'flat' | 'phong' | 'texture';

export interface RenderOptions {
  mode: ShadingMode;
  lightDir: Vector3;
  cameraPos: Vector3;
  texture?: {
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
  };
}

interface ScreenVertex {
  x: number;
  y: number;
  z: number;
  clipW: number;
}

export class Rasterizer {
  private width: number;
  private height: number;
  private colorBuffer: Uint8ClampedArray;
  private zBuffer: Float32Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.colorBuffer = new Uint8ClampedArray(width * height * 4);
    this.zBuffer = new Float32Array(width * height);
    this.clear();
  }

  clear() {
    this.colorBuffer.fill(0);
    this.zBuffer.fill(Infinity);
  }

  private edgeFunction(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
  ): number {
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
  }

  rasterize(
    mesh: Mesh,
    model: Matrix4x4,
    view: Matrix4x4,
    projection: Matrix4x4,
    options: RenderOptions
  ) {
    const mvp = projection.multiply(view.multiply(model));
    const { mode, lightDir, cameraPos } = options;

    for (const face of mesh.faces) {
      const worldPos: Vector3[] = [];
      const screenVerts: ScreenVertex[] = [];
      const vertNormals: Vector3[] = [];
      const vertUVs: [number, number][] = [];

      let discard = false;

      for (const fv of face.vertices) {
        const v = mesh.vertices[fv.posIdx];
        if (!v) { discard = true; break; }

        const v4 = new Vector4(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, 1);

        // World position
        const wPos4 = model.multiplyVector(v4);
        worldPos.push(wPos4.toVector3());

        // Vertex normal → world space (w=0 skips translation)
        if (fv.normalIdx >= 0 && mesh.normals[fv.normalIdx]) {
          const n = mesh.normals[fv.normalIdx]!;
          const nv4 = model.multiplyVector(new Vector4(n[0] ?? 0, n[1] ?? 0, n[2] ?? 0, 0));
          vertNormals.push(new Vector3(nv4.x, nv4.y, nv4.z).normalize());
        } else {
          vertNormals.push(new Vector3(0, 1, 0));
        }

        // UV
        if (fv.uvIdx >= 0 && mesh.uvs[fv.uvIdx]) {
          const uv = mesh.uvs[fv.uvIdx]!;
          vertUVs.push([uv[0] ?? 0, uv[1] ?? 0]);
        } else {
          vertUVs.push([0, 0]);
        }

        // Clip → NDC → screen
        const clip = mvp.multiplyVector(v4);
        if (clip.w <= 0) { discard = true; break; }

        const ndc = new Vector3(clip.x / clip.w, clip.y / clip.w, clip.z / clip.w);
        screenVerts.push({
          x: (ndc.x + 1) * 0.5 * this.width,
          y: (1 - ndc.y) * 0.5 * this.height,
          z: ndc.z,
          clipW: clip.w,
        });
      }

      if (discard || screenVerts.length < 3) continue;

      const s0 = screenVerts[0]!, s1 = screenVerts[1]!, s2 = screenVerts[2]!;

      // Back-face culling (Y-flip makes front faces area < 0)
      const area = this.edgeFunction(s0, s1, s2);
      if (area >= 0) continue;

      // Face normal for flat shading and texture lighting
      const faceNormal = worldPos[1]!.sub(worldPos[0]!)
        .cross(worldPos[2]!.sub(worldPos[0]!))
        .normalize();

      // Pre-compute flat color
      let flatR = 0, flatG = 0, flatB = 0;
      if (mode === 'flat') {
        const i = Math.max(0.15, faceNormal.dot(lightDir.normalize()));
        flatR = 180 * i; flatG = 180 * i; flatB = 255 * i;
      }

      // Bounding box clipped to screen
      const minX = Math.max(0, Math.floor(Math.min(s0.x, s1.x, s2.x)));
      const maxX = Math.min(this.width - 1, Math.ceil(Math.max(s0.x, s1.x, s2.x)));
      const minY = Math.max(0, Math.floor(Math.min(s0.y, s1.y, s2.y)));
      const maxY = Math.min(this.height - 1, Math.ceil(Math.max(s0.y, s1.y, s2.y)));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const p = { x: x + 0.5, y: y + 0.5 };

          const w0 = this.edgeFunction(s1, s2, p) / area;
          const w1 = this.edgeFunction(s2, s0, p) / area;
          const w2 = this.edgeFunction(s0, s1, p) / area;

          if (w0 < 0 || w1 < 0 || w2 < 0) continue;

          const z = w0 * s0.z + w1 * s1.z + w2 * s2.z;
          const index = y * this.width + x;
          if (z >= (this.zBuffer[index] ?? Infinity)) continue;
          this.zBuffer[index] = z;

          let r: number, g: number, b: number;

          if (mode === 'flat') {
            r = flatR; g = flatG; b = flatB;

          } else if (mode === 'phong') {
            // Interpolate world position
            const wx = w0 * worldPos[0]!.x + w1 * worldPos[1]!.x + w2 * worldPos[2]!.x;
            const wy = w0 * worldPos[0]!.y + w1 * worldPos[1]!.y + w2 * worldPos[2]!.y;
            const wz = w0 * worldPos[0]!.z + w1 * worldPos[1]!.z + w2 * worldPos[2]!.z;

            // Interpolate vertex normal
            const nx = w0 * vertNormals[0]!.x + w1 * vertNormals[1]!.x + w2 * vertNormals[2]!.x;
            const ny = w0 * vertNormals[0]!.y + w1 * vertNormals[1]!.y + w2 * vertNormals[2]!.y;
            const nz = w0 * vertNormals[0]!.z + w1 * vertNormals[1]!.z + w2 * vertNormals[2]!.z;

            const col = PhongShader.shade(
              new Vector3(nx, ny, nz),
              cameraPos.sub(new Vector3(wx, wy, wz)),
              lightDir,
              DEFAULT_PHONG_MATERIAL
            );
            r = col.r; g = col.g; b = col.b;

          } else {
            // Texture — perspective-correct UV interpolation
            const c0 = s0.clipW, c1 = s1.clipW, c2 = s2.clipW;
            const denom = w0 / c0 + w1 / c1 + w2 / c2;
            const u = (w0 * vertUVs[0]![0] / c0 + w1 * vertUVs[1]![0] / c1 + w2 * vertUVs[2]![0] / c2) / denom;
            const v = (w0 * vertUVs[0]![1] / c0 + w1 * vertUVs[1]![1] / c1 + w2 * vertUVs[2]![1] / c2) / denom;

            if (options.texture) {
              const { pixels, width: tw, height: th } = options.texture;
              const col = TextureMapper.sample(pixels, tw, th, u, v);
              // Basic diffuse lighting on top of texture
              const intensity = Math.max(0.55, faceNormal.dot(lightDir.normalize()));
              r = col.r * intensity;
              g = col.g * intensity;
              b = col.b * intensity;
            } else {
              // UV visualization when no texture loaded
              r = 255 * u; g = 255 * v; b = 0;
            }
          }

          const pixelIdx = index * 4;
          this.colorBuffer[pixelIdx]     = r;
          this.colorBuffer[pixelIdx + 1] = g;
          this.colorBuffer[pixelIdx + 2] = b;
          this.colorBuffer[pixelIdx + 3] = 255;
        }
      }
    }
  }

  getBuffer(): Uint8ClampedArray {
    return this.colorBuffer;
  }
}
