import React, { useEffect, useRef } from 'react';
import { 
  Rasterizer, 
  Vector3, 
  ViewTransform, 
  ProjectionTransform,
  ModelTransform 
} from 'engine';
import type { Mesh } from 'engine';

interface Props {
  mesh: Mesh;
  translation: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  width: number;
  height: number;
}

const CanvasRenderer: React.FC<Props> = ({ mesh, translation, rotation, scale, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rasterizerRef = useRef<Rasterizer | null>(null);

  useEffect(() => {
    if (!rasterizerRef.current) {
      rasterizerRef.current = new Rasterizer(width, height);
    }
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rasterizerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rasterizer = rasterizerRef.current;
    rasterizer.clear();

    const model = ModelTransform.getModelMatrix(translation, rotation, scale);
    const view = ViewTransform.lookAt(
      new Vector3(0, 5, 15), // Camera position
      new Vector3(0, 4, 0),  // Looking at the bottle
      new Vector3(0, 1, 0)   // Up vector
    );
    const projection = ProjectionTransform.perspective(
      (45 * Math.PI) / 180,
      width / height,
      0.1,
      1000
    );

    const lightDir = new Vector3(1, 1, 1);
    rasterizer.rasterize(mesh, model, view, projection, lightDir);

    const imageData = new ImageData(rasterizer.getBuffer(), width, height);
    ctx.putImageData(imageData, 0, 0);
  }, [mesh, translation, rotation, scale, width, height]);

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
