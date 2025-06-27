// presupuesto.js
// Carga y visualización dinámica de datos de presupuesto público

document.addEventListener('DOMContentLoaded', async function () {
  const resumenUrl = '/public/data/presupuesto_publico/resumen_ejecutivo.json';
  const datosUrl = '/public/data/presupuesto_publico/datos_visualizacion.json';
  const metaUrl = '/public/data/presupuesto_publico/metadatos.json';

  const resumenDiv = document.getElementById('resumen-presupuesto');
  const chartsDiv = document.getElementById('charts-presupuesto');
  const explicacionesDiv = document.getElementById('explicaciones-presupuesto');
  const metaDiv = document.getElementById('metadatos-presupuesto');

  try {
    // Cargar resumen ejecutivo
    const resumen = await fetch(resumenUrl).then(r => r.json());
    resumenDiv.innerHTML = `
      <h2>Resumen Ejecutivo</h2>
      <ul>
        <li><b>Presupuesto Total:</b> $${Number(resumen.presupuesto_total).toLocaleString('es-CL')}</li>
        <li><b>Transferencias Totales:</b> $${Number(resumen.transferencias_totales).toLocaleString('es-CL')}</li>
        <li><b>Inversión Total:</b> $${Number(resumen.inversion_total).toLocaleString('es-CL')}</li>
        <li><b>Inversión Ejecutada:</b> $${Number(resumen.inversion_ejecutada).toLocaleString('es-CL')}</li>
        <li><b>Eficiencia de Ejecución:</b> ${resumen.eficiencia_ejecucion.toFixed(2)}%</li>
        <li><b>Avance Promedio:</b> ${resumen.avance_promedio.toFixed(2)}%</li>
        <li><b>Eficiencia de Inversión:</b> ${resumen.eficiencia_inversion.toFixed(2)}%</li>
        <li><b>Fecha de Análisis:</b> ${resumen.fecha_analisis}</li>
      </ul>
    `;

    // Cargar metadatos
    const meta = await fetch(metaUrl).then(r => r.json());
    metaDiv.innerHTML = `
      <h3>Metadatos</h3>
      <ul>
        <li><b>Fuentes:</b> ${meta.fuentes_datos.join(', ')}</li>
        <li><b>Archivos generados:</b> ${meta.datasets_generados.join(', ')}</li>
        <li><b>Total de registros:</b> ${meta.total_registros}</li>
        <li><b>Período de análisis:</b> ${meta.periodo_analisis}</li>
        <li><b>Metodología:</b> ${meta.metodologia}</li>
        <li><b>Notebook origen:</b> ${meta.notebook_origen}</li>
      </ul>
    `;

    // Cargar datos de visualización
    const datos = await fetch(datosUrl).then(r => r.json());
    chartsDiv.innerHTML = '';
    explicacionesDiv.innerHTML = '';
    const visualizaciones = [];

    // Recorrer todas las visualizaciones del JSON
    let idx = 0;
    for (const [key, v] of Object.entries(datos)) {
      if (!v.labels || !v.values || v.labels.length === 0 || v.values.length === 0) continue;
      // Soporte para barras agrupadas
      if (v.type === 'bar_grouped' && Array.isArray(v.values) && v.values.length === 2) {
        visualizaciones.push({
          chartId: `chart-${key}`,
          chartType: 'bar',
          chartData: {
            labels: v.labels,
            datasets: [
              {
                label: 'Vigente',
                data: v.values[0],
                backgroundColor: '#4e79a7'
              },
              {
                label: 'Devengado',
                data: v.values[1],
                backgroundColor: '#f28e2b'
              }
            ]
          },
          chartOptions: {
            responsive: true,
            plugins: { legend: { display: true, position: 'top' } },
            scales: { y: { beginAtZero: true } }
          },
          explicacion: v.explicacion || ''
        });
        idx++;
        continue;
      }
      visualizaciones.push({
        chartId: `chart-${key}`,
        chartType: v.type || 'bar',
        chartData: {
          labels: v.labels,
          datasets: [{
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: v.values,
            backgroundColor: v.type === 'pie' ? [
              '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7'
            ] : (idx % 2 === 0 ? '#4e79a7' : '#f28e2b')
          }]
        },
        chartOptions: v.type === 'pie' ? {
          responsive: true,
          plugins: { legend: { position: 'right' } }
        } : {
          indexAxis: v.type === 'bar' && key.includes('region') ? 'y' : 'x',
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { [v.type === 'bar' && key.includes('region') ? 'x' : 'y']: { beginAtZero: true } }
        },
        explicacion: v.explicacion || ''
      });
      idx++;
    }

    // Renderizar la grilla alternada
    chartsDiv.innerHTML = '';
    visualizaciones.forEach((viz, i) => {
      const row = document.createElement('div');
      row.className = 'viz-row';
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '1fr 1fr';
      row.style.alignItems = 'center';
      row.style.gap = '2em';
      row.style.marginBottom = '2.5em';
      if (i % 2 === 0) {
        row.innerHTML = `
          <div class="viz-chart"><canvas id="${viz.chartId}"></canvas></div>
          <div class="viz-expl">${viz.explicacion}</div>
        `;
      } else {
        row.innerHTML = `
          <div class="viz-expl">${viz.explicacion}</div>
          <div class="viz-chart"><canvas id="${viz.chartId}"></canvas></div>
        `;
      }
      chartsDiv.appendChild(row);
    });
    // Inicializar los gráficos
    visualizaciones.forEach((viz) => {
      new Chart(document.getElementById(viz.chartId).getContext('2d'), {
        type: viz.chartType,
        data: viz.chartData,
        options: viz.chartOptions
      });
    });

    // Mejorar visualmente las explicaciones
    const expls = document.querySelectorAll('.viz-expl');
    expls.forEach(e => {
      e.style.background = 'var(--main-bg, #f8fafd)';
      e.style.borderRadius = '14px';
      e.style.boxShadow = '0 2px 12px #00b4ff11';
      e.style.padding = '1.2em 1.5em';
      e.style.fontSize = '1.08em';
      e.style.color = 'var(--main-text, #222)';
      e.style.lineHeight = '1.6';
    });
    // Mejorar visualmente los gráficos
    const chartDivs = document.querySelectorAll('.viz-chart');
    chartDivs.forEach(c => {
      c.style.background = '#fff';
      c.style.borderRadius = '14px';
      c.style.boxShadow = '0 2px 12px #00b4ff11';
      c.style.padding = '1.2em 1.5em';
    });
    // Responsive
    chartsDiv.style.gridTemplateColumns = '1fr';
    chartsDiv.style.gap = '0';
    chartsDiv.querySelectorAll('.viz-row').forEach(r => {
      r.style.gridTemplateColumns = '1fr';
      r.style.display = 'flex';
      r.style.flexDirection = 'row';
      r.style.flexWrap = 'wrap';
      r.style.gap = '2em';
    });
    if (window.innerWidth < 700) {
      chartsDiv.querySelectorAll('.viz-row').forEach(r => {
        r.style.flexDirection = 'column';
      });
    }

  } catch (err) {
    resumenDiv.innerHTML = '<b>Error cargando datos de presupuesto público.</b>';
    chartsDiv.innerHTML = '';
    explicacionesDiv.innerHTML = '';
    metaDiv.innerHTML = '';
    console.error('Error al cargar datos de presupuesto público:', err);
  }
});
