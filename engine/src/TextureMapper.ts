export class TextureMapper {
  static sample(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    u: number,
    v: number
  ): { r: number; g: number; b: number } {
    const cu = Math.min(1, Math.max(0, u));
    const cv = Math.min(1, Math.max(0, v));

    const px = Math.min(width - 1, Math.floor(cu * width));
    // OBJ V=0 is bottom; PNG Y=0 is top → flip V
    const py = Math.min(height - 1, Math.floor((1 - cv) * height));

    const idx = (py * width + px) * 4;
    return {
      r: pixels[idx]!,
      g: pixels[idx + 1]!,
      b: pixels[idx + 2]!,
    };
  }
}
