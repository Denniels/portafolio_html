# Generador de Reportes Inteligente (DEMO)

Demo web 100% frontend para análisis exploratorio de datos y visualización, pensada para ser desplegada en GitHub Pages.


## ¿Qué hace esta demo?
- Permite subir archivos CSV o JSON (o usar un dataset de ejemplo).
- Muestra una vista previa de los datos.
- Realiza análisis exploratorio básico (media, min, max de columnas numéricas).
- Genera visualizaciones automáticas:
  - Histograma de la primera columna numérica
  - Gráfico de dispersión de las dos primeras columnas numéricas
  - Gráfico de barras de frecuencia de la primera columna categórica
- Simula un análisis de IA (clustering K-means simple en JS).
- Permite descargar un informe PDF con los resultados, imágenes de los gráficos y descripciones automáticas.
- Todo el procesamiento ocurre en el navegador, sin backend.

## Estructura de archivos
- `index.html`: Interfaz principal de la demo.
- `style.css`: Estilos visuales.
- `app.js`: Lógica de carga, análisis y visualización de datos.
- `README.md`: Esta documentación.

## Tecnologías utilizadas
- HTML5, CSS3, JavaScript puro
- [PapaParse](https://www.papaparse.com/) para parseo de CSV
- [Chart.js](https://www.chartjs.org/) para gráficos

## ¿Cómo probar la demo?
1. Abre `index.html` en tu navegador (o accede vía GitHub Pages si está desplegado).
2. Sube un archivo CSV/JSON o usa el botón de datos de ejemplo.
3. Explora la vista previa, análisis y gráficos.

## Limitaciones
- No ejecuta código Python ni modelos de IA avanzados (solo simulación en JS).
- El PDF es generado 100% en frontend, puede variar según navegador.
- Para procesamiento real o modelos avanzados, se requiere backend o integración con APIs externas.


## Despliegue en GitHub Pages
Esta demo funciona directamente en GitHub Pages. Solo asegúrate de que la carpeta esté en `/public/demo/generador-reportes/` y accede vía:
```
https://<usuario>.github.io/<repo>/public/demo/generador-reportes/
```

## Autor
Daniel Mardones S. | portafolio_pro
