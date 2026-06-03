# Tarea 3 — Software Rasterizer
**Computación Gráfica e Interacción Humano-Computadora**

Rasterizador por CPU que carga un modelo `.obj` de una botella de agua y lo renderiza con el pipeline completo (Model → View → Projection) usando coordenadas baricéntricas, Z-Buffer e iluminación plana (flat shading). Sin WebGL ni Three.js — toda la matemática es propia.

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18 o superior | https://nodejs.org |
| pnpm | 9 o superior | `npm install -g pnpm` |

Verifica que estén instalados:
```bash
node --version
pnpm --version
```

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias (desde la raíz del proyecto)
pnpm install

# 2. Iniciar el servidor de desarrollo
pnpm dev
```

Abrir en el navegador: **http://localhost:5173**

---

## Estructura del proyecto

```
cgih-tarea3/
├── engine/               # Motor de renderizado (TypeScript puro)
│   └── src/
│       ├── MathEngine.ts         — Vector3, Vector4, Matrix4x4
│       ├── ObjLoader.ts          — Parser de archivos .obj
│       ├── Transformations.ts    — Matrices base: Translate, Rotate, Scale
│       ├── ModelTransform.ts     — Espacio objeto → espacio mundo (M = T·R·S)
│       ├── ViewTransform.ts      — Espacio mundo → espacio cámara (LookAt)
│       ├── ProjectionTransform.ts — Espacio cámara → imagen (perspectiva)
│       └── Rasterizer.ts         — Rasterización con Z-Buffer e iluminación plana
├── gui/                  # Interfaz gráfica (React + Vite)
│   ├── src/
│   │   ├── App.tsx               — Tres vistas + panel de controles TRS
│   │   └── CanvasRenderer.tsx    — Pintado del buffer en <canvas>
│   └── public/
│       └── bottle.obj            — Modelo 3D de la botella
└── package.json
```

---

## Uso de la interfaz

La aplicación muestra **tres vistas simultáneas** de la botella:

| Vista | Transformación aplicada |
|---|---|
| Vista Principal | Controlada por los sliders del panel |
| Vista Y-Rot 90° | Rotación fija de 90° en el eje Y |
| Vista Mini | Escala 0.5, traslación lateral fija |

### Panel de controles (lado izquierdo)

Modifica la Vista Principal en tiempo real:

- **Traslación** X / Y / Z — desplaza la botella en el espacio
- **Rotación** X / Y / Z — rota la botella en cada eje (radianes, de −π a π)
- **Escala** — escala uniforme de la botella

---

## Pipeline de renderizado

```
Vértice OBJ
    │
    ▼  ModelTransform      (Transformations.ts → ModelTransform.ts)
Espacio Mundo
    │
    ▼  ViewTransform        (ViewTransform.ts — LookAt)
Espacio Cámara
    │
    ▼  ProjectionTransform  (ProjectionTransform.ts — perspectiva)
Clip Space → NDC → Pantalla
    │
    ▼  Rasterizer           (Rasterizer.ts — baricéntricas + Z-Buffer + flat shading)
Buffer de píxeles → <canvas>
```
