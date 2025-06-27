
# Módulo `public`

Contiene la aplicación web estática lista para ser desplegada en GitHub Pages o cualquier servidor estático.

## Estructura
- `index.html`: Página principal del portafolio.
- `css/`: Hojas de estilo CSS globales.
- `js/`: Scripts JavaScript para visualizaciones y navegación.
  - `emisiones.js`: Visualización de emisiones de CO₂ (gráficos y mapa interactivo).
  - `navigation.js`: Lógica de navegación y selector de tema/color.
- `pages/`: Páginas temáticas del portafolio.
  - `emisiones.html`, `agua.html`, `demografia.html`, `presupuesto.html`, `curriculum.html`, `servicios.html`, `productos.html`.
- `demo/generador-reportes/`: Demo avanzada de análisis de datos y generación de reportes PDF.

## Avances recientes
- Demo "Generador de Reportes Inteligente" con:
  - Subida de datos, análisis exploratorio, visualizaciones automáticas (histograma, dispersión, frecuencia).
  - Descarga de informe PDF con imágenes y descripciones.
- Unificación de temas y selector de color en toda la web.
- Navegación y sidebar responsivos.

## Propósito
- Mostrar resultados y visualizaciones de los análisis de datos.
- Permitir navegación entre las distintas temáticas del portafolio.
- Ofrecer demos y productos listos para probar y comprar.

## Uso
- Abrir `index.html` o cualquier página en `pages/` para visualizar la web.
- Acceder a la demo en `/public/demo/generador-reportes/`.
- Los scripts JS consumen los datos procesados desde `app/data/cache/`.
