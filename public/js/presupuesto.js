// presupuesto.js
// Carga y visualización dinámica de datos de presupuesto público

document.addEventListener('DOMContentLoaded', async function () {
  const resumenUrl = '../data/presupuesto_publico/resumen_ejecutivo.json';
  const datosUrl = '../data/presupuesto_publico/datos_visualizacion.json';
  const metaUrl = '../data/presupuesto_publico/metadatos.json';

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

    // Renderizar la grilla: gráfico arriba, explicación abajo (tarjeta)
    chartsDiv.innerHTML = '';
    visualizaciones.forEach((viz, i) => {
      const card = document.createElement('div');
      card.className = 'viz-card';
      card.style.background = '#fff';
      card.style.borderRadius = '18px';
      card.style.boxShadow = '0 2px 16px #00b4ff11';
      card.style.padding = '1.5em 1.2em 1.2em 1.2em';
      card.style.margin = '0 auto 2.5em auto';
      card.style.maxWidth = '900px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.gap = '1.2em';
      // Gráfico
      const chartDiv = document.createElement('div');
      chartDiv.className = 'viz-chart';
      chartDiv.style.width = '100%';
      chartDiv.style.maxWidth = '700px';
      chartDiv.style.minWidth = '0';
      chartDiv.style.display = 'flex';
      chartDiv.style.alignItems = 'center';
      chartDiv.style.justifyContent = 'center';
      const canvas = document.createElement('canvas');
      canvas.id = viz.chartId;
      canvas.style.width = '100%';
      canvas.style.maxWidth = '100%';
      canvas.style.height = '380px';
      chartDiv.appendChild(canvas);
      // Explicación
      const explDiv = document.createElement('div');
      explDiv.className = 'viz-expl';
      explDiv.innerHTML = viz.explicacion;
      explDiv.style.background = 'linear-gradient(90deg,#e0f7fa 0%,#b2ebf2 100%)';
      explDiv.style.borderRadius = '14px';
      explDiv.style.boxShadow = '0 2px 12px #00b4ff11';
      explDiv.style.padding = '1.2em 1.5em';
      explDiv.style.fontSize = '1.13em';
      explDiv.style.color = '#0077b6';
      explDiv.style.lineHeight = '1.7';
      explDiv.style.width = '100%';
      explDiv.style.maxWidth = '700px';
      explDiv.style.margin = '0 auto';
      // Agregar al card
      card.appendChild(chartDiv);
      card.appendChild(explDiv);
      chartsDiv.appendChild(card);
    });
    // Inicializar los gráficos y hacerlos 100% responsivos
    visualizaciones.forEach((viz) => {
      const ctx = document.getElementById(viz.chartId).getContext('2d');
      new Chart(ctx, {
        type: viz.chartType,
        data: viz.chartData,
        options: {
          ...viz.chartOptions,
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            ...viz.chartOptions.plugins,
            legend: viz.chartOptions.plugins.legend || { display: false },
            title: viz.chartOptions.plugins.title || undefined
          },
          layout: { padding: 0 },
          animation: { duration: 600 }
        }
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
      c.style.padding = '0.5em 0.5em';
      c.style.width = '100%';
      c.style.minWidth = '0';
      c.style.overflow = 'hidden';
    });

  } catch (err) {
    resumenDiv.innerHTML = '<b>Error cargando datos de presupuesto público.</b>';
    chartsDiv.innerHTML = '';
    explicacionesDiv.innerHTML = '';
    metaDiv.innerHTML = '';
    console.error('Error al cargar datos de presupuesto público:', err);
  }
});
