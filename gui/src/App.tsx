import { useState, useEffect } from 'react';
import './App.css';
import { ObjLoader } from 'engine';
import type { Mesh } from 'engine';
import CanvasRenderer from './CanvasRenderer';

function App() {
  const [mesh, setMesh] = useState<Mesh | null>(null);
  const [translation, setTranslation] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });

  useEffect(() => {
    fetch('/bottle.obj')
      .then(res => res.text())
      .then(text => {
        const parsedMesh = ObjLoader.parse(text);
        setMesh(parsedMesh);
      });
  }, []);

  if (!mesh) return <div className="loading">Cargando modelo...</div>;

  const handleRangeChange = (setter: any, key: string, val: string) => {
    setter((prev: any) => ({ ...prev, [key]: parseFloat(val) }));
  };

  return (
    <div className="app-container">
      <h1>Software Rasterizer - Tarea 3</h1>
      
      <div className="main-layout">
        <div className="controls">
          <h3>Transformaciones</h3>
          
          <div className="control-group">
            <label>Traslación X: {translation.x}</label>
            <input type="range" min="-10" max="10" step="0.1" value={translation.x}
                   onChange={(e) => handleRangeChange(setTranslation, 'x', e.target.value)} />
            <label>Traslación Y: {translation.y}</label>
            <input type="range" min="-10" max="10" step="0.1" value={translation.y}
                   onChange={(e) => handleRangeChange(setTranslation, 'y', e.target.value)} />
            <label>Traslación Z: {translation.z}</label>
            <input type="range" min="-10" max="10" step="0.1" value={translation.z}
                   onChange={(e) => handleRangeChange(setTranslation, 'z', e.target.value)} />
          </div>

          <div className="control-group">
            <label>Rotación X: {rotation.x.toFixed(2)}</label>
            <input type="range" min="-3.14" max="3.14" step="0.01" value={rotation.x} 
                   onChange={(e) => handleRangeChange(setRotation, 'x', e.target.value)} />
            <label>Rotación Y: {rotation.y.toFixed(2)}</label>
            <input type="range" min="-3.14" max="3.14" step="0.01" value={rotation.y} 
                   onChange={(e) => handleRangeChange(setRotation, 'y', e.target.value)} />
            <label>Rotación Z: {rotation.z.toFixed(2)}</label>
            <input type="range" min="-3.14" max="3.14" step="0.01" value={rotation.z} 
                   onChange={(e) => handleRangeChange(setRotation, 'z', e.target.value)} />
          </div>

          <div className="control-group">
            <label>Escala: {scale.x}</label>
            <input type="range" min="0.1" max="5" step="0.1" value={scale.x} 
                   onChange={(e) => {
                     const val = parseFloat(e.target.value);
                     setScale({ x: val, y: val, z: val });
                   }} />
          </div>
        </div>

        <div className="viewports">
          <div className="viewport-item">
            <h4>Vista Principal (Controlada)</h4>
            <CanvasRenderer 
              mesh={mesh} 
              translation={translation} 
              rotation={rotation} 
              scale={scale} 
              width={400} height={400} 
            />
          </div>
          
          <div className="viewport-item">
            <h4>Vista Superior (Y-Rot 90°)</h4>
            <CanvasRenderer 
              mesh={mesh} 
              translation={{x: 0, y: 0, z: 0}} 
              rotation={{x: 0, y: Math.PI/2, z: 0}} 
              scale={{x: 1, y: 1, z: 1}} 
              width={300} height={300} 
            />
          </div>

          <div className="viewport-item">
            <h4>Vista Mini (Escala 0.5)</h4>
            <CanvasRenderer 
              mesh={mesh} 
              translation={{x: 2, y: 0, z: 0}} 
              rotation={rotation} 
              scale={{x: 0.5, y: 0.5, z: 0.5}} 
              width={300} height={300} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
