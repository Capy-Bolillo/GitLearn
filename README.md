# GuiaGit

GuiaGit es una guía interactiva en español para aprender Git desde cero. Combina explicaciones visuales, recetas de uso real y un juego de misiones con una terminal simulada donde puedes practicar comandos como `git init`, `git add`, `git commit`, `git branch`, `git merge`, `git push`, `git pull`, `git fetch`, `git reset`, `git restore` y `git revert`.

## Ver la guía

La versión publicada está disponible en GitHub Pages:

https://capy-bolillo.github.io/GitLearn/

El archivo principal se llama `index.html`, así que GitHub Pages lo abre automáticamente desde la raíz del repositorio.

## Qué incluye

- Conceptos clave de Git explicados con analogías y diagramas.
- Casos de uso paso a paso para situaciones comunes de trabajo.
- Un modo de juego con 30 misiones, terminal simulada y árbol de commits animado.
- Progreso guardado en el navegador con `localStorage`.
- Una chuleta imprimible de comandos esenciales en `Chuleta Git.html`.

## Estructura

```text
index.html              # Entrada principal de la guía
app.jsx                 # Navegación principal y estado global de la app
conceptos.jsx           # Sección de conceptos
casos.jsx               # Sección de casos de uso
juego.jsx               # Terminal, misiones y visualización del árbol
missions-data.js        # Datos y objetivos de las 30 misiones
git-engine.js           # Motor simulado de Git
git-styles.css          # Estilos de la interfaz
Chuleta Git.html        # Chuleta imprimible
```

## Ejecutarlo localmente

No necesita instalación ni build. Puedes abrir `index.html` directamente en el navegador.

La app carga React, ReactDOM y Babel desde CDN, por lo que necesitas conexión a internet la primera vez que la abras.

## Publicación en GitHub Pages

Para publicarlo, sube el repositorio y activa GitHub Pages desde la rama principal. Como la entrada es `index.html`, la URL pública queda:

```text
https://capy-bolillo.github.io/GitLearn/
```

