import { Vector3, Vector4, Matrix4x4 } from './MathEngine';
import type { Mesh } from './ObjLoader';

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
    this.colorBuffer.fill(0); // Black background
    this.zBuffer.fill(Infinity);
  }

  private edgeFunction(a: Vector3, b: Vector3, c: Vector3): number {
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
  }

  rasterize(mesh: Mesh, model: Matrix4x4, view: Matrix4x4, projection: Matrix4x4, lightDir: Vector3) {
    const mvp = projection.multiply(view.multiply(model));
    
    for (const face of mesh.faces) {
      // 1. Transform vertices to Screen Space
      const worldPos: Vector3[] = [];
      const screenPos: Vector3[] = [];
      
      let discardFace = false;
      for (const idx of face.indices) {
        const v = mesh.vertices[idx];
        if (v === undefined) { discardFace = true; break; }
        const v4 = new Vector4(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, 1);
        
        // World position for lighting
        const wPos4 = model.multiplyVector(v4);
        worldPos.push(wPos4.toVector3());

        // Projection
        const clipPos = mvp.multiplyVector(v4);
        
        // Simple clipping (behind camera)
        if (clipPos.w <= 0) {
          discardFace = true;
          break;
        }

        // Perspective divide
        const ndc = new Vector3(
          clipPos.x / clipPos.w,
          clipPos.y / clipPos.w,
          clipPos.z / clipPos.w
        );

        // Viewport transform
        screenPos.push(new Vector3(
          (ndc.x + 1) * 0.5 * this.width,
          (1 - ndc.y) * 0.5 * this.height,
          ndc.z
        ));
      }

      if (discardFace || screenPos.length < 3) continue;

      // 2. Flat Shading Calculation
      const edge1 = worldPos[1]!.sub(worldPos[0]!);
      const edge2 = worldPos[2]!.sub(worldPos[0]!);
      const normal = edge1.cross(edge2).normalize();
      
      const intensity = Math.max(0.1, normal.dot(lightDir.normalize()));
      const baseColor = { r: 180, g: 180, b: 255 }; // Light blue bottle
      const r = baseColor.r * intensity;
      const g = baseColor.g * intensity;
      const b = baseColor.b * intensity;

      // 3. Bounding Box
      const s0 = screenPos[0]!, s1 = screenPos[1]!, s2 = screenPos[2]!;
      let minX = Math.floor(Math.min(s0.x, s1.x, s2.x));
      let maxX = Math.ceil(Math.max(s0.x, s1.x, s2.x));
      let minY = Math.floor(Math.min(s0.y, s1.y, s2.y));
      let maxY = Math.ceil(Math.max(s0.y, s1.y, s2.y));

      // Clip to screen
      minX = Math.max(0, minX);
      maxX = Math.min(this.width - 1, maxX);
      minY = Math.max(0, minY);
      maxY = Math.min(this.height - 1, maxY);

      const area = this.edgeFunction(s0, s1, s2);
      if (area >= 0) continue; // back-face culling: Y-flip makes front faces area<0

      // 4. Rasterization loop
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const p = new Vector3(x + 0.5, y + 0.5, 0);
          
          const w0 = this.edgeFunction(s1, s2, p) / area;
          const w1 = this.edgeFunction(s2, s0, p) / area;
          const w2 = this.edgeFunction(s0, s1, p) / area;

          if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
            // Z-Interpolation
            const z = w0 * s0.z + w1 * s1.z + w2 * s2.z;
            const index = y * this.width + x;

            if (z < (this.zBuffer[index] ?? Infinity)) {
              this.zBuffer[index] = z;
              const pixelIdx = index * 4;
              this.colorBuffer[pixelIdx] = r;
              this.colorBuffer[pixelIdx + 1] = g;
              this.colorBuffer[pixelIdx + 2] = b;
              this.colorBuffer[pixelIdx + 3] = 255;
            }
          }
        }
      }
    }
  }

  getBuffer(): Uint8ClampedArray {
    return this.colorBuffer;
  }
}
