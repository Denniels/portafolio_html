// Carga y visualización de datos de calidad del agua
// Este script asume que los archivos JSON están en rutas relativas accesibles desde la web

document.addEventListener('DOMContentLoaded', async function() {
  // (Depuración eliminada para producción)
  try {
    // Mostrar loader
    const loader = document.getElementById('loader-agua');
    if (loader) loader.style.display = 'flex';
    // Panel de visualizaciones (debe estar antes de cualquier uso)
    const panel = document.getElementById('panel-visualizaciones');
    const bannerStats = document.getElementById('banner-stats');
    const conclusiones = document.getElementById('conclusiones-agua');
    // Verificar elementos requeridos
    if (!panel) {
      // Si no existe el panel, no continuar
      return;
    }
    if (!bannerStats) {
      panel.innerHTML += '<div style="color:#e74c3c;">No se encontró el elemento banner-stats en el HTML.</div>';
      return;
    }
    if (!conclusiones) {
      panel.innerHTML += '<div style="color:#e74c3c;">No se encontró el elemento conclusiones-agua en el HTML.</div>';
      return;
    }
    // Banner: cargar metadatos
    const metaPath = '../data/agua/cache_metadata.json';
    let meta = null;
    try {
      meta = await fetch(metaPath).then(r => r.json());
    } catch (e) {
      bannerStats.innerHTML = '<span style="color:#e74c3c;">No se pudo cargar metadatos del estudio.<br>' + e + '</span>';
      if (loader) loader.style.display = 'none';
      return;
    }
    // Mostrar estadísticas principales
    if (loader) loader.style.display = 'none';
    bannerStats.innerHTML = `
      <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:180px;box-shadow:0 1px 6px #00b4ff11;">
        <span style="font-size:1.3em;">${meta.estadisticas?.total_instalaciones ?? '-'}+</span> estaciones
      </div>
      <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:180px;box-shadow:0 1px 6px #00b4ff11;">
        <span style="font-size:1.3em;">${meta.estadisticas?.total_regiones ?? '-'}+</span> regiones
      </div>
      <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:180px;box-shadow:0 1px 6px #00b4ff11;">
        <span style="font-size:1.3em;">${meta.fuentes_datos?.length ?? '-'}+</span> fuentes de datos
      </div>
      <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:180px;box-shadow:0 1px 6px #00b4ff11;">
        <span style="font-size:1.3em;">2023</span> periodo analizado
      </div>
    `;

    // --- Visualización: Estadísticas por parámetro ---
    const paramPath = '../data/agua/estadisticas_parametros.json';
    let paramStats = [];
    try {
      paramStats = await fetch(paramPath).then(r => r.json());
    } catch (e) {
      panel.innerHTML += '<div style="color:#e74c3c;">No se pudo cargar estadisticas_parametros.json<br>' + e + '</div>';
    }
    if (paramStats && paramStats.length > 0) {
      try {
        const paramDiv = document.createElement('div');
        paramDiv.className = 'viz-card';
        paramDiv.style = 'width:100%;max-width:700px;margin:2em auto;';
        panel.appendChild(paramDiv);
        const paramCanvas = document.createElement('canvas');
        paramDiv.appendChild(paramCanvas);
        // Promedios y std de parámetros principales
        const labels = ['Temperatura (°C)', 'Conductividad (µS/cm)', 'pH', 'Transparencia (m)'];
        const means = [
          paramStats[0]["('Temperatura Temperatura muestra °C', 'mean')"],
          paramStats[0]["('Conductividad Específica (µS/cm a 25°C)', 'mean')"],
          paramStats[0]["('Ph a 25°C', 'mean')"],
          paramStats[0]["('Transparencia secchi (m)', 'mean')"]
        ];
        const stds = [
          paramStats[0]["('Temperatura Temperatura muestra °C', 'std')"],
          paramStats[0]["('Conductividad Específica (µS/cm a 25°C)', 'std')"],
          paramStats[0]["('Ph a 25°C', 'std')"],
          paramStats[0]["('Transparencia secchi (m)', 'std')"]
        ];
        await loadChartJs();
        new Chart(paramCanvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Promedio',
                data: means,
                backgroundColor: 'rgba(0,180,255,0.5)'
              },
              {
                label: 'Desviación estándar',
                data: stds,
                backgroundColor: 'rgba(255,193,7,0.4)'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: { display: true, text: 'Estadísticas de parámetros principales de calidad de agua' },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
        // Explicación
        const exp = document.createElement('div');
        exp.className = 'explicacion';
        exp.innerHTML = `<b>Explicación:</b> Este gráfico compara el promedio y la variabilidad (desviación estándar) de los parámetros clave de calidad de agua. Un pH estable y temperaturas moderadas indican condiciones relativamente saludables, aunque la conductividad y transparencia muestran mayor variabilidad, lo que puede estar asociado a diferencias regionales y estacionales.`;
        paramDiv.appendChild(exp);
      } catch (e) {
        panel.innerHTML += '<div style="color:#e74c3c;">Error al graficar parámetros: ' + e + '</div>';
      }
    }

    // Visualización: Top instalaciones contaminantes
    const topPath = '../data/agua/instalaciones_top.json';
    let instalaciones = [];
    try {
      instalaciones = await fetch(topPath).then(r => r.json());
    } catch (e) {
      panel.innerHTML += '<span style="color:#e74c3c;">No se pudo cargar datos de instalaciones.<br>' + e + '</span>';
    }
    if (instalaciones && instalaciones.length > 0) {
      try {
        // Filtrar solo instalaciones con emisiones numéricas válidas
        const instalacionesValidas = instalaciones.filter(i => typeof i.emisiones === 'number' && !isNaN(i.emisiones));
        if (instalacionesValidas.length > 0) {
          const top10 = instalacionesValidas.sort((a, b) => b.emisiones - a.emisiones).slice(0, 10);
          const chartDiv = document.createElement('div');
          chartDiv.style = 'width:100%;max-width:700px;margin:2em auto;';
          panel.appendChild(chartDiv);
          const chartCanvas = document.createElement('canvas');
          chartDiv.appendChild(chartCanvas);
          await loadChartJs();
          new Chart(chartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
              labels: top10.map(i => i.nombre),
              datasets: [{
                label: 'Emisiones (t)',
                data: top10.map(i => i.emisiones),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Top 10 instalaciones más contaminantes' },
                tooltip: {
                  callbacks: {
                    label: ctx => ` ${ctx.parsed.y.toLocaleString()} t`
                  }
                }
              },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Emisiones (t)' } },
                x: { title: { display: true, text: 'Instalación' } }
              }
            }
          });
        } else {
          panel.innerHTML += '<div style="color:#e74c3c;">No hay datos válidos de emisiones para graficar el Top 10 de instalaciones.</div>';
        }
        // Visualización: Tabla interactiva de instalaciones
        const tablaDiv = document.createElement('div');
        tablaDiv.style = 'width:100%;max-width:900px;margin:2em auto;overflow-x:auto;';
        panel.appendChild(tablaDiv);
        let tablaHtml = `<table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#e3f6fd;"><th>Instalación</th><th>Región</th><th>Comuna</th><th>Tipo</th><th>Emisiones (t)</th></tr></thead><tbody>`;
        instalaciones.slice(0, 20).forEach(inst => {
          let emisionesStr = '-';
          if (typeof inst.emisiones === 'number' && !isNaN(inst.emisiones)) {
            emisionesStr = inst.emisiones.toLocaleString();
          } else if (inst.emisiones !== undefined && inst.emisiones !== null) {
            emisionesStr = String(inst.emisiones);
          }
          tablaHtml += `<tr><td>${inst.nombre ?? '-'}</td><td>${inst.region ?? '-'}</td><td>${inst.comuna ?? '-'}</td><td>${inst.tipo ?? '-'}</td><td style="text-align:right;">${emisionesStr}</td></tr>`;
        });
        tablaHtml += '</tbody></table>';
        tablaDiv.innerHTML = `<h3>Top 20 instalaciones más contaminantes</h3>${tablaHtml}`;
      } catch (e) {
        panel.innerHTML += '<div style="color:#e74c3c;">Error al graficar instalaciones: ' + e + '</div>';
      }
    }

    // Gráfico comparativo por región (índice de contaminación promedio)
    const regionPath = '../data/agua/resumen_regiones.json';
    let regiones = [];
    try {
      regiones = await fetch(regionPath).then(r => r.json());
    } catch (e) {
      panel.innerHTML += '<div style="color:#e74c3c;">No se pudo cargar resumen_regiones.json<br>' + e + '</div>';
    }
    if (regiones && regiones.length > 0) {
      try {
        const regionDiv = document.createElement('div');
        regionDiv.style = 'width:100%;max-width:700px;margin:2em auto;';
        panel.appendChild(regionDiv);
        const regionCanvas = document.createElement('canvas');
        regionDiv.appendChild(regionCanvas);
        new Chart(regionCanvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: regiones.map(r => r.region),
            datasets: [{
              label: 'Índice de contaminación promedio',
              data: regiones.map(r => r.indice_contaminacion_mean),
              backgroundColor: 'rgba(0, 180, 255, 0.4)',
              borderColor: 'rgba(0, 180, 255, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Comparativo regional: Índice de contaminación promedio' },
              tooltip: {
                callbacks: {
                  label: ctx => ` ${ctx.parsed.y.toFixed(2)}`
                }
              }
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Índice de contaminación' } },
              x: { title: { display: true, text: 'Región' } }
            }
          }
        });
        // Explicación
        const exp = document.createElement('div');
        exp.style = 'max-width:700px;margin:0 auto 2em auto;font-size:1em;color:#222;text-align:left;';
        exp.innerHTML = `<b>Explicación:</b> Este gráfico muestra el índice de contaminación promedio por región, permitiendo identificar zonas con mayor presión ambiental sobre lagos, lagunas y embalses. Regiones como Metropolitana y O'Higgins presentan los valores más altos, lo que sugiere la necesidad de monitoreo y gestión prioritaria.`;
        panel.appendChild(exp);
      } catch (e) {
        panel.innerHTML += '<div style="color:#e74c3c;">Error al graficar regiones: ' + e + '</div>';
      }
    }

    // Gráfico de evolución temporal de parámetros
    const temporalPath = '../data/agua/series_temporales.json';
    let series = [];
    try {
      series = await fetch(temporalPath).then(r => r.json());
    } catch (e) {
      panel.innerHTML += '<div style="color:#e74c3c;">No se pudo cargar series_temporales.json<br>' + e + '</div>';
    }
    if (series && series.length > 0) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.style = 'width:100%;max-width:700px;margin:2em auto;';
        panel.appendChild(tempDiv);
        const tempCanvas = document.createElement('canvas');
        tempDiv.appendChild(tempCanvas);
        new Chart(tempCanvas.getContext('2d'), {
          type: 'line',
          data: {
            labels: series.map(s => s['Año']),
            datasets: [
              {
                label: 'Temperatura (°C)',
                data: series.map(s => s['Temperatura Temperatura muestra °C']),
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230,126,34,0.1)',
                yAxisID: 'y1',
                tension: 0.2
              },
              {
                label: 'pH',
                data: series.map(s => s['Ph a 25°C']),
                borderColor: '#2980b9',
                backgroundColor: 'rgba(41,128,185,0.1)',
                yAxisID: 'y2',
                tension: 0.2
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: { display: true, text: 'Evolución temporal de parámetros de calidad de agua' },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            scales: {
              y1: { type: 'linear', position: 'left', title: { display: true, text: 'Temperatura (°C)' } },
              y2: { type: 'linear', position: 'right', title: { display: true, text: 'pH' }, grid: { drawOnChartArea: false } }
            }
          }
        });
        // Explicación
        const exp2 = document.createElement('div');
        exp2.style = 'max-width:700px;margin:0 auto 2em auto;font-size:1em;color:#222;text-align:left;';
        exp2.innerHTML = `<b>Explicación:</b> La evolución temporal permite observar tendencias en la temperatura y el pH del agua en los últimos años. Se aprecia estabilidad en el pH y variaciones moderadas en la temperatura, lo que puede estar asociado a cambios climáticos y presiones locales.`;
        panel.appendChild(exp2);
      } catch (e) {
        panel.innerHTML += '<div style="color:#e74c3c;">Error al graficar series temporales: ' + e + '</div>';
      }
    }

    // Explicaciones y conclusiones
    conclusiones.innerHTML = `
      <h2>Conclusiones y Hallazgos</h2>
      <ul>
        <li>Las instalaciones con mayores emisiones se concentran en regiones urbanas e industriales, destacando la importancia del monitoreo en zonas críticas.</li>
        <li>La integración de fuentes de datos oficiales permite un análisis robusto y reproducible, facilitando la transparencia y la toma de decisiones.</li>
        <li>El monitoreo continuo y la apertura de datos son claves para la gestión ambiental y la participación ciudadana.</li>
      </ul>
      <p style="margin-top:1em;">Explora los gráficos y tablas para identificar focos de contaminación y oportunidades de mejora en la calidad del agua. Los datos utilizados provienen de fuentes oficiales y están disponibles para descarga pública.</p>
      <div style="margin-top:1.5em;">
        <b>Fuente de datos:</b> Registro de Emisiones y Transferencias de Contaminantes (RETC), Ministerio del Medio Ambiente de Chile.<br>
        <a href="https://datos.mma.gob.cl/" target="_blank" style="color:#0077b6;text-decoration:underline;font-weight:bold;">Descargar datos originales</a>
      </div>
    `;
  } catch (err) {
    // Captura global de errores
    const panel = document.getElementById('panel-visualizaciones');
    if (panel) {
      panel.innerHTML += `<div style="color:#e74c3c;font-weight:bold;">Error inesperado: ${err.message || err}</div>`;
    } else {
      alert('Error crítico: ' + (err.message || err));
    }
  }
});

// Utilidad para cargar Chart.js
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
