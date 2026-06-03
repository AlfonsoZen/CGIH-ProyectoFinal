# Contexto General del Proyecto
Actúa como un Desarrollador Experto en Gráficos 3D y TypeScript. El objetivo es construir un motor de renderizado por software (rasterizador por CPU) desde cero para cargar y visualizar un archivo `.obj` (una botella). El proyecto no debe usar librerías gráficas de alto nivel como Three.js o WebGL para el renderizado, toda la matemática lineal debe ser programada a mano. 

El proyecto usará el siguiente stack:
- Backend/Engine: Node.js con TypeScript.
- Frontend/GUI: React (usando Vite) en una carpeta separada.
- Gestor de paquetes: pnpm.

Debes esperar a que yo te indique "Avanzar a la Etapa X" para generar el código de cada fase.

---

## Etapa 1: Estructura del Proyecto y Lector de OBJ
**Objetivo:** Crear el esqueleto del proyecto y la utilidad para parsear el modelo 3D.
1. Inicializa un entorno de trabajo para un monorepo o proyecto dual usando `pnpm`.
2. [cite_start]Crea una carpeta `engine/` para la lógica central y una carpeta `gui/` para la interfaz[cite: 14].
3. Dentro de `engine/`, crea un archivo `ObjLoader.ts` capaz de leer un archivo `.obj` básico, extrayendo los vértices (líneas `v`) y las caras (líneas `f`).

---

## Etapa 2: Motor Matemático (MathEngine)
**Objetivo:** Implementar las estructuras de datos fundamentales para el pipeline de renderizado.
1. Dentro de `engine/`, crea un archivo `MathEngine.ts`.
2. Implementa las clases o funciones para manejar Vectores (Vector3, Vector4) y Matrices (Matrix4x4).
3. Incluye operaciones indispensables: suma, resta, producto punto, producto cruz, normalización, y multiplicación de matrices por matrices y matrices por vectores.

---

## Etapa 3: Transformaciones del Pipeline (TRS, View, Projection)
[cite_start]**Objetivo:** Implementar la matemática para transformar el objeto del espacio local al espacio de la imagen, manteniendo los archivos separados según la rúbrica[cite: 11, 12].
1. Crea un archivo `Transformations.ts` que exporte las funciones para generar las matrices base (Translate, Rotate, Scale).
2. Crea `ModelTransform.ts` que importe las transformaciones básicas y genere la matriz de Modelo ($M = T \cdot R \cdot S$).
3. Crea `ViewTransform.ts` que implemente una función `LookAt` para generar la matriz de Vista a partir de los vectores *eye*, *center* y *up*.
4. Crea `ProjectionTransform.ts` que implemente la matriz de Proyección en Perspectiva usando FOV, aspect ratio, near y far.

---

## Etapa 4: Rasterizador e Iluminación Plana
[cite_start]**Objetivo:** Convertir los triángulos proyectados a píxeles 2D con Z-Buffer y sombreado plano[cite: 9, 13].
1. [cite_start]Crea el archivo `Rasterizer.ts` en la carpeta `engine/`[cite: 13].
2. Implementa una función para rasterizar triángulos utilizando coordenadas baricéntricas.
3. Integra un Z-Buffer para manejar la oclusión (profundidad) y que el objeto no se dibuje sobre sí mismo.
4. Implementa el modelo de iluminación plano (Flat Shading): calcula la normal de la cara, realiza el producto punto con una fuente de luz direccional, y multiplica ese factor por un color base.

---

## Etapa 5: Interfaz Gráfica (React) y Ensamblaje Final
[cite_start]**Objetivo:** Levantar la UI para visualizar el modelo renderizado y controlar sus transformaciones, cumpliendo el bonus[cite: 15].
1. [cite_start]En la carpeta `gui/`, inicializa una app con React y Vite[cite: 14].
2. Crea un componente `CanvasRenderer.tsx` que reciba el buffer de píxeles del `Rasterizer.ts` y lo pinte en un elemento HTML `<canvas>`.
3. [cite_start]Implementa un panel de controles (sliders) en la UI para modificar los valores de Traslación, Rotación y Escala en tiempo real[cite: 15].
4. [cite_start]Asegúrate de mostrar tres instancias (o tres vistas) del modelo en pantalla, cada una con una transformación diferente[cite: 5].
