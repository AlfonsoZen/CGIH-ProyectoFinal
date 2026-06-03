export interface FaceVertex {
  posIdx: number;
  uvIdx: number;
  normalIdx: number;
}

export interface Face {
  vertices: FaceVertex[];
}

export interface Mesh {
  vertices: number[][];
  uvs: number[][];
  normals: number[][];
  faces: Face[];
}

export class ObjLoader {
  static parse(content: string): Mesh {
    const vertices: number[][] = [];
    const uvs: number[][] = [];
    const normals: number[][] = [];
    const faces: Face[] = [];

    for (let line of content.split('\n')) {
      line = line.trim();

      if (line.startsWith('v ')) {
        const [, x, y, z] = line.split(/\s+/);
        vertices.push([parseFloat(x!), parseFloat(y!), parseFloat(z!)]);

      } else if (line.startsWith('vt ')) {
        const [, u, v] = line.split(/\s+/);
        uvs.push([parseFloat(u!), parseFloat(v ?? '0')]);

      } else if (line.startsWith('vn ')) {
        const [, x, y, z] = line.split(/\s+/);
        normals.push([parseFloat(x!), parseFloat(y!), parseFloat(z!)]);

      } else if (line.startsWith('f ')) {
        const tokens = line.split(/\s+/).slice(1);
        const fverts: FaceVertex[] = tokens.map(t => {
          const parts = t.split('/');
          return {
            posIdx: parseInt(parts[0] ?? '1') - 1,
            uvIdx: parts[1] && parts[1] !== '' ? parseInt(parts[1]) - 1 : -1,
            normalIdx: parts[2] && parts[2] !== '' ? parseInt(parts[2]) - 1 : -1,
          };
        });

        // Fan triangulation: polygon [v0,v1,...,vN] → [v0,v1,v2], [v0,v2,v3], ...
        for (let i = 1; i < fverts.length - 1; i++) {
          faces.push({ vertices: [fverts[0]!, fverts[i]!, fverts[i + 1]!] });
        }
      }
    }

    return { vertices, uvs, normals, faces };
  }
}
