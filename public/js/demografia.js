// Visualización y análisis demográfico de Chile
// Carga dinámica de datos y visualizaciones para demografia.html

document.addEventListener('DOMContentLoaded', function() {
  // Ruta relativa para GitHub Pages y entorno local
  const DATA_PATH = '../data/demografia/demografia_data.json';

  console.log('[DEMOGRAFIA] Iniciando fetch de datos:', DATA_PATH);
  fetch(DATA_PATH)
    .then(response => {
      console.log('[DEMOGRAFIA] Respuesta fetch:', response);
      if (!response.ok) throw new Error('HTTP error ' + response.status);
      return response.json();
    })
    .then(data => {
      console.log('[DEMOGRAFIA] Datos recibidos:', data);
      renderDemografia(data);
    })
    .catch(err => {
      console.error('[DEMOGRAFIA] Error en fetch o parseo JSON:', err);
      document.getElementById('banner-demografia').innerHTML = '<p style="color:red">No se pudo cargar el análisis demográfico.</p>';
    });
});

function renderDemografia(data) {
  console.log('[DEMOGRAFIA] Entrando a renderDemografia con data:', data);
  // Banner informativo
  try {
    const meta = data.metadata || {};
    const resumen = (data.conclusiones && data.conclusiones.resumen_ejecutivo) || 'Sin resumen disponible.';
    const stats = (data.datos && data.datos.estadisticas_resumen) || {};
    const poblacionActual = stats.poblacion_actual ? stats.poblacion_actual.toLocaleString('es-CL') : 'N/D';
    const crecimientoPorcentual = (typeof stats.crecimiento_porcentual === 'number' ? stats.crecimiento_porcentual.toFixed(2) : 'N/D');
    const densidadPoblacional = (typeof stats.densidad_poblacional !== 'undefined' ? stats.densidad_poblacional : 'N/D');
    const periodoAnalisis = meta.periodo_analisis || 'N/D';
    const fuenteDatos = meta.fuente_datos || 'N/D';
    let fechaActualizacion = 'N/D';
    if (meta.fecha_actualizacion) {
      try {
        fechaActualizacion = meta.fecha_actualizacion.split('T')[0];
      } catch (e) {
        fechaActualizacion = meta.fecha_actualizacion;
      }
    }
    const banner = `
      <h1 style="font-size:2.3em;font-weight:700;letter-spacing:-1px;">Análisis Demográfico de Chile</h1>
      <p style="font-size:1.15em;max-width:750px;margin:0 auto 1.2em auto;text-align:center;">${resumen}</p>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:1.2em;margin-top:1em;">
        <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:170px;box-shadow:0 1px 6px #00b4ff11;">
          <span style="font-size:1.2em;">${poblacionActual}</span> habitantes (2023)
        </div>
        <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:170px;box-shadow:0 1px 6px #00b4ff11;">
          <span style="font-size:1.2em;">${crecimientoPorcentual}%</span> crecimiento 2010-2023
        </div>
        <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:170px;box-shadow:0 1px 6px #00b4ff11;">
          <span style="font-size:1.2em;">${densidadPoblacional}</span> hab/km²
        </div>
        <div style="background:rgba(0,180,255,0.18);color:#0077b6;font-weight:bold;padding:1em 2em;border-radius:12px;min-width:170px;box-shadow:0 1px 6px #00b4ff11;">
          <span style="font-size:1.2em;">${periodoAnalisis}</span> periodo
        </div>
      </div>
      <p style="font-size:0.98em;color:#555;margin-top:1em;">Fuente: ${fuenteDatos} | Actualizado: ${fechaActualizacion}</p>
    `;
    document.getElementById('banner-demografia').innerHTML = banner;
  } catch (err) {
    document.getElementById('banner-demografia').innerHTML = '<p style="color:red">Error al renderizar el banner demográfico.</p>';
    console.error('Error al renderizar el banner demográfico:', err, data);
    alert('Error al renderizar el banner demográfico. Revisa la consola para más detalles.');
  }

  // Visualizaciones y explicaciones dinámicas
  const explicaciones = [
    {
      titulo: 'Serie histórica de población',
      grafico: 'chart-poblacion',
      explicacion: `Esta gráfica muestra la evolución de la población total de Chile entre 2010 y 2023. Se observa un crecimiento sostenido, reflejo de tendencias demográficas positivas, migración y mejoras en salud pública. El aumento poblacional impacta en la demanda de servicios, infraestructura y recursos.`
    },
    {
      titulo: 'Crecimiento absoluto anual',
      grafico: 'chart-crecimiento-absoluto',
      explicacion: `El crecimiento absoluto anual indica cuántas personas se suman cada año a la población. Los picos pueden deberse a migraciones, políticas públicas o fenómenos coyunturales. Un crecimiento estable facilita la planificación, mientras que variaciones abruptas pueden desafiar la capacidad de respuesta del Estado.`
    },
    {
      titulo: 'Crecimiento porcentual anual',
      grafico: 'chart-crecimiento-porcentual',
      explicacion: `El crecimiento porcentual anual permite comparar la dinámica poblacional relativa año a año. Un porcentaje bajo indica madurez demográfica, mientras que valores altos pueden asociarse a migración o cambios en la natalidad. Chile muestra una tendencia a la estabilización, típica de países en transición demográfica.`
    },
    {
      titulo: 'Población observada vs proyección',
      grafico: 'chart-observada-proyeccion',
      explicacion: `Esta comparación entre datos observados y proyecciones permite anticipar escenarios futuros. Las proyecciones, basadas en modelos estadísticos, ayudan a prever necesidades de infraestructura, educación y salud. Es fundamental monitorear la precisión de estas estimaciones para ajustar políticas públicas.`
    }
  ];

  // Renderizado de la grilla visualizaciones + explicaciones
  const panel = document.getElementById('panel-visualizaciones');
  panel.innerHTML = '';
  explicaciones.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'viz-row' + (idx % 2 === 1 ? ' reverse' : '');
    row.innerHTML = `
      <div class="viz-chart">
        <h2 style="margin:0 0 0.7em 0;">${item.titulo}</h2>
        <canvas id="${item.grafico}" width="350" height="220"></canvas>
      </div>
      <div class="viz-explanation">
        <p>${item.explicacion}</p>
      </div>
    `;
    panel.appendChild(row);
  });

  // Gráficos
  renderPoblacionHistorica(data.datos.poblacion_historica);
  renderCrecimientoAbsoluto(data.datos.poblacion_historica);
  renderCrecimientoPorcentual(data.datos.poblacion_historica);
  renderObservadaVsProyeccion(data.datos.poblacion_historica, data.datos.proyecciones);

  // Tabla de proyecciones
  renderProyecciones(data.datos.proyecciones);

  // Hallazgos y recomendaciones
  renderConclusiones(data.conclusiones);

  // Visualización adicional: distribución por sexo si existe
  if (data.datos.poblacion_por_sexo) {
    renderPoblacionPorSexo(data.datos.poblacion_por_sexo);
  } else {
    // Si no hay datos, mostrar explicación
    document.getElementById('extra-demografia').innerHTML = `
      <div class="card-info" style="max-width:600px;margin:1.5em auto 0 auto;padding:1.2em 1.5em;background:var(--card-bg, #f8f9fa);border-radius:14px;box-shadow:0 2px 12px #0077b611;">
        <h3 style="margin-top:0">¿Sabías qué?</h3>
        <p style="font-size:1.08em;">La estructura por sexo y edad es clave para entender la dinámica demográfica. Cuando se disponga de datos por sexo o grupos etarios, aquí se mostrarán visualizaciones adicionales como pirámides poblacionales o comparativas por región.</p>
        <ul style="margin-top:0.7em;">
          <li>La pirámide poblacional permite visualizar el envejecimiento o rejuvenecimiento de la población.</li>
          <li>Las diferencias por sexo pueden indicar tendencias migratorias o de salud.</li>
        </ul>
        <p style="color:#888;font-size:0.97em;margin-top:1em;">¿Te gustaría ver más análisis? ¡Sugiere nuevos datos o visualizaciones!</p>
      </div>
    `;
  }
// Visualización de distribución por sexo (si existe en el JSON)
function renderPoblacionPorSexo(arr) {
  const container = document.getElementById('extra-demografia');
  container.innerHTML = `
    <div class="card-info" style="max-width:600px;margin:1.5em auto 0 auto;padding:1.2em 1.5em;background:var(--card-bg, #f8f9fa);border-radius:14px;box-shadow:0 2px 12px #0077b611;">
      <h3 style="margin-top:0">Distribución por sexo</h3>
      <canvas id="chart-sexo" height="180"></canvas>
      <p style="font-size:1.02em;margin-top:1em;">La proporción entre hombres y mujeres se ha mantenido relativamente estable, con ligeras variaciones según los años analizados.</p>
    </div>
  `;
  const ctx = document.getElementById('chart-sexo').getContext('2d');
  const labels = arr.map(d => d.año);
  const hombres = arr.map(d => d.hombres);
  const mujeres = arr.map(d => d.mujeres);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Hombres',
          data: hombres,
          backgroundColor: 'rgba(0,180,255,0.55)',
          borderColor: '#0077b6',
          borderWidth: 1
        },
        {
          label: 'Mujeres',
          data: mujeres,
          backgroundColor: 'rgba(255,99,132,0.45)',
          borderColor: '#d90429',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { title: { display: true, text: 'Año' } },
        y: { title: { display: true, text: 'Población' }, beginAtZero: true }
      }
    }
  });
}
}
// Gráfico de crecimiento absoluto anual
function renderCrecimientoAbsoluto(arr) {
  const ctx = document.getElementById('chart-crecimiento-absoluto').getContext('2d');
  const labels = arr.slice(1).map(d => d.año);
  const values = arr.slice(1).map((d, i) => d.poblacion_total - arr[i].poblacion_total);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Crecimiento absoluto',
        data: values,
        backgroundColor: '#48cae4',
        borderColor: '#0077b6',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { title: { display: true, text: 'Año' } },
        y: { title: { display: true, text: 'Crecimiento absoluto' }, beginAtZero: true }
      }
    }
  });
}

// Gráfico de crecimiento porcentual anual
function renderCrecimientoPorcentual(arr) {
  const ctx = document.getElementById('chart-crecimiento-porcentual').getContext('2d');
  const labels = arr.slice(1).map(d => d.año);
  const values = arr.slice(1).map((d, i) => ((d.poblacion_total - arr[i].poblacion_total) / arr[i].poblacion_total * 100).toFixed(2));
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Crecimiento %',
        data: values,
        borderColor: '#00b47a',
        backgroundColor: 'rgba(0,180,255,0.10)',
        fill: true,
        tension: 0.2,
        pointRadius: 3,
        pointBackgroundColor: '#00b47a',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { title: { display: true, text: 'Año' } },
        y: { title: { display: true, text: 'Crecimiento %' }, beginAtZero: false }
      }
    }
  });
}

// Gráfico combinado: observada vs proyección
function renderObservadaVsProyeccion(historico, proy) {
  const ctx = document.getElementById('chart-observada-proyeccion').getContext('2d');
  const labels = historico.map(d => d.año).concat(proy.map(d => d.año));
  const valuesHistorico = historico.map(d => d.poblacion_total);
  const valuesProy = Array(historico.length-1).fill(null).concat([historico[historico.length-1].poblacion_total]).concat(proy.map(d => d.poblacion_proyectada));
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Observado',
          data: valuesHistorico.concat(Array(proy.length).fill(null)),
          borderColor: '#0077b6',
          backgroundColor: 'rgba(0,180,255,0.13)',
          fill: true,
          tension: 0.2,
          pointRadius: 3,
          pointBackgroundColor: '#0077b6',
        },
        {
          label: 'Proyección',
          data: valuesProy,
          borderColor: '#d4af37',
          backgroundColor: 'rgba(255,215,0,0.10)',
          fill: false,
          borderDash: [6,4],
          pointRadius: 3,
          pointBackgroundColor: '#d4af37',
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { title: { display: true, text: 'Año' } },
        y: { title: { display: true, text: 'Población' }, beginAtZero: false }
      }
    }
  });
}

function renderPoblacionHistorica(arr) {
  const ctx = document.getElementById('chart-poblacion').getContext('2d');
  const labels = arr.map(d => d.año);
  const values = arr.map(d => d.poblacion_total);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Población total',
        data: values,
        borderColor: '#0077b6',
        backgroundColor: 'rgba(0,180,255,0.13)',
        fill: true,
        tension: 0.2,
        pointRadius: 3,
        pointBackgroundColor: '#0077b6',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { title: { display: true, text: 'Año' } },
        y: { title: { display: true, text: 'Población' }, beginAtZero: false }
      }
    }
  });
}

function renderProyecciones(arr) {
  let html = `<table style="width:100%;max-width:420px;margin:0 auto 1.5em auto;border-collapse:collapse;font-size:1em;">
    <thead><tr style="background:#e0f7fa;"><th>Año</th><th>Población proyectada</th></tr></thead><tbody>`;
  arr.forEach(d => {
    html += `<tr><td>${d.año}</td><td>${d.poblacion_proyectada.toLocaleString('es-CL')}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('tabla-proyecciones').innerHTML = html;
}

function renderConclusiones(conc) {
  let html = `<h2 style="margin-top:1.5em;">Conclusiones y Recomendaciones</h2>`;
  html += `<p style="font-size:1.08em;margin-bottom:1em;">${conc.resumen_ejecutivo}</p>`;
  html += '<ul style="margin-bottom:1em;">';
  conc.hallazgos_principales.forEach(h => {
    html += `<li><b>${h.categoria}:</b> ${h.descripcion} <span style="color:${h.impacto==='positivo'?'#009e60':h.impacto==='negativo'?'#d90429':'#555'};font-weight:600;">[${h.impacto}]</span></li>`;
  });
  html += '</ul>';
  html += '<h3>Recomendaciones</h3><ul>';
  conc.recomendaciones.forEach(r => {
    html += `<li>${r}</li>`;
  });
  html += '</ul>';
  document.getElementById('conclusiones-demografia').innerHTML = html;
}
