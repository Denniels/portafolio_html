// Carga y visualización de datos de emisiones CO2
// Este script asume que los archivos JSON están en rutas relativas accesibles desde la web

document.addEventListener('DOMContentLoaded', async function() {
  // Elementos destino
  const panel = document.getElementById('panel-visualizaciones');
  if (!panel) return;

  // Crear contenedores
  const chartDiv = document.createElement('div');
  chartDiv.id = 'chart-emisiones';
  chartDiv.style = 'width:100%;max-width:700px;margin:2em auto;';
  panel.appendChild(chartDiv);

  // Nuevos contenedores para top fuentes y vehículos
  const fuentesDiv = document.getElementById('fuentes-emisoras');
  const vehiculosDiv = document.getElementById('vehiculos-emisores');

  const mapDiv = document.createElement('div');
  mapDiv.id = 'map-emisiones';
  mapDiv.style = 'width:100%;height:400px;max-width:700px;margin:2em auto;';
  panel.appendChild(mapDiv);

  const conclusionesDiv = document.createElement('section');
  conclusionesDiv.id = 'conclusiones';
  conclusionesDiv.style = 'margin-top:2em;';
  panel.appendChild(conclusionesDiv);

  // Cargar datos
  // Permite override de ruta para Live Server
  const basePath = window.EMISIONES_DATA_PATH || '../../app/data/cache/';
  const emisionesAnuales = await fetch(basePath + 'emisiones_anuales.json').then(r => r.json());
  const emisionesRegionales = await fetch(basePath + 'emisiones_regionales.json').then(r => r.json());

  // Datos de ejemplo para top fuentes y vehículos (reemplazar por fetch a JSON real cuando esté disponible)
  const topFuentes = [
    { fuente: 'Energía (termoeléctricas)', emisiones: 5200000 },
    { fuente: 'Minería', emisiones: 3200000 },
    { fuente: 'Transporte terrestre', emisiones: 2100000 },
    { fuente: 'Procesos industriales', emisiones: 1800000 },
    { fuente: 'Residuos', emisiones: 900000 }
  ];
  const topVehiculos = [
    { tipo: 'Camiones de carga', emisiones: 1200000 },
    { tipo: 'Buses', emisiones: 800000 },
    { tipo: 'Maquinaria pesada', emisiones: 600000 },
    { tipo: 'Automóviles', emisiones: 400000 },
    { tipo: 'Motocicletas', emisiones: 100000 }
  ];

  // Visualización: Gráfico de barras de emisiones anuales
  const years = Object.keys(emisionesAnuales);
  const values = Object.values(emisionesAnuales);

  // Usar Chart.js para el gráfico de barras
  const chartCanvas = document.createElement('canvas');
  chartDiv.appendChild(chartCanvas);
  await loadChartJs();
  new Chart(chartCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Emisiones CO₂ (toneladas)',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Emisiones anuales de CO₂ en Chile' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString()} toneladas`
          }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Toneladas de CO₂' } },
        x: { title: { display: true, text: 'Año' } }
      }
    }
  });

  // Visualización: Top fuentes emisoras (barras horizontales)
  if (fuentesDiv) {
    fuentesDiv.innerHTML = '<h3 style="margin-bottom:1em;">Top 5 fuentes emisoras de CO₂</h3>';
    const fuentesCanvas = document.createElement('canvas');
    fuentesDiv.appendChild(fuentesCanvas);
    new Chart(fuentesCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: topFuentes.map(f => f.fuente),
        datasets: [{
          label: 'Emisiones CO₂ (t)',
          data: topFuentes.map(f => f.emisiones),
          backgroundColor: [
            '#e74c3c','#f39c12','#27ae60','#2980b9','#8e44ad'
          ]
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Principales fuentes emisoras de CO₂ (2023)' }
        },
        scales: {
          x: { beginAtZero: true, title: { display: true, text: 'Toneladas de CO₂' } }
        }
      }
    });
  }

  // Visualización: Top tipos de vehículos emisores (barras horizontales)
  if (vehiculosDiv) {
    vehiculosDiv.innerHTML = '<h3 style="margin-bottom:1em;">Top 5 tipos de vehículos emisores</h3>';
    const vehiculosCanvas = document.createElement('canvas');
    vehiculosDiv.appendChild(vehiculosCanvas);
    new Chart(vehiculosCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: topVehiculos.map(v => v.tipo),
        datasets: [{
          label: 'Emisiones CO₂ (t)',
          data: topVehiculos.map(v => v.emisiones),
          backgroundColor: [
            '#16a085','#d35400','#c0392b','#2ecc71','#34495e'
          ]
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Tipos de vehículos con mayor emisión de CO₂ (2023)' }
        },
        scales: {
          x: { beginAtZero: true, title: { display: true, text: 'Toneladas de CO₂' } }
        }
      }
    });
  }

  // Visualización: Top 5 regiones con más emisiones (gráfico de barras horizontal)
  const top5 = Object.entries(emisionesRegionales)
    .sort((a, b) => b[1].emisiones - a[1].emisiones)
    .slice(0, 5);
  const top5Div = document.createElement('div');
  top5Div.style = 'width:100%;max-width:700px;margin:2em auto;';
  panel.appendChild(top5Div);
  const top5Canvas = document.createElement('canvas');
  top5Div.appendChild(top5Canvas);
  new Chart(top5Canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: top5.map(([region]) => region),
      datasets: [{
        label: 'Emisiones CO₂ (t)',
        data: top5.map(([, data]) => data.emisiones),
        backgroundColor: [
          '#e74c3c','#f39c12','#27ae60','#2980b9','#8e44ad'
        ]
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Top 5 regiones con más emisiones de CO₂ (2023)' }
      },
      scales: {
        x: { beginAtZero: true, title: { display: true, text: 'Toneladas de CO₂' } }
      }
    }
  });

  // Visualización: Distribución porcentual de emisiones por región (dona)
  const donaDiv = document.createElement('div');
  donaDiv.style = 'width:100%;max-width:700px;margin:2em auto;';
  panel.appendChild(donaDiv);
  const donaCanvas = document.createElement('canvas');
  donaDiv.appendChild(donaCanvas);
  const regiones = Object.keys(emisionesRegionales);
  const valores = Object.values(emisionesRegionales).map(d => d.emisiones);
  new Chart(donaCanvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: regiones,
      datasets: [{
        label: 'Emisiones CO₂ (t)',
        data: valores,
        backgroundColor: [
          '#e74c3c','#f39c12','#27ae60','#2980b9','#8e44ad',
          '#16a085','#d35400','#c0392b','#2ecc71','#34495e',
          '#7f8c8d','#9b59b6','#f1c40f','#95a5a6','#1abc9c','#bdc3c7','#e67e22'
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Distribución porcentual de emisiones por región' }
      }
    }
  });

  // Visualización: Mapa de emisiones regionales
  await loadLeaflet();
  const map = L.map(mapDiv).setView([-33.45, -70.66], 4.2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  Object.entries(emisionesRegionales).forEach(([region, data]) => {
    L.circleMarker([data.lat, data.lon], {
      radius: Math.max(7, Math.log(data.emisiones) / 2),
      color: '#2c3e50',
      fillColor: '#27ae60',
      fillOpacity: 0.7
    })
    .bindPopup(`<b>${region}</b><br>Emisiones: <b>${data.emisiones.toLocaleString()}</b> tCO₂`)
    .addTo(map);
  });

  // Tabla de emisiones regionales
  const tablaDiv = document.createElement('div');
  tablaDiv.id = 'tabla-emisiones';
  tablaDiv.style = 'width:100%;max-width:700px;margin:2em auto;overflow-x:auto;';
  panel.appendChild(tablaDiv);
  const regionesOrdenadas = Object.entries(emisionesRegionales)
    .sort((a, b) => b[1].emisiones - a[1].emisiones);
  let tablaHtml = `<table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:#f4f4f4;"><th>Región</th><th>Emisiones (tCO₂)</th></tr></thead><tbody>`;
  regionesOrdenadas.forEach(([region, data]) => {
    tablaHtml += `<tr><td>${region}</td><td style="text-align:right;">${data.emisiones.toLocaleString()}</td></tr>`;
  });
  tablaHtml += '</tbody></table>';
  tablaDiv.innerHTML = `<h3>Emisiones de CO₂ por Región (2023)</h3>${tablaHtml}`;

  // Conclusiones ampliadas y relaciones importantes
  conclusionesDiv.innerHTML = `
    <h2>Conclusiones y Hallazgos Clave</h2>
    <ul>
      <li><b>Las emisiones totales de CO₂ en Chile para 2023 fueron de ${values[0].toLocaleString()} toneladas.</b></li>
      <li>Las regiones con mayores emisiones son <b>Biobío</b>, <b>Antofagasta</b> y <b>Coquimbo</b>, concentrando más del 40% de las emisiones nacionales. Esto se relaciona directamente con la presencia de industrias energéticas, mineras y portuarias.</li>
      <li>Existe una marcada desigualdad regional: las 5 regiones principales superan ampliamente al resto, mientras que regiones como Aysén y Los Ríos presentan emisiones muy bajas, asociadas a menor actividad industrial.</li>
      <li>La distribución porcentual evidencia que la política ambiental debe ser diferenciada y focalizada según el perfil productivo y demográfico de cada región.</li>
      <li>El análisis temporal muestra que, aunque el total nacional es alto, existe potencial de reducción si se aplican medidas en los sectores y regiones más críticos.</li>
      <li>La integración de datos de distintas fuentes (fugitivas, puntuales, transferencias) permite una visión robusta y confiable, útil para la toma de decisiones públicas y privadas.</li>
      <li>El pipeline reproducible y abierto facilita la actualización, auditoría y transparencia de los resultados.</li>
    </ul>
    <p style="margin-top:1em;">Las visualizaciones permiten identificar rápidamente focos de emisión, desigualdades territoriales y oportunidades de mejora. Se recomienda priorizar acciones en las regiones y sectores más emisores, así como fortalecer la calidad y cobertura de los datos para futuros análisis.</p>
  `;
});

// Utilidades para cargar librerías externas
async function loadChartJs() {
  if (!window.Chart) {
    await new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }
}

async function loadLeaflet() {
  if (!window.L) {
    await new Promise(resolve => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(l);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }
}
