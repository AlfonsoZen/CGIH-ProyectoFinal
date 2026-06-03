export interface Face {
  indices: number[];
}

export interface Mesh {
  vertices: number[][]; // Each vertex is [x, y, z]
  faces: Face[];
}

export class ObjLoader {
  static parse(content: string): Mesh {
    const vertices: number[][] = [];
    const faces: Face[] = [];

    const lines = content.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('v ')) {
        const parts = line.split(/\s+/).slice(1);
        vertices.push(parts.map(p => parseFloat(p)));
      } else if (line.startsWith('f ')) {
        const parts = line.split(/\s+/).slice(1);
        // OBJ indices are 1-based; handles v/vt/vn format by taking only the vertex index
        const indices = parts.map(p => parseInt(p.split('/')[0] ?? '1') - 1);

        // Fan triangulation: polygon [v0,v1,...,vN] → triangles [v0,v1,v2], [v0,v2,v3], ...
        for (let i = 1; i < indices.length - 1; i++) {
          faces.push({ indices: [indices[0]!, indices[i]!, indices[i + 1]!] });
        }
      }
    }

    return { vertices, faces };
  }
}
