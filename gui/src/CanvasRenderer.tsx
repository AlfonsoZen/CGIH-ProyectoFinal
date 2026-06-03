import React, { useEffect, useRef } from 'react';
import {
  Rasterizer,
  Vector3,
  ViewTransform,
  ProjectionTransform,
  ModelTransform,
} from 'engine';
import type { Mesh, ShadingMode } from 'engine';

interface TextureData {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
}

interface Props {
  mesh: Mesh;
  translation: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  width: number;
  height: number;
  shadingMode: ShadingMode;
  textureData: TextureData | null;
}

const CAMERA_POS = new Vector3(0, 5, 15);
const LOOK_AT    = new Vector3(0, 4, 0);
const UP         = new Vector3(0, 1, 0);
const LIGHT_DIR  = new Vector3(0.5, 1, 3);

const CanvasRenderer: React.FC<Props> = ({
  mesh, translation, rotation, scale,
  width, height, shadingMode, textureData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rasterizerRef = useRef<Rasterizer | null>(null);

  useEffect(() => {
    rasterizerRef.current = new Rasterizer(width, height);
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rasterizerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rasterizer = rasterizerRef.current;
    rasterizer.clear();

    const model      = ModelTransform.getModelMatrix(translation, rotation, scale);
    const view       = ViewTransform.lookAt(CAMERA_POS, LOOK_AT, UP);
    const projection = ProjectionTransform.perspective(
      (45 * Math.PI) / 180, width / height, 0.1, 1000
    );

    rasterizer.rasterize(mesh, model, view, projection, {
      mode:      shadingMode,
      lightDir:  LIGHT_DIR,
      cameraPos: CAMERA_POS,
      texture:   textureData ?? undefined,
    });

    ctx.putImageData(new ImageData(rasterizer.getBuffer(), width, height), 0, 0);
  }, [mesh, translation, rotation, scale, width, height, shadingMode, textureData]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #444', backgroundColor: '#000', margin: '10px' }}
    />
  );
};

export default CanvasRenderer;
